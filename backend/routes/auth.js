const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();
const transporter = require('../utils/mailer');
const prisma = new PrismaClient();

// ✅ Register a new user
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // 1️⃣ التحقق من الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const blockedDomains = ['example.com', 'test.com', 'fake.com'];
    const domain = email.split('@')[1];

    if (!emailRegex.test(email) || blockedDomains.includes(domain)) {
      return res.status(400).json({ message: 'Please use a valid real email address' });
    }

    // 2️⃣ التحقق من قوة كلمة السر
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // 3️⃣ تحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 4️⃣ إنشاء مستخدم جديد
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user',
      },
      
    });

    // 5️⃣ اشتراك فارغ مبدأي
    await prisma.subscription.create({
      data: {
        userId: user.id,
        status: 'inactive',
        expiryDate: null,
      },
    });

    // 6️⃣ JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_end: null,
      },
    });
   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

// Update the existing user with verificationCode
await prisma.user.update({
  where: { id: user.id },
  data: {
    verificationCode,
    emailVerified: false,
  },
});


// أرسل الإيميل باستخدام nodemailer
await transporter.sendMail({
  to: email,
  subject: 'Verify your account',
  text: `Your verification code is: ${verificationCode}`,
});

  } 
  catch (err) {
    console.error('🔴 Error in /register:', err);
    res.status(500).json({ message: 'Server error' });
  }

});

router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.verificationCode !== code) {
    return res.status(400).json({ message: 'Invalid code' });
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: true, verificationCode: null },
  });

  res.json({ message: 'Email verified successfully' });
});

// ✅ Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_end: user.subscription?.expiryDate || null,
      },
    });
  } catch (err) {
    console.error('🔴 Error in /me:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription_end: user.subscription?.expiryDate || null,
      },
    });
  } catch (err) {
    console.error('🔴 Error in /login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
