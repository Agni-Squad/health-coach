import { Router } from 'express';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

export const goalsRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Middleware to authenticate
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

goalsRouter.post('/', authenticate, async (req: any, res: any) => {
  try {
    const { goalType, targetWeightKg, targetDate } = req.body;
    const userId = req.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate Age
    const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
    
    // Calculate BMR (Mifflin-St Jeor)
    let bmr = 10 * user.currentWeightKg + 6.25 * user.heightCm - 5 * age;
    bmr += user.gender.toLowerCase() === 'male' ? 5 : -161;

    // Activity factor mapping
    const activityFactors: Record<string, number> = {
      'sedentary': 1.2,
      'lightly active': 1.375,
      'moderately active': 1.55,
      'very active': 1.725
    };
    const tdee = bmr * (activityFactors[user.lifestyle?.toLowerCase() || 'sedentary'] || 1.2);

    let dailyCalorieTarget = tdee;
    let proteinTargetGrams = user.currentWeightKg * 1.6; // Base protein
    let weeklyWeightChangeKg = 0;

    if (goalType === 'Weight Loss') {
      dailyCalorieTarget -= 500; // ~0.5kg loss per week
      weeklyWeightChangeKg = -0.5;
    } else if (goalType === 'Weight Gain') {
      dailyCalorieTarget += 500;
      weeklyWeightChangeKg = 0.5;
    } else if (goalType === 'Muscle Gain') {
      dailyCalorieTarget += 300;
      proteinTargetGrams = user.currentWeightKg * 2.0; // Higher protein for muscle gain
      weeklyWeightChangeKg = 0.25;
    }

    const waterTargetMl = user.currentWeightKg * 35; // 35ml per kg
    const stepTarget = 10000;

    // Optional: deactivate old goals
    // We only keep one active goal conceptually, but for now just create the new one

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

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
