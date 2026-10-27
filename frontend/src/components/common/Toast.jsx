import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1E1F20] border border-[#333538] text-sm text-[#E3E3E3] shadow-2xl animate-fade-in pointer-events-auto">
      {toast.type === 'success' ? (
        <CheckCircle2 size={16} className="text-emerald-400" />
      ) : (
        <AlertCircle size={16} className="text-rose-400" />
      )}
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-[#C4C7C5] hover:text-white cursor-pointer"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

