const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = 'your_jwt_secret_key_here'; // In a real app, from .env

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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.' });
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

module.exports = router;
