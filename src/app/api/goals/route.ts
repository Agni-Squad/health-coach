import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    const { goalType, targetWeightKg, targetDate } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
    
    let bmr = 10 * user.currentWeightKg + 6.25 * user.heightCm - 5 * age;
    bmr += user.gender.toLowerCase() === 'male' ? 5 : -161;

    const activityFactors: Record<string, number> = {
      'sedentary': 1.2,
      'lightly active': 1.375,
      'moderately active': 1.55,
      'very active': 1.725
    };
    const tdee = bmr * (activityFactors[user.lifestyle?.toLowerCase() || 'sedentary'] || 1.2);

    let dailyCalorieTarget = tdee;
    let proteinTargetGrams = user.currentWeightKg * 1.6;
    let weeklyWeightChangeKg = 0;

    if (goalType === 'Weight Loss') {
      dailyCalorieTarget -= 500;
      weeklyWeightChangeKg = -0.5;
    } else if (goalType === 'Weight Gain') {
      dailyCalorieTarget += 500;
      weeklyWeightChangeKg = 0.5;
    } else if (goalType === 'Muscle Gain') {
      dailyCalorieTarget += 300;
      proteinTargetGrams = user.currentWeightKg * 2.0;
      weeklyWeightChangeKg = 0.25;
    }

    const waterTargetMl = user.currentWeightKg * 35;
    const stepTarget = 10000;

    const goal = await prisma.goal.create({
      data: {
        userId,
        goalType,
        targetWeightKg,
        targetDate: new Date(targetDate),
        bmr,
        dailyCalorieTarget,
        proteinTargetGrams,
        waterTargetMl,
        stepTarget,
        weeklyWeightChangeKg
      }
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
