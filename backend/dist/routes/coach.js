"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.coachRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const generative_ai_1 = require("@google/generative-ai");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const coachRouter = (0, express_1.Router)();
exports.coachRouter = coachRouter;
const prisma = new client_1.PrismaClient();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.userId;
        next();
    }
    catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
coachRouter.get('/daily', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Fetch daily aggregations
        const meals = yield prisma.mealLog.findMany({ where: { userId: req.userId, mealTime: { gte: today } } });
        const steps = yield prisma.stepLog.findMany({ where: { userId: req.userId, logDate: { gte: today } } });
        const water = yield prisma.waterLog.findMany({ where: { userId: req.userId, logTime: { gte: today } } });
        const sleep = yield prisma.sleepLog.findMany({ where: { userId: req.userId, logDate: { gte: today } } });
        const goal = yield prisma.goal.findFirst({ where: { userId: req.userId } });
        const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);
        const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
        const totalSteps = steps.reduce((sum, s) => sum + s.steps, 0);
        const totalWater = water.reduce((sum, w) => sum + w.quantityMl, 0);
        const totalSleep = sleep.reduce((sum, s) => sum + s.hours, 0);
        const fallbackAdvice = `You consumed ${Math.round((totalCals / ((goal === null || goal === void 0 ? void 0 : goal.dailyCalorieTarget) || 2000)) * 100)}% of your daily calorie target. Keep your hydration on track!`;
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ adviceText: fallbackAdvice, categories: 'Diet, Activity' });
        }
        const prompt = `You are an AI Health Coach. 
User's data for today:
- Calories Consumed: ${totalCals} (Target: ${(goal === null || goal === void 0 ? void 0 : goal.dailyCalorieTarget) || 2000})
- Protein Consumed: ${totalProtein}g (Target: ${(goal === null || goal === void 0 ? void 0 : goal.proteinTargetGrams) || 50}g)
- Steps: ${totalSteps} (Target: ${(goal === null || goal === void 0 ? void 0 : goal.stepTarget) || 10000})
- Water: ${totalWater}ml (Target: ${(goal === null || goal === void 0 ? void 0 : goal.waterTargetMl) || 2000}ml)
- Sleep: ${totalSleep} hours

Write a short, friendly, advisory-only recommendation (2-3 sentences max) based on this data. Use emojis. Do not provide medical diagnosis.
Return ONLY a valid JSON object with the exact keys: {"adviceText": string, "categories": string}`;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        let text = response.text().trim();
        if (text.startsWith('```json'))
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        // Save recommendation
        yield prisma.aIRecommendation.create({
            data: {
                userId: req.userId,
                adviceText: parsed.adviceText,
                categories: parsed.categories
            }
        });
        res.json(parsed);
    }
    catch (error) {
        console.error("Coach API Error:", error);
        res.json({ adviceText: "Keep up the good work today! Make sure you stay hydrated and active.", categories: "General" });
    }
}));
