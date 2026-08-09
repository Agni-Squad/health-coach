import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

  const fallbackMock = [
    { name: 'Idli', portion: '2 pieces', calories: 120, protein: 4, carbs: 24, fat: 0.5 },
    { name: 'Sambar', portion: '1 cup', calories: 60, protein: 2, carbs: 12, fat: 1.5 }
  ];

  try {
    const { transcript } = await req.json();
    if (!process.env.GEMINI_API_KEY) return NextResponse.json(fallbackMock);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extract food items and quantities from this transcript and estimate the nutritional value for each item: "${transcript}".
Return ONLY a valid JSON array of objects. Do not include markdown or text outside the array. Each object must have these exact keys:
[{"name": string, "portion": string, "calories": number, "protein": number, "carbs": number, "fat": number}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error (Voice):", error);
    return NextResponse.json(fallbackMock);
  }
}
