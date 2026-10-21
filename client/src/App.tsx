import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WelcomeStep } from './components/candidate/WelcomeStep';
import { InstructionsStep } from './components/candidate/InstructionsStep';
import { ExamStep } from './components/candidate/ExamStep';
import { CompletionStep } from './components/candidate/CompletionStep';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { SupabaseConfigModal } from './components/admin/SupabaseConfigModal';
import { checkHealth, startAssessment } from './services/api';
import { ShieldCheck } from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<'candidate' | 'admin'>('candidate');
  
  // Flujo de la Candidata: 'welcome' | 'instructions' | 'exam' | 'completion'
  const [candidateStep, setCandidateStep] = useState<'welcome' | 'instructions' | 'exam' | 'completion'>('welcome');
  const [currentCandidate, setCurrentCandidate] = useState<any>(null);
  const [currentAssessment, setCurrentAssessment] = useState<any>(null);

  // Evaluador / Admin
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem('quimi_admin_token') || '');
  const [adminReviewer, setAdminReviewer] = useState<{ id: string; name: string }>(() => {
    const saved = localStorage.getItem('quimi_admin_reviewer');
    return saved ? JSON.parse(saved) : { id: 'maria_evaluadora', name: 'María' };
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Supabase Status
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  useEffect(() => {
    checkHealth()
      .then(data => {
        if (data?.supabase) {
          setSupabaseStatus(data.supabase);
        }
      })
      .catch(err => console.warn('Health check warning:', err));
  }, []);

  // Soporte para ingresar directo por URL (#admin o #evaluador)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.hash === '#evaluador') {
        if (!adminToken) {
          setIsAdminLoginOpen(true);
        } else {
          setCurrentRole('admin');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [adminToken]);

  // Manejador al validar código de candidata
  const handleCandidateValidated = (data: { candidate: any; assessment: any; accessCode: string }) => {
    setCurrentCandidate(data.candidate);
    setCurrentAssessment(data.assessment);

    // Si ya completó la prueba previamente, llevar directo a finalización
    if (data.assessment.status === 'submitted' || data.assessment.status === 'graded') {
      setCandidateStep('completion');
    } else if (data.assessment.status === 'in_progress') {
      // Reanudar directamente examen en progreso
      setCandidateStep('exam');
    } else {
      setCandidateStep('instructions');
    }
  };

  const handleStartExam = async () => {
    if (!currentAssessment) return;
    try {
      await startAssessment(currentAssessment.id);
      setCandidateStep('exam');
    } catch (err: any) {
      alert(err.message || 'Error al iniciar la evaluación.');
    }
  };

  const handleSwitchRole = (role: 'candidate' | 'admin') => {
    if (role === 'admin' && !adminToken) {
      setIsAdminLoginOpen(true);
      return;
    }
    setCurrentRole(role);
  };

  const handleAdminLoginSuccess = (token: string, reviewer: { id: string; name: string }) => {
    setAdminToken(token);
    setAdminReviewer(reviewer);
    localStorage.setItem('quimi_admin_token', token);
    localStorage.setItem('quimi_admin_reviewer', JSON.stringify(reviewer));
    setIsAdminLoginOpen(false);
    setCurrentRole('admin');
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    localStorage.removeItem('quimi_admin_token');
    localStorage.removeItem('quimi_admin_reviewer');
    setCurrentRole('candidate');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        supabaseStatus={supabaseStatus}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        candidateName={currentCandidate?.full_name}
        reviewerName={adminReviewer.name}
        onLogoutAdmin={handleAdminLogout}
      />

      <main className="flex-1">
        {currentRole === 'candidate' ? (
          <div>
            {candidateStep === 'welcome' && (
              <WelcomeStep onValidated={handleCandidateValidated} />
            )}

            {candidateStep === 'instructions' && currentCandidate && currentAssessment && (
              <InstructionsStep
                candidate={currentCandidate}
                assessment={currentAssessment}
                onStart={handleStartExam}
                onBack={() => setCandidateStep('welcome')}
              />
            )}

            {candidateStep === 'exam' && currentAssessment && (
              <ExamStep
                assessmentId={currentAssessment.id}
                candidateName={currentCandidate?.full_name || 'Candidata'}
                onFinished={() => setCandidateStep('completion')}
              />
            )}

            {candidateStep === 'completion' && (
              <CompletionStep
                candidateName={currentCandidate?.full_name || 'Candidata'}
                onResetToLogin={() => {
                  setCandidateStep('welcome');
                  setCurrentCandidate(null);
                  setCurrentAssessment(null);
                }}
              />
            )}
          </div>
        ) : (
          <AdminDashboard
            authToken={adminToken}
            currentReviewer={adminReviewer}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Footer corporativo */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <p>
          &copy; {new Date().getFullYear()} <strong>QUIMICORP PERÚ S.A.C.</strong> — Sistema de Evaluación Comercial y Captación Digital. Todos los derechos reservados.
        </p>
      </footer>

      {/* Modal de autenticación evaluador */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Modal de estado Supabase */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        status={supabaseStatus}
      />
    </div>
  );
}

export default App;
