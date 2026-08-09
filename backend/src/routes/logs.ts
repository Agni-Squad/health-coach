import { Router } from 'express';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

export const logsRouter = Router();

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

// Log Water
logsRouter.post('/water', authenticate, async (req: any, res: any) => {
  try {
    const { quantityMl } = req.body;
    const waterLog = await prisma.waterLog.create({
      data: { userId: req.userId, quantityMl: Number(quantityMl) }
    });
    res.status(201).json(waterLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log water' });
  }
});

// Log Sleep
logsRouter.post('/sleep', authenticate, async (req: any, res: any) => {
  try {
    const { hours } = req.body;
    // Simple sleep score logic: 8 hours is 100%, each hour diff is -10%
    const sleepScore = Math.max(0, 100 - Math.abs(8 - Number(hours)) * 10);
    const sleepLog = await prisma.sleepLog.create({
      data: { userId: req.userId, hours: Number(hours), sleepScore }
    });
    res.status(201).json(sleepLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log sleep' });
  }
});

// Log Exercise
logsRouter.post('/exercise', authenticate, async (req: any, res: any) => {
  try {
    const { exerciseType, durationMin } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Mock MET values
    const metValues: Record<string, number> = {
      'walking': 3.5, 'running': 8.0, 'cycling': 6.0, 'gym': 5.0, 'yoga': 2.5, 'swimming': 7.0, 'home workout': 4.0
    };
    const met = metValues[exerciseType.toLowerCase()] || 4.0;
    
    // Calories burned = MET * weight (kg) * duration (hrs)
    const caloriesBurned = met * user.currentWeightKg * (Number(durationMin) / 60);

    const exerciseLog = await prisma.exerciseLog.create({
      data: { userId: req.userId, exerciseType, durationMin: Number(durationMin), caloriesBurned }
    });
    res.status(201).json(exerciseLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log exercise' });
  }
});

// Log Weight
logsRouter.post('/weight', authenticate, async (req: any, res: any) => {
  try {
    const { weightKg } = req.body;
    const weightLog = await prisma.weightLog.create({
      data: { userId: req.userId, weightKg: Number(weightKg) }
    });
    // Update user's current weight
    await prisma.user.update({
      where: { id: req.userId },
      data: { currentWeightKg: Number(weightKg) }
    });
    res.status(201).json(weightLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log weight' });
  }
});

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// AI Photo Analysis
logsRouter.post('/meal/analyze-photo', authenticate, async (req: any, res: any) => {
  const fallbackMock = [
    { name: 'Thala Vazhai Ilai Sappadu (South Indian Meals)', portion: '1 plate', calories: 600, protein: 12, carbs: 100, fat: 10 },
    { name: 'Appalam', portion: '1 piece', calories: 50, protein: 1, carbs: 5, fat: 3 },
    { name: 'Payasam', portion: '1 small cup', calories: 200, protein: 5, carbs: 35, fat: 9 }
  ];

  try {
    const { base64Image } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.json(fallbackMock);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this food image. Identify the individual food items on the plate.
Return ONLY a valid JSON array of objects. Do not include markdown or text outside the array. Each object must have these exact keys:
[{"name": string, "portion": string, "calories": number, "protein": number, "carbs": number, "fat": number, "sugar": number, "fiber": number, "healthScore": number, "recommendation": string}]`;

    const imageParts = [{
      inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/jpeg" }
    }];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error (Photo):", error);
    res.json(fallbackMock);
  }
});

// AI Voice Analysis
logsRouter.post('/meal/analyze-voice', authenticate, async (req: any, res: any) => {
  const fallbackMock = [
    { name: 'Idli', portion: '2 pieces', calories: 120, protein: 4, carbs: 24, fat: 0.5 },
    { name: 'Sambar', portion: '1 cup', calories: 60, protein: 2, carbs: 12, fat: 1.5 }
  ];

  try {
    const { transcript } = req.body;
    if (!process.env.GEMINI_API_KEY) return res.json(fallbackMock);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extract food items and quantities from this transcript and estimate the nutritional value for each item: "${transcript}".
Return ONLY a valid JSON array of objects. Do not include markdown or text outside the array. Each object must have these exact keys:
[{"name": string, "portion": string, "calories": number, "protein": number, "carbs": number, "fat": number}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error (Voice):", error);
    res.json(fallbackMock);
  }
});

// Log Meal (Final Save with Items)
logsRouter.post('/meal', authenticate, async (req: any, res: any) => {
  try {
    const { mealType, logMethod, items, photoUrl, voiceTranscript } = req.body;
    
    // Calculate totals
    const calories = items.reduce((sum: number, item: any) => sum + Number(item.calories), 0);
    const protein = items.reduce((sum: number, item: any) => sum + Number(item.protein), 0);
    const carbs = items.reduce((sum: number, item: any) => sum + Number(item.carbs), 0);
    const fat = items.reduce((sum: number, item: any) => sum + Number(item.fat), 0);

    const mealLog = await prisma.mealLog.create({
      data: {
        userId: req.userId,
        mealType,
        mealTime: new Date(),
        calories, protein, carbs, fat,
        mealItems: {
          create: items.map((item: any) => ({
            name: item.name,
            portion: item.portion,
            calories: Number(item.calories),
            protein: Number(item.protein),
            carbs: Number(item.carbs),
            fat: Number(item.fat),
            sugar: item.sugar ? Number(item.sugar) : null,
            fiber: item.fiber ? Number(item.fiber) : null,
            healthScore: item.healthScore ? Number(item.healthScore) : null,
            recommendation: item.recommendation || null
          }))
        }
      }
    });

    if (logMethod === 'photo' && photoUrl) {
      await prisma.mealImage.create({
        data: { mealId: mealLog.id, imageUrl: photoUrl, aiDetectedFood: items.map((i:any)=>i.name).join(', ') }
      });
    }

    if (logMethod === 'voice' && voiceTranscript) {
      await prisma.voiceTranscript.create({
        data: { mealId: mealLog.id, transcript: voiceTranscript, aiFoodSummary: items.map((i:any)=>i.name).join(', ') }
      });
    }

    res.status(201).json(mealLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});
