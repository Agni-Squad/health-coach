import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase';

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

    const { data: existingUsers, error: checkError } = await supabase
      .from('User')
      .select('id')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .limit(1);

    if (checkError) {
      console.error(checkError);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: 'Email or phone already exists.' }, { status: 400 });
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : '';

    const { data: user, error: insertError } = await supabase
      .from('User')
      .insert([
        {
          name, phone, email, passwordHash,
          dateOfBirth: new Date(dateOfBirth).toISOString(),
          gender, heightCm, currentWeightKg, targetWeightKg,
          bloodGroup, country, state, city, lifestyle, occupation,
          wakeTime, sleepTime, dietaryPreference, medicalConditions,
          medications, allergies
        }
      ])
      .select()
      .single();

    if (insertError || !user) {
      console.error(insertError);
      return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({ token, userId: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
