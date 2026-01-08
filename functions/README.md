# Firebase Cloud Functions for SMS

This directory contains Firebase Cloud Functions for sending SMS messages via Twilio.

## Setup Instructions

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Twilio Credentials

#### Option A: Using Firebase Functions Config (Recommended for production)
```bash
firebase functions:config:set twilio.sid="your_twilio_account_sid"
firebase functions:config:set twilio.token="your_twilio_auth_token"
firebase functions:config:set twilio.phone="your_twilio_phone_number"
```

#### Option B: Using Environment Variables (for local development)
Create a `.env` file in the functions directory:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 3. Deploy Functions
```bash
firebase deploy --only functions
```

### 4. Test Locally
```bash
npm run serve
```

## Twilio Setup

1. Create a Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number for sending SMS
4. Add the credentials to Firebase Functions config

## Usage

The SMS service will automatically use Firebase Cloud Functions to send SMS messages. If the function call fails, it falls back to console logging for development.

## Security Notes

- Never commit Twilio credentials to version control
- Use Firebase Functions config for production deployments
- Consider implementing rate limiting and authentication checks