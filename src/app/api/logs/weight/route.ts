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
    const { weightKg } = await req.json();
    const weightLog = await prisma.weightLog.create({
      data: { userId, weightKg: Number(weightKg) }
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: { currentWeightKg: Number(weightKg) }
    });
    
    return NextResponse.json(weightLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
  }
}
