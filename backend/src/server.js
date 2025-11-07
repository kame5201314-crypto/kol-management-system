import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import kolRoutes from './routes/kolRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import salesTrackingRoutes from './routes/salesTrackingRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KOL Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kols', kolRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/sales-tracking', salesTrackingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到請求的資源'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '伺服器內部錯誤',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Test database connection and start server
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    console.log('\n⚠️  Please make sure:');
    console.log('   1. PostgreSQL is installed and running');
    console.log('   2. Database "kol_management" exists');
    console.log('   3. .env file is configured correctly');
    console.log('   4. Run migrations: npm run migrate\n');
  } else {
    console.log('✅ Database connected successfully');
    console.log(`📅 Current database time: ${res.rows[0].now}\n`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║                                                   ║');
  console.log('║      🚀 KOL Management System API Server 🚀      ║');
  console.log('║                                                   ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🌐 Server is running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📚 Available Endpoints:');
  console.log('   Auth:           /api/auth/*');
  console.log('   KOLs:           /api/kols/*');
  console.log('   Collaborations: /api/collaborations/*');
  console.log('   Sales Tracking: /api/sales-tracking/*');
  console.log('');
  console.log('⏰ Press Ctrl+C to stop the server');
  console.log('═══════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⏹️  SIGINT signal received: closing HTTP server');
  pool.end(() => {
    console.log('✅ Database pool closed');
    process.exit(0);
  });
});

export default app;
