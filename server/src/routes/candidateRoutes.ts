import { Router, Request, Response } from 'express';
import { assessmentService } from '../services/assessmentService.js';

const router = Router();

// Consulta previa de código de invitación (autocompletado/verificación)
router.get('/lookup/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code as string;
    const result = await assessmentService.lookupInvitationCode(code);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ found: false, error: error.message || 'Error al consultar código.' });
  }
});

// Validar código de invitación individual y confirmar datos
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, accept_privacy, full_name, email, phone } = req.body;
    if (!accept_privacy) {
      return res.status(400).json({ 
        error: 'Debe aceptar la política de privacidad y tratamiento de datos para continuar con el proceso de selección.' 
      });
    }

    const result = await assessmentService.validateInvitation(code, { full_name, email, phone });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Código de invitación inválido.' });
  }
});

// Iniciar evaluación cronometrada
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { assessment_id } = req.body;
    if (!assessment_id) {
      return res.status(400).json({ error: 'ID de evaluación requerido.' });
    }

    const questionData = await assessmentService.startAssessment(assessment_id);
    res.json(questionData);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al iniciar la evaluación.' });
  }
});

// Recuperar sesión activa (tolerancia a fallos de conexión)
router.get('/session/:assessmentId', async (req: Request, res: Response) => {
  try {
    const assessmentId = req.params.assessmentId as string;
    const sessionData = await assessmentService.getCurrentQuestion(assessmentId);
    res.json(sessionData);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al recuperar la sesión.' });
  }
});

export default router;
