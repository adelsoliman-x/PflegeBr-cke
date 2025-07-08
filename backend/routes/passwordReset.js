const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const transporter = require('../utils/mailer');

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.user.update({
    where: { email },
    data: { verificationCode: resetCode },
  });

  await transporter.sendMail({
    to: email,
    subject: 'Reset your password',
    text: `Use this code to reset your password: ${resetCode}`,
  });

  res.json({ message: 'Reset code sent' });
});

router.post('/request-reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.verificationCode !== code) {
    return res.status(400).json({ message: 'Invalid code' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, verificationCode: null },
  });

  res.json({ message: 'Password reset successfully' });
});

module.exports = router;
