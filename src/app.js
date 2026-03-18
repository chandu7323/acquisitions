import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {stream: {write: (message) => logger.info(message.trim()) }}));
app.use(cookieParser());

// Define healthcheck route BEFORE any security middleware
app.get('/health', (req, res) => {
  res.status(200).json({status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime()});
});

// Apply custom Arcjet security middleware only in production
if (process.env.NODE_ENV === 'production') {
  app.use(securityMiddleware);
}

app.get('/', (req,res) => {
  logger.info('Hello from Acquisitions!');
  res.status(200).send('Hello from Acquisitions!');
});

app.get('/api', (req, res) => {
  res.status(200).json({message: 'Acquisitions API is running'});
});

app.use('/api/auth', authRoutes); //api/auth/sign-in
app.use("/api/users", usersRoutes);
app.use((req,res)=>{
  res.status(404).json({error: 'Route not found'});
});
// Catch-all 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global JSON error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.stack || err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;