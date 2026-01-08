# MongoDB Atlas Setup Guide

## Current Status
❌ MongoDB connection failed: bad auth : authentication failed

## Step-by-Step Setup

### 1. Access MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account

### 2. Check Database Access
1. Click on "Database Access" in the left sidebar
2. Make sure you have a user named `bolemvamsi` with proper permissions
3. If not, create a new user:
   - Click "Add New Database User"
   - Username: `bolemvamsi`
   - Password: `Mike@0501`
   - Built-in Role: `Read and write any database`

### 3. Whitelist Your IP Address (Most Important!)
1. Click on "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0) for testing
4. Or add your specific IP address
5. Save the changes

### 4. Get Connection String
1. Click on "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (should look like yours)

### 5. Test Connection
After whitelisting your IP, run:
```bash
cd backend
node test-mongo.js
```

## Alternative: Use Local MongoDB
If Atlas setup is difficult, you can use local MongoDB:

1. Install MongoDB locally
2. Update connection string in `server.js`:
```javascript
const mongoUri = 'mongodb://localhost:27017/shreemDB';
```

## Current Fallback Mode
The app is currently working in fallback mode using localStorage. User registration will work, but data won't persist between sessions.

Once MongoDB is connected, all user data will be stored in the cloud database.