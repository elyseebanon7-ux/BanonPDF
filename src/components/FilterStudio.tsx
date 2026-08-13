import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, RotateCcw, Check, Sparkles, Sun, Contrast } from 'lucide-react';
import type { FilterType, ScanPage } from '../types';
import { applyFilterToCanvas, rotateCanvas } from '../services/imageProcessor';

interface FilterStudioProps {
  page: ScanPage;
  onSave: (updatedPage: ScanPage) => void;
  onCancel: () => void;
}

export const FILTER_OPTIONS: { id: FilterType; label: string; desc: string; iconColor: string }[] = [
  { id: 'magic', label: 'Magic Color', desc: 'Fond blanc pur + Texte foncé', iconColor: 'text-amber-400' },
  { id: 'bw', label: 'Noir & Blanc High', desc: 'Contraste maximal texte pur', iconColor: 'text-slate-100' },
  { id: 'grayscale', label: 'Niveaux de Gris', desc: 'Rendu papier classique', iconColor: 'text-slate-400' },
  { id: 'original', label: 'Original', desc: 'Photo couleur brute', iconColor: 'text-blue-400' },
  { id: 'whiteboard', label: 'Tableau Blanc', desc: 'Effacement reflets & feutres', iconColor: 'text-emerald-400' },
  { id: 'contrast', label: 'Contraste Couleurs', desc: 'Restauration éclairage', iconColor: 'text-indigo-400' },
];

export const FilterStudio: React.FC<FilterStudioProps> = ({ page, onSave, onCancel }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(page.filter || 'magic');
  const [brightness, setBrightness] = useState<number>(page.brightness || 0);
  const [contrast, setContrast] = useState<number>(page.contrast || 0);
  const [rotation, setRotation] = useState<number>(page.rotation || 0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = page.originalImageUrl;
    img.onload = () => {
      imgRef.current = img;
      renderImage();
    };
  }, [page.originalImageUrl]);

  useEffect(() => {
    renderImage();
  }, [activeFilter, brightness, contrast, rotation]);

  const renderImage = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth || 1200;
    tempCanvas.height = img.naturalHeight || 1600;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(img, 0, 0);
    }

    if (rotation !== 0) {
      tempCanvas = rotateCanvas(tempCanvas, rotation);
    }

    tempCanvas = applyFilterToCanvas(tempCanvas, activeFilter, brightness, contrast);

    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const processedUrl = canvas.toDataURL('image/jpeg', 0.9);

    onSave({
      ...page,
      filter: activeFilter,
      brightness,
      contrast,
      rotation,
      processedImageUrl: processedUrl,
      thumbnailUrl: processedUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      
      <div className="flex items-center justify-between bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base">Studio de Rehaussement d'Image</h2>
            <p className="text-slate-400 text-xs">Filtres pro Magic Color, suppression des ombres et netteté</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRotateLeft}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Rotation 90° Gauche"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRotateRight}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Rotation 90° Droite"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Annuler
          </button>
        </div>
      </div>

      <div className="relative flex-1 my-4 flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800/80 p-4 overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
      </div>

      <div className="bg-slate-900 px-6 py-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left min-w-[140px] transition-all ${
                activeFilter === f.id
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Sparkles className={`w-3.5 h-3.5 ${f.iconColor}`} />
                <span>{f.label}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">{f.desc}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 w-24">Luminosité</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 accent-blue-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">{brightness}</span>
          </div>

          <div className="flex items-center gap-3">
            <Contrast className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-300 w-24">Contraste</span>
            <input
              type="range"
              min="-100"
              max="100"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-8 text-right">{contrast}</span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Enregistrer les Filtres</span>
          </button>
        </div>

      </div>

    </div>
  );
};
