const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // الأفضل يبقى فوق مع المتغيرات

// ✅ إنشاء أو تحديث اشتراك
router.post('/subscribe', authenticateToken, async (req, res) => {
  const { status, expiryDate } = req.body;

  try {
    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        status,
        expiryDate: new Date(expiryDate),
      },
    });

    res.json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ طلب اشتراك يدوي (مثل زر "Renew Subscription")
router.post('/request-subscription', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { duration = 12 } = req.body;

  try {
    // تأكد ما فيش طلب سابق
    const existing = await prisma.cashRequest.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    const newRequest = await prisma.cashRequest.create({
      data: {
        userId,
        duration,
        status: 'pending',
      },
    });

    res.json({ message: 'Request sent successfully', newRequest });
  } catch (error) {
    console.error('❌ Failed to create manual subscription request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ جلب اشتراك المستخدم
router.get('/my-subscription', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// ✅ إنشاء Stripe Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [
        {
          price: 'price_1Rejma2aTkS63to0e63IfW9N', // تأكد إنه موجود فعلاً في test mode
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
    });

    if (!session.url) {
      console.error('❌ No checkout URL returned from Stripe');
      return res.status(500).json({ error: 'No checkout URL returned' });
    }

    console.log('✅ Stripe session created:', session.url);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


module.exports = router;
