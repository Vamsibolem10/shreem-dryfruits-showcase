const mongoose = require('mongoose');

// Test MongoDB connection
const testConnection = async () => {
  const mongoUri = 'mongodb+srv://bolemvamsi:Mike%400501@cluster0.9iryn.mongodb.net/?retryWrites=true&w=majority';

  console.log('Testing MongoDB connection...');
  console.log('Connection string:', mongoUri.replace(/:([^:@]{4})[^:@]*@/, ':$1****@')); // Hide password

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log('✅ MongoDB connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);

    // Test creating a collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted successfully');

    // Clean up
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Test document cleaned up');

    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');

  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('2. Verify your username and password');
      console.log('3. Make sure the database user has read/write permissions');
      console.log('4. Try creating a new database user in Atlas');
    }

    process.exit(1);
  }
};

testConnection();