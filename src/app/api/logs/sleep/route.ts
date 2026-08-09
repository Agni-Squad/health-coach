import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    const { hours, sleepScore } = await req.json();
    const { data: sleepLog, error } = await supabase
      .from('SleepLog')
      .insert([{ userId, hours: Number(hours), sleepScore: sleepScore ? Number(sleepScore) : null }])
      .select()
      .single();

    if (error || !sleepLog) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 });
    }
    return NextResponse.json(sleepLog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to log sleep' }, { status: 500 });
  }
}
