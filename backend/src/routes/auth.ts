import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

authRouter.post('/register', async (req, res) => {
  try {
    const {
      name, phone, email, password, dateOfBirth, gender,
      heightCm, currentWeightKg, targetWeightKg,
      bloodGroup, country, state, city, lifestyle, occupation,
      wakeTime, sleepTime, dietaryPreference, medicalConditions,
      medications, allergies
    } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name, phone, email, passwordHash,
        dateOfBirth: new Date(dateOfBirth),
        gender, heightCm, currentWeightKg, targetWeightKg,
        bloodGroup, country, state, city, lifestyle, occupation,
        wakeTime, sleepTime, dietaryPreference, medicalConditions,
        medications, allergies
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, userId: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, name: user.name, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
