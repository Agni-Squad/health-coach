import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const body = await req.json();
    const { type, payload } = body; // type can be 'vitals' or 'medication'

    if (type === 'vitals') {
      const { data, error } = await supabase
        .from('medical_vitals')
        .insert([{ userId, ...payload }]);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } 
    
    if (type === 'medication') {
      const { data, error } = await supabase
        .from('medications')
        .insert([{ userId, ...payload }]);

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: 'Invalid medical log type' }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
