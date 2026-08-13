import React, { useState, useRef } from 'react';
import { PenTool, Check, RotateCcw, X } from 'lucide-react';

interface SignatureModalProps {
  onApplySignature: (imageDataUrl: string) => void;
  onClose: () => void;
}

export const STAMP_PRESETS = [
  { label: 'CERTIFIÉ CONFORME', color: '#16a34a' },
  { label: 'PAYÉ', color: '#2563eb' },
  { label: 'LU ET APPROUVÉ', color: '#9333ea' },
  { label: 'CONFIDENTIEL', color: '#dc2626' },
];

export const SignatureModal: React.FC<SignatureModalProps> = ({ onApplySignature, onClose }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setSelectedStamp(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSelectedStamp(null);
  };

  const handleSelectStamp = (stamp: { label: string; color: string }) => {
    setSelectedStamp(stamp.label);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.strokeStyle = stamp.color;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 30, canvas.width - 80, canvas.height - 60);

    ctx.fillStyle = stamp.color;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp.label, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onApplySignature(canvas.toDataURL('image/png'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Signature & Tampon Officiel</h3>
              <p className="text-slate-400 text-xs">Dessinez votre signature ou choisissez un tampon certifié</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STAMP_PRESETS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSelectStamp(s)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                selectedStamp === s.label
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span style={{ color: s.color }}>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="relative bg-white rounded-2xl border-2 border-dashed border-slate-700 p-2 shadow-inner">
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            className="w-full h-40 cursor-crosshair touch-none"
          />
          <span className="absolute bottom-2 left-4 text-[10px] text-slate-400 font-mono">
            {selectedStamp ? 'Tampon Apposé' : 'Signez ci-dessus avec le doigt ou la souris'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Effacer</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apposer la Signature</span>
          </button>
        </div>

      </div>
    </div>
  );
};
