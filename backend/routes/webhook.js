const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ❗ مهم جدًا: نستخدم express.raw قبل أي bodyParser
router.post(
  '/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const userEmail = session.customer_email;
      const stripeSubId = session.subscription;

      try {
        // 🟡 تحقق إن الإيميل موجود
        if (!userEmail) {
          console.error('❌ customer_email not found in session');
          return res.status(400).send('Missing customer_email');
        }

        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        if (!user) {
          console.error('❌ No user found with email:', userEmail);
          return res.status(404).send('User not found');
        }

        // ✅ مدة الاشتراك سنة من تاريخ اليوم
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);

        // ✅ تحديث أو إنشاء الاشتراك
        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            status: 'active',
            expiryDate: expiry,
          },
          create: {
            userId: user.id,
            status: 'active',
            expiryDate: expiry,
          },
        });

        console.log('✅ Subscription activated for user:', userEmail);
      } catch (err) {
        console.error('❌ Error handling subscription:', err.message);
        return res.status(500).send('Server error');
      }
    }

    res.status(200).json({ received: true });
  }
);

module.exports = router;
