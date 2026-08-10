import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { targetWeightKg, targetDate, currentWeightKg, heightCm } = body;
    
    // Automatically determine goal type based on weights
    let goalType = 'Weight Maintenance';
    if (targetWeightKg < currentWeightKg) goalType = 'Weight Loss';
    else if (targetWeightKg > currentWeightKg) goalType = 'Weight Gain';

    const { data: user, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Update User table with new weight and height from the form
    if (currentWeightKg || heightCm) {
      await supabase
        .from('User')
        .update({ 
          currentWeightKg: currentWeightKg || user.currentWeightKg, 
          heightCm: heightCm || user.heightCm 
        })
        .eq('id', userId);
    }

    const updatedWeight = currentWeightKg || user.currentWeightKg;
    const updatedHeight = heightCm || user.heightCm;

    const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    
    let bmr = 10 * updatedWeight + 6.25 * updatedHeight - 5 * age;
    bmr += user.gender.toLowerCase() === 'male' ? 5 : -161;

    const activityFactors: Record<string, number> = {
      'sedentary': 1.2,
      'lightly active': 1.375,
      'moderately active': 1.55,
      'very active': 1.725
    };
    const tdee = bmr * (activityFactors[user.lifestyle?.toLowerCase() || 'sedentary'] || 1.2);

    let dailyCalorieTarget = tdee;
    let proteinTargetGrams = updatedWeight * 1.6;
    let weeklyWeightChangeKg = 0;

    if (goalType === 'Weight Loss') {
      dailyCalorieTarget -= 500;
      weeklyWeightChangeKg = -0.5;
    } else if (goalType === 'Weight Gain') {
      dailyCalorieTarget += 500;
      weeklyWeightChangeKg = 0.5;
    } else if (goalType === 'Muscle Gain') {
      dailyCalorieTarget += 300;
      proteinTargetGrams = updatedWeight * 2.0;
      weeklyWeightChangeKg = 0.25;
    }

    const waterTargetMl = updatedWeight * 35;
    const stepTarget = 10000;

    const { data: goal, error: goalError } = await supabase
      .from('Goal')
      .insert([{
        userId,
        goalType,
        targetWeightKg,
        targetDate: new Date(targetDate).toISOString(),
        bmr,
        dailyCalorieTarget,
        proteinTargetGrams,
        waterTargetMl,
        stepTarget,
        weeklyWeightChangeKg
      }])
      .select()
      .single();

    if (goalError || !goal) {
      console.error(goalError);
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
