const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ يرسل المستخدم طلب اشتراك (من اليوزر)
 */
router.post('/cash-request', authenticateToken, async (req, res) => {
  const duration = 12;

  
  try {
    const existing = await prisma.cashRequest.findFirst({
      where: {
        userId: req.user.id,
        status: 'pending',
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'requestExists' });
    }

    await prisma.cashRequest.create({
      data: {
        userId: req.user.id,
        duration,
        status: 'pending',
      },
    });

    res.status(201).json({ message: 'requestSent' });
  } catch (err) {
    console.error('User cash request error:', err);
    res.status(500).json({ message: 'serverError' });
  }
});

/**
 * ✅ يحصل الأدمن على كل الطلبات
 */
router.get('/admin/cash-requests', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'unauthorized' });
  }

  try {
    const requests = await prisma.cashRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(requests);
  } catch (err) {
    console.error('Admin cash request fetch error:', err);
    res.status(500).json({ message: 'serverError' });
  }
});

/**
 * ✅ رفض طلب كاش من الأدمن
 */
router.post('/admin/cash-requests/:id/reject', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'unauthorized' });
  }

  try {
const id = req.params.id;
if (!id || typeof id !== 'string') return res.status(400).json({ message: 'invalidId' });

    await prisma.cashRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });

    res.json({ message: 'requestRejected' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ message: 'serverError' });
  }
});

/**
 * ✅ قبول الطلب وتفعيل الاشتراك
 */
router.post('/admin/cash-requests/:id/approve', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'unauthorized' });
  }

const id = req.params.id;
  const duration = req.body?.duration || 12;

if (!id || typeof id !== 'string') return res.status(400).json({ message: 'invalidId' });
  try {
    const request = await prisma.cashRequest.update({
      where: { id:id },
      data: { status: 'approved', duration },
    });

    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + duration);

    await prisma.subscription.upsert({
      where: { userId: request.userId },
      update: {
        expiryDate: subscriptionEnd,
        status: 'active',
      },
      create: {
        userId: request.userId,
        expiryDate: subscriptionEnd,
        status: 'active',
      },
    });

    res.json({ message: 'requestApproved' });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ message: 'serverError' });
  }
});

module.exports = router;
