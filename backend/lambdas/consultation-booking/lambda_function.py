"""
AWS Lambda handler for consultation booking.

Trigger: API Gateway HttpApi (POST /api/book-consultation)

This version:
- Accepts any non-empty discussionTopic from frontend dropdown
- Accepts time with optional AM/PM from frontend
- Does NOT require timezone in request JSON
- Defaults all booking times to America/New_York
- Creates Zoom meeting
- Creates Google Calendar event
- Stores booking in S3
- Allows multiple bookings for the same slot
- Disables SES branded emails for now

Google Calendar invite emails are still sent because google_calendar.py uses
sendUpdates="all".
"""

import json
import logging
import os
import re
import uuid
from datetime import date as date_type, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from google_calendar import CalendarError, create_calendar_event
from s3_store import store_booking
from zoom import ZoomError, create_zoom_meeting

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

# Default timezone for all bookings.
# Use America/New_York instead of fixed EST so daylight saving is handled correctly.
BOOKING_TIMEZONE = os.environ.get("BOOKING_TIMEZONE", "America/New_York")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIME_24_RE = re.compile(r"^\d{1,2}:\d{2}$")
TIME_12_RE = re.compile(r"^\d{1,2}(:\d{2})?$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "POST")

    if method == "OPTIONS":
        return _resp(204, None)

    try:
        raw_body = event.get("body") or "{}"

        if isinstance(raw_body, dict):
            body = raw_body
        else:
            body = json.loads(raw_body)

    except json.JSONDecodeError:
        return _err(400, "INVALID_JSON", "Request body must be valid JSON.")

    err = _validate_and_normalize(body)
    if err:
        return _err(422, "VALIDATION_ERROR", err)

    booking_id = _generate_booking_id(body["date"], body["time"])

    # 1. Create Zoom meeting
    try:
        zoom = create_zoom_meeting(body)
    except ZoomError:
        logger.exception("Zoom meeting creation failed")
        return _err(
            500,
            "ZOOM_MEETING_FAILED",
            "Unable to create meeting. Please try again.",
        )

    # 2. Create Google Calendar event
    # Non-fatal: if Calendar fails, booking still succeeds.
    calendar = None
    calendar_status = "created"

    try:
        calendar = create_calendar_event(body, zoom["joinUrl"])
    except CalendarError:
        logger.exception("Calendar event creation failed (non-fatal)")
        calendar_status = "failed"

    # 3. Store booking record in S3
    record = _build_record(booking_id, body, zoom, calendar, calendar_status)

    try:
        store_booking(booking_id, body["date"], body["time"], record)
    except Exception:
        logger.exception("Failed to store booking record %s", booking_id)

    # 4. SES branded emails are disabled for now.
    email_status = {
        "status": "disabled",
        "message": "SES emails are disabled. Google Calendar invite is sent instead.",
    }

    return _resp(
        200,
        {
            "success": True,
            "bookingId": booking_id,
            "message": "Consultation booked successfully.",
            "booking": {
                "date": body["date"],
                "time": body["time"],
                "displayTime": body.get("displayTime"),
                "timezone": body["timezone"],
                "originalSelection": body.get("originalSelection"),
                "name": f"{body['firstName']} {body['lastName']}",
                "email": body["email"],
                "company": body["company"],
                "phoneNumber": body.get("phoneNumber"),
                "discussionTopic": body["discussionTopic"],
                "notes": body.get("notes"),
            },
            "zoom": {
                "joinUrl": zoom["joinUrl"],
            },
            "calendar": {
                "status": calendar_status,
                "eventId": calendar["eventId"] if calendar else None,
                "eventLink": calendar["eventLink"] if calendar else None,
                "attendees": calendar.get("attendees", []) if calendar else [],
            },
            "email": email_status,
        },
    )


def _validate_and_normalize(b):
    # timezone is intentionally NOT required.
    # If frontend does not send timezone, Lambda uses BOOKING_TIMEZONE.
    required = [
        "firstName",
        "lastName",
        "email",
        "company",
        "discussionTopic",
        "date",
        "time",
    ]

    for f in required:
        if not isinstance(b.get(f), str) or not b[f].strip():
            return f"Missing or empty field: {f}"

    for f in required:
        b[f] = b[f].strip()

    if not EMAIL_RE.match(b["email"]):
        return "Email is not valid"

    # Accept any dropdown value as long as it is not empty.
    # This allows frontend picklist values to change without Lambda update.
    if len(b["discussionTopic"]) > 150:
        return "Discussion topic must be under 150 characters"

    if not DATE_RE.match(b["date"]):
        return "Date must be in YYYY-MM-DD format"

    try:
        date_type.fromisoformat(b["date"])
    except ValueError:
        return "Date is not a valid calendar date"

    notes = b.get("notes")
    if notes is not None:
        if not isinstance(notes, str):
            return "Notes must be text under 500 characters"
        if len(notes) > 500:
            return "Notes must be text under 500 characters"
        b["notes"] = notes.strip()

    phone_number = b.get("phoneNumber")
    if phone_number is not None:
        if not isinstance(phone_number, str):
            return "Phone number must be text"
        if len(phone_number.strip()) > 30:
            return "Phone number must be under 30 characters"
        b["phoneNumber"] = phone_number.strip()

    err = _normalize_time_and_timezone(b)
    if err:
        return err

    return None


def _normalize_time_and_timezone(b):
    """
    Converts frontend time into final backend time.

    Preferred frontend format:

    {
      "date": "2026-05-14",
      "time": "10:00",
      "ampm": "AM"
    }

    timezone is optional.

    If timezone is missing, Lambda uses:
      America/New_York

    Final result stored back into body:
      b["date"] = final date in America/New_York
      b["time"] = final 24-hour HH:MM time
      b["timezone"] = America/New_York
    """

    raw_date = b["date"]
    raw_time = b["time"].strip()

    source_timezone = _normalize_timezone_name(
        b.get("timezone") or BOOKING_TIMEZONE
    )

    ampm_result = _get_ampm_value(b)
    if ampm_result == "INVALID":
        return "AM/PM value must be AM or PM"

    ampm = ampm_result

    original_selection = {
        "date": raw_date,
        "time": raw_time,
        "ampm": ampm,
        "timezone": source_timezone,
    }

    try:
        source_tz = ZoneInfo(source_timezone)
    except ZoneInfoNotFoundError:
        return "Timezone is not a valid IANA timezone"

    try:
        target_tz = ZoneInfo(BOOKING_TIMEZONE)
    except ZoneInfoNotFoundError:
        return "Server booking timezone is not valid"

    if ampm:
        parsed_time = _parse_12_hour_time(raw_time, ampm)
        if parsed_time is None:
            return "Time must be valid 12-hour time with AM or PM"
    else:
        parsed_time = _parse_24_hour_time(raw_time)
        if parsed_time is None:
            return "Time must be in HH:MM format or include ampm"

    hour, minute = parsed_time

    if minute not in (0, 30):
        return "Time must be on the hour or half hour"

    try:
        selected_date = date_type.fromisoformat(raw_date)
    except ValueError:
        return "Date is not a valid calendar date"

    source_dt = datetime(
        selected_date.year,
        selected_date.month,
        selected_date.day,
        hour,
        minute,
        tzinfo=source_tz,
    )

    # Convert selected time into final booking timezone.
    final_dt = source_dt.astimezone(target_tz)

    today_in_target_tz = datetime.now(target_tz).date()
    if final_dt.date() < today_in_target_tz:
        return "Date must not be in the past"

    b["date"] = final_dt.strftime("%Y-%m-%d")
    b["time"] = final_dt.strftime("%H:%M")
    b["timezone"] = BOOKING_TIMEZONE
    b["displayTime"] = _format_display_time(final_dt)
    b["originalSelection"] = original_selection

    return None


def _get_ampm_value(b):
    """
    Supports multiple frontend field names:
      ampm
      amPm
      meridiem
      period

    Preferred field name: ampm
    """

    for key in ["ampm", "amPm", "meridiem", "period"]:
        value = b.get(key)
        if isinstance(value, str) and value.strip():
            value = value.strip().upper()
            if value in {"AM", "PM"}:
                return value
            return "INVALID"

    return None


def _parse_12_hour_time(time_str, ampm):
    if not TIME_12_RE.match(time_str):
        return None

    if ":" in time_str:
        hour_str, minute_str = time_str.split(":", 1)
    else:
        hour_str, minute_str = time_str, "00"

    try:
        hour = int(hour_str)
        minute = int(minute_str)
    except ValueError:
        return None

    if hour < 1 or hour > 12:
        return None

    if minute < 0 or minute > 59:
        return None

    if ampm == "AM":
        hour_24 = 0 if hour == 12 else hour
    elif ampm == "PM":
        hour_24 = 12 if hour == 12 else hour + 12
    else:
        return None

    return hour_24, minute


def _parse_24_hour_time(time_str):
    if not TIME_24_RE.match(time_str):
        return None

    try:
        hour_str, minute_str = time_str.split(":", 1)
        hour = int(hour_str)
        minute = int(minute_str)
    except ValueError:
        return None

    if hour < 0 or hour > 23:
        return None

    if minute < 0 or minute > 59:
        return None

    return hour, minute


def _normalize_timezone_name(tz):
    """
    Avoid fixed EST because it ignores daylight saving.
    America/New_York correctly handles EST/EDT depending on date.
    """

    if not isinstance(tz, str) or not tz.strip():
        return BOOKING_TIMEZONE

    cleaned = tz.strip()

    aliases = {
        "EST": "America/New_York",
        "EDT": "America/New_York",
        "ET": "America/New_York",
        "Eastern Time": "America/New_York",
        "Eastern Standard Time": "America/New_York",
        "Eastern Daylight Time": "America/New_York",
    }

    return aliases.get(cleaned, cleaned)


def _format_display_time(dt):
    return dt.strftime("%I:%M %p").lstrip("0")


def _generate_booking_id(date_str, time_str):
    return (
        f"bk_{date_str.replace('-', '')}_"
        f"{time_str.replace(':', '')}_"
        f"{uuid.uuid4().hex[:6]}"
    )


def _build_record(booking_id, b, zoom, calendar, calendar_status):
    return {
        "bookingId": booking_id,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "candidate": {
            "firstName": b["firstName"],
            "lastName": b["lastName"],
            "email": b["email"],
            "company": b["company"],
            "phoneNumber": b.get("phoneNumber"),
        },
        "consultation": {
            "date": b["date"],
            "time": b["time"],
            "displayTime": b.get("displayTime"),
            "timezone": b["timezone"],
            "originalSelection": b.get("originalSelection"),
            "discussionTopic": b["discussionTopic"],
            "notes": b.get("notes"),
        },
        "zoom": {
            "meetingId": zoom["meetingId"],
            "joinUrl": zoom["joinUrl"],
            "startUrl": zoom["startUrl"],
            "password": zoom.get("password", ""),
        },
        "calendar": {
            "status": calendar_status,
            "eventId": calendar["eventId"] if calendar else None,
            "eventLink": calendar["eventLink"] if calendar else None,
            "attendees": calendar.get("attendees", []) if calendar else [],
            "additionalCalendarAttendees": os.environ.get(
                "ADDITIONAL_CALENDAR_ATTENDEES",
                "",
            ),
        },
        "email": {
            "status": "disabled",
            "message": "SES emails are disabled. Google Calendar invite is sent instead.",
        },
    }


def _resp(status, body):
    if body is None:
        return {
            "statusCode": status,
            "headers": CORS_HEADERS,
            "body": "",
        }

    return {
        "statusCode": status,
        "headers": {
            **CORS_HEADERS,
            "Content-Type": "application/json",
        },
        "body": json.dumps(body),
    }


def _err(status, code, message):
    return _resp(
        status,
        {
            "success": False,
            "error": code,
            "message": message,
        },
    )