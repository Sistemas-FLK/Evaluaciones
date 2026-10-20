import { Router, Request, Response } from 'express';
import { reviewService } from '../services/reviewService.js';
import { assessmentService } from '../services/assessmentService.js';

const router = Router();

// Middleware simple de verificación de sesión de admin/evaluador
const verifyAdmin = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

  if (!authHeader || !authHeader.includes(adminSecret)) {
    // Permitir continuar si no hay encabezado estricto pero registrar aviso
    // o verificar token simple:
    return res.status(401).json({ error: 'Acceso no autorizado al panel de evaluación.' });
  }
  next();
};

// Login de administrador / evaluador
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { key, reviewer_name } = req.body;
    const adminSecret = process.env.ADMIN_SECRET_KEY || 'admin123';

    if (key !== adminSecret) {
      return res.status(401).json({ error: 'Clave de acceso de evaluador incorrecta.' });
    }

    res.json({
      success: true,
      token: `Bearer ${adminSecret}`,
      reviewer: {
        id: reviewer_name === 'María' ? 'maria_evaluadora' : 'evaluador_comercial_2',
        name: reviewer_name || 'Comité Evaluador'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error en autenticación.' });
  }
});

// Resumen del dashboard
router.get('/overview', verifyAdmin, async (_req: Request, res: Response) => {
  try {
    const overview = await reviewService.getOverview();
    res.json(overview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al obtener resumen.' });
  }
});

// Detalle individual de candidata
router.get('/candidate/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const detail = await reviewService.getCandidateDetail(id);
    res.json(detail);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'Candidata no encontrada.' });
  }
});

// Calificar respuesta abierta por un evaluador (María o 2do Evaluador)
router.post('/score', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { answer_id, reviewer_id, reviewer_name, criterion_scores, observation } = req.body;

    if (!answer_id || !reviewer_id || !criterion_scores) {
      return res.status(400).json({ error: 'Parámetros de calificación incompletos.' });
    }

    const result = await reviewService.submitReviewerScore(
      answer_id,
      reviewer_id,
      reviewer_name || 'Evaluador Autorizado',
      criterion_scores,
      observation
    );

    res.json({ success: true, score: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al guardar la calificación.' });
  }
});

// Dictamen final consensuado y recomendación colegiada
router.post('/finalize', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { assessment_id, recommendation, justification, approved_by } = req.body;

    if (!assessment_id || !recommendation || !justification) {
      return res.status(400).json({ error: 'Debe especificar recomendación y justificación completa.' });
    }

    const finalReview = await reviewService.saveFinalReview(assessment_id, {
      recommendation,
      justification,
      approved_by: approved_by || 'Comité Evaluador'
    });

    res.json({ success: true, final_review: finalReview });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al finalizar evaluación.' });
  }
});

// Registrar nueva candidata
router.post('/candidate/create', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { full_name, email, phone } = req.body;
    const created = await reviewService.registerNewCandidate(full_name, email, phone);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al registrar candidata.' });
  }
});

// Reiniciar evaluación de forma auditada
router.post('/candidate/:assessmentId/reset', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { actor_id, reason } = req.body;
    const result = await assessmentService.resetAssessment(
      assessmentId, 
      actor_id || 'admin', 
      reason || 'Reinicio autorizado por evaluador'
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al reiniciar evaluación.' });
  }
});

// Exportar CSV
router.get('/export/csv', verifyAdmin, async (_req: Request, res: Response) => {
  try {
    const csvContent = await reviewService.exportCSV();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="QUIMICORP_Evaluaciones_Comerciales.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al generar exportación CSV.' });
  }
});

export default router;
