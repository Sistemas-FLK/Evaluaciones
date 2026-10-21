import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import candidateRoutes from './routes/candidateRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { getSupabaseStatus } from './config/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 1234;

// Configuración de Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log simple de peticiones
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Servir frontend compilado de React (Vite)
app.use(express.static(clientDistPath));

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

// Fallback SPA para la aplicación React
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

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
  console.log(`🚀 QUIMICORP TALENT iniciada en http://localhost:${PORT}`);
  console.log(`📊 Panel Admin Secret: ${process.env.ADMIN_SECRET_KEY || 'admin123'}`);
  console.log(`📁 Frontend estático servido desde: ${clientDistPath}`);
  console.log(`====================================================`);
});
