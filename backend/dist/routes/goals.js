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
exports.goalsRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.goalsRouter = (0, express_1.Router)();
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
exports.goalsRouter.post('/', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { goalType, targetWeightKg, targetDate } = req.body;
        const userId = req.userId;
        const user = yield prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Calculate Age
        const age = new Date().getFullYear() - user.dateOfBirth.getFullYear();
        // Calculate BMR (Mifflin-St Jeor)
        let bmr = 10 * user.currentWeightKg + 6.25 * user.heightCm - 5 * age;
        bmr += user.gender.toLowerCase() === 'male' ? 5 : -161;
        // Activity factor mapping
        const activityFactors = {
            'sedentary': 1.2,
            'lightly active': 1.375,
            'moderately active': 1.55,
            'very active': 1.725
        };
        const tdee = bmr * (activityFactors[((_a = user.lifestyle) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'sedentary'] || 1.2);
        let dailyCalorieTarget = tdee;
        let proteinTargetGrams = user.currentWeightKg * 1.6; // Base protein
        let weeklyWeightChangeKg = 0;
        if (goalType === 'Weight Loss') {
            dailyCalorieTarget -= 500; // ~0.5kg loss per week
            weeklyWeightChangeKg = -0.5;
        }
        else if (goalType === 'Weight Gain') {
            dailyCalorieTarget += 500;
            weeklyWeightChangeKg = 0.5;
        }
        else if (goalType === 'Muscle Gain') {
            dailyCalorieTarget += 300;
            proteinTargetGrams = user.currentWeightKg * 2.0; // Higher protein for muscle gain
            weeklyWeightChangeKg = 0.25;
        }
        const waterTargetMl = user.currentWeightKg * 35; // 35ml per kg
        const stepTarget = 10000;
        // Optional: deactivate old goals
        // We only keep one active goal conceptually, but for now just create the new one
        const goal = yield prisma_1.default.goal.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}));
