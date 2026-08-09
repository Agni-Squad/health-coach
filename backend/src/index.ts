import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { goalsRouter } from './routes/goals';
import { dashboardRouter } from './routes/dashboard';
import { logsRouter } from './routes/logs';
import { coachRouter } from './routes/coach';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/logs', logsRouter);
app.use('/api/coach', coachRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
