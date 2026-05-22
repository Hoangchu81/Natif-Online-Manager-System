import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { authenticate, requireAdmin, requireExpert, requireRole } from './middleware/auth.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import { validate } from './middleware/validate.js';
import * as authRoutes from './routes/auth.js';
import * as applicationRoutes from './routes/applications.js';
import * as programRoutes from './routes/programs.js';
import * as newsRoutes from './routes/news.js';
import * as dashboardRoutes from './routes/dashboard.js';
import * as expertRoutes from './routes/expert.js';
import * as assignmentRoutes from './routes/assignments.js';
import * as reviewRoutes from './routes/reviews.js';
import * as workflowRoutes from './routes/workflow.js';
import * as councilRoutes from './routes/councils.js';

import {
  registerSchema, loginSchema, createApplicationSchema,
  createReviewSchema, createAssignmentSchema, workflowTransitionSchema,
} from './validators/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (for rate limiting behind Nginx)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), service: 'NATIF OMS API' });
});

// Public routes
app.post('/api/auth/register', validate(registerSchema), authRoutes.register);
app.post('/api/auth/login', validate(loginSchema), authRoutes.login);
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
app.post('/api/applications', validate(createApplicationSchema), applicationRoutes.createApplication);
app.put('/api/applications/:id', authenticate, applicationRoutes.updateApplication);
app.delete('/api/applications/:id', authenticate, applicationRoutes.deleteApplication);
app.post('/api/applications/:id/submit', authenticate, applicationRoutes.submitApplication);
app.get('/api/user/stats', authenticate, dashboardRoutes.getUserStats);

// Protected routes - admin
app.get('/api/dashboard/stats', authenticate, dashboardRoutes.getDashboardStats);

// Protected routes - expert
app.get('/api/expert/profile', authenticate, requireExpert, expertRoutes.getProfile);
app.put('/api/expert/profile', authenticate, requireExpert, expertRoutes.updateProfile);
app.post('/api/expert/complete', authenticate, requireExpert, expertRoutes.completeProfile);

app.get('/api/expert/education', authenticate, requireExpert, expertRoutes.education.list);
app.post('/api/expert/education', authenticate, requireExpert, expertRoutes.education.create);
app.put('/api/expert/education/:id', authenticate, requireExpert, expertRoutes.education.update);
app.delete('/api/expert/education/:id', authenticate, requireExpert, expertRoutes.education.remove);

app.get('/api/expert/work-history', authenticate, requireExpert, expertRoutes.workHistory.list);
app.post('/api/expert/work-history', authenticate, requireExpert, expertRoutes.workHistory.create);
app.put('/api/expert/work-history/:id', authenticate, requireExpert, expertRoutes.workHistory.update);
app.delete('/api/expert/work-history/:id', authenticate, requireExpert, expertRoutes.workHistory.remove);

app.get('/api/expert/research', authenticate, requireExpert, expertRoutes.research.list);
app.post('/api/expert/research', authenticate, requireExpert, expertRoutes.research.create);
app.put('/api/expert/research/:id', authenticate, requireExpert, expertRoutes.research.update);
app.delete('/api/expert/research/:id', authenticate, requireExpert, expertRoutes.research.remove);

app.get('/api/expert/publications', authenticate, requireExpert, expertRoutes.publications.list);
app.post('/api/expert/publications', authenticate, requireExpert, expertRoutes.publications.create);
app.put('/api/expert/publications/:id', authenticate, requireExpert, expertRoutes.publications.update);
app.delete('/api/expert/publications/:id', authenticate, requireExpert, expertRoutes.publications.remove);

app.get('/api/expert/patents', authenticate, requireExpert, expertRoutes.patents.list);
app.post('/api/expert/patents', authenticate, requireExpert, expertRoutes.patents.create);
app.put('/api/expert/patents/:id', authenticate, requireExpert, expertRoutes.patents.update);
app.delete('/api/expert/patents/:id', authenticate, requireExpert, expertRoutes.patents.remove);

app.get('/api/expert/awards', authenticate, requireExpert, expertRoutes.awards.list);
app.post('/api/expert/awards', authenticate, requireExpert, expertRoutes.awards.create);
app.put('/api/expert/awards/:id', authenticate, requireExpert, expertRoutes.awards.update);
app.delete('/api/expert/awards/:id', authenticate, requireExpert, expertRoutes.awards.remove);

app.get('/api/expert/books', authenticate, requireExpert, expertRoutes.books.list);
app.post('/api/expert/books', authenticate, requireExpert, expertRoutes.books.create);
app.put('/api/expert/books/:id', authenticate, requireExpert, expertRoutes.books.update);
app.delete('/api/expert/books/:id', authenticate, requireExpert, expertRoutes.books.remove);

// Protected routes - assignments & reviews
app.post('/api/assignments', authenticate, requireRole('admin', 'moderator'), validate(createAssignmentSchema), assignmentRoutes.createAssignment);
app.get('/api/assignments', authenticate, requireRole('admin', 'moderator', 'expert', 'officer'), assignmentRoutes.listAssignments);
app.put('/api/assignments/:id', authenticate, requireRole('admin', 'moderator', 'expert'), assignmentRoutes.updateAssignment);
app.delete('/api/assignments/:id', authenticate, requireRole('admin', 'moderator'), assignmentRoutes.deleteAssignment);

app.get('/api/reviews', authenticate, requireRole('admin', 'moderator', 'expert', 'officer', 'dept_head', 'director'), reviewRoutes.listReviews);
app.post('/api/reviews', authenticate, requireExpert, validate(createReviewSchema), reviewRoutes.createReview);
app.get('/api/reviews/:id', authenticate, reviewRoutes.getReview);

// Protected routes - workflow
app.post('/api/workflow/transition', authenticate, requireRole('admin', 'clerk', 'officer', 'dept_head', 'director', 'enterprise'), validate(workflowTransitionSchema), workflowRoutes.transition);
app.get('/api/workflow/history/:applicationId', authenticate, workflowRoutes.getHistory);

// Protected routes - councils
app.get('/api/councils', authenticate, requireRole('admin', 'dept_head', 'director'), councilRoutes.listCouncils);
app.get('/api/councils/:id', authenticate, requireRole('admin', 'dept_head', 'director', 'officer'), councilRoutes.getCouncil);
app.post('/api/councils', authenticate, requireRole('admin', 'dept_head'), councilRoutes.createCouncil);
app.put('/api/councils/:id', authenticate, requireRole('admin', 'dept_head'), councilRoutes.updateCouncil);
app.delete('/api/councils/:id', authenticate, requireRole('admin', 'dept_head'), councilRoutes.deleteCouncil);

app.post('/api/councils/:councilId/members', authenticate, requireRole('admin', 'dept_head'), councilRoutes.addCouncilMember);
app.delete('/api/council-members/:id', authenticate, requireRole('admin', 'dept_head'), councilRoutes.removeCouncilMember);

app.post('/api/councils/:councilId/meetings', authenticate, requireRole('admin', 'dept_head', 'director'), councilRoutes.addCouncilMeeting);
app.put('/api/council-meetings/:id', authenticate, requireRole('admin', 'dept_head', 'director'), councilRoutes.updateCouncilMeeting);
app.get('/api/council-meetings', authenticate, requireRole('admin', 'dept_head', 'director', 'officer'), councilRoutes.getCouncilMeetings);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({
    error: 'Lỗi server nội bộ',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
});

app.listen(PORT, () => {
  console.log(`NATIF OMS API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});
