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
exports.dashboardRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.dashboardRouter = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
// Middleware to authenticate
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (e) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
exports.dashboardRouter.get('/summary', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: {
                goals: { orderBy: { createdAt: 'desc' }, take: 1 },
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const activeGoal = user.goals[0];
        // Today's boundaries
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        // Fetch logs
        const [mealLogs, stepLogs, waterLogs, exerciseLogs, weightLogs, sleepLogs] = yield Promise.all([
            prisma_1.default.mealLog.findMany({ where: { userId, mealTime: { gte: startOfDay, lte: endOfDay } } }),
            prisma_1.default.stepLog.findMany({ where: { userId, logDate: { gte: startOfDay, lte: endOfDay } } }),
            prisma_1.default.waterLog.findMany({ where: { userId, logTime: { gte: startOfDay, lte: endOfDay } } }),
            prisma_1.default.exerciseLog.findMany({ where: { userId, logDate: { gte: startOfDay, lte: endOfDay } } }),
            prisma_1.default.weightLog.findMany({ where: { userId }, orderBy: { logDate: 'desc' }, take: 1 }), // latest weight
            prisma_1.default.sleepLog.findMany({ where: { userId, logDate: { gte: startOfDay, lte: endOfDay } } })
        ]);
        const caloriesConsumed = mealLogs.reduce((sum, meal) => sum + meal.calories, 0);
        const stepsTaken = stepLogs.reduce((sum, step) => sum + step.steps, 0);
        const waterIntake = waterLogs.reduce((sum, water) => sum + water.quantityMl, 0);
        const exerciseDuration = exerciseLogs.reduce((sum, ex) => sum + ex.durationMin, 0);
        const sleepHours = sleepLogs.reduce((sum, sl) => sum + sl.hours, 0);
        const currentWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : user.currentWeightKg;
        const heightM = user.heightCm / 100;
        const bmi = currentWeight / (heightM * heightM);
        // Goal Progress % (Simplistic calculation based on weight)
        let goalProgress = 0;
        if (activeGoal) {
            const totalWeightToLose = Math.abs(user.currentWeightKg - activeGoal.targetWeightKg);
            const weightLost = Math.abs(user.currentWeightKg - currentWeight);
            if (totalWeightToLose > 0) {
                goalProgress = Math.min((weightLost / totalWeightToLose) * 100, 100);
            }
            else {
                goalProgress = 100; // if target is same as current or goal met
            }
        }
        // Health Score (Mock composite metric for Phase 1)
        const healthScore = Math.min(100, Math.round((caloriesConsumed / ((activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.dailyCalorieTarget) || 2000)) * 40 +
            (stepsTaken / ((activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.stepTarget) || 10000)) * 30 +
            (waterIntake / ((activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.waterTargetMl) || 2500)) * 30));
        res.json({
            greeting: `Good Morning ${user.name.split(' ')[0]} 👋`,
            dashboard: {
                calories: { current: caloriesConsumed, target: (activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.dailyCalorieTarget) || 2000 },
                steps: { current: stepsTaken, target: (activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.stepTarget) || 10000 },
                water: { current: waterIntake, target: (activeGoal === null || activeGoal === void 0 ? void 0 : activeGoal.waterTargetMl) || 2500 },
                exercise: { durationMin: exerciseDuration },
                sleep: { hours: sleepHours },
                weight: { latest: currentWeight },
                bmi: parseFloat(bmi.toFixed(1)),
                healthScore: healthScore,
                goalProgress: Math.round(goalProgress)
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}));
