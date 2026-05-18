"""
Google Calendar event creation via service account + domain-wide delegation.

This version supports either Google service account JSON keys:

{
  "project_id": "...",
  "client_email": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
}

OR Lambda-specific keys:

{
  "GOOGLE_PROJECT_ID": "...",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL": "...",
  "GOOGLE_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
}

Reads the secret from AWS Secrets Manager using env var SECRETS_GOOGLE_KEY.

Required Lambda environment variables:
  GOOGLE_CALENDAR_HOST_EMAIL
  DEFAULT_MEETING_DURATION
  SECRETS_GOOGLE_KEY

Optional Lambda environment variable:
  ADDITIONAL_CALENDAR_ATTENDEES
  Example:
    sales@techsarasolutions.com
  Or multiple:
    sales@techsarasolutions.com,admin@techsarasolutions.com

Important:
The service account must have domain-wide delegation authorized for:
  https://www.googleapis.com/auth/calendar.events

GOOGLE_CALENDAR_HOST_EMAIL must be a real Google Workspace mailbox.
"""

import json
import logging
import os
from datetime import datetime, timedelta

import boto3
from google.oauth2 import service_account
from googleapiclient.discovery import build

logger = logging.getLogger()

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

_secret_cache = None
_service_cache = None


class CalendarError(Exception):
    pass


def create_calendar_event(booking, zoom_join_url):
    try:
        service = _get_service()

        host_email = os.environ["GOOGLE_CALENDAR_HOST_EMAIL"]
        duration = int(os.environ.get("DEFAULT_MEETING_DURATION", "30"))

        start_dt = f"{booking['date']}T{booking['time']}:00"
        end_time = _add_minutes(booking["time"], duration)
        end_dt = f"{booking['date']}T{end_time}:00"

        attendees = _build_attendees(
            host_email=host_email,
            candidate_email=booking["email"],
        )

        event_body = {
            "summary": (
                f"Consultation - {booking['firstName']} {booking['lastName']} "
                f"({booking['company']})"
            ),
            "description": (
                f"Company: {booking['company']}\n"
                f"Discussion Topic: {booking['discussionTopic']}\n"
                f"Notes: {booking.get('notes') or 'N/A'}\n\n"
                f"Zoom Meeting Link: {zoom_join_url}"
            ),
            "location": zoom_join_url,
            "start": {
                "dateTime": start_dt,
                "timeZone": booking["timezone"],
            },
            "end": {
                "dateTime": end_dt,
                "timeZone": booking["timezone"],
            },
            "attendees": attendees,
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 60},
                    {"method": "popup", "minutes": 15},
                ],
            },
        }

        response = (
            service.events()
            .insert(
                calendarId=host_email,
                body=event_body,
                sendUpdates="all",
            )
            .execute()
        )

        logger.info(
            "Calendar event %s created for %s with attendees: %s",
            response["id"],
            booking["email"],
            ", ".join([a["email"] for a in attendees]),
        )

        return {
            "eventId": response["id"],
            "eventLink": response.get("htmlLink", ""),
            "attendees": [a["email"] for a in attendees],
        }

    except Exception as exc:
        raise CalendarError(f"Google Calendar event creation failed: {exc}") from exc


def _build_attendees(host_email, candidate_email):
    attendees = []
    seen = set()

    def add_attendee(email, response_status="needsAction"):
        if not email:
            return

        cleaned = email.strip().lower()
        if not cleaned or cleaned in seen:
            return

        seen.add(cleaned)
        attendees.append(
            {
                "email": cleaned,
                "responseStatus": response_status,
            }
        )

    # Calendar owner / host.
    add_attendee(host_email, "accepted")

    # Client who submitted the booking form.
    add_attendee(candidate_email, "needsAction")

    # Extra internal attendees, e.g. sales@techsarasolutions.com.
    extra_attendees = os.environ.get("ADDITIONAL_CALENDAR_ATTENDEES", "")
    for email in extra_attendees.split(","):
        add_attendee(email, "needsAction")

    return attendees


def _get_service():
    global _service_cache

    if _service_cache is not None:
        return _service_cache

    secrets = _get_secrets()
    service_account_info = _build_service_account_info(secrets)

    creds = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES,
    )

    delegated_creds = creds.with_subject(os.environ["GOOGLE_CALENDAR_HOST_EMAIL"])

    _service_cache = build(
        "calendar",
        "v3",
        credentials=delegated_creds,
        cache_discovery=False,
    )

    return _service_cache


def _build_service_account_info(secrets):
    project_id = _get_first_present(
        secrets,
        ["GOOGLE_PROJECT_ID", "project_id"],
        "GOOGLE_PROJECT_ID or project_id",
    )

    client_email = _get_first_present(
        secrets,
        ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "client_email"],
        "GOOGLE_SERVICE_ACCOUNT_EMAIL or client_email",
    )

    private_key = _get_first_present(
        secrets,
        ["GOOGLE_PRIVATE_KEY", "private_key"],
        "GOOGLE_PRIVATE_KEY or private_key",
    )

    private_key = _normalize_private_key(private_key)

    info = {
        "type": secrets.get("type", "service_account"),
        "project_id": project_id,
        "private_key": private_key,
        "client_email": client_email,
        "token_uri": secrets.get("token_uri", "https://oauth2.googleapis.com/token"),
    }

    optional_keys = [
        "private_key_id",
        "client_id",
        "auth_uri",
        "auth_provider_x509_cert_url",
        "client_x509_cert_url",
        "universe_domain",
    ]

    for key in optional_keys:
        if key in secrets:
            info[key] = secrets[key]

    return info


def _get_first_present(secrets, keys, label):
    for key in keys:
        value = secrets.get(key)
        if isinstance(value, str) and value.strip():
            return value

    available_keys = ", ".join(sorted(secrets.keys()))
    raise CalendarError(
        f"Missing Google secret value: {label}. "
        f"Available keys: {available_keys}"
    )


def _normalize_private_key(private_key):
    private_key = private_key.strip()
    private_key = private_key.replace("\\n", "\n")

    if "-----BEGIN PRIVATE KEY-----" not in private_key:
        raise CalendarError("Google private key is missing BEGIN PRIVATE KEY header")

    if "-----END PRIVATE KEY-----" not in private_key:
        raise CalendarError("Google private key is missing END PRIVATE KEY footer")

    return private_key


def _get_secrets():
    global _secret_cache

    if _secret_cache is not None:
        return _secret_cache

    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=os.environ["SECRETS_GOOGLE_KEY"])

    _secret_cache = json.loads(response["SecretString"])
    return _secret_cache


def _add_minutes(hhmm, minutes):
    hour, minute = (int(x) for x in hhmm.split(":"))
    base = datetime(2000, 1, 1, hour, minute) + timedelta(minutes=minutes)
    return base.strftime("%H:%M")