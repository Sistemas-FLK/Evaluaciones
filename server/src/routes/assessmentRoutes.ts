import { Router, Request, Response } from 'express';
import { assessmentService } from '../services/assessmentService.js';

const router = Router();

// Obtener pregunta actual (sin exponer answer keys)
router.get('/:assessmentId/question', async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const questionData = await assessmentService.getCurrentQuestion(assessmentId);
    res.json(questionData);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al obtener la pregunta.' });
  }
});

// Guardar borrador en tiempo real de respuesta abierta (anti-pérdida)
router.post('/:assessmentId/draft', async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { question_id, draft_text } = req.body;
    
    if (question_id !== undefined && draft_text !== undefined) {
      await assessmentService.saveDraft(assessmentId, Number(question_id), String(draft_text));
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al auto-guardar borrador.' });
  }
});

// Enviar respuesta y avanzar a la siguiente pregunta
router.post('/:assessmentId/submit', async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { question_id, selected_option, written_answer, client_elapsed_seconds } = req.body;

    if (!question_id) {
      return res.status(400).json({ error: 'ID de pregunta requerido.' });
    }

    const result = await assessmentService.submitAnswer(assessmentId, Number(question_id), {
      selected_option,
      written_answer,
      client_elapsed_seconds
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al registrar la respuesta.' });
  }
});

export default router;
