import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import candidateRoutes from './routes/candidateRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getSupabaseStatus } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1235;

// Configuración de Middlewares
app.use(cors({
  origin: '*', // En producción limitar al dominio de frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log simple de peticiones
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Endpoint de Salud y Estado de Conexión Supabase
app.get('/api/health', (_req: Request, res: Response) => {
  const supabaseStatus = getSupabaseStatus();
  res.json({
    status: 'online',
    platform: 'QUIMICORP TALENT — Evaluación Comercial',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus
  });
});

// Enrutamiento de Módulos
app.use('/api/candidate', candidateRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de errores no capturados
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[Error no controlado]', err);
  res.status(500).json({ 
    error: 'Error interno del servidor en la plataforma de evaluación.',
    details: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 QUIMICORP TALENT API iniciada en http://localhost:${PORT}`);
  console.log(`📊 Panel Admin Secret: ${process.env.ADMIN_SECRET_KEY || 'admin123'}`);
  console.log(`====================================================`);
});
