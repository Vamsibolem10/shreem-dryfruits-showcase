# Firebase SMS Integration Setup Guide

## 🚀 Firebase + Twilio SMS Integration

Your application now uses Firebase Cloud Functions with Twilio to send real SMS messages to customers.

## 📋 Prerequisites

1. **Firebase Project**: You already have this configured
2. **Twilio Account**: Create one at https://www.twilio.com/
3. **Node.js**: Version 18 or higher

## 🛠️ Setup Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Functions (if not done)
```bash
firebase init functions
```
Select your existing project and choose JavaScript.

### Step 4: Configure Twilio

1. **Create Twilio Account**: https://www.twilio.com/
2. **Get Credentials**:
   - Account SID
   - Auth Token
   - Phone Number (purchase one)

3. **Set Environment Variables**:
   Create a `.env` file in the root directory:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Step 5: Configure Firebase Functions

#### Option A: Using Environment Variables (Recommended)
The Firebase function now uses environment variables from the `.env` file automatically.

#### Option B: Using Firebase Config (Alternative)
```bash
firebase functions:config:set twilio.sid="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
firebase functions:config:set twilio.token="your_twilio_auth_token"
firebase functions:config:set twilio.phone="+1234567890"
```

### Step 6: Install Functions Dependencies
```bash
cd functions
npm install
```

### Step 7: Deploy Functions
```bash
npm run functions:deploy
```

## 🧪 Testing

### Test Locally
```bash
npm run functions:serve
```

### Test SMS Sending
1. Start your app: `npm run dev`
2. Create a bill with a customer phone number
3. Check Firebase Functions logs: `npm run functions:logs`

## 📱 How SMS Works

### Automatic SMS Triggers
- ✅ **Online Orders**: SMS sent after payment completion
- ✅ **Offline Bills**: SMS sent when employee generates bill
- ✅ **Order Updates**: Status change notifications

### SMS Message Examples
```
Shreem Dry Fruits: Your bill BILL-001 for ₹1829.00 has been generated. Download PDF: [link]
```

```
Shreem Dry Fruits: Order ORD-001 confirmed! Total: ₹1550.00. Track at shreem.com/orders
```

## 🔧 Configuration

### Firebase Functions Config
The `sendSMS` function validates:
- Phone number format
- Message content
- Authentication (optional)

### Error Handling
- Falls back to console logging if Firebase Functions fail
- Comprehensive error logging
- User-friendly error messages

## 💰 Costs

- **Twilio**: ~$0.01-0.05 per SMS (varies by country)
- **Firebase**: Free tier available, then pay per invocation

## 🔒 Security

- Twilio credentials stored securely in Firebase Functions config
- Phone number validation prevents invalid requests
- Optional authentication checks

## 🚀 Production Deployment

1. **Set production Twilio credentials** in Firebase Functions config
2. **Deploy functions**: `firebase deploy --only functions`
3. **Deploy app**: `firebase deploy --only hosting`
4. **Test SMS sending** with real phone numbers

## 📊 Monitoring

- **Firebase Console**: View function logs and performance
- **Twilio Dashboard**: Monitor SMS delivery and costs
- **Browser Console**: Debug client-side SMS calls

## 🆘 Troubleshooting

### Common Issues

1. **"Function not found"**: Deploy functions first
2. **"Invalid phone number"**: Check format (+country code)
3. **"Authentication failed"**: Check Twilio credentials
4. **SMS not received**: Check Twilio phone number verification

### Debug Commands
```bash
# Check function status
firebase functions:list

# View logs
firebase functions:log

# Test function locally
npm run functions:serve
```

## 🎯 Next Steps

1. Complete Twilio setup
2. Deploy Firebase Functions
3. Test SMS sending
4. Monitor delivery rates
5. Set up billing alerts

Your SMS system is now production-ready! 🎉