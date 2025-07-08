const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ GET /api/admin/users
 * Accessible by: Admin only
 * Returns: قائمة بجميع المستخدمين مع تفاصيل الاشتراك
 */
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    // تحقق من صلاحيات الأدمن
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'unauthorized' });
    }

    // جلب كل المستخدمين وترتيبهم من الأحدث إلى الأقدم
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscription: {
          select: {
            expiryDate: true,
            status: true,
          },
        },
      },
    });

    return res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    return res.status(500).json({ message: 'serverError' });
  }
});

module.exports = router;
