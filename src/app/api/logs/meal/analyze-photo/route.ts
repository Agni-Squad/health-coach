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
    { name: 'Thala Vazhai Ilai Sappadu (South Indian Meals)', portion: '1 plate', calories: 600, protein: 12, carbs: 100, fat: 10 },
    { name: 'Appalam', portion: '1 piece', calories: 50, protein: 1, carbs: 5, fat: 3 },
    { name: 'Payasam', portion: '1 small cup', calories: 200, protein: 5, carbs: 35, fat: 9 }
  ];

  try {
    const { base64Image } = await req.json();
    if (!process.env.GEMINI_API_KEY) return NextResponse.json(fallbackMock);

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
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error (Photo):", error);
    return NextResponse.json(fallbackMock);
  }
}
