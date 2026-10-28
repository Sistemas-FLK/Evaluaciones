export type QuestionType = 'multiple_choice' | 'open_text';

export type AssessmentStatus = 'pending' | 'in_progress' | 'submitted' | 'graded';

export type RecommendationType = 
  | 'Recomendada' 
  | 'Recomendada con capacitación' 
  | 'Pendiente de evaluación adicional' 
  | 'No recomendada para este puesto por ahora';

export interface QuestionOption {
  id: string;
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

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface CandidateOverviewRow {
  candidate_id: string;
  full_name: string;
  email: string;
  access_code: string;
  assessment_id: string | null;
  status: AssessmentStatus;
  objective_score: number;
  manual_score: number;
  total_score: number;
  total_time_seconds: number;
  answers_count: number;
  has_review: boolean;
}

export interface OverviewData {
  kpis: {
    total_candidates: number;
    pending: number;
    in_progress: number;
    submitted_pending_review: number;
    graded: number;
  };
  candidates: CandidateOverviewRow[];
}

export interface ReviewerScore {
  id: string;
  answer_id: string;
  reviewer_id: string;
  reviewer_name: string;
  criterion_scores: Record<string, number>;
  total_points: number;
  observation?: string;
  reviewed_at: string;
}

export interface QuestionDetailItem {
  question: Question;
  answer_key: {
    correct_option: string | null;
    scoring_metadata: any;
    explanation: string | null;
    benchmark_guide?: {
      ideal_approach: string;
      sample_answer: string;
      key_strengths: string[];
      red_flags: string[];
    } | null;
  };
  candidate_answer: {
    id: string;
    selected_option: string | null;
    written_answer: string | null;
    draft_answer: string | null;
    started_at: string;
    submitted_at: string;
    elapsed_seconds: number;
    timed_out: boolean;
    objective_points: number;
  } | null;
  reviews: ReviewerScore[];
}

export interface FinalReview {
  assessment_id: string;
  final_scores: {
    objective_score: number;
    manual_score: number;
    total_score: number;
    competency_breakdown: Record<string, { earned: number; max: number }>;
    historical_import?: {
      source_file: string;
      evaluation_date: string;
      original_verdict: string;
      timing_available: false;
    };
  };
  recommendation: RecommendationType;
  justification: string;
  approved_by: string;
  approved_at: string;
}

export interface CandidateDetailResponse {
  candidate: Candidate;
  assessment: {
    id: string;
    candidate_id: string;
    invitation_id: string;
    status: AssessmentStatus;
    started_at?: string;
    completed_at?: string;
    current_question_index: number;
    objective_score: number;
    manual_score: number;
    total_score: number;
  };
  questions_detail: QuestionDetailItem[];
  final_review: FinalReview | null;
}
