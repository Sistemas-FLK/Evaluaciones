// ==============================================================================
// QUIMICORP TALENT — Tipos del Backend
// ==============================================================================

export type QuestionType = 'multiple_choice' | 'open_text';

export type AssessmentStatus = 'pending' | 'in_progress' | 'submitted' | 'graded';

export type RecommendationType = 
  | 'Recomendada' 
  | 'Recomendada con capacitación' 
  | 'Pendiente de evaluación adicional' 
  | 'No recomendada para este puesto por ahora';

export interface QuestionOption {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: number;
  position: number;
  category: string;
  question_type: QuestionType;
  statement: string;
  situation?: string;
  options?: QuestionOption[];
  time_limit_seconds: number;
  max_points: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  max: number; // usually 3
}

export interface AnswerKey {
  question_id: number;
  correct_option?: string;
  scoring_metadata: {
    type: 'objective' | 'rubric';
    points?: number;
    criteria?: RubricCriterion[];
  };
  explanation?: string;
  benchmark_guide?: {
    ideal_approach: string;
    sample_answer: string;
    key_strengths: string[];
    red_flags: string[];
  };
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  candidate_id: string;
  access_code: string;
  is_active: boolean;
  expires_at: string;
  used_at?: string;
}

export interface Answer {
  id: string;
  assessment_id: string;
  question_id: number;
  selected_option?: string;
  written_answer?: string;
  draft_answer?: string;
  started_at: string;
  submitted_at?: string;
  elapsed_seconds: number;
  timed_out: boolean;
  is_interrupted?: boolean;
  objective_points: number;
}

export interface ReviewerScore {
  id: string;
  answer_id: string;
  reviewer_id: string;
  reviewer_name: string;
  criterion_scores: Record<string, number>; // e.g. { c1: 3, c2: 2, c3: 3, c4: 3 }
  total_points: number;
  observation?: string;
  reviewed_at: string;
}

export interface HistoricalImport {
  source_file: string;
  source_sha256: string;
  evaluation_date: string;
  imported_at: string;
  original_verdict: string;
  timing_available: false;
  questions: Array<{ question: Question; answer_key: AnswerKey }>;
}

export interface HistoricalEvaluationPayload {
  access_code: string;
  candidate_name: string;
  source_file: string;
  source_sha256: string;
  evaluation_date: string;
  original_verdict: string;
  recommendation: RecommendationType;
  objective_score: number;
  manual_score: number;
  total_score: number;
  questions: Array<{
    question: Question;
    answer_key: AnswerKey;
    selected_option?: string;
    written_answer?: string;
    points: number;
    criterion_scores?: Record<string, number>;
    observation?: string;
  }>;
}

export interface FinalReview {
  assessment_id: string;
  final_scores: {
    objective_score: number;
    manual_score: number;
    total_score: number;
    competency_breakdown: Record<string, { earned: number; max: number }>;
    historical_import?: HistoricalImport;
  };
  recommendation: RecommendationType;
  justification: string;
  approved_by: string;
  approved_at: string;
}

export interface Assessment {
  id: string;
  candidate_id: string;
  invitation_id: string;
  status: AssessmentStatus;
  started_at?: string;
  completed_at?: string;
  current_question_index: number;
  current_question_started_at?: string;
  objective_score: number;
  manual_score: number;
  total_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
}

export interface CandidateAdministrativeState {
  last_action_reason?: string;
  revision: number;
  deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
  delete_reason?: string;
  participation: 'active' | 'no_show' | 'incomplete';
  participation_reason?: string;
  participation_changed_at?: string;
  participation_changed_by?: string;
}
