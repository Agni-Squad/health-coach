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
    const { mealType, logMethod, items, photoUrl, voiceTranscript } = await req.json();
    
    const calories = items.reduce((sum: number, item: any) => sum + Number(item.calories), 0);
    const protein = items.reduce((sum: number, item: any) => sum + Number(item.protein), 0);
    const carbs = items.reduce((sum: number, item: any) => sum + Number(item.carbs), 0);
    const fat = items.reduce((sum: number, item: any) => sum + Number(item.fat), 0);

    const { data: mealLog, error: logError } = await supabase
      .from('MealLog')
      .insert([{
        userId,
        mealType,
        mealTime: new Date().toISOString(),
        calories, protein, carbs, fat
      }])
      .select()
      .single();

    if (logError || !mealLog) {
      console.error(logError);
      return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
    }

    const mealItemsToInsert = items.map((item: any) => ({
      mealId: mealLog.id,
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
    }));

    if (mealItemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from('MealItem').insert(mealItemsToInsert);
      if (itemsError) console.error(itemsError);
    }

    if (logMethod === 'photo' && photoUrl) {
      await supabase.from('MealImage').insert([{
        mealId: mealLog.id, 
        imageUrl: photoUrl, 
        aiDetectedFood: items.map((i:any)=>i.name).join(', ')
      }]);
    }

    if (logMethod === 'voice' && voiceTranscript) {
      await supabase.from('VoiceTranscript').insert([{
        mealId: mealLog.id, 
        transcript: voiceTranscript, 
        aiFoodSummary: items.map((i:any)=>i.name).join(', ')
      }]);
    }

    return NextResponse.json(mealLog, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}
