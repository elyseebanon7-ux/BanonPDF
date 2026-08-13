import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Download, Sparkles, ArrowRight, ShieldCheck, FileSpreadsheet, Presentation, Image as ImageIcon, Stamp, Lock, Merge, Split, QrCode } from 'lucide-react';
import type { DocumentItem } from '../types';

interface ToolActionModalProps {
  toolName: string;
  documents: DocumentItem[];
  onClose: () => void;
  onOpenScan?: () => void;
  theme?: 'light' | 'dark';
}

export const ToolActionModal: React.FC<ToolActionModalProps> = ({
  toolName,
  documents,
  onClose,
  onOpenScan,
  theme = 'light',
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const isLight = theme === 'light';

  // Get icon for selected tool
  const getToolIcon = () => {
    const name = toolName.toLowerCase();
    if (name.includes('word')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (name.includes('excel')) return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    if (name.includes('ppt')) return <Presentation className="w-8 h-8 text-orange-500" />;
    if (name.includes('image')) return <ImageIcon className="w-8 h-8 text-purple-500" />;
    if (name.includes('signature')) return <Stamp className="w-8 h-8 text-teal-500" />;
    if (name.includes('aes') || name.includes('protect')) return <Lock className="w-8 h-8 text-rose-500" />;
    if (name.includes('fusion')) return <Merge className="w-8 h-8 text-indigo-500" />;
    if (name.includes('division')) return <Split className="w-8 h-8 text-amber-500" />;
    if (name.includes('qr')) return <QrCode className="w-8 h-8 text-cyan-500" />;
    return <Sparkles className="w-8 h-8 text-emerald-500" />;
  };

  const handleStartProcess = () => {
    setIsProcessing(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setIsCompleted(true);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-lg rounded-3xl ${isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-white border-slate-800'} border p-6 shadow-2xl space-y-5 relative`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              {getToolIcon()}
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">{toolName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Traitement intelligent BanonPDF AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content State */}
        {!isCompleted ? (
          <div className="space-y-4">
            
            {/* Step 1: Select Document */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  1. Sélectionner le document source
                </label>
                {onOpenScan && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScan();
                    }}
                    className="text-xs font-extrabold text-[#00bba7] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>📷 Prendre photo en direct</span>
                  </button>
                )}
              </div>

              {documents.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedDocId === doc.id
                          ? isLight
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                            : 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {doc.pages[0]?.thumbnailUrl ? (
                          <img src={doc.pages[0].thumbnailUrl} alt={doc.title} className="w-9 h-11 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shrink-0" />
                        ) : (
                          <FileText className="w-6 h-6 text-emerald-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{doc.pages.length} page(s) • {(doc.pdfSizeEstimateBytes / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>

                      {selectedDocId === doc.id && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs text-center space-y-2">
                  <p>Aucun document scanné disponible pour le moment.</p>
                  {onOpenScan && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenScan();
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white font-extrabold rounded-xl shadow-md text-xs hover:bg-emerald-500"
                    >
                      📷 Prendre la photo en direct avec la caméra
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Processing Status & Progress Bar */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Traitement en cours avec Banon AI...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl font-bold text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Annuler
              </button>

              <button
                disabled={isProcessing || !selectedDoc}
                onClick={handleStartProcess}
                className="px-5 py-2.5 rounded-2xl bg-[#00bba7] hover:bg-[#00a392] text-white font-extrabold text-xs shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <span>Exécuter {toolName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* Completion State */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">Traitement Effectué avec Succès !</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Le document <span className="font-bold text-slate-800 dark:text-slate-200">"{selectedDoc?.title}"</span> a été traité avec l'outil {toolName}.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200"
              >
                Fermer
              </button>

              <button
                onClick={() => {
                  alert(`Téléchargement de "${selectedDoc?.title}_${toolName.replace(/\s+/g, '_')}" démarré.`);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Fichier</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
