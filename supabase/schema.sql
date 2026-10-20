-- ==============================================================================
-- QUIMICORP TALENT — Evaluación Comercial
-- Base de Datos PostgreSQL / Supabase
-- ==============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla: candidates (Postulantes)
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla: invitations (Códigos de invitación individuales)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    access_code VARCHAR(64) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla: assessments (Instancias de evaluación)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES invitations(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'graded')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    current_question_index INT DEFAULT 1 NOT NULL,
    current_question_started_at TIMESTAMPTZ,
    objective_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    manual_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    total_score NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla: questions (Banco de 10 preguntas)
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY,
    position INT NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'open_text')),
    statement TEXT NOT NULL,
    situation TEXT,
    options JSONB, -- Array de objetos: [{"id":"A","text":"..."},{"id":"B","text":"..."}]
    time_limit_seconds INT NOT NULL,
    max_points NUMERIC(5, 2) NOT NULL
);

-- 6. Tabla: answer_keys (SEGURA: Claves y Rúbricas accesibles solo por backend/admin)
CREATE TABLE IF NOT EXISTS answer_keys (
    question_id INT PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE,
    correct_option VARCHAR(10), -- Para selección múltiple ('A', 'B', 'C', 'D')
    scoring_metadata JSONB,     -- Rúbrica con criterios 0-3 y explicaciones
    explanation TEXT
);

-- 7. Tabla: answers (Respuestas de las candidatas con registro de tiempos)
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(id),
    selected_option VARCHAR(10),
    written_answer TEXT,
    draft_answer TEXT,
    started_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ,
    elapsed_seconds INT DEFAULT 0 NOT NULL,
    timed_out BOOLEAN DEFAULT FALSE NOT NULL,
    is_interrupted BOOLEAN DEFAULT FALSE NOT NULL,
    objective_points NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_assessment_question UNIQUE (assessment_id, question_id)
);

-- 8. Tabla: reviewer_scores (Calificación manual dual de preguntas abiertas)
CREATE TABLE IF NOT EXISTS reviewer_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(100) NOT NULL, -- ej: 'maria_evaluadora', 'evaluador_comercial_2'
    reviewer_name VARCHAR(255) NOT NULL,
    criterion_scores JSONB NOT NULL, -- {"c1": 3, "c2": 3, "c3": 2, "c4": 3}
    total_points NUMERIC(5, 2) NOT NULL,
    observation TEXT,
    reviewed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_answer_reviewer UNIQUE (answer_id, reviewer_id)
);

-- 9. Tabla: final_reviews (Consenso, dictamen y recomendación final colegiada)
CREATE TABLE IF NOT EXISTS final_reviews (
    assessment_id UUID PRIMARY KEY REFERENCES assessments(id) ON DELETE CASCADE,
    final_scores JSONB NOT NULL, -- Puntaje por competencia y manual acordado
    recommendation VARCHAR(100) NOT NULL CHECK (recommendation IN (
        'Recomendada',
        'Recomendada con capacitación',
        'Pendiente de evaluación adicional',
        'No recomendada para este puesto por ahora'
    )),
    justification TEXT NOT NULL,
    approved_by VARCHAR(255) NOT NULL,
    approved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabla: audit_logs (Auditoría para reinicios, incidencias y accesos)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar rendimiento
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(access_code);
CREATE INDEX IF NOT EXISTS idx_assessments_candidate ON assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_answers_assessment ON answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_scores_answer ON reviewer_scores(answer_id);

-- Configuración de Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
-- 1. questions: Lectura pública de preguntas (pero NO de answer_keys)
CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);

-- 2. answer_keys: NUNCA expuesta a usuarios públicos (Solo accesible por service_role)
-- No se crean políticas públicas para answer_keys.

-- 3. Políticas para acceso mediante service_role / backend seguro
CREATE POLICY "Service role full access candidates" ON candidates USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access invitations" ON invitations USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access assessments" ON assessments USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access answers" ON answers USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access reviewer_scores" ON reviewer_scores USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access final_reviews" ON final_reviews USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access audit_logs" ON audit_logs USING (true) WITH CHECK (true);
