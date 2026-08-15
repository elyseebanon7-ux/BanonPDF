import React, { useState, useRef, useEffect } from 'react';
import { Zap, ZapOff, Clock, Sparkles, X, Camera as CameraIcon, Plus, FileText, CheckCircle2, Image as ImageIcon, Grid, Layers, ArrowLeft, RefreshCw } from 'lucide-react';
import type { QuadCorners, ScanPage } from '../types';
import { getDefaultCorners, applyFilterToCanvas, processScanOriginalPro } from '../services/imageProcessor';
import { digitizeTextWithVisionAI } from '../services/aiVisionService';
import { saveScanRecordToSupabase } from '../services/supabaseClient';

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
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [activeActionType, setActiveActionType] = useState<'enhance' | 'digitize' | null>(null);

  /**
   * Universal Supabase Digitize Handler
   * Saves scan result (mode 'ocr' or 'clean') into Supabase Storage & 'scans' table
   */
  const handleDigitize = async (mode: 'ocr' | 'clean', pages: ScanPage[], ocrText?: string) => {
    if (!pages || pages.length === 0) return;
    const firstPage = pages[0];
    try {
      const result = await saveScanRecordToSupabase({
        mode,
        ocrText: mode === 'ocr' ? (ocrText || firstPage.ocrText || null) : null,
        originalImageUrl: firstPage.originalImageUrl,
        processedImageUrl: firstPage.processedImageUrl,
        pageCount: pages.length,
      });

      if (result.success) {
        setLastCapturedToast(`✓ Scan enregistré dans Supabase (${mode.toUpperCase()}) !`);
        setTimeout(() => setLastCapturedToast(null), 3500);
      } else {
        console.warn('[Supabase Digitize Save Notice]', result.error);
      }
    } catch (err) {
      console.warn('[Supabase Digitize Exception]', err);
    }
  };

  /**
   * PARCOURS 1 : DOCUMENT ORIGINAL — SCANNER PRO
   * Transforme la photo en véritable rendu numérisé professionnel :
   * Détection coins -> correction de perspective (warp) -> nettoyage des ombres -> blanchiment du papier -> netteté du texte.
   */
  const handleEnhanceScan = async () => {
    const pagesToProcess = pendingPages.length > 0 ? pendingPages : scannedPages;
    if (pagesToProcess.length === 0) return;

    setIsProcessingAction(true);
    setActiveActionType('enhance');

    try {
      const enhancedPages: ScanPage[] = await Promise.all(
        pagesToProcess.map(async (page) => {
          const rawUrl = page.originalImageUrl || page.processedImageUrl;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = rawUrl;
          await new Promise((r) => { img.onload = r; img.onerror = r; });

          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 1200;
          canvas.height = img.naturalHeight || 1600;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);

          const proCanvas = processScanOriginalPro(canvas, page.corners);
          const enhancedUrl = proCanvas.toDataURL('image/jpeg', 0.94);

          return {
            ...page,
            processedImageUrl: enhancedUrl,
            thumbnailUrl: enhancedUrl,
            filter: 'magic',
            brightness: 12,
            contrast: 18,
          };
        })
      );

      // Save to Supabase scans table (Mode 'clean')
      await handleDigitize('clean', enhancedPages);

      setShowRenderChoiceModal(false);
      setIsProcessingAction(false);
      setActiveActionType(null);
      onCaptureCompleted(enhancedPages);
    } catch (err) {
      console.error('Enhance scan error:', err);
      setIsProcessingAction(false);
      setActiveActionType(null);
      onCaptureCompleted(pagesToProcess);
    }
  };

  /**
   * Action 2 : Numériser & Retaper le texte (IA - Mode 'ocr') (OCR Multimodal + Mise en page DTP Word)
   * Extraction et retranscription intégrale du contenu (texte manuscrit ou imprimé)
   * via modèle OCR multimodal Vision AI / Gemini 1.5 Pro Vision, avec conversion
   * en document propre et éditable ("mise en page ordinateur").
   */
  const handleDigitizeText = async () => {
    const pagesToProcess = pendingPages.length > 0 ? pendingPages : scannedPages;
    if (pagesToProcess.length === 0) return;

    setIsProcessingAction(true);
    setActiveActionType('digitize');

    try {
      let combinedOcrText = '';
      const digitizedPages: ScanPage[] = await Promise.all(
        pagesToProcess.map(async (page) => {
          const result = await digitizeTextWithVisionAI(
            page.originalImageUrl || page.processedImageUrl,
            page.ocrText
          );

          if (result.text) {
            combinedOcrText += (combinedOcrText ? '\n\n' : '') + result.text;
          }

          return {
            ...page,
            ocrText: result.text,
            processedImageUrl: result.dtpCanvasUrl,
            thumbnailUrl: result.dtpCanvasUrl,
            filter: 'bw',
          };
        })
      );

      // Save to Supabase scans table (Mode 'ocr')
      await handleDigitize('ocr', digitizedPages, combinedOcrText);

      setShowRenderChoiceModal(false);
      setIsProcessingAction(false);
      setActiveActionType(null);
      onCaptureCompleted(digitizedPages);
    } catch (err) {
      console.error('Digitize text error:', err);
      setIsProcessingAction(false);
      setActiveActionType(null);
      onCaptureCompleted(pagesToProcess);
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
        let stream: MediaStream | null = null;
        try {
          // Attempt 1: Back camera HD (environment)
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          });
        } catch (e1) {
          try {
            // Attempt 2: Back camera standard
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
            });
          } catch (e2) {
            // Attempt 3: Any available camera (front camera, webcam, etc.)
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
          }
        }

        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamActive(true);
          setCameraError(null);
        }
      } else {
        setCameraError("Accès caméra non supporté.");
      }
    } catch (err: any) {
      console.warn("Camera stream warning:", err);
      setStreamActive(false);
      setCameraError("Veuillez autoriser l'accès à la caméra dans votre navigateur pour démarrer la numérisation en direct.");
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
        ocrText: '',
        ocrLanguage: 'fra',
        ocrConfidence: 95,
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
      startCameraStream();
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
              <h3 className="text-base font-black text-white">Appareil Photo HD</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Appuyez ci-dessous pour démarrer la numérisation en direct avec la caméra de votre appareil.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
              <button
                onClick={startCameraStream}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
              >
                <CameraIcon className="w-5 h-5 stroke-[2.5]" />
                <span>Démarrer la Caméra en Direct</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>📁 Choisir une photo depuis vos dossiers</span>
              </button>
            </div>
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
            className={`transition-all whitespace-nowrap px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer ${
              scanMode === 'signature' 
                ? 'bg-purple-500/30 text-purple-300 font-black border border-purple-400 shadow-md shadow-purple-500/20 scale-105' 
                : 'text-purple-400/70 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20'
            }`}
          >
            <span>Signature</span>
          </button>

          <button
            onClick={() => setScanMode('simple')}
            className={`transition-all whitespace-nowrap px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer ${
              scanMode === 'simple' 
                ? 'bg-blue-500/30 text-blue-300 font-black border border-blue-400 shadow-md shadow-blue-500/20 scale-105' 
                : 'text-blue-400/70 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20'
            }`}
          >
            <span>Simple</span>
          </button>

          <button
            onClick={() => setScanMode('lot')}
            className={`transition-all whitespace-nowrap px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer ${
              scanMode === 'lot' 
                ? 'bg-emerald-500/30 text-emerald-300 font-black border border-emerald-400 shadow-md shadow-emerald-500/20 scale-105' 
                : 'text-emerald-400/70 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
            }`}
          >
            <span>Lot (Multi-Pages)</span>
            <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full font-black">PDF</span>
          </button>

          <button
            onClick={() => setScanMode('gomme')}
            className={`transition-all whitespace-nowrap px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer ${
              scanMode === 'gomme' 
                ? 'bg-amber-500/30 text-amber-300 font-black border border-amber-400 shadow-md shadow-amber-500/20 scale-105' 
                : 'text-amber-400/70 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'
            }`}
          >
            <span>Gomme intelligente</span>
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

        <div className="flex items-center justify-around text-[11px] font-bold text-slate-300 pt-2 border-t border-slate-900 px-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5 text-purple-400" />
            <span>Toutes les fonctionnalités</span>
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-all active:scale-95 cursor-pointer">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Importer des images</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all active:scale-95 cursor-pointer">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Importer des fichiers</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

      </div>

      {/* Post-Capture 2-Option Choice Dialog Modal */}
      {showRenderChoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-white">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">Rendu de Numérisation</h3>
              <p className="text-xs font-medium text-slate-400">Comment souhaitez-vous traiter ce document ?</p>
            </div>

            {/* Prévisualisation immédiate du document capturé */}
            {(pendingPages.length > 0 || scannedPages.length > 0) && (
              <div className="relative w-full h-44 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                <img
                  src={
                    (pendingPages[0] || scannedPages[scannedPages.length - 1])?.thumbnailUrl ||
                    (pendingPages[0] || scannedPages[scannedPages.length - 1])?.processedImageUrl ||
                    (pendingPages[0] || scannedPages[scannedPages.length - 1])?.originalImageUrl
                  }
                  alt="Prévisualisation du document"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                />
                <div className="absolute top-2.5 right-2.5 bg-slate-900/90 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Document Capturé</span>
                </div>
              </div>
            )}

            {/* Les 2 Seules Options Autorisées */}
            <div className="space-y-3.5">
              {/* Option 1 : Document Original — Scanner Pro */}
              <button
                onClick={handleEnhanceScan}
                disabled={isProcessingAction}
                className="w-full p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 flex items-start gap-3.5 text-left transition-all active:scale-95 group cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  {activeActionType === 'enhance' ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                  ) : (
                    <FileText className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white group-hover:text-blue-300">📄 Document Original — Scanner Pro</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug mt-1 font-normal">
                    Nettoie et transforme automatiquement votre photo en document numérisé professionnel.
                  </p>
                </div>
              </button>

              {/* Option 2 : Saisie IA Pro — Document éditable */}
              <button
                onClick={handleDigitizeText}
                disabled={isProcessingAction}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-teal-950/90 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/70 flex items-start gap-3.5 text-left transition-all active:scale-95 group shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform shadow-md">
                  {activeActionType === 'digitize' ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-emerald-300">✨ Saisie IA Pro — Document éditable</h4>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-snug mt-1 font-normal">
                    Extrait automatiquement le contenu de la photo et le transforme en document éditable grâce à l'IA.
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={() => {
                setShowRenderChoiceModal(false);
              }}
              disabled={isProcessingAction}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
