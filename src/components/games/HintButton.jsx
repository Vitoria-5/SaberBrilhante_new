import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useStudent } from '@/lib/StudentContext';

export default function HintButton({ hint, label = 'Quer uma dica?' }) {
  const { speak, audioBlocked } = useStudent();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => {
          const willOpen = !open;
          setOpen(willOpen);
          if (willOpen) speak(hint);
        }}
        className="flex items-center gap-2 text-violet-700 font-semibold text-sm hover:underline"
      >
        <HelpCircle className="w-4 h-4" /> {label}
      </button>
      {open && <p className="mt-2 p-3 bg-amber-50 rounded-xl text-sm text-amber-800 border border-amber-100">{hint}</p>}
    </div>
  );
}