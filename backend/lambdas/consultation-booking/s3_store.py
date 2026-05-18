"""
S3 storage helpers for consultation booking.

New booking record layout:

  s3://{S3_BUCKET_NAME}/{date}/{user-name-company-name}/{display-time}/data.json

Example:

  s3://techsara-consultation-bookings/2026-05-14/jay-soni-tech/10:00 AM/data.json

Important:
- If the same user/company books the same date/time again, data.json will be overwritten.
- If you want to preserve multiple bookings for same user/company/time, use bookingId.json instead.
"""

import json
import logging
import os
import re

import boto3

logger = logging.getLogger()

_s3_client = None


def _client():
    global _s3_client

    if _s3_client is None:
        _s3_client = boto3.client("s3")

    return _s3_client


def _bucket():
    return os.environ["S3_BUCKET_NAME"]


def store_booking(booking_id, date_str, time_str, record):
    """
    Store the full booking record in this S3 layout:

      {date}/{user-name-company-name}/{display-time}/data.json

    Example:

      2026-05-14/jay-soni-tech/10:00 AM/data.json
    """

    candidate = record.get("candidate", {})
    consultation = record.get("consultation", {})

    first_name = candidate.get("firstName", "")
    last_name = candidate.get("lastName", "")
    company = candidate.get("company", "")

    user_company_folder = _build_user_company_folder(
        first_name,
        last_name,
        company,
    )

    display_time = consultation.get("displayTime") or _display_time_from_24h(time_str)
    display_time_folder = _safe_display_time(display_time)

    key = f"{date_str}/{user_company_folder}/{display_time_folder}/data.json"

    _client().put_object(
        Bucket=_bucket(),
        Key=key,
        Body=json.dumps(record, indent=2, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )

    logger.info("Booking stored: %s", key)

    return key


def store_email_failure(booking_id, date_str, payload):
    """
    Kept for backward compatibility.

    SES is currently disabled, but if this function is called later,
    it stores failures in:

      {date}/email-failures/{bookingId}_email_failed.json
    """

    key = f"{date_str}/email-failures/{booking_id}_email_failed.json"

    _client().put_object(
        Bucket=_bucket(),
        Key=key,
        Body=json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )

    logger.warning("Email-failure record stored: %s", key)

    return key


def lock_slot(date_str, time_str, timezone, booking_id):
    """
    Kept for backward compatibility only.

    Slot locking is disabled in the current Lambda flow.
    """

    logger.info(
        "lock_slot called but slot locking is disabled. date=%s time=%s timezone=%s bookingId=%s",
        date_str,
        time_str,
        timezone,
        booking_id,
    )

    return True


def release_slot(date_str, time_str, timezone):
    """
    Kept for backward compatibility only.

    Slot locking is disabled in the current Lambda flow.
    """

    logger.info(
        "release_slot called but slot locking is disabled. date=%s time=%s timezone=%s",
        date_str,
        time_str,
        timezone,
    )

    return True


def _build_user_company_folder(first_name, last_name, company):
    raw = f"{first_name} {last_name} {company}".strip()
    slug = _slugify(raw)

    if not slug:
        return "unknown-user-unknown-company"

    return slug


def _slugify(value):
    """
    Convert name + company into safe S3 prefix text.

    Example:
      "Jay Soni Tech" -> "jay-soni-tech"
    """

    value = str(value or "").strip().lower()

    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    value = value.strip("-")

    return value


def _safe_display_time(display_time):
    """
    Keep display time readable in S3.

    Example:
      "10:00 AM" stays "10:00 AM"
      "9:30 PM" stays "9:30 PM"
    """

    value = str(display_time or "").strip()

    if not value:
        return "unknown-time"

    value = value.replace("/", "-").replace("\\", "-")
    value = re.sub(r"\s+", " ", value)

    return value


def _display_time_from_24h(time_str):
    """
    Fallback if consultation.displayTime is missing.

    Example:
      10:00 -> 10:00 AM
      22:00 -> 10:00 PM
    """

    try:
        hour_str, minute_str = str(time_str).split(":", 1)
        hour = int(hour_str)
        minute = int(minute_str)
    except Exception:
        return str(time_str or "unknown-time")

    period = "AM" if hour < 12 else "PM"

    hour_12 = hour % 12
    if hour_12 == 0:
        hour_12 = 12

    return f"{hour_12}:{minute:02d} {period}"