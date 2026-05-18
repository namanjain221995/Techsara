# Techsara Backend README

This backend supports two website flows:

1. Consultation Booking
2. Contact Us / Send Message

The backend is hosted on AWS and uses Lambda, API Gateway, S3, Secrets Manager, Zoom API, Google Calendar API, and Gmail API.

SES is currently not used. Booking emails are sent through Google Calendar invites, and Contact Us emails are sent through Gmail API.

---

## Backend Folder Structure

```text
backend/
├── README.md
├── aws-resources.md
├── .env.example
├── lambdas/
│   ├── consultation-booking/
│   │   ├── lambda_function.py
│   │   ├── zoom.py
│   │   ├── google_calendar.py
│   │   └── s3_store.py
│   │
│   └── contact-message/
│       └── lambda_function.py
│
├── layers/
│   └── techsara-booking-deps/
│       └── requirements.txt
│
├── policies/
│   ├── consultation-booking-policy.json
│   └── contact-message-policy.json
│
└── test-events/
    ├── book-consultation-lambda-test.json
    ├── contact-message-lambda-test.json
    ├── book-consultation-postman-body.json
    └── contact-message-postman-body.json
```

---

# 1. AWS Region

All backend AWS resources are configured in:

```text
us-east-1
```

Region name:

```text
N. Virginia
```

---

# 2. Lambda Functions

## 2.1 Consultation Booking Lambda

AWS Lambda name:

```text
techsara-consultation-booking
```

Local source path:

```text
backend/lambdas/consultation-booking/
```

Files:

```text
lambda_function.py
zoom.py
google_calendar.py
s3_store.py
```

Purpose:

```text
Handles website consultation booking requests.
```

This Lambda:

```text
- Receives consultation booking data from the frontend
- Validates request JSON
- Converts AM/PM time into backend time
- Defaults timezone to America/New_York
- Creates a Zoom meeting
- Creates a Google Calendar event
- Sends calendar invite email through Google Calendar
- Stores booking data in S3
- Returns success response to frontend
```

---

## 2.2 Contact Message Lambda

AWS Lambda name:

```text
techsara-contact-message
```

Local source path:

```text
backend/lambdas/contact-message/
```

Files:

```text
lambda_function.py
```

Purpose:

```text
Handles Contact Us popup form submissions.
```

This Lambda:

```text
- Receives Contact Us form data from the frontend
- Validates request JSON
- Sends internal email to sales/team using Gmail API
- Sends thank-you email to the user using Gmail API
- Stores contact message data in S3
- Returns success response to frontend
```

---

# 3. API Routes

The backend uses API Gateway HTTP API routes.

Do not store the full API invoke URL in this README.

## 3.1 Consultation Booking Routes

```text
POST    /api/book-consultation
OPTIONS /api/book-consultation
```

Integrated Lambda:

```text
techsara-consultation-booking
```

## 3.2 Contact Message Routes

```text
POST    /api/contact-message
OPTIONS /api/contact-message
```

Integrated Lambda:

```text
techsara-contact-message
```

The `OPTIONS` routes are required for browser CORS preflight requests.

---

# 4. End-to-End Backend Flows

## 4.1 Consultation Booking Flow

```text
User opens booking form on frontend
→ User selects date
→ User selects time and AM/PM
→ User fills personal/company details
→ User clicks Confirm Booking
→ Frontend sends POST request to /api/book-consultation
→ API Gateway receives request
→ API Gateway triggers techsara-consultation-booking Lambda
→ Lambda validates required fields
→ Lambda normalizes time to America/New_York
→ Lambda creates Zoom meeting
→ Lambda creates Google Calendar event
→ Google Calendar sends invite email to attendee/internal attendees
→ Lambda stores booking JSON in S3
→ Lambda returns success response to frontend
→ Frontend shows confirmation to user
```

### Booking Request Body

```json
{
  "firstName": "Jay",
  "lastName": "Soni",
  "email": "jay.soni@techsarasolutions.com",
  "company": "Techno Knowledge",
  "phoneNumber": "123456789",
  "discussionTopic": "Healthcare and Recruitment",
  "notes": "abc",
  "date": "2026-05-18",
  "time": "10:00",
  "ampm": "AM"
}
```

### Booking Response Example

```json
{
  "success": true,
  "bookingId": "bk_20260518_1000_abc123",
  "message": "Consultation booked successfully.",
  "booking": {
    "date": "2026-05-18",
    "time": "10:00",
    "displayTime": "10:00 AM",
    "timezone": "America/New_York",
    "name": "Jay Soni",
    "email": "jay.soni@techsarasolutions.com",
    "company": "Techno Knowledge",
    "phoneNumber": "123456789",
    "discussionTopic": "Healthcare and Recruitment",
    "notes": "abc"
  },
  "zoom": {
    "joinUrl": "https://zoom.us/j/..."
  },
  "calendar": {
    "status": "created",
    "eventId": "...",
    "eventLink": "...",
    "attendees": [
      "hello@techsarasolutions.com",
      "jay.soni@techsarasolutions.com",
      "sales@techsarasolutions.com"
    ]
  },
  "email": {
    "status": "disabled",
    "message": "SES emails are disabled. Google Calendar invite is sent instead."
  }
}
```

---

## 4.2 Contact Us Flow

```text
User opens Services page
→ User clicks Contact Us
→ Contact popup form opens
→ User fills form details
→ User clicks Send Message
→ Frontend sends POST request to /api/contact-message
→ API Gateway receives request
→ API Gateway triggers techsara-contact-message Lambda
→ Lambda validates required fields
→ Lambda sends internal Gmail email to sales/team
→ Lambda sends thank-you Gmail email to user
→ Lambda stores contact JSON in S3
→ Lambda returns success response to frontend
→ Frontend shows success message to user
```

### Contact Request Body

```json
{
  "firstName": "Jay",
  "lastName": "Soni",
  "email": "jay.soni@techsarasolutions.com",
  "company": "Tech",
  "phoneNumber": "123456789",
  "discussionTopic": "Healthcare and Recruitment",
  "notes": "Need help with staffing and IT solutions."
}
```

### Contact Response Example

```json
{
  "success": true,
  "contactId": "ct_20260514_182330_a294bd",
  "message": "Message received successfully.",
  "email": {
    "internalEmailStatus": "sent",
    "userEmailStatus": "sent"
  },
  "s3Key": "contact-messages/2026-05-14/jay-soni-tech/ct_20260514_182330_a294bd.json"
}
```

---

# 5. Frontend Field Mapping

## 5.1 Booking Form Mapping

| Frontend Field | JSON Key | Example |
|---|---|---|
| First name | `firstName` | `Jay` |
| Last name | `lastName` | `Soni` |
| Work email | `email` | `jay.soni@techsarasolutions.com` |
| Company | `company` | `Techno Knowledge` |
| Phone number | `phoneNumber` | `123456789` |
| What would you like to discuss? | `discussionTopic` | `Healthcare and Recruitment` |
| Anything we should know? | `notes` | `abc` |
| Selected date | `date` | `2026-05-18` |
| Selected time | `time` | `10:00` |
| AM/PM | `ampm` | `AM` |

The frontend does not need to send timezone.

The backend uses:

```text
America/New_York
```

---

## 5.2 Contact Us Form Mapping

| Frontend Field | JSON Key | Example |
|---|---|---|
| First name | `firstName` | `Jay` |
| Last name | `lastName` | `Soni` |
| Work email | `email` | `jay.soni@techsarasolutions.com` |
| Company | `company` | `Tech` |
| Phone number | `phoneNumber` | `123456789` |
| What would you like to discuss? | `discussionTopic` | `Healthcare and Recruitment` |
| Anything we should know? | `notes` | `Need help with staffing and IT solutions.` |

---

# 6. Time Handling

The booking frontend sends:

```json
{
  "time": "10:00",
  "ampm": "AM"
}
```

The backend converts AM/PM time into 24-hour time.

Examples:

```text
10:00 AM → 10:00
10:00 PM → 22:00
12:00 AM → 00:00
12:00 PM → 12:00
```

The backend timezone is:

```text
America/New_York
```

This is better than hardcoding `EST` because New York switches between EST and EDT depending on daylight saving time.

---

# 7. S3 Storage

S3 bucket:

```text
techsara-consultation-bookings
```

## 7.1 Booking S3 Structure

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

Important:

```text
If the same user/company books the same date and time again, data.json is overwritten.
```

If multiple records need to be preserved later, change the file name from `data.json` to a unique file name such as `{bookingId}.json`.

---

## 7.2 Contact Message S3 Structure

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

# 8. Secrets Manager

## 8.1 Google Secret

Secret name:

```text
/techsara/consultation-booking/google
```

Used by:

```text
techsara-consultation-booking
techsara-contact-message
```

Used for:

```text
Google Calendar API
Gmail API
```

Expected secret type:

```text
Google service account JSON
```

Do not commit the secret value.

---

## 8.2 Zoom Secret

Secret name:

```text
/techsara/consultation-booking/zoom
```

Used by:

```text
techsara-consultation-booking
```

Used for:

```text
Zoom OAuth refresh token flow
Zoom meeting creation
```

Expected values:

```text
ZOOM_CLIENT_ID
ZOOM_CLIENT_SECRET
ZOOM_REFRESH_TOKEN
ZOOM_REDIRECT_URI
```

Do not commit the secret value.

---

# 9. Environment Variables

A safe template is stored in:

```text
backend/.env.example
```

Do not commit real `.env` files.

## 9.1 Common Variables

```text
ALLOWED_ORIGIN=https://techsarasolutions.com
S3_BUCKET_NAME=techsara-consultation-bookings
SECRETS_GOOGLE_KEY=/techsara/consultation-booking/google
```

## 9.2 Consultation Booking Lambda Variables

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

## 9.3 Contact Message Lambda Variables

```text
GMAIL_SENDER_EMAIL=hello@techsarasolutions.com
CONTACT_INTERNAL_EMAILS=sales@techsarasolutions.com,hello@techsarasolutions.com
```

Important:

```text
GMAIL_SENDER_EMAIL must be a real Google Workspace mailbox.
```

---

# 10. Google Workspace Requirements

The Google service account must have domain-wide delegation.

Required APIs in Google Cloud:

```text
Google Calendar API
Gmail API
```

Required OAuth scopes in Google Admin Console:

```text
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/gmail.send
```

Final scope field:

```text
https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/gmail.send
```

Google Admin path:

```text
Security
→ Access and data control
→ API controls
→ Domain-wide delegation
→ Manage Domain Wide Delegation
```

Use the numeric service account Client ID, not the service account email.

---

# 11. Zoom Requirements

Zoom app type:

```text
General App OAuth
```

Zoom host email:

```text
jay.soni@techsarasolutions.com
```

Important meeting settings in `zoom.py`:

```text
join_before_host=true
waiting_room=false
```

This allows users to join before the host.

If users still cannot join before host, check Zoom Admin settings:

```text
Join before host = enabled
Waiting Room = not locked/forced
```

---

# 12. Lambda Layer

Shared Lambda dependency layer:

```text
techsara-booking-deps
```

Used by both Lambdas:

```text
techsara-consultation-booking
techsara-contact-message
```

Local dependency file:

```text
backend/layers/techsara-booking-deps/requirements.txt
```

Current requirements:

```text
httpx
google-auth
google-api-python-client
google-auth-httplib2
```

Runtime:

```text
Python 3.11
```

---

# 13. IAM Policy Templates

Local path:

```text
backend/policies/
```

Files:

```text
consultation-booking-policy.json
contact-message-policy.json
```

## 13.1 Booking Lambda Permissions

The booking Lambda needs:

```text
CloudWatch Logs
S3 PutObject/GetObject/DeleteObject
Secrets Manager GetSecretValue for Google secret
Secrets Manager GetSecretValue for Zoom secret
Secrets Manager PutSecretValue for Zoom refresh token rotation
```

## 13.2 Contact Lambda Permissions

The contact Lambda needs:

```text
CloudWatch Logs
Secrets Manager GetSecretValue for Google secret
S3 PutObject for contact messages
```

---

# 14. Testing

Test files are stored in:

```text
backend/test-events/
```

## 14.1 Lambda Test Events

```text
book-consultation-lambda-test.json
contact-message-lambda-test.json
```

## 14.2 Postman Body Examples

```text
book-consultation-postman-body.json
contact-message-postman-body.json
```

---

# 15. Common Issues

## 15.1 No module named google

Error:

```text
Unable to import module 'lambda_function': No module named 'google'
```

Cause:

```text
Lambda dependency layer is missing.
```

Fix:

```text
Attach techsara-booking-deps layer to the Lambda.
```

---

## 15.2 Gmail unauthorized_client

Cause:

```text
gmail.send scope is missing from Google domain-wide delegation.
```

Fix:

```text
Add https://www.googleapis.com/auth/gmail.send
to the same service account Client ID.
```

---

## 15.3 Calendar unauthorized_client

Cause:

```text
calendar.events scope is missing from Google domain-wide delegation.
```

Fix:

```text
Add https://www.googleapis.com/auth/calendar.events
to the same service account Client ID.
```

---

## 15.4 Postman INVALID_JSON

Cause:

```text
Request body is not valid JSON.
```

Common fixes:

```text
Use Body → raw → JSON
Add Content-Type: application/json
Avoid copied invisible/non-breaking spaces
Use clean one-line JSON if needed
```

---

## 15.5 Browser CORS Issue

Cause:

```text
Frontend origin does not match ALLOWED_ORIGIN.
```

Fix:

```text
Set ALLOWED_ORIGIN=https://techsarasolutions.com
```

For local testing, temporarily allow localhost or use:

```text
ALLOWED_ORIGIN=*
```

Do not keep `*` permanently in production unless intentionally required.

---

# 16. Security Notes

Do not commit:

```text
API invoke URL
AWS access keys
Google private key
Google service account JSON
Zoom client secret
Zoom refresh token
Any raw Secrets Manager value
```

Safe to commit:

```text
Lambda source code
README files
aws-resources.md
.env.example
requirements.txt
IAM policy templates
test event examples
Route paths
Resource names
Secret names without secret values
```

---

# 17. Current Backend Status

```text
Consultation booking Lambda works
Zoom meeting creation works
Google Calendar event creation works
Calendar invite email works
Join before host enabled for new Zoom meetings
S3 booking storage works
Contact message Lambda works
Gmail internal email works
Gmail user thank-you email works
S3 contact storage works
API Gateway routes configured
SES disabled
```