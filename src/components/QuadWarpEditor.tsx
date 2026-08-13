import React, { useState, useRef, useEffect } from 'react';
import { Move, Check, RotateCcw, Maximize2, Sparkles, RefreshCw } from 'lucide-react';
import type { QuadCorners, ScanPage } from '../types';
import { getDefaultCorners, warpPerspective } from '../services/imageProcessor';

interface QuadWarpEditorProps {
  page: ScanPage;
  onSave: (updatedPage: ScanPage) => void;
  onCancel: () => void;
}

export const QuadWarpEditor: React.FC<QuadWarpEditorProps> = ({ page, onSave, onCancel }) => {
  const [corners, setCorners] = useState<QuadCorners>(page.corners);
  const [activeCorner, setActiveCorner] = useState<keyof QuadCorners | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = page.originalImageUrl;
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
  }, [page.originalImageUrl, corners]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth || 1200;
    canvas.height = img.naturalHeight || 1600;

    ctx.drawImage(img, 0, 0);

    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.9)';
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.moveTo(corners.topLeft.x, corners.topLeft.y);
    ctx.lineTo(corners.topRight.x, corners.topRight.y);
    ctx.lineTo(corners.bottomRight.x, corners.bottomRight.y);
    ctx.lineTo(corners.bottomLeft.x, corners.bottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.fill();

    const keys: (keyof QuadCorners)[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    keys.forEach((key) => {
      const p = corners[key];
      const isSelected = activeCorner === key;

      ctx.fillStyle = isSelected ? '#10b981' : '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 22 : 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#059669' : '#2563eb';
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const threshold = 60;
    const keys: (keyof QuadCorners)[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    for (const key of keys) {
      const p = corners[key];
      const dist = Math.hypot(p.x - clickX, p.y - clickY);
      if (dist < threshold) {
        setActiveCorner(key);
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeCorner) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const posX = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX));
    const posY = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY));

    setCorners((prev) => ({
      ...prev,
      [activeCorner]: { x: posX, y: posY },
    }));
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  const handleAutoReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCorners(getDefaultCorners(canvas.width, canvas.height));
  };

  const handleApplyWarp = () => {
    const img = imgRef.current;
    if (!img) return;

    setIsProcessing(true);

    setTimeout(() => {
      const warpedCanvas = warpPerspective(img, corners, 1200, 1600);
      const warpedUrl = warpedCanvas.toDataURL('image/jpeg', 0.9);

      onSave({
        ...page,
        corners,
        processedImageUrl: warpedUrl,
        thumbnailUrl: warpedUrl,
      });

      setIsProcessing(false);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      
      <div className="flex items-center justify-between bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Correction de Perspective (Quad 4 Points)</h2>
            <p className="text-slate-400 text-xs">Faites glisser les 4 coins pour cadrer parfaitement le document</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoReset}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser</span>
          </button>

          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>

      <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden bg-slate-900 rounded-2xl border border-slate-800/80 p-2">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="max-w-full max-h-full object-contain cursor-crosshair rounded-lg shadow-2xl touch-none"
        />

        {activeCorner && (
          <div className="absolute top-4 left-4 bg-slate-950/90 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2">
            <Move className="w-4 h-4 animate-spin" />
            <span>Ajustement du coin: {activeCorner}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Algorithme d'Homographie OpenCV 60FPS</span>
        </div>

        <button
          onClick={handleApplyWarp}
          disabled={isProcessing}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
        >
          {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          <span>Appliquer le Redressement</span>
        </button>
      </div>

    </div>
  );
};
