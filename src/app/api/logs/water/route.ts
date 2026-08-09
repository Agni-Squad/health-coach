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
    const { quantityMl } = await req.json();
    const { data: waterLog, error } = await supabase
      .from('WaterLog')
      .insert([{ userId, quantityMl: Number(quantityMl) }])
      .select()
      .single();

    if (error || !waterLog) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to log water' }, { status: 500 });
    }
    return NextResponse.json(waterLog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to log water' }, { status: 500 });
  }
}
