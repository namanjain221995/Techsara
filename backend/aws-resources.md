# AWS Resources

This file documents the AWS resources used by the Techsara website backend.

Do not add secret values, private keys, refresh tokens, client secrets, AWS access keys, or API invoke URLs in this file.

---

# Region

All backend AWS resources are currently configured in:

```text
us-east-1
```

AWS region name:

```text
N. Virginia
```

---

# Lambda Functions

## 1. Consultation Booking Lambda

```text
techsara-consultation-booking
```

Purpose:

```text
Handles website consultation booking requests.
```

This Lambda:

```text
- Receives booking form data
- Validates request body
- Normalizes AM/PM time into America/New_York timezone
- Creates Zoom meeting
- Creates Google Calendar event
- Sends Google Calendar invite email
- Stores booking data in S3
```

Local source path:

```text
backend/lambdas/consultation-booking/
```

Important files:

```text
lambda_function.py
zoom.py
google_calendar.py
s3_store.py
```

---

## 2. Contact Message Lambda

```text
techsara-contact-message
```

Purpose:

```text
Handles Contact Us popup form submissions from the Services page.
```

This Lambda:

```text
- Receives Contact Us form data
- Validates request body
- Sends internal email to sales/team using Gmail API
- Sends thank-you email to the user using Gmail API
- Stores contact message data in S3
```

Local source path:

```text
backend/lambdas/contact-message/
```

Important files:

```text
lambda_function.py
```

---

# API Gateway Routes

The backend uses API Gateway HTTP API routes.

Do not add the full invoke URL here.

## Consultation Booking Routes

```text
POST    /api/book-consultation
OPTIONS /api/book-consultation
```

Integration:

```text
techsara-consultation-booking
```

Purpose:

```text
Used by the frontend consultation booking form.
```

---

## Contact Message Routes

```text
POST    /api/contact-message
OPTIONS /api/contact-message
```

Integration:

```text
techsara-contact-message
```

Purpose:

```text
Used by the frontend Contact Us popup form.
```

---

# S3 Bucket

Main bucket:

```text
techsara-consultation-bookings
```

Used for:

```text
- Consultation booking records
- Contact Us form submission records
```

---

## Booking Data S3 Structure

Booking records are stored like this:

```text
techsara-consultation-bookings/
└── YYYY-MM-DD/
    └── user-name-company-name/
        └── display-time/
            └── data.json
```

Example:

```text
techsara-consultation-bookings/
└── 2026-05-18/
    └── jay-soni-techno-knowledge/
        └── 10:00 AM/
            └── data.json
```

Important note:

```text
If the same user/company books the same date and time again, data.json will be overwritten.
```

---

## Contact Message S3 Structure

Contact form records are stored like this:

```text
techsara-consultation-bookings/
└── contact-messages/
    └── YYYY-MM-DD/
        └── user-name-company-name/
            └── contactId.json
```

Example:

```text
techsara-consultation-bookings/
└── contact-messages/
    └── 2026-05-14/
        └── jay-soni-tech/
            └── ct_20260514_182330_a294bd.json
```

---

# AWS Secrets Manager

## Google Secret

Secret name:

```text
/techsara/consultation-booking/google
```

Used by:

```text
techsara-consultation-booking
techsara-contact-message
```

Purpose:

```text
Stores Google service account credentials.
```

Used for:

```text
- Google Calendar API
- Gmail API
```

Do not store the actual secret value in this repository.

---

## Zoom Secret

Secret name:

```text
/techsara/consultation-booking/zoom
```

Used by:

```text
techsara-consultation-booking
```

Purpose:

```text
Stores Zoom OAuth credentials and refresh token.
```

Used for:

```text
- Creating Zoom meetings
- Refreshing Zoom access token
```

Do not store the actual secret value in this repository.

---

# Lambda Layer

Shared Lambda dependency layer:

```text
techsara-booking-deps
```

Used by:

```text
techsara-consultation-booking
techsara-contact-message
```

Runtime:

```text
Python 3.11
```

Local source path:

```text
backend/layers/techsara-booking-deps/
```

Dependency file:

```text
backend/layers/techsara-booking-deps/requirements.txt
```

Required packages:

```text
httpx
google-auth
google-api-python-client
google-auth-httplib2
```

---

# Lambda Environment Variables

## Common Environment Variables

Used by both Lambdas:

```text
ALLOWED_ORIGIN=https://techsarasolutions.com
S3_BUCKET_NAME=techsara-consultation-bookings
SECRETS_GOOGLE_KEY=/techsara/consultation-booking/google
```

---

## Consultation Booking Lambda Environment Variables

Lambda:

```text
techsara-consultation-booking
```

Variables:

```text
SECRETS_ZOOM_KEY=/techsara/consultation-booking/zoom
ZOOM_HOST_EMAIL=jay.soni@techsarasolutions.com
GOOGLE_CALENDAR_HOST_EMAIL=hello@techsarasolutions.com
BOOKING_TIMEZONE=America/New_York
DEFAULT_MEETING_DURATION=30
ADDITIONAL_CALENDAR_ATTENDEES=sales@techsarasolutions.com
```

Currently unused because SES is disabled:

```text
SES_FROM_EMAIL
INTERNAL_NOTIFICATION_EMAIL
```

---

## Contact Message Lambda Environment Variables

Lambda:

```text
techsara-contact-message
```

Variables:

```text
GMAIL_SENDER_EMAIL=hello@techsarasolutions.com
CONTACT_INTERNAL_EMAILS=sales@techsarasolutions.com,hello@techsarasolutions.com
```

Important:

```text
GMAIL_SENDER_EMAIL must be a real Google Workspace mailbox.
```

---

# Google Workspace Configuration

The Google service account uses domain-wide delegation.

Required Google APIs:

```text
Google Calendar API
Gmail API
```

Required OAuth scopes:

```text
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/gmail.send
```

Final scope value in Google Admin Console:

```text
https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/gmail.send
```

Google Admin Console path:

```text
Security
→ Access and data control
→ API controls
→ Domain-wide delegation
→ Manage Domain Wide Delegation
```

Important:

```text
Use the numeric service account Client ID, not the service account email.
```

---

# Zoom Configuration

Zoom is used by:

```text
techsara-consultation-booking
```

Zoom app type:

```text
General App OAuth
```

OAuth flow:

```text
Refresh token flow
```

Zoom host email:

```text
jay.soni@techsarasolutions.com
```

Important meeting settings:

```text
join_before_host=true
waiting_room=false
```

This allows users to join the Zoom meeting before the host joins.

If this does not work, check Zoom Admin account-level settings:

```text
Join before host = enabled
Waiting Room = not locked/forced
```

---

# IAM Policy Files

Local path:

```text
backend/policies/
```

Files:

```text
consultation-booking-policy.json
contact-message-policy.json
```

---

## Consultation Booking Lambda IAM Needs

Lambda:

```text
techsara-consultation-booking
```

Needs permissions for:

```text
- CloudWatch Logs
- S3 PutObject/GetObject/DeleteObject
- Secrets Manager GetSecretValue for Google secret
- Secrets Manager GetSecretValue for Zoom secret
- Secrets Manager PutSecretValue for Zoom refresh token updates
```

---

## Contact Message Lambda IAM Needs

Lambda:

```text
techsara-contact-message
```

Needs permissions for:

```text
- CloudWatch Logs
- Secrets Manager GetSecretValue for Google secret
- S3 PutObject for contact messages
```

---

# Test Event Files

Local path:

```text
backend/test-events/
```

Files:

```text
book-consultation-lambda-test.json
contact-message-lambda-test.json
book-consultation-postman-body.json
contact-message-postman-body.json
```

---

# Backend Flow Summary

## Consultation Booking Flow

```text
Frontend booking form
→ POST /api/book-consultation
→ API Gateway
→ techsara-consultation-booking Lambda
→ Validate request
→ Normalize time to America/New_York
→ Create Zoom meeting
→ Create Google Calendar event
→ Google Calendar sends invite email
→ Store booking data in S3
→ Return success response to frontend
```

---

## Contact Message Flow

```text
Frontend Contact Us popup
→ POST /api/contact-message
→ API Gateway
→ techsara-contact-message Lambda
→ Validate request
→ Send internal Gmail email to sales/team
→ Send thank-you Gmail email to user
→ Store contact message in S3
→ Return success response to frontend
```

---

# Security Notes

Do not commit these values:

```text
API invoke URL
AWS access keys
Google private key
Google service account JSON
Zoom client secret
Zoom refresh token
Any raw Secrets Manager value
```

It is safe to commit:

```text
Lambda source code
README files
.env.example
requirements.txt
IAM policy templates
test event examples
AWS resource names
route paths
secret names without secret values
```