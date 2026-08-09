import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        goals: { orderBy: { createdAt: 'desc' }, take: 1 },
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const activeGoal = user.goals[0];

    // Today's boundaries
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch logs
    const [mealLogs, stepLogs, waterLogs, exerciseLogs, weightLogs, sleepLogs] = await Promise.all([
      prisma.mealLog.findMany({ where: { userId, mealTime: { gte: startOfDay, lte: endOfDay } } }),
      prisma.stepLog.findMany({ where: { userId, logDate: { gte: startOfDay, lte: endOfDay } } }),
      prisma.waterLog.findMany({ where: { userId, logTime: { gte: startOfDay, lte: endOfDay } } }),
      prisma.exerciseLog.findMany({ where: { userId, logDate: { gte: startOfDay, lte: endOfDay } } }),
      prisma.weightLog.findMany({ where: { userId }, orderBy: { logDate: 'desc' }, take: 1 }),
      prisma.sleepLog.findMany({ where: { userId, logDate: { gte: startOfDay, lte: endOfDay } } })
    ]);

    const caloriesConsumed = mealLogs.reduce((sum: any, meal: any) => sum + meal.calories, 0);
    const stepsTaken = stepLogs.reduce((sum: any, step: any) => sum + step.steps, 0);
    const waterIntake = waterLogs.reduce((sum: any, water: any) => sum + water.quantityMl, 0);
    const exerciseDuration = exerciseLogs.reduce((sum: any, ex: any) => sum + ex.durationMin, 0);
    const sleepHours = sleepLogs.reduce((sum: any, sl: any) => sum + sl.hours, 0);
    
    const currentWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : user.currentWeightKg;
    const heightM = user.heightCm / 100;
    const bmi = currentWeight / (heightM * heightM);

    let goalProgress = 0;
    if (activeGoal) {
        const totalWeightToLose = Math.abs(user.currentWeightKg - activeGoal.targetWeightKg);
        const weightLost = Math.abs(user.currentWeightKg - currentWeight);
        if (totalWeightToLose > 0) {
            goalProgress = Math.min((weightLost / totalWeightToLose) * 100, 100);
        } else {
            goalProgress = 100;
        }
    }

    const healthScore = Math.min(100, Math.round(
      (caloriesConsumed / (activeGoal?.dailyCalorieTarget || 2000)) * 40 +
      (stepsTaken / (activeGoal?.stepTarget || 10000)) * 30 +
      (waterIntake / (activeGoal?.waterTargetMl || 2500)) * 30
    ));

    return NextResponse.json({
      greeting: `Good Morning ${user.name.split(' ')[0]} 👋`,
      dashboard: {
        calories: { current: caloriesConsumed, target: activeGoal?.dailyCalorieTarget || 2000 },
        steps: { current: stepsTaken, target: activeGoal?.stepTarget || 10000 },
        water: { current: waterIntake, target: activeGoal?.waterTargetMl || 2500 },
        exercise: { durationMin: exerciseDuration },
        sleep: { hours: sleepHours },
        weight: { latest: currentWeight },
        bmi: parseFloat(bmi.toFixed(1)),
        healthScore: healthScore,
        goalProgress: Math.round(goalProgress)
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
