import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name, phone, email, password, dateOfBirth, gender,
      heightCm, currentWeightKg, targetWeightKg,
      bloodGroup, country, state, city, lifestyle, occupation,
      wakeTime, sleepTime, dietaryPreference, medicalConditions,
      medications, allergies
    } = body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or phone already exists.' }, { status: 400 });
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

    return NextResponse.json({ token, userId: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
