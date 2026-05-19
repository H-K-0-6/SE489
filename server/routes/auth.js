const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

const JWT_SECRET = 'your_jwt_secret_key_here'; // In a real app, from .env

// Reusable transport object for Ethereal SMTP testing
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[SMTP] Ethereal test transport initialized: ${testAccount.user}`);
    return transporter;
  } catch (err) {
    console.error('[SMTP Init Error]', err);
    throw err;
  }
}

router.post('/register', async (req, res) => {
  try {
    const { email: rawEmail, password, role, name, shopName, bio, avatarUrl } = req.body;
    
    if (!rawEmail) return res.status(400).json({ error: 'Email is required' });
    const email = rawEmail.toLowerCase();
    
    // Validate email
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, and a number.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || 'CUSTOMER',
        name,
        ...(role === 'ARTISAN' ? {
          profile: {
            create: {
              shopName,
              bio,
              avatarUrl
            }
          }
        } : {})
      }
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    
    if (!rawEmail) return res.status(400).json({ error: 'Email is required' });
    const email = rawEmail.toLowerCase();
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Check lockout
    if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
      return res.status(403).json({ error: 'Account locked. Try again later.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      const failedAttempts = user.failedAttempts + 1;
      let lockoutUntil = null;
      if (failedAttempts >= 5) {
        lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts, lockoutUntil }
      });

      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockoutUntil: null }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, role: user.role, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Checks the email exists, generates a token, and sends an actual
// email containing the reset link using Nodemailer via Ethereal.
// ──────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    if (!rawEmail) return res.status(400).json({ error: 'Email is required' });
    const email = rawEmail.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Always respond with success message to avoid email enumeration
      return res.json({ message: 'We have sent a secure password reset link to your email. Please check your inbox to proceed.' });
    }

    // 15-minute single-use reset token
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send real email via Ethereal
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: '"Artisan Cooperative Marketplace" <noreply@artisanmarket.coop>',
      to: email,
      subject: 'Password Reset Request - Artisan Cooperative Marketplace',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555; line-height: 1.5;">
            Hello <strong>${user.name}</strong>,<br><br>
            We received a request to reset the password for your account associated with this email address.
            If you made this request, please click the secure button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #FFB300; color: #111; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #777; font-size: 0.85em;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${resetLink}" style="color: #0288D1; word-break: break-all;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #aaa; font-size: 0.75em; text-align: center;">
            This link will expire in 15 minutes. If you did not request this reset, you can safely ignore this email.
          </p>
        </div>
      `
    });

    console.log(`[SMTP] Password reset email sent to ${email}`);
    console.log(`[SMTP] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return res.json({
      message: 'We have sent a secure password reset link to your email. Please check your inbox to proceed.'
    });
  } catch (error) {
    console.error('[SMTP Error]', error);
    res.status(500).json({ error: 'Failed to process password reset request. Please try again later.' });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Validates the reset token and saves the new hashed password.
// ──────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    // Validate password strength (same rules as registration)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
      });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Reset token is invalid or has expired.' });
    }

    if (payload.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token purpose.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash, failedAttempts: 0, lockoutUntil: null }
    });

    res.json({ message: 'Password updated successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
