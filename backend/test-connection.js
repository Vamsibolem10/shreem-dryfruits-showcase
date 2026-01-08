const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://bolemvamsi:Mike%400501@cluster0.9iryn.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  mongoose.connection.close();
})
.catch(err => {
  console.log('MongoDB connection error:', err.message);
  process.exit(1);
});