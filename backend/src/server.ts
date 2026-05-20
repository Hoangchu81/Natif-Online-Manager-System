import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { authenticate } from './middleware/auth.js';
import * as authRoutes from './routes/auth.js';
import * as applicationRoutes from './routes/applications.js';
import * as programRoutes from './routes/programs.js';
import * as newsRoutes from './routes/news.js';
import * as dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'NATIF OMS API' });
});

// Public routes
app.post('/api/auth/register', authRoutes.register);
app.post('/api/auth/login', authRoutes.login);
app.get('/api/programs', programRoutes.listPrograms);
app.get('/api/programs/:slug', programRoutes.getProgram);
app.get('/api/programs/type/:type', programRoutes.getProgramByType);
app.get('/api/news', newsRoutes.listNews);
app.get('/api/news/announcements', newsRoutes.listAnnouncements);
app.get('/api/news/:slug', newsRoutes.getNews);

// Protected routes - user
app.get('/api/profile', authenticate, authRoutes.getProfile);
app.put('/api/profile', authenticate, authRoutes.updateProfile);
app.get('/api/applications', authenticate, applicationRoutes.getApplications);
app.get('/api/applications/:id', authenticate, applicationRoutes.getApplication);
app.post('/api/applications', applicationRoutes.createApplication);
app.put('/api/applications/:id', authenticate, applicationRoutes.updateApplication);
app.delete('/api/applications/:id', authenticate, applicationRoutes.deleteApplication);
app.post('/api/applications/:id/submit', authenticate, applicationRoutes.submitApplication);
app.get('/api/user/stats', authenticate, dashboardRoutes.getUserStats);

// Protected routes - admin
app.get('/api/dashboard/stats', authenticate, dashboardRoutes.getDashboardStats);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Lỗi server nội bộ' });
});

app.listen(PORT, () => {
  console.log(`NATIF OMS API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
