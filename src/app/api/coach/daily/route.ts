import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  const token = authHeader.split(' ')[1];
  let userId;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startIso = today.toISOString();

    const [
      { data: meals },
      { data: steps },
      { data: water },
      { data: sleep },
      { data: goals }
    ] = await Promise.all([
      supabase.from('MealLog').select('*').eq('userId', userId).gte('mealTime', startIso),
      supabase.from('StepLog').select('*').eq('userId', userId).gte('logDate', startIso),
      supabase.from('WaterLog').select('*').eq('userId', userId).gte('logTime', startIso),
      supabase.from('SleepLog').select('*').eq('userId', userId).gte('logDate', startIso),
      supabase.from('Goal').select('*').eq('userId', userId).order('createdAt', { ascending: false }).limit(1)
    ]);

    const goal = goals && goals.length > 0 ? goals[0] : null;

    const totalCals = (meals || []).reduce((sum: number, m: any) => sum + m.calories, 0);
    const totalProtein = (meals || []).reduce((sum: number, m: any) => sum + m.protein, 0);
    const totalSteps = (steps || []).reduce((sum: number, s: any) => sum + s.steps, 0);
    const totalWater = (water || []).reduce((sum: number, w: any) => sum + w.quantityMl, 0);
    const totalSleep = (sleep || []).reduce((sum: number, s: any) => sum + s.hours, 0);

    const fallbackAdvice = `You consumed ${Math.round((totalCals/(goal?.dailyCalorieTarget || 2000))*100)}% of your daily calorie target. Keep your hydration on track!`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ adviceText: fallbackAdvice, categories: 'Diet, Activity' });
    }

    const prompt = `You are an AI Health Coach. 
User's data for today:
- Calories Consumed: ${totalCals} (Target: ${goal?.dailyCalorieTarget || 2000})
- Protein Consumed: ${totalProtein}g (Target: ${goal?.proteinTargetGrams || 50}g)
- Steps: ${totalSteps} (Target: ${goal?.stepTarget || 10000})
- Water: ${totalWater}ml (Target: ${goal?.waterTargetMl || 2000}ml)
- Sleep: ${totalSleep} hours

Write a short, friendly, advisory-only recommendation (2-3 sentences max) based on this data. Use emojis. Do not provide medical diagnosis.
Return ONLY a valid JSON object with the exact keys: {"adviceText": "...", "categories": "..."}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);

    // Save recommendation
    await supabase.from('AIRecommendation').insert([{
      userId,
      adviceText: parsed.adviceText,
      categories: parsed.categories
    }]);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Coach API Error:", error);
    return NextResponse.json({ adviceText: "Keep up the good work today! Make sure you stay hydrated and active.", categories: "General" });
  }
}
