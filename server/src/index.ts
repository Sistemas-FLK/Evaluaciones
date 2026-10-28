import { db } from './data/mockDatabase.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

// Servir frontend compilado de React si existe (Modo Monolito / Docker)
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Endpoint de Salud y Estado de Conexión Supabase (para Render y monitores)
app.get('/api/health', (_req: Request, res: Response) => {
  const supabaseStatus = getSupabaseStatus();
  res.status(db.initializationError ? 503 : 200).json({
    status: db.initializationError ? 'database_unavailable' : 'online',
    platform: 'QUIMICORP TALENT — Evaluación Comercial',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supabase: { ...supabaseStatus,
      isConfigured: supabaseStatus.isConfigured && !db.initializationError,
      message: db.initializationError ? 'No se pudo conectar a la base de datos. Revisa las variables del servidor.' :
        supabaseStatus.isConfigured ? 'Conexión verificada con Supabase' : supabaseStatus.message
    },
    revision: process.env.RENDER_GIT_COMMIT || 'local'
  });
});

// Serialize API requests within this server so concurrent submissions cannot advance twice.
let requestQueue = Promise.resolve();
app.use('/api', (_req, res, next) => {
  if (db.initializationError) {
    res.status(503).json({ error: 'La base de datos no está disponible. No se registrarán cambios hasta recuperar la conexión.' });
    return;
  }
  const previous = requestQueue;
  let release!: () => void;
  requestQueue = new Promise<void>(resolve => { release = resolve; });
  void previous.then(() => {
    if (res.destroyed) { release(); return; }
    res.once('finish', release);
    res.once('close', release);
    next();
  });
});

// Enrutamiento de Módulos
app.use('/api/candidate', candidateRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint raíz para chequeos de salud de Render
app.get('/', (_req: Request, res: Response) => {
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.json({
    status: 'online',
    message: 'Backend API de QUIMICORP TALENT activo y conectado a Supabase.',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Fallback SPA para la aplicación React si existe el dist
app.get('*', (req: Request, res: Response) => {
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(404).json({
    error: 'Ruta no encontrada en la API de QUIMICORP TALENT.',
    path: req.path
  });
});

// Manejo de errores no capturados
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[Error no controlado]', err);
  res.status(500).json({ 
    error: 'Error interno del servidor en la plataforma de evaluación.',
    details: err.message 
  });
});

await db.ready;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 QUIMICORP TALENT iniciada en http://localhost:${PORT}`);
  console.log(`📁 Frontend estático servido desde: ${clientDistPath}`);
  console.log(`====================================================`);
});
