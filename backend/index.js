const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const passwordResetRoutes = require('./routes/passwordReset');
const cashRequestRoutes = require('./routes/cashRequest');
const authRoutes = require('./routes/auth');

// 🟡 Stripe webhook route لازم قبل json parser
app.use('/stripe/webhook', require('./routes/webhook'));

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/password', require('./routes/passwordReset'));
app.use('/api', require('./routes/user'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api', require('./routes/cashRequest'));
app.use('/stripe', require('./routes/stripe'));


// ✅ Admin route to activate subscription manually
function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

app.post('/admin/activate-cash', isAdmin, async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  try {
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // سنة
      },
      create: {
        userId,
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({ message: 'تم تفعيل الاشتراك بنجاح ✅', subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ أثناء التفعيل' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
