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
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
exports.authRouter = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
exports.authRouter.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, email, password, dateOfBirth, gender, heightCm, currentWeightKg, targetWeightKg, bloodGroup, country, state, city, lifestyle, occupation, wakeTime, sleepTime, dietaryPreference, medicalConditions, medications, allergies } = req.body;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or phone already exists.' });
        }
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma_1.default.user.create({
            data: {
                name, phone, email, passwordHash,
                dateOfBirth: new Date(dateOfBirth),
                gender, heightCm, currentWeightKg, targetWeightKg,
                bloodGroup, country, state, city, lifestyle, occupation,
                wakeTime, sleepTime, dietaryPreference, medicalConditions,
                medications, allergies
            }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, userId: user.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}));
exports.authRouter.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, userId: user.id });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}));
