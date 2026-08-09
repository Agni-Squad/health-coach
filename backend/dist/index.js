"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./routes/auth");
const goals_1 = require("./routes/goals");
const dashboard_1 = require("./routes/dashboard");
const logs_1 = require("./routes/logs");
const coach_1 = require("./routes/coach");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/auth', auth_1.authRouter);
app.use('/api/goals', goals_1.goalsRouter);
app.use('/api/dashboard', dashboard_1.dashboardRouter);
app.use('/api/logs', logs_1.logsRouter);
app.use('/api/coach', coach_1.coachRouter);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
