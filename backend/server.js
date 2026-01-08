const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads (50MB limit)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'product_photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'));
    }
  }
});

// MongoDB connection (use MONGO_URI from environment)
const mongoUri = process.env.MONGO_URI;

console.log('Attempting to connect to MongoDB Atlas...');

// Improve mongoose settings
mongoose.set('strictQuery', false);

// Add retry logic with exponential backoff and finite attempts
const connectWithRetry = async (maxAttempts = 10, initialDelayMs = 2000) => {
  let attempt = 0;
  let delay = initialDelayMs;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 2
      });
      console.log('✅ MongoDB connected successfully!');
      console.log('Database:', mongoose.connection.db.databaseName);
      return true;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} error:`, err.message);
      if (attempt < maxAttempts) {
        console.log(`Retrying in ${Math.round(delay / 1000)}s... (${attempt}/${maxAttempts})`);
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, delay));
        delay *= 1.5; // exponential backoff
      } else {
        console.error('❌ MongoDB connection failed after maximum attempts. Starting server in fallback mode.');
        console.log('🔧 For Vercel deployment, consider whitelisting 0.0.0.0/0 in MongoDB Atlas Network Access');
        return false;
      }
    }
  }
};

mongoose.connection.on('connected', () => {
  // initialize default users after successful connection
  initializeDefaultUsers().catch(err => console.error('Error initializing default users:', err));
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Initialize default users
async function initializeDefaultUsers() {
  try {
    // Default admin and employee accounts
    const defaultUsers = [
      { id: '1', phoneNumber: 'admin@shreem.com', password: 'admin123', name: 'Admin', role: 'admin' },
      { id: '2', phoneNumber: 'employee@shreem.com', password: 'employee123', name: 'Employee', role: 'employee' }
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ id: userData.id });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const newUser = new User({
          id: userData.id,
          phoneNumber: userData.phoneNumber,
          password: hashedPassword,
          name: userData.name,
          role: userData.role
        });

        await newUser.save();
        console.log(`✅ Default user created: ${userData.phoneNumber}`);
      } else {
        console.log(`ℹ️ Default user already exists: ${userData.phoneNumber}`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing default users:', error);
  }
}

// NOTE: server will be started after attempting MongoDB connection (see bottom of file)

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, default: '' }, // Optional for phone-only customers
  name: { type: String, required: true },
  address: { type: String, default: '' }, // User's address
  role: { type: String, default: 'customer' },
  resetToken: { type: String },
  resetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Twilio removed: SMS functionality is disabled. Use server logs or integrate another provider if needed.

// Billing Schema
const billingSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cash' },
  status: { type: String, default: 'pending' },
  createdBy: { type: String }, // employee/admin phone number
  createdAt: { type: Date, default: Date.now },
  pdfPath: { type: String } // path to generated PDF
});

const Billing = mongoose.model('Billing', billingSchema);

// Stock Schema
const stockSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  inStock: { type: Boolean, default: false }, // true if quantity > 0
  lastUpdatedBy: { type: String }, // phone number of admin/employee who updated
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Stock = mongoose.model('Stock', stockSchema);

// Content Schema (for home page, banners, hero, etc.)
const contentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'hero', 'banner1', 'featured_text'
  title: { type: String },
  description: { type: String },
  imageUrl: { type: String },
  avatarUrl: { type: String }, // For testimonials
  content: { type: String }, // rich HTML or plain text
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdBy: { type: String }, // admin phone
  updatedBy: { type: String }, // admin phone
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Content = mongoose.model('Content', contentSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // phone number or ID of recipient
  userRole: { type: String, enum: ['customer', 'employee', 'admin'], required: true },
  type: { type: String, enum: ['order', 'stock', 'promotion', 'system'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: String }, // reference to order if applicable
  billNumber: { type: String },
  relatedData: { type: Object }, // order details, stock info, etc.
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Product Schema (basic - photos stored on filesystem, not in DB)
const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  photoPath: { type: String }, // path to photo on filesystem
  inStock: { type: Boolean, default: true }, // stock status
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Routes
// NOTE: OTP-based send endpoint removed in favor of password-based auth
app.post('/api/auth/send-otp', async (req, res) => {
  res.status(410).json({ success: false, message: 'OTP flow removed. Use phoneNumber + password registration/login.' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { phoneNumber, password, name, email } = req.body;

    if (!phoneNumber || !name) {
      return res.status(400).json({ success: false, message: 'Phone number and full name are required' });
    }

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        // Check if user already exists
        const existing = await User.findOne({ phoneNumber });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Phone number already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || phoneNumber, salt);

        const newUser = new User({
          id: Date.now().toString(),
          phoneNumber,
          password: hashedPassword,
          name,
          email: email || undefined,
          role: 'customer'
        });

        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;

        return res.json({ success: true, user: userObj, storage: 'mongodb' });

      } catch (mongoError) {
        console.error('MongoDB registration error, falling back to localStorage:', mongoError.message);
        // Fall through to localStorage fallback
      }
    }

    // Fallback to localStorage simulation
    console.log('Using localStorage fallback for registration');
    const fallbackUser = {
      id: Date.now().toString(),
      phoneNumber,
      name,
      role: 'customer'
    };

    res.json({ success: true, user: fallbackUser, storage: 'localStorage', fallback: true });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Check default users first (for admin/employee accounts)
    const defaultUsers = [
      { id: '1', email: 'admin@shreem.com', password: 'admin123', name: 'Admin', role: 'admin' },
      { id: '2', email: 'employee@shreem.com', password: 'employee123', name: 'Employee', role: 'employee' }
    ];

    const defaultUser = defaultUsers.find(u => (u.email === phoneNumber || u.phoneNumber === phoneNumber));
    if (defaultUser) {
      const { password: _, ...userWithoutPassword } = defaultUser;
      return res.json({ success: true, user: userWithoutPassword });
    }

    // For customers: check MongoDB
    if (mongoose.connection.readyState !== 1) {
      // Fallback
      console.log('Using fallback login (MongoDB not connected)');
      const fallbackUser = {
        id: Date.now().toString(),
        phoneNumber,
        name: phoneNumber,
        role: 'customer'
      };
      return res.json({ success: true, user: fallbackUser, fallback: true, isNewUser: true });
    }

    // Find user in database
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // User not found — instruct client to show signup flow instead of auto-registering.
      return res.json({ success: true, exists: false, isNewUser: true, message: 'User not found. Please sign up.' });
    }

    // Existing user
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.resetToken;
    delete userObj.resetExpires;

    res.json({ success: true, user: userObj });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check phone existence or auto-register (called from UI when user enters phone)
app.post('/api/auth/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ success: false, message: 'Phone number required' });

    if (mongoose.connection.readyState !== 1) {
      // Fallback: assume not exists and return that we would create
      return res.json({ success: true, exists: false, fallback: true, message: 'Database not connected; would register' });
    }

    const user = await User.findOne({ phoneNumber });
    if (user) {
      const userObj = user.toObject();
      delete userObj.password;
      return res.json({ success: true, exists: true, user: userObj, message: 'Phone number already exists' });
    }

    // Do not auto-register here. Let the client prompt the user to sign up with full details.
    return res.json({ success: true, exists: false, message: 'Phone number available. Please sign up.' });

  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/auth/update-profile', async (req, res) => {
  try {
    const { phoneNumber, name, address } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (address !== undefined) user.address = address;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.resetToken;
    delete userObj.resetExpires;

    res.json({ success: true, user: userObj });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Forgot password / reset-password removed.
// Policy: if a user forgets their password, the default password is their phone number.
// To change/reset a password programmatically, update the user's password in the database
// (the application can provide an admin-only endpoint or database admin tools).

// Generate unique bill number
function generateBillNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timestamp = Date.now();
  return `BILL-${year}${month}${day}-${timestamp}`;
}

// Send bill email - DISABLED (Resend API removed)
async function sendBillEmail(bill) {
  try {
    // Email functionality disabled - Resend API removed
    console.log(`📧 Email would be sent to ${bill.customerEmail} for bill ${bill.billNumber}`);
    console.log('Bill details:', {
      billNumber: bill.billNumber,
      customerName: bill.customerName,
      total: bill.total,
      items: bill.items.length
    });

    // Return mock success response
    return {
      data: {
        id: `mock-email-${Date.now()}`
      }
    };

  } catch (error) {
    console.error('Bill email send error (disabled):', error);
    throw error;
  }
}

// Billing endpoints
app.post('/api/billing/create', async (req, res) => {
  try {
    const billData = req.body;

    // Validate required fields
    if (!billData.customerName || !billData.items || !Array.isArray(billData.items) || billData.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer name and at least one item are required' });
    }

    // Validate items
    for (const item of billData.items) {
      if (!item.name || !item.quantity || !item.price || item.total === undefined) {
        return res.status(400).json({ success: false, message: 'Invalid item data: name, quantity, price, and total are required' });
      }
    }

    if (billData.subtotal === undefined || billData.total === undefined) {
      return res.status(400).json({ success: false, message: 'Subtotal and total are required' });
    }

    const billNumber = generateBillNumber();

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        const newBill = new Billing({
          ...billData,
          billNumber,
          createdAt: new Date(),
          tax: billData.tax || 0 // Allow tax to be set from request
        });

        await newBill.save();

        // Send email if customer has email - DISABLED
        if (billData.customerEmail) {
          try {
            console.log(`📧 Bill email disabled: Would send bill ${newBill.billNumber} to ${billData.customerEmail}`);
            // await sendBillEmail(newBill);
            // console.log(`Bill email sent to ${billData.customerEmail}`);
          } catch (emailError) {
            console.error('Email send error (disabled):', emailError);
            // Continue without failing the bill creation
          }
        }

        // Create notifications for customer and employees
        try {
          // Customer notification
          if (newBill.customerPhone) {
            const custNotif = new Notification({
              userId: newBill.customerPhone,
              userRole: 'customer',
              type: 'order',
              title: `Order ${newBill.billNumber} created`,
              message: `Your order ${newBill.billNumber} for ₹${newBill.total} has been processed.`,
              billNumber: newBill.billNumber,
              relatedData: { total: newBill.total, items: newBill.items }
            });
            await custNotif.save();
          }

          // Employee notifications: notify all employees in the system
          const employees = await User.find({ role: 'employee' });
          for (const emp of employees) {
            const empNotif = new Notification({
              userId: emp.phoneNumber || emp.id,
              userRole: 'employee',
              type: 'order',
              title: `New order ${newBill.billNumber}`,
              message: `Order ${newBill.billNumber} for ₹${newBill.total} requires processing.`,
              billNumber: newBill.billNumber,
              relatedData: { total: newBill.total, items: newBill.items }
            });
            await empNotif.save();
          }
        } catch (notifErr) {
          console.error('Notification creation error after billing:', notifErr);
        }

        return res.json({
          success: true,
          bill: newBill,
          billNumber,
          storage: 'mongodb',
          pdfGenerated: false, // PDF generation removed
          emailSent: false, // Email functionality disabled
          emailDisabled: true
        });

      } catch (mongoError) {
        console.error('MongoDB billing error, falling back to localStorage:', mongoError.message);
        // Fall through to localStorage fallback
      }
    }

    // Fallback to localStorage simulation
    console.log('Using localStorage fallback for billing');
    const fallbackBill = {
      ...billData,
      billNumber,
      createdAt: new Date(),
      pdfPath: null
    };

    res.json({
      success: true,
      bill: fallbackBill,
      billNumber,
      storage: 'localStorage',
      fallback: true,
      pdfGenerated: false, // PDF generation removed
      emailSent: false, // Email functionality disabled
      emailDisabled: true
    });

  } catch (error) {
    console.error('Billing creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/billing/:billNumber', async (req, res) => {
  try {
    const { billNumber } = req.params;

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        const bill = await Billing.findOne({ billNumber });
        if (bill) {
          return res.json({ success: true, bill, storage: 'mongodb' });
        }
      } catch (mongoError) {
        console.error('MongoDB bill retrieval error:', mongoError.message);
      }
    }

    // Fallback: check if PDF exists
    const pdfPath = path.join(__dirname, 'bills', `${billNumber}.pdf`);
    if (fs.existsSync(pdfPath)) {
      return res.json({
        success: true,
        bill: { billNumber, pdfPath },
        storage: 'filesystem',
        fallback: true
      });
    }

    res.status(404).json({ success: false, message: 'Bill not found' });

  } catch (error) {
    console.error('Bill retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/billing', async (req, res) => {
  try {
    const { date, customer } = req.query;

    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};

        if (date) {
          const startDate = new Date(date);
          const endDate = new Date(date);
          endDate.setDate(endDate.getDate() + 1);
          query.createdAt = { $gte: startDate, $lt: endDate };
        }

        if (customer) {
          query.customerName = { $regex: customer, $options: 'i' };
        }

        const bills = await Billing.find(query).sort({ createdAt: -1 });
        return res.json({ success: true, bills, storage: 'mongodb' });

      } catch (mongoError) {
        console.error('MongoDB bills retrieval error:', mongoError.message);
      }
    }

    // Fallback: return empty array
    // Fallback: if bills are stored on filesystem under shreem_bills, return those for the requested date
    const billsRoot = path.join(__dirname, 'shreem_bills');
    const result = [];
    if (date && fs.existsSync(billsRoot)) {
      const dir = path.join(billsRoot, date);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stats = fs.statSync(fullPath);
          result.push({ billNumber: path.basename(file, '.pdf'), pdfPath: fullPath, createdAt: stats.mtime });
        }
      }
    }

    return res.json({ success: true, bills: result, storage: 'filesystem', fallback: true });

  } catch (error) {
    console.error('Bills retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/billing/pdf/:billNumber', async (req, res) => {
  try {
    const { billNumber } = req.params;
    // Look for PDF in shreem_bills/<date>/<billNumber>.pdf (archived by date)
    const billsRoot = path.join(__dirname, 'shreem_bills');

    // If MongoDB is connected, enforce download only for delivered/completed orders
    if (mongoose.connection.readyState === 1) {
      try {
        const billDoc = await Billing.findOne({ billNumber });
        if (billDoc) {
          const allowed = ['delivered', 'completed'];
          if (!allowed.includes((billDoc.status || '').toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Bill PDF available only after order is delivered' });
          }
        }
      } catch (e) {
        console.error('Error checking bill status before PDF retrieval:', e.message);
        // fall through to filesystem check
      }
    }

    // If the bills root exists, search for the file across date subfolders
    let foundPath = null;
    if (fs.existsSync(billsRoot)) {
      const dates = fs.readdirSync(billsRoot);
      for (const d of dates) {
        const candidate = path.join(billsRoot, d, `${billNumber}.pdf`);
        if (fs.existsSync(candidate)) {
          foundPath = candidate;
          break;
        }
      }
    }

    // Fallback: previous location
    if (!foundPath) {
      const legacy = path.join(__dirname, 'bills', `${billNumber}.pdf`);
      if (fs.existsSync(legacy)) foundPath = legacy;
    }

    if (foundPath) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${billNumber}.pdf"`);
      const fileStream = fs.createReadStream(foundPath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ success: false, message: 'PDF not found' });
    }

  } catch (error) {
    console.error('PDF retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: export orders and income to Excel
app.get('/api/admin/export-excel', async (req, res) => {
  try {
    let bills = [];
    if (mongoose.connection.readyState === 1) {
      bills = await Billing.find().sort({ createdAt: -1 });
    } else {
      console.log('Database not connected, exporting empty Excel');
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Shreem Admin';
    workbook.created = new Date();

    // Orders Sheet
    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Bill Number', key: 'billNumber', width: 20 },
      { header: 'Date', key: 'createdAt', width: 15 },
      { header: 'Customer Name', key: 'customerName', width: 20 },
      { header: 'Customer Phone', key: 'customerPhone', width: 15 },
      { header: 'Items Count', key: 'itemsCount', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 10 },
      { header: 'Tax', key: 'tax', width: 10 },
      { header: 'Discount', key: 'discount', width: 10 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Created By', key: 'createdBy', width: 15 }
    ];

    bills.forEach(bill => {
      ordersSheet.addRow({
        billNumber: bill.billNumber,
        createdAt: bill.createdAt ? bill.createdAt.toLocaleDateString() : '',
        customerName: bill.customerName,
        customerPhone: bill.customerPhone,
        itemsCount: bill.items ? bill.items.length : 0,
        subtotal: bill.subtotal,
        tax: bill.tax || 0,
        discount: bill.discount || 0,
        total: bill.total,
        paymentMethod: bill.paymentMethod,
        status: bill.status,
        createdBy: bill.createdBy
      });
    });

    // Income Sheet (daily summary)
    const incomeSheet = workbook.addWorksheet('Income Summary');
    incomeSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Total Orders', key: 'orders', width: 10 },
      { header: 'Total Income', key: 'income', width: 15 },
      { header: 'Total Tax', key: 'tax', width: 10 },
      { header: 'Total Discount', key: 'discount', width: 10 },
      { header: 'Net Income', key: 'netIncome', width: 15 }
    ];

    const dailySummary = {};
    bills.forEach(bill => {
      const date = bill.createdAt ? bill.createdAt.toISOString().split('T')[0] : 'unknown';
      if (!dailySummary[date]) {
        dailySummary[date] = { orders: 0, income: 0, tax: 0, discount: 0 };
      }
      dailySummary[date].orders += 1;
      dailySummary[date].income += bill.total;
      dailySummary[date].tax += bill.tax || 0;
      dailySummary[date].discount += bill.discount || 0;
    });

    Object.keys(dailySummary).sort().forEach(date => {
      const data = dailySummary[date];
      incomeSheet.addRow({
        date,
        orders: data.orders,
        income: data.income,
        tax: data.tax,
        discount: data.discount,
        netIncome: data.income - data.discount
      });
    });

    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=shreem-orders-income-${new Date().toISOString().split('T')[0]}.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// ==================== USER ORDERS (My Orders) ====================
// Get orders for a specific user (by phone number)
// Optional query: ?filter=past|present
app.get('/api/orders/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const filter = (req.query.filter || '').toString().toLowerCase();

    if (!phoneNumber) return res.status(400).json({ success: false, message: 'Phone number required' });

    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, orders: [], fallback: true, message: 'Database not connected' });
    }

    let query = { customerPhone: phoneNumber };

    if (filter === 'past') {
      // Past: delivered or completed
      query.status = { $in: ['delivered', 'completed'] };
    } else if (filter === 'present') {
      // Present: not delivered/completed
      query.status = { $nin: ['delivered', 'completed'] };
    }

    const orders = await Billing.find(query).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('User orders retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Email endpoints - DISABLED (Resend API removed)
app.post('/api/email/send-bill', async (req, res) => {
  try {
    const { billNumber, customerEmail, customerName } = req.body;

    if (!billNumber || !customerEmail) {
      return res.status(400).json({ success: false, message: 'Bill number and customer email are required' });
    }

    // Email functionality disabled - just log and return success
    console.log(`📧 Bill email disabled: Would send bill ${billNumber} to ${customerEmail}`);

    res.json({
      success: true,
      message: 'Bill email functionality disabled (Resend API removed)',
      emailId: `disabled-${Date.now()}`
    });

  } catch (error) {
    console.error('Email send error (disabled):', error);
    res.status(500).json({ success: false, message: 'Email functionality disabled' });
  }
});

app.post('/api/email/send-notification', async (req, res) => {
  try {
    const { to, subject, message, type = 'general' } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Recipient, subject, and message are required' });
    }

    // Email functionality disabled - just log and return success
    console.log(`📧 Notification email disabled: Would send "${subject}" to ${to}`);

    res.json({
      success: true,
      message: 'Email notification functionality disabled (Resend API removed)',
      emailId: `disabled-${Date.now()}`
    });

  } catch (error) {
    console.error('Email send error (disabled):', error);
    res.status(500).json({ success: false, message: 'Email functionality disabled' });
  }
});

app.post('/api/email/send-order-confirmation', async (req, res) => {
  try {
    const { orderId, customerEmail, customerName, orderDetails } = req.body;

    if (!orderId || !customerEmail || !orderDetails) {
      return res.status(400).json({ success: false, message: 'Order ID, customer email, and order details are required' });
    }

    // Email functionality disabled - just log and return success
    console.log(`📧 Order confirmation email disabled: Would send order ${orderId} to ${customerEmail}`);

    res.json({
      success: true,
      message: 'Order confirmation email functionality disabled (Resend API removed)',
      emailId: `disabled-${Date.now()}`
    });

  } catch (error) {
    console.error('Order confirmation email error (disabled):', error);
    res.status(500).json({ success: false, message: 'Email functionality disabled' });
  }
});

// ==================== STOCK MANAGEMENT ====================
// Get all stock info
app.get('/api/stock', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, stock: [], fallback: true });
    }
    const stock = await Stock.find().sort({ updatedAt: -1 });
    res.json({ success: true, stock });
  } catch (error) {
    console.error('Stock retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get stock for single product
app.get('/api/stock/:productId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, stock: null, fallback: true });
    }
    const stock = await Stock.findOne({ productId: req.params.productId });
    res.json({ success: true, stock });
  } catch (error) {
    console.error('Stock retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update stock (admin/employee only)
app.post('/api/stock/update', async (req, res) => {
  try {
    const { productId, productName, quantity, updatedBy } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product ID and quantity required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    let stock = await Stock.findOne({ productId });
    
    if (!stock) {
      stock = new Stock({
        productId,
        productName: productName || productId,
        quantity,
        inStock: quantity > 0,
        lastUpdatedBy: updatedBy
      });
    } else {
      stock.quantity = quantity;
      stock.inStock = quantity > 0;
      stock.lastUpdatedBy = updatedBy;
      stock.updatedAt = new Date();
    }

    await stock.save();

    // Notify users if stock changed significantly
    if (stock.inStock && quantity > 5) {
      console.log(`✅ Stock updated for ${productName}: ${quantity} units available`);
    } else if (!stock.inStock) {
      console.log(`❌ Stock out: ${productName} is now unavailable`);
    }

    res.json({ success: true, stock });
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== PRODUCT PHOTO UPLOAD ====================
// Upload product photo (max 50MB)
app.post('/api/products/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { productId, productName } = req.body;
    const photoPath = `/product_photos/${req.file.filename}`;

    // NOTE: Per requirements, products (metadata) should NOT be stored in the DB here.
    // We only store the uploaded photo on disk and return its path. If you need
    // to associate photos with products, do that via a separate CMS/content flow.

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoPath,
      fileName: req.file.filename,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// Upload testimonial avatar
app.post('/api/testimonials/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar uploaded' });
    }

    // Move file from product_photos to testimonial_avatars directory
    const sourcePath = path.join(__dirname, 'product_photos', req.file.filename);
    const avatarDir = path.join(__dirname, 'testimonial_avatars');
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }

    const avatarPath = path.join(avatarDir, req.file.filename);
    fs.renameSync(sourcePath, avatarPath);

    const publicPath = `/testimonial_avatars/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarPath: publicPath,
      fileName: req.file.filename,
      fileSize: req.file.size
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// Serve logo directly from backend directory
app.get('/logo.png', (req, res) => {
  const logoPath = path.join(__dirname, 'logo.png');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).json({ success: false, message: 'Logo not found' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, products: [], fallback: true });
    }
    const products = await Product.find().sort({ createdAt: -1 });
    
    // Get base URL for images (in production, this should be the same domain)
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `${req.protocol}://${req.get('host')}`
      : 'http://localhost:5002';
    
    // Transform products to match frontend interface (photoPath -> image)
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.photoPath ? `${baseUrl}${product.photoPath}` : 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=500',
      weight: '500g', // Default weight since not stored in DB
      inStock: product.inStock !== undefined ? product.inStock : true, // Use stored value or default to true
      featured: false, // Default featured since not stored in DB
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
    
    res.json({ success: true, products: transformedProducts });
  } catch (error) {
    console.error('Products retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get product info with photo
app.get('/api/products/:productId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, product: null, fallback: true });
    }
    const product = await Product.findOne({ id: req.params.productId });
    const stock = await Stock.findOne({ productId: req.params.productId });
    
    res.json({ success: true, product, stock });
  } catch (error) {
    console.error('Product retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new product
app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;

    if (!productData.name || !productData.price) {
      return res.status(400).json({ success: false, message: 'Product name and price are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const newProduct = new Product({
      id: Date.now().toString(),
      name: productData.name,
      description: productData.description,
      price: productData.price,
      photoPath: productData.image, // Store the uploaded photo path
      category: productData.category,
      inStock: productData.inStock !== undefined ? productData.inStock : true, // Default to true
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newProduct.save();

    // Get base URL for images
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `${req.protocol}://${req.get('host')}`
      : 'http://localhost:5002';

    // Transform the product to match frontend interface
    const transformedProduct = {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      category: newProduct.category,
      image: newProduct.photoPath ? `${baseUrl}${newProduct.photoPath}` : 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=500',
      weight: '500g', // Default weight
      inStock: newProduct.inStock,
      featured: false, // Default featured
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt
    };

    res.json({ success: true, product: transformedProduct });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update product
app.put('/api/products/:productId', async (req, res) => {
  try {
    const productData = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const product = await Product.findOne({ id: req.params.productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update fields
    if (productData.name !== undefined) product.name = productData.name;
    if (productData.description !== undefined) product.description = productData.description;
    if (productData.price !== undefined) product.price = productData.price;
    if (productData.image !== undefined) product.photoPath = productData.image;
    if (productData.category !== undefined) product.category = productData.category;
    if (productData.inStock !== undefined) product.inStock = productData.inStock;
    product.updatedAt = new Date();

    await product.save();

    // Get base URL for images
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `${req.protocol}://${req.get('host')}`
      : 'http://localhost:5002';

    // Transform the product to match frontend interface
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.photoPath ? `${baseUrl}${product.photoPath}` : 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=500',
      weight: '500g', // Default weight
      inStock: product.inStock,
      featured: false, // Default featured
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.json({ success: true, product: transformedProduct });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete product
app.delete('/api/products/:productId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const product = await Product.findOneAndDelete({ id: req.params.productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Also delete associated stock if exists
    await Stock.findOneAndDelete({ productId: req.params.productId });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Serve product photos statically
app.use('/product_photos', express.static(path.join(__dirname, 'product_photos')));

// Serve testimonial avatars statically
app.use('/testimonial_avatars', express.static(path.join(__dirname, 'testimonial_avatars')));

// ==================== CONTENT MANAGEMENT ====================
// Get all content (for home page, banners, etc.)
app.get('/api/content', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, content: [], fallback: true });
    }
    const content = await Content.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, content });
  } catch (error) {
    console.error('Content retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single content section
app.get('/api/content/:key', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, content: null, fallback: true });
    }
    const content = await Content.findOne({ key: req.params.key });
    res.json({ success: true, content });
  } catch (error) {
    console.error('Content retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create/Update content (admin only)
app.post('/api/content/save', async (req, res) => {
  try {
    const { key, title, description, imageUrl, avatarUrl, content, order, active, createdBy } = req.body;

    if (!key) {
      return res.status(400).json({ success: false, message: 'Content key is required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    let contentDoc = await Content.findOne({ key });
    
    if (!contentDoc) {
      contentDoc = new Content({
        key,
        title,
        description,
        imageUrl,
        avatarUrl,
        content,
        order: order || 0,
        active: active !== false,
        createdBy
      });
    } else {
      contentDoc.title = title || contentDoc.title;
      contentDoc.description = description || contentDoc.description;
      contentDoc.imageUrl = imageUrl || contentDoc.imageUrl;
      contentDoc.avatarUrl = avatarUrl || contentDoc.avatarUrl;
      contentDoc.content = content || contentDoc.content;
      if (order !== undefined) contentDoc.order = order;
      if (active !== undefined) contentDoc.active = active;
      contentDoc.updatedBy = createdBy;
      contentDoc.updatedAt = new Date();
    }

    await contentDoc.save();

    // Broadcast content change to all connected clients (if using WebSocket)
    console.log(`📝 Content updated: ${key}`);

    res.json({ success: true, content: contentDoc, message: 'Content saved successfully' });
  } catch (error) {
    console.error('Content save error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== NOTIFICATIONS ====================
// Get notifications for user
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, notifications: [], fallback: true });
    }
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Notifications retrieval error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark notification as read
app.post('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create notification (for orders, stock changes, etc.)
app.post('/api/notifications/create', async (req, res) => {
  try {
    const { userId, userRole, type, title, message, orderId, billNumber, relatedData } = req.body;

    if (!userId || !type || !title) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    if (mongoose.connection.readyState !== 1) {
      // Log notification in fallback mode
      console.log(`📢 Notification: [${type}] ${title} - ${message}`);
      return res.json({ success: true, fallback: true });
    }

    const notification = new Notification({
      userId,
      userRole: userRole || 'customer',
      type,
      title,
      message,
      orderId,
      billNumber,
      relatedData
    });

    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Notification creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get unread notification count
app.get('/api/notifications/:userId/unread-count', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, count: 0, fallback: true });
    }

    const count = await Notification.countDocuments({
      userId: req.params.userId,
      read: false
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Global error handlers to keep server running and provide diagnostics
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception thrown:', err);
});

// Start server after attempting MongoDB connection (will still start in fallback mode if DB fails)
(async () => {
  const connected = await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${connected ? 'MongoDB connected' : 'MongoDB not connected'})`);
  });
})();
