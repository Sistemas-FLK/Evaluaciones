// ==============================================================================
// QUIMICORP TALENT — Cliente de API
// ==============================================================================

const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

// -----------------------------------------------------------------------------
// Portal de Candidatas
// -----------------------------------------------------------------------------

export async function lookupInvitationCode(code: string) {
  try {
    const res = await fetch(`${API_BASE}/candidate/lookup/${encodeURIComponent(code)}`);
    return await res.json();
  } catch (err) {
    return { found: false };
  }
}

export async function validateInvitation(
  code: string,
  accept_privacy: boolean,
  candidateData?: { full_name?: string; email?: string; phone?: string }
) {
  const res = await fetch(`${API_BASE}/candidate/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      accept_privacy,
      full_name: candidateData?.full_name,
      email: candidateData?.email,
      phone: candidateData?.phone
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Código de invitación inválido');
  return data;
}

export async function startAssessment(assessmentId: string) {
  const res = await fetch(`${API_BASE}/candidate/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assessment_id: assessmentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al iniciar evaluación');
  return data;
}

export async function getCurrentQuestion(assessmentId: string) {
  const res = await fetch(`${API_BASE}/assessment/${assessmentId}/question`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener la pregunta actual');
  return data;
}

export async function saveDraftAnswer(assessmentId: string, questionId: number, draftText: string) {
  await fetch(`${API_BASE}/assessment/${assessmentId}/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, draft_text: draftText }),
  });
}

export async function submitQuestionAnswer(
  assessmentId: string,
  questionId: number,
  payload: { selected_option?: string; written_answer?: string; client_elapsed_seconds?: number }
) {
  const res = await fetch(`${API_BASE}/assessment/${assessmentId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_id: questionId, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al registrar respuesta');
  return data;
}

// -----------------------------------------------------------------------------
// Panel de Evaluadores / Administrador
// -----------------------------------------------------------------------------

export async function adminLogin(key: string, reviewerName: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, reviewer_name: reviewerName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de autenticación');
  return data;
}

export async function getAdminOverview(token: string) {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar resumen');
  return data;
}

export async function getCandidateDetail(candidateId: string, token: string) {
  const res = await fetch(`${API_BASE}/admin/candidate/${candidateId}`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar detalle');
  return data;
}

export async function submitReviewerScore(
  payload: {
    answer_id: string;
    reviewer_id: string;
    reviewer_name: string;
    criterion_scores: Record<string, number>;
    observation?: string;
  },
  token: string
) {
  const res = await fetch(`${API_BASE}/admin/score`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al calificar');
  return data;
}

export async function submitFinalReview(
  payload: {
    assessment_id: string;
    recommendation: string;
    justification: string;
    approved_by: string;
  },
  token: string
) {
  const res = await fetch(`${API_BASE}/admin/finalize`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al emitir dictamen final');
  return data;
}

export async function createCandidate(
  payload: { full_name: string; email: string; phone?: string },
  token: string
) {
  const res = await fetch(`${API_BASE}/admin/candidate/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al crear candidata');
  return data;
}

export async function resetAssessment(
  assessmentId: string,
  reason: string,
  actorId: string,
  token: string
) {
  const res = await fetch(`${API_BASE}/admin/candidate/${assessmentId}/reset`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({ reason, actor_id: actorId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al reiniciar');
  return data;
}
