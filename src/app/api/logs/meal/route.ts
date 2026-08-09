import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    const { mealType, logMethod, items, photoUrl, voiceTranscript } = await req.json();
    
    const calories = items.reduce((sum: number, item: any) => sum + Number(item.calories), 0);
    const protein = items.reduce((sum: number, item: any) => sum + Number(item.protein), 0);
    const carbs = items.reduce((sum: number, item: any) => sum + Number(item.carbs), 0);
    const fat = items.reduce((sum: number, item: any) => sum + Number(item.fat), 0);

    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
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

    return NextResponse.json(mealLog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}
