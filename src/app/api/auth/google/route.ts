import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Check if user exists in our custom User table
    const { data: user, error: checkError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (checkError || !user) {
      // User not found in our database, they need to complete registration (Step 2)
      return NextResponse.json({ error: 'User not found. Please complete registration.' }, { status: 404 });
    }

    // User exists! Generate our custom JWT token for them
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({ 
      token, 
      userId: user.id, 
      name: user.name, 
      email: user.email 
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
