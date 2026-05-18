"""
AWS Lambda handler for Techsara Contact Us form.

Trigger:
  API Gateway HTTP API
  POST /api/contact-message

This Lambda:
- Accepts Contact Us form data
- Sends internal notification email to sales/team using Gmail API
- Sends thank-you email to the user using Gmail API
- Stores contact submission in S3
- Does not use SES
"""

import base64
import json
import logging
import os
import re
import uuid
from datetime import datetime
from email.message import EmailMessage

import boto3
from google.oauth2 import service_account
from googleapiclient.discovery import build

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
S3_BUCKET_NAME = os.environ["S3_BUCKET_NAME"]
SECRETS_GOOGLE_KEY = os.environ["SECRETS_GOOGLE_KEY"]
GMAIL_SENDER_EMAIL = os.environ["GMAIL_SENDER_EMAIL"]

CONTACT_INTERNAL_EMAILS = os.environ.get(
    "CONTACT_INTERNAL_EMAILS",
    "sales@techsarasolutions.com",
)

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

CORS_HEADERS = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

_secret_cache = None
_gmail_service_cache = None
_s3_client = None


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "POST")

    if method == "OPTIONS":
        return _resp(204, None)

    try:
        raw_body = event.get("body") or "{}"

        if event.get("isBase64Encoded"):
            raw_body = base64.b64decode(raw_body).decode("utf-8")

        if isinstance(raw_body, dict):
            body = raw_body
        else:
            body = json.loads(raw_body)

    except json.JSONDecodeError:
        return _err(400, "INVALID_JSON", "Request body must be valid JSON.")

    err = _validate_and_normalize(body)
    if err:
        return _err(422, "VALIDATION_ERROR", err)

    contact_id = _generate_contact_id()
    record = _build_record(contact_id, body)

    internal_status = "not_sent"
    user_status = "not_sent"

    try:
        _send_internal_email(body, contact_id)
        internal_status = "sent"
    except Exception:
        logger.exception("Failed to send internal contact email")
        internal_status = "failed"

    try:
        _send_user_thank_you_email(body)
        user_status = "sent"
    except Exception:
        logger.exception("Failed to send user thank-you email")
        user_status = "failed"

    record["emailStatus"] = {
        "internalEmailStatus": internal_status,
        "userEmailStatus": user_status,
    }

    try:
        s3_key = _store_contact_message(contact_id, body, record)
        record["s3Key"] = s3_key
    except Exception:
        logger.exception("Failed to store contact message in S3")
        s3_key = None

    return _resp(
        200,
        {
            "success": True,
            "contactId": contact_id,
            "message": "Message received successfully.",
            "email": {
                "internalEmailStatus": internal_status,
                "userEmailStatus": user_status,
            },
            "s3Key": s3_key,
        },
    )


def _validate_and_normalize(b):
    required = [
        "firstName",
        "lastName",
        "email",
        "company",
        "phoneNumber",
        "discussionTopic",
    ]

    for field in required:
        if not isinstance(b.get(field), str) or not b[field].strip():
            return f"Missing or empty field: {field}"

    for field in required:
        b[field] = b[field].strip()

    if not EMAIL_RE.match(b["email"]):
        return "Email is not valid"

    if len(b["firstName"]) > 80:
        return "First name must be under 80 characters"

    if len(b["lastName"]) > 80:
        return "Last name must be under 80 characters"

    if len(b["company"]) > 150:
        return "Company must be under 150 characters"

    if len(b["phoneNumber"]) > 40:
        return "Phone number must be under 40 characters"

    if len(b["discussionTopic"]) > 150:
        return "Discussion topic must be under 150 characters"

    notes = b.get("notes", "")
    if notes is None:
        notes = ""

    if not isinstance(notes, str):
        return "Notes must be text"

    if len(notes) > 1000:
        return "Notes must be under 1000 characters"

    b["notes"] = notes.strip()

    return None


def _send_internal_email(body, contact_id):
    recipients = _get_internal_recipients()

    subject = (
        f"New B2B Lead Details - "
        f"{body['firstName']} {body['lastName']} / {body['company']}"
    )

    submitted_at = datetime.utcnow().isoformat() + "Z"

    text_body = f"""A new user submitted the Techsara Solutions Contact Us form.

Contact ID: {contact_id}

Name: {body['firstName']} {body['lastName']}
Email: {body['email']}
Company: {body['company']}
Phone: {body['phoneNumber']}
Topic: {body['discussionTopic']}

Message:
{body.get('notes') or 'N/A'}

Submitted at: {submitted_at}
"""

    html_body = f"""
<html>
  <body>
    <h2>New B2B Lead Details</h2>
    <p>A new user submitted the Techsara Solutions Contact Us form.</p>

    <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;">
      <tr><td><b>Contact ID</b></td><td>{_html_escape(contact_id)}</td></tr>
      <tr><td><b>Name</b></td><td>{_html_escape(body['firstName'] + ' ' + body['lastName'])}</td></tr>
      <tr><td><b>Email</b></td><td>{_html_escape(body['email'])}</td></tr>
      <tr><td><b>Company</b></td><td>{_html_escape(body['company'])}</td></tr>
      <tr><td><b>Phone</b></td><td>{_html_escape(body['phoneNumber'])}</td></tr>
      <tr><td><b>Topic</b></td><td>{_html_escape(body['discussionTopic'])}</td></tr>
    </table>

    <h3>Message</h3>
    <p>{_html_escape(body.get('notes') or 'N/A')}</p>

    <p><b>Submitted at:</b> {_html_escape(submitted_at)}</p>
  </body>
</html>
"""

    _send_email(
        to_emails=recipients,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        reply_to=body["email"],
    )


def _send_user_thank_you_email(body):
    subject = "Thanks for contacting Techsara Solutions"

    text_body = f"""Hi {body['firstName']},

Thank you for contacting Techsara Solutions.

We received your message and our team will get back to you soon.

Summary:
Topic: {body['discussionTopic']}
Company: {body['company']}

Regards,
Techsara Team
"""

    html_body = f"""
<html>
  <body>
    <p>Hi {_html_escape(body['firstName'])},</p>

    <p>Thank you for contacting <b>Techsara Solutions</b>.</p>

    <p>We received your message and our team will get back to you soon.</p>

    <p><b>Summary</b></p>
    <ul>
      <li><b>Topic:</b> {_html_escape(body['discussionTopic'])}</li>
      <li><b>Company:</b> {_html_escape(body['company'])}</li>
    </ul>

    <p>Regards,<br/>Techsara Team</p>
  </body>
</html>
"""

    _send_email(
        to_emails=[body["email"]],
        subject=subject,
        text_body=text_body,
        html_body=html_body,
    )


def _send_email(to_emails, subject, text_body, html_body, reply_to=None):
    service = _get_gmail_service()

    message = EmailMessage()
    message["From"] = GMAIL_SENDER_EMAIL
    message["To"] = ", ".join(to_emails)
    message["Subject"] = subject

    if reply_to:
        message["Reply-To"] = reply_to

    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

    result = (
        service.users()
        .messages()
        .send(
            userId=GMAIL_SENDER_EMAIL,
            body={"raw": raw_message},
        )
        .execute()
    )

    logger.info(
        "Gmail message sent. messageId=%s to=%s subject=%s",
        result.get("id"),
        ", ".join(to_emails),
        subject,
    )

    return result


def _get_gmail_service():
    global _gmail_service_cache

    if _gmail_service_cache is not None:
        return _gmail_service_cache

    secrets = _get_google_secret()
    service_account_info = _build_service_account_info(secrets)

    creds = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=SCOPES,
    )

    delegated_creds = creds.with_subject(GMAIL_SENDER_EMAIL)

    _gmail_service_cache = build(
        "gmail",
        "v1",
        credentials=delegated_creds,
        cache_discovery=False,
    )

    return _gmail_service_cache


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


def _get_google_secret():
    global _secret_cache

    if _secret_cache is not None:
        return _secret_cache

    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=SECRETS_GOOGLE_KEY)

    _secret_cache = json.loads(response["SecretString"])
    return _secret_cache


def _normalize_private_key(private_key):
    private_key = private_key.strip()
    private_key = private_key.replace("\\n", "\n")

    if "-----BEGIN PRIVATE KEY-----" not in private_key:
        raise ValueError("Google private key is missing BEGIN PRIVATE KEY header")

    if "-----END PRIVATE KEY-----" not in private_key:
        raise ValueError("Google private key is missing END PRIVATE KEY footer")

    return private_key


def _get_first_present(secrets, keys, label):
    for key in keys:
        value = secrets.get(key)
        if isinstance(value, str) and value.strip():
            return value

    available_keys = ", ".join(sorted(secrets.keys()))
    raise ValueError(
        f"Missing Google secret value: {label}. Available keys: {available_keys}"
    )


def _store_contact_message(contact_id, body, record):
    key = _build_s3_key(contact_id, body)

    _s3().put_object(
        Bucket=S3_BUCKET_NAME,
        Key=key,
        Body=json.dumps(record, indent=2, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
    )

    logger.info("Contact message stored in S3: %s", key)

    return key


def _build_s3_key(contact_id, body):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    folder = _slugify(
        f"{body.get('firstName', '')} {body.get('lastName', '')} {body.get('company', '')}"
    )

    if not folder:
        folder = "unknown-user-unknown-company"

    return f"contact-messages/{today}/{folder}/{contact_id}.json"


def _build_record(contact_id, body):
    return {
        "contactId": contact_id,
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "source": "services-contact-popup",
        "contact": {
            "firstName": body["firstName"],
            "lastName": body["lastName"],
            "email": body["email"],
            "company": body["company"],
            "phoneNumber": body["phoneNumber"],
        },
        "message": {
            "discussionTopic": body["discussionTopic"],
            "notes": body.get("notes", ""),
        },
        "internalRecipients": _get_internal_recipients(),
        "senderEmail": GMAIL_SENDER_EMAIL,
    }


def _get_internal_recipients():
    emails = []

    for item in CONTACT_INTERNAL_EMAILS.split(","):
        email = item.strip()
        if email:
            emails.append(email)

    seen = set()
    unique = []

    for email in emails:
        lower = email.lower()
        if lower not in seen:
            seen.add(lower)
            unique.append(email)

    return unique


def _s3():
    global _s3_client

    if _s3_client is None:
        _s3_client = boto3.client("s3")

    return _s3_client


def _generate_contact_id():
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    suffix = uuid.uuid4().hex[:6]

    return f"ct_{timestamp}_{suffix}"


def _slugify(value):
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    value = value.strip("-")

    return value


def _html_escape(value):
    value = str(value or "")

    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


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