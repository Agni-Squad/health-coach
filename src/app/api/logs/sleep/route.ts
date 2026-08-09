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
    const { hours } = await req.json();
    const sleepScore = Math.max(0, 100 - Math.abs(8 - Number(hours)) * 10);
    const sleepLog = await prisma.sleepLog.create({
      data: { userId, hours: Number(hours), sleepScore }
    });
    return NextResponse.json(sleepLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 });
  }
}
