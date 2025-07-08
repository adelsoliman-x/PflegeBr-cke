// routes/checkout.js

const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: 'prod_SZtZta36EIwrkc', // استبدل بـ Price ID من Stripe
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:5000/success',
    cancel_url: 'http://localhost:5000/cancel',
    metadata: {
      userId: req.body.userId, // عشان نربط الدفع بالمستخدم
    },
  });

  res.json({ url: session.url });
});

module.exports = router;
