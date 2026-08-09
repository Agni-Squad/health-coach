import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

function authenticate(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  const userId = authenticate(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { exerciseType, durationMin } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const metValues: Record<string, number> = {
      'walking': 3.5, 'running': 8.0, 'cycling': 6.0, 'gym': 5.0, 'yoga': 2.5, 'swimming': 7.0, 'home workout': 4.0
    };
    const met = metValues[exerciseType.toLowerCase()] || 4.0;
    
    const caloriesBurned = met * user.currentWeightKg * (Number(durationMin) / 60);

    const exerciseLog = await prisma.exerciseLog.create({
      data: { userId, exerciseType, durationMin: Number(durationMin), caloriesBurned }
    });
    return NextResponse.json(exerciseLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log exercise' }, { status: 500 });
  }
}
