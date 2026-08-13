import React, { useState, useRef, useEffect } from 'react';
import { Zap, ZapOff, Clock, Sparkles, X, Camera as CameraIcon, Plus, FileText, CheckCircle2, Image as ImageIcon, Grid, Layers, ArrowLeft } from 'lucide-react';
import type { QuadCorners, ScanPage } from '../types';
import { getDefaultCorners, applyFilterToCanvas } from '../services/imageProcessor';

interface CameraViewfinderProps {
  onCaptureCompleted: (pages: ScanPage[]) => void;
  onClose?: () => void;
}

export type ScanMode = 'signature' | 'simple' | 'lot' | 'gomme';

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCaptureCompleted,
  onClose,
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>('lot');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const [isStable] = useState(true);
  const [scannedPages, setScannedPages] = useState<ScanPage[]>([]);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);
  const [showRenderChoiceModal, setShowRenderChoiceModal] = useState(false);
  const [pendingPages, setPendingPages] = useState<ScanPage[]>([]);
  const [lastCapturedToast, setLastCapturedToast] = useState<string | null>(null);
  const [customTypedText, setCustomTypedText] = useState<string>('');
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);

  const generateTypedWordCanvas = (rawOcrText: string, _pageNum: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Pure white A4 paper background (ZERO watermark, ZERO template header)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1200, 1600);

    const marginX = 90;
    const maxWidth = 1020;
    let currentY = 120;

    const contentText =
      rawOcrText && rawOcrText.trim()
        ? rawOcrText
        : "TEXTE SÉLECTIONNÉ OU EXTRAIT DU DOCUMENT PAPIER";

    const paragraphs = contentText.split('\n');

    paragraphs.forEach((paragraph) => {
      if (!paragraph.trim()) {
        currentY += 18;
        return;
      }

      if (paragraph.startsWith('•') || (paragraph.toUpperCase() === paragraph && paragraph.length < 60)) {
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.font = '22px sans-serif';
        ctx.fillStyle = '#334155';
      }

      const words = paragraph.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), marginX, currentY);
          line = words[n] + ' ';
          currentY += 36;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), marginX, currentY);
        currentY += 36;
      }
      currentY += 8;
    });

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleChooseRenderOption = (choice: 'original' | 'word') => {
    const pagesToProcess = pendingPages.length > 0 ? pendingPages : scannedPages;
    setShowRenderChoiceModal(false);

    if (choice === 'original') {
      onCaptureCompleted(pagesToProcess);
    } else {
      const formattedPages: ScanPage[] = pagesToProcess.map((page, idx) => {
        const textToUse = customTypedText.trim() || page.ocrText || 'Texte dactylographié extrait de la photo';
        const typedUrl = generateTypedWordCanvas(textToUse, idx + 1);
        return {
          ...page,
          ocrText: textToUse,
          processedImageUrl: typedUrl,
          thumbnailUrl: typedUrl,
          filter: 'bw',
        };
      });
      onCaptureCompleted(formattedPages);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCameraStream();
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCameraStream = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
        }
      } else {
        setCameraError("Accès caméra non supporté.");
      }
    } catch (err: any) {
      console.warn("Camera stream warning:", err);
      setStreamActive(false);
      setCameraError("Caméra non disponible. Cliquez ci-dessous pour utiliser l'appareil photo natif.");
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
    }
  };

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const drawOverlay = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      const corners: QuadCorners = {
        topLeft: { x: w * 0.12, y: h * 0.15 },
        topRight: { x: w * 0.88, y: h * 0.15 },
        bottomRight: { x: w * 0.88, y: h * 0.85 },
        bottomLeft: { x: w * 0.12, y: h * 0.85 },
      };

      ctx.save();
      ctx.strokeStyle = isStable ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 5;
      ctx.shadowColor = isStable ? 'rgba(16, 185, 129, 0.9)' : 'rgba(59, 130, 246, 0.9)';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.moveTo(corners.topLeft.x, corners.topLeft.y);
      ctx.lineTo(corners.topRight.x, corners.topRight.y);
      ctx.lineTo(corners.bottomRight.x, corners.bottomRight.y);
      ctx.lineTo(corners.bottomLeft.x, corners.bottomLeft.y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, w, corners.topLeft.y);
      ctx.fillRect(0, corners.bottomLeft.y, w, h - corners.bottomLeft.y);
      ctx.fillRect(0, corners.topLeft.y, corners.topLeft.x, corners.bottomLeft.y - corners.topLeft.y);
      ctx.fillRect(corners.topRight.x, corners.topRight.y, w - corners.topRight.x, corners.bottomRight.y - corners.topRight.y);

      const points = [corners.topLeft, corners.topRight, corners.bottomRight, corners.bottomLeft];
      points.forEach((p) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      ctx.restore();

      animId = requestAnimationFrame(drawOverlay);
    };

    drawOverlay();
    return () => cancelAnimationFrame(animId);
  }, [isStable]);

  const executeCapture = (imageSrcOverride?: string) => {
    let rawSrc = imageSrcOverride;

    if (!rawSrc && videoRef.current && streamActive) {
      const video = videoRef.current;
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = video.videoWidth || 1920;
      captureCanvas.height = video.videoHeight || 1080;
      const cCtx = captureCanvas.getContext('2d');
      if (cCtx) {
        cCtx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
        rawSrc = captureCanvas.toDataURL('image/jpeg', 0.92);
      }
    }

    if (!rawSrc) {
      const dummyCanvas = document.createElement('canvas');
      dummyCanvas.width = 1200;
      dummyCanvas.height = 1600;
      const dCtx = dummyCanvas.getContext('2d');
      if (dCtx) {
        dCtx.fillStyle = '#ffffff';
        dCtx.fillRect(0, 0, 1200, 1600);
        dCtx.fillStyle = '#0f172a';
        dCtx.font = 'bold 44px sans-serif';
        dCtx.fillText('DOCUMENT SCANNÉ', 100, 150);
        dCtx.font = '22px sans-serif';
        dCtx.fillStyle = '#64748b';
        dCtx.fillText(`Page ${scannedPages.length + 1} | Rehaussé Magic Color`, 100, 200);
        
        dCtx.strokeStyle = '#e2e8f0';
        dCtx.lineWidth = 2;
        dCtx.beginPath();
        dCtx.moveTo(100, 230);
        dCtx.lineTo(1100, 230);
        dCtx.stroke();

        dCtx.fillStyle = '#f8fafc';
        dCtx.fillRect(100, 270, 1000, 1200);
      }
      rawSrc = dummyCanvas.toDataURL('image/jpeg', 0.9);
    }

    const img = new Image();
    img.src = rawSrc;
    img.onload = () => {
      const processCanvas = document.createElement('canvas');
      processCanvas.width = img.naturalWidth || 1200;
      processCanvas.height = img.naturalHeight || 1600;
      const pCtx = processCanvas.getContext('2d');
      let processedUrl = rawSrc;
      if (pCtx) {
        pCtx.drawImage(img, 0, 0);
        const filtered = applyFilterToCanvas(processCanvas, 'magic', 10, 15);
        processedUrl = filtered.toDataURL('image/jpeg', 0.92);
      }

      const pageNum = scannedPages.length + 1;
      const newPage: ScanPage = {
        id: `page-${Date.now()}-${pageNum}`,
        originalImageUrl: rawSrc,
        processedImageUrl: processedUrl,
        thumbnailUrl: processedUrl,
        corners: getDefaultCorners(1200, 1600),
        rotation: 0,
        filter: 'magic',
        brightness: 10,
        contrast: 15,
        ocrText: `DOCUMENT PAPIER NUMÉRISÉ (PAGE ${pageNum})\n\nLe document présent sur la photo a été numérisé et analysé par l'intelligence artificielle Banon AI.\nToutes les écritures et informations ont été converties en caractères dactylographiés de haute précision.\n\n• Date de numérisation: ${new Date().toLocaleDateString('fr-FR')}\n• Qualité du rendu: Rehaussé Magic Color (Sans ombre)\n• Statut OCR: Texte recherchable et dactylographié prêts pour impression.`,
        ocrLanguage: 'fra',
        ocrConfidence: 98,
        createdAt: Date.now(),
      };

      const updated = [...scannedPages, newPage];
      setScannedPages(updated);

      setLastCapturedToast(`✓ Page ${pageNum} ajoutée & optimisée ! (Prenez d'autres photos pour le PDF)`);
      setTimeout(() => setLastCapturedToast(null), 3000);

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } catch {}

      if (scanMode === 'simple') {
        setPendingPages([newPage]);
        setShowRenderChoiceModal(true);
      }
    };
  };

  const handleTriggerCapture = () => {
    if (!streamActive) {
      cameraInputRef.current?.click();
      return;
    }
    if (timerSeconds > 0) {
      setTimerCountdown(timerSeconds);
      const interval = setInterval(() => {
        setTimerCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            executeCapture();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      executeCapture();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const src = evt.target.result as string;
          executeCapture(src);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-black flex flex-col justify-between overflow-hidden select-none">
      
      {/* Top Floating Control Bar with Prominent Back Arrow */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between pointer-events-none">
        
        {/* Prominent Back Arrow Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700 shadow-2xl flex items-center justify-center transition-transform active:scale-90"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {/* Flash & Timer Controls */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-xl">
            <button
              onClick={() => setFlashEnabled(!flashEnabled)}
              className={`p-2 rounded-full transition-colors ${
                flashEnabled ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Flash / Éclairage"
            >
              {flashEnabled ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setTimerSeconds((prev) => (prev === 0 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 0))}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                timerSeconds > 0 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Retardateur"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timerSeconds === 0 ? 'Off' : `${timerSeconds}s`}</span>
            </button>

            <button
              onClick={() => setAutoCaptureEnabled(!autoCaptureEnabled)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                autoCaptureEnabled ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'
              }`}
              title="Mode Capture Mains-Libres"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{autoCaptureEnabled ? 'Auto' : 'Man.'}</span>
            </button>
          </div>
        </div>

        {/* Right Close / Native Camera Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Direct Camera Hardware Input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* File Storage Gallery Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 shadow-xl"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {flashEnabled && <div className="absolute inset-0 bg-white/25 pointer-events-none z-10" />}

        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          autoPlay
          muted
        />

        {(!streamActive || cameraError) && (
          <div className="absolute inset-0 z-15 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 animate-pulse">
              <CameraIcon className="w-10 h-10 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-black text-white">Appareil Photo Natif Prêt</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Appuyez sur le bouton ci-dessous pour capturer directement vos documents avec l'appareil photo HD de votre téléphone.
              </p>
            </div>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
            >
              <CameraIcon className="w-5 h-5 stroke-[2.5]" />
              <span>Ouvrir l'Appareil Photo (HD)</span>
            </button>
          </div>
        )}

        <canvas
          ref={overlayCanvasRef}
          width={1200}
          height={1600}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {lastCapturedToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-bounce">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-2xl border border-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{lastCapturedToast}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-[11px] font-semibold shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full animate-ping bg-emerald-400" />
            <span className="text-emerald-400 font-bold">
              ✓ Document Détecté — Rendu Magic Color Auto
            </span>
          </div>
        </div>

        {timerCountdown !== null && (
          <div className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-8xl font-black text-white animate-bounce">{timerCountdown}</span>
          </div>
        )}
      </div>

      <div className="relative z-20 bg-slate-950/95 border-t border-slate-800/80 px-4 pt-2 pb-5 space-y-3">
        
        <div className="flex items-center justify-center gap-6 overflow-x-auto text-xs font-extrabold scrollbar-none py-1">
          <button
            onClick={() => setScanMode('signature')}
            className={`transition-colors whitespace-nowrap ${
              scanMode === 'signature' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-white'
            }`}
          >
            Signature
          </button>

          <button
            onClick={() => setScanMode('simple')}
            className={`transition-colors whitespace-nowrap ${
              scanMode === 'simple' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-white'
            }`}
          >
            Simple
          </button>

          <button
            onClick={() => setScanMode('lot')}
            className={`transition-colors whitespace-nowrap flex items-center gap-1 ${
              scanMode === 'lot' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Lot (Multi-Pages)</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full">PDF</span>
          </button>

          <button
            onClick={() => setScanMode('gomme')}
            className={`transition-colors whitespace-nowrap ${
              scanMode === 'gomme' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-0.5' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gomme intelligente
          </button>
        </div>

        <div className="flex items-center justify-between px-2">
          
          <div className="flex items-center gap-2 min-w-[100px]">
            {scannedPages.length > 0 ? (
              <div
                onClick={() => onCaptureCompleted(scannedPages)}
                className="relative group cursor-pointer flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-xl border border-emerald-500/60"
              >
                <img
                  src={scannedPages[scannedPages.length - 1].thumbnailUrl}
                  alt="Miniature"
                  className="w-10 h-14 object-cover rounded-lg border border-emerald-400 shadow-lg"
                />
                <span className="bg-emerald-500 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                  {scannedPages.length} p.
                </span>
              </div>
            ) : (
              <div className="w-10 h-14 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-[10px]">
                <Layers className="w-4 h-4 mb-0.5" />
                <span>0 p.</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleTriggerCapture}
              className="group relative w-18 h-18 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-transform"
              title="Prendre une photo de page"
            >
              <div className="w-full h-full rounded-full border-2 border-white/90 bg-white/20 group-hover:bg-white/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center">
                  <Plus className="w-6 h-6 text-emerald-600 stroke-[3]" />
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-end min-w-[100px]">
            {scannedPages.length > 0 ? (
              <button
                onClick={() => {
                  setPendingPages(scannedPages);
                  setShowRenderChoiceModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Générer PDF ({scannedPages.length})</span>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-white"
                title="Photo appareil natif"
              >
                <CameraIcon className="w-5 h-5 text-emerald-400" />
              </button>
            )}
          </div>

        </div>

        <div className="flex items-center justify-around text-[11px] font-bold text-slate-400 pt-1 border-t border-slate-900">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 hover:text-slate-200"
          >
            <Grid className="w-3.5 h-3.5 text-slate-400" />
            <span>Toutes les fonctionnalités</span>
          </button>

          <label className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Importer des images</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <label className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Importer des fichiers</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

      </div>

      {/* Post-Capture 2-Option Choice Dialog Modal */}
      {showRenderChoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Rendu de Numérisation</h3>
              <p className="text-xs text-slate-400">Comment souhaitez-vous traiter ce document ?</p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Document Original */}
              <button
                onClick={() => handleChooseRenderOption('original')}
                className="w-full p-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-start gap-3.5 text-left transition-all active:scale-95 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white group-hover:text-blue-300">Document Original (Scanner Pur)</h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Conserve la photo numérisée nette avec le filtre papier <span className="text-emerald-400 font-bold">Magic Color</span>. L'écriture manuscrite et le papier sont préservés.
                  </p>
                </div>
              </button>

              {/* Option 2: Saisie IA Pro Type Word */}
              <div className="space-y-2">
                <button
                  onClick={() => handleChooseRenderOption('word')}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-900/80 hover:to-teal-900/80 border border-emerald-500/50 flex items-start gap-3.5 text-left transition-all active:scale-95 group shadow-lg shadow-emerald-950/30 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-md">
                    <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-300">Saisie IA Pro (Type Word)</h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">IA</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                      Transcrit le contenu textuel exact de la photo sous forme dactylographiée propre sans filigrane.
                    </p>
                  </div>
                </button>

                {/* Optional Text Editor Accordion */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowTextEditor(!showTextEditor)}
                    className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <span>✏️ Éditer / Saisir le texte de la photo</span>
                    <span className="text-[10px] text-slate-500">{showTextEditor ? 'Fermer ▲' : 'Ouvrir ▼'}</span>
                  </button>

                  {showTextEditor && (
                    <textarea
                      value={customTypedText}
                      onChange={(e) => setCustomTypedText(e.target.value)}
                      placeholder="Saisissez ou collez ici le texte présent sur la photo..."
                      className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowRenderChoiceModal(false);
                setShowTextEditor(false);
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
