"""
Zoom General App OAuth + meeting creation.

This version uses Zoom OAuth refresh_token flow, not Server-to-Server OAuth.

Reads this secret from AWS Secrets Manager using env var SECRETS_ZOOM_KEY:

{
  "ZOOM_CLIENT_ID": "...",
  "ZOOM_CLIENT_SECRET": "...",
  "ZOOM_REFRESH_TOKEN": "...",
  "ZOOM_REDIRECT_URI": "https://techsarasolutions.com/zoom/callback"
}

Required Lambda environment variables:
  ZOOM_HOST_EMAIL
  DEFAULT_MEETING_DURATION
  SECRETS_ZOOM_KEY

The refresh token may rotate when Zoom returns a new one, so this file updates
the Zoom secret in Secrets Manager automatically.

Meeting behavior:
  - Participants can join before host.
  - Waiting room is disabled.
"""

import base64
import json
import logging
import os
import time

import boto3
import httpx

logger = logging.getLogger()

OAUTH_URL = "https://zoom.us/oauth/token"
API_BASE = "https://api.zoom.us/v2"

_token_cache = {"token": None, "expires_at": 0.0}
_secret_cache = None


class ZoomError(Exception):
    pass


def create_zoom_meeting(booking):
    token = _get_access_token()
    host_email = os.environ["ZOOM_HOST_EMAIL"]
    duration = int(os.environ.get("DEFAULT_MEETING_DURATION", "30"))

    payload = {
        "topic": (
            f"Consultation - {booking['firstName']} {booking['lastName']} "
            f"({booking['company']}) - {booking['discussionTopic']}"
        ),
        "type": 2,
        "start_time": f"{booking['date']}T{booking['time']}:00",
        "duration": duration,
        "timezone": booking["timezone"],
        "agenda": (
            f"Company: {booking['company']}\n"
            f"Focus Area: {booking['discussionTopic']}"
        ),
        "settings": {
            "host_video": True,
            "participant_video": True,

            # Important:
            # Allows attendees to join before the host joins.
            "join_before_host": True,

            # Important:
            # If waiting room is true, attendees may still wait for host/admit.
            "waiting_room": False,

            "mute_upon_entry": True,
            "auto_recording": "none",
        },
    }

    response = _create_meeting_request(host_email, token, payload)

    # If a cached token somehow became invalid, refresh once and retry.
    if response.status_code == 401:
        logger.warning("Zoom access token rejected. Refreshing token and retrying once.")
        _clear_token_cache()
        token = _get_access_token(force_refresh=True)
        response = _create_meeting_request(host_email, token, payload)

    if response.status_code != 201:
        raise ZoomError(
            f"Zoom API error {response.status_code}: {response.text[:500]}"
        )

    data = response.json()
    logger.info("Zoom meeting %s created for %s", data["id"], booking["email"])

    return {
        "meetingId": str(data["id"]),
        "joinUrl": data["join_url"],
        "startUrl": data["start_url"],
        "password": data.get("password", ""),
    }


def _create_meeting_request(host_email, token, payload):
    with httpx.Client(timeout=20) as client:
        return client.post(
            f"{API_BASE}/users/{host_email}/meetings",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )


def _get_access_token(force_refresh=False):
    now = time.time()

    if (
        not force_refresh
        and _token_cache["token"]
        and now < _token_cache["expires_at"]
    ):
        return _token_cache["token"]

    return _refresh_access_token()


def _refresh_access_token():
    secrets = _get_secrets(force_reload=False)
    response = _call_refresh_token_endpoint(secrets)

    # If refresh token was rotated by another warm Lambda/container,
    # reload Secrets Manager and retry once with the newest token.
    if response.status_code != 200:
        logger.warning(
            "Zoom refresh token failed once. Reloading secret and retrying. "
            "Status=%s Body=%s",
            response.status_code,
            response.text[:300],
        )
        secrets = _get_secrets(force_reload=True)
        response = _call_refresh_token_endpoint(secrets)

    if response.status_code != 200:
        raise ZoomError(
            f"Zoom refresh token failed {response.status_code}: {response.text[:500]}"
        )

    data = response.json()

    access_token = data["access_token"]
    expires_in = int(data.get("expires_in", 3600))

    _token_cache["token"] = access_token
    _token_cache["expires_at"] = time.time() + expires_in - 60

    old_refresh_token = secrets.get("ZOOM_REFRESH_TOKEN")
    new_refresh_token = data.get("refresh_token")

    if new_refresh_token and new_refresh_token != old_refresh_token:
        secrets["ZOOM_REFRESH_TOKEN"] = new_refresh_token
        _save_secrets(secrets)
        logger.info("Zoom refresh token updated in Secrets Manager")

    return access_token


def _call_refresh_token_endpoint(secrets):
    client_id = secrets["ZOOM_CLIENT_ID"]
    client_secret = secrets["ZOOM_CLIENT_SECRET"]
    refresh_token = secrets["ZOOM_REFRESH_TOKEN"]

    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    with httpx.Client(timeout=20) as client:
        return client.post(
            OAUTH_URL,
            headers={
                "Authorization": f"Basic {basic}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
            },
        )


def _get_secrets(force_reload=False):
    global _secret_cache

    if _secret_cache is not None and not force_reload:
        return _secret_cache

    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=os.environ["SECRETS_ZOOM_KEY"])
    _secret_cache = json.loads(response["SecretString"])

    return _secret_cache


def _save_secrets(secrets):
    global _secret_cache

    client = boto3.client("secretsmanager")
    client.put_secret_value(
        SecretId=os.environ["SECRETS_ZOOM_KEY"],
        SecretString=json.dumps(secrets),
    )

    _secret_cache = secrets


def _clear_token_cache():
    _token_cache["token"] = None
    _token_cache["expires_at"] = 0.0