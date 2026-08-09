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
    const { weightKg } = await req.json();
    
    const { data: weightLog, error: logError } = await supabase
      .from('WeightLog')
      .insert([{ userId, weightKg: Number(weightKg) }])
      .select()
      .single();
      
    if (logError || !weightLog) {
      console.error(logError);
      return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
    }
    
    const { error: updateError } = await supabase
      .from('User')
      .update({ currentWeightKg: Number(weightKg) })
      .eq('id', userId);

    if (updateError) {
      console.error(updateError);
    }
    
    return NextResponse.json(weightLog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to log weight' }, { status: 500 });
  }
}
