const functions = require('firebase-functions');
const twilio = require('twilio');
const { MongoClient } = require('mongodb');

// MongoDB connection string
const mongoUri = 'mongodb+srv://bolemvamsi:Mike@0501@cluster0.9iryn.mongodb.net/?appName=Cluster0';
const client = new MongoClient(mongoUri);

// Twilio credentials from Firebase Functions config
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioPhoneNumber = functions.config().twilio.phone;

const twilioClient = new twilio(accountSid, authToken);

exports.sendSMS = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated (optional)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  // }

  const { to, message } = data;

  // Validate input
  if (!to || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Phone number and message are required');
  }

  // Validate phone number format (basic validation)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(to.replace(/\s+/g, ''))) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format');
  }

  try {
    // Send SMS via Twilio
    const sms = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });

    console.log('SMS sent successfully:', {
      sid: sms.sid,
      to: to,
      status: sms.status
    });

    return {
      success: true,
      messageId: sms.sid,
      status: sms.status
    };

  } catch (error) {
    console.error('Error sending SMS:', error);

    throw new functions.https.HttpsError('internal', 'Failed to send SMS', {
      error: error.message,
      code: error.code
    });
  }
});

// User registration function
exports.registerUser = functions.https.onCall(async (data, context) => {
  const { email, password, name } = data;

  // Validate input
  if (!email || !password || !name) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, password, and name are required');
  }

  try {
    await client.connect();
    const db = client.db('shreemDB');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      throw new functions.https.HttpsError('already-exists', 'User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, hash the password
      name,
      role: 'customer',
      createdAt: new Date()
    };

    await users.insertOne(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: userWithoutPassword
    };

  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'already-exists') {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to register user');
  } finally {
    await client.close();
  }
});

// User login function
exports.loginUser = functions.https.onCall(async (data, context) => {
  const { email, password } = data;

  // Validate input
  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and password are required');
  }

  try {
    await client.connect();
    const db = client.db('shreemDB');
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ email, password });
    if (!user) {
      return { success: false };
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword
    };

  } catch (error) {
    console.error('Error logging in user:', error);
    throw new functions.https.HttpsError('internal', 'Failed to login user');
  } finally {
    await client.close();
  }
});

// Get all users function (for admin purposes)
exports.getUsers = functions.https.onCall(async (data, context) => {
  try {
    await client.connect();
    const db = client.db('shreemDB');
    const users = db.collection('users');

    const allUsers = await users.find({}).toArray();

    // Return users without passwords
    const usersWithoutPasswords = allUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      success: true,
      users: usersWithoutPasswords
    };

  } catch (error) {
    console.error('Error getting users:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get users');
  } finally {
    await client.close();
  }
});