import React, { useState } from 'react';
import { X, UserPlus, Mail, User, Phone, CheckCircle, Copy } from 'lucide-react';
import { createCandidate } from '../../services/api';

interface NewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken: string;
  onCandidateCreated: () => void;
}

export const NewCandidateModal: React.FC<NewCandidateModalProps> = ({
  isOpen,
  onClose,
  authToken,
  onCandidateCreated
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdData, setCreatedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await createCandidate({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined
      }, authToken);

      setCreatedData(res);
      onCandidateCreated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar postulante.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Código copiado al portapapeles: ' + text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Cabecera */}
        <div className="bg-[#08265C] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-bold">Registrar Nueva Postulante</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {createdData ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ¡Candidata Registrada con Éxito!
            </h3>
            <p className="text-xs text-slate-600">
              Se ha creado el registro para <strong>{createdData.candidate.full_name}</strong>.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Código Individual de Invitación:</span>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-300">
                <span className="font-mono font-black text-blue-900 text-sm tracking-wider">
                  {createdData.invitation.access_code}
                </span>
                <button
                  onClick={() => copyToClipboard(createdData.invitation.access_code)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md transition-colors cursor-pointer"
                  title="Copiar código"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Comparte este código con la postulante para que ingrese a su evaluación en Google Meet.
              </p>
            </div>

            <button
              onClick={() => {
                setCreatedData(null);
                setFullName('');
                setEmail('');
                setPhone('');
                onClose();
              }}
              className="w-full py-2.5 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Cerrar y volver al Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombres y Apellidos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Andrea Paredes Gómez"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andrea.paredes@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Teléfono / WhatsApp (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+51 987 654 321"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#08265C] hover:bg-[#0D3882] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Registrando...' : 'Generar Invitación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
