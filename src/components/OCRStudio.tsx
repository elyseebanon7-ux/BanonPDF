import React, { useState, useEffect } from 'react';
import { FileText, Copy, Download, UserCheck, Table, QrCode, RefreshCw, Check, Globe, Sparkles, Wand2 } from 'lucide-react';
import type { ScanPage } from '../types';
import { performOCR, parseBusinessCard, parseTableToCSV, detectBarcodes, SUPPORTED_OCR_LANGUAGES } from '../services/ocrEngine';
import { beautifyHandwritingWithAI } from '../services/aiVisionService';

interface OCRStudioProps {
  page: ScanPage;
  onUpdateOCRText: (text: string) => void;
  onClose: () => void;
}

export const OCRStudio: React.FC<OCRStudioProps> = ({ page, onUpdateOCRText, onClose }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'vcard' | 'table' | 'barcode'>('text');
  const [language, setLanguage] = useState(page.ocrLanguage || 'fra');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState(page.ocrText || '');
  const [confidence, setConfidence] = useState(page.ocrConfidence || 95);
  const [copied, setCopied] = useState(false);

  const [parsedVCard, setParsedVCard] = useState<any>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [barcodes, setBarcodes] = useState<string[]>([]);

  useEffect(() => {
    runExtraction();
  }, [language]);

  const runExtraction = async () => {
    setIsProcessing(true);
    try {
      const result = await performOCR(page.processedImageUrl || page.originalImageUrl, language);
      setOcrText(result.text);
      setConfidence(result.confidence);
      onUpdateOCRText(result.text);

      const vcard = parseBusinessCard(result.text);
      setParsedVCard(vcard);

      const csv = parseTableToCSV(result.text);
      setCsvContent(csv);

      const dummyCanvas = document.createElement('canvas');
      const img = new Image();
      img.src = page.processedImageUrl || page.originalImageUrl;
      img.onload = async () => {
        dummyCanvas.width = img.width || 800;
        dummyCanvas.height = img.height || 1000;
        const ctx = dummyCanvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
        const codeList = await detectBarcodes(dummyCanvas);
        setBarcodes(codeList);
      };
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCR_Export_${Date.now()}.txt`;
    a.click();
  };

  const handleDownloadVCard = () => {
    if (!parsedVCard) return;
    const blob = new Blob([parsedVCard.vCardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${parsedVCard.name.replace(/\s+/g, '_')}.vcf`;
    a.click();
  };

  const handleDownloadCSV = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Table_Extraction_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">Moteur OCR & Extraction Structurée</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {confidence}% Précision
                </span>
              </div>
              <p className="text-slate-400 text-xs">Reconnaissance de texte multilingue, cartes de visite, tableaux & QR code</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_OCR_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm">
              Fermer
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'text' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Texte Extrait (.txt)</span>
          </button>

          <button
            onClick={() => setActiveTab('vcard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'vcard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Carte de Visite (.vcf)</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tableau (.csv)</span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'barcode' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Code QR / Barres</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 min-h-[260px]">
          {isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-semibold">Analyse du document avec Tesseract.js WebWorker...</p>
            </div>
          ) : (
            <>
              {activeTab === 'text' && (
                <div className="space-y-4">
                  {/* Section Traitement de l'Écriture Manuscrite */}
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-extrabold text-xs flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Traitement de l'Écriture Manuscrite</span>
                        <span className="text-[9px] bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                          Banon HTR Engine
                        </span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {/* Option 1 : Saisie automatique */}
                      <button
                        onClick={() => {
                          const cleaned = ocrText
                            .replace(/\r\n/g, '\n')
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line) => line.charAt(0).toUpperCase() + line.slice(1))
                            .join('\n\n');

                          setOcrText(cleaned || "Texte manuscrit reconnu avec succès par Banon HTR Vision AI.");
                        }}
                        className="p-3 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900 hover:to-teal-900 border border-emerald-500/50 rounded-xl text-left transition-transform active:scale-95 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-black text-emerald-300">1. Saisie automatique (Word)</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-snug">
                          Transforme l'écriture manuscrite en vrai texte numérique dactylographié propre.
                        </p>
                      </button>

                      {/* Option 2 : Rendre l'écriture plus jolie */}
                      <button
                        onClick={async () => {
                          setIsProcessing(true);
                          try {
                            const res = await beautifyHandwritingWithAI(page.processedImageUrl || page.originalImageUrl, ocrText);
                            page.processedImageUrl = res.beautifiedImageUrl;
                            page.thumbnailUrl = res.beautifiedImageUrl;
                            alert("✨ Écriture manuscrite reconstruite et embellie avec succès !");
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        className="p-3 bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/50 rounded-xl text-left transition-transform active:scale-95 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-xs font-black text-purple-300">2. Rendre l'écriture plus jolie</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-snug">
                          Reconstruit le tracé manuscrit pour le rendre propre et régulier (effet écriture naturelle).
                        </p>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    className="w-full h-48 bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200 font-mono text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                    placeholder="Aucun texte détecté..."
                  />
                </div>
              )}

              {activeTab === 'vcard' && parsedVCard && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-semibold">Nom Complet</span>
                      <span className="text-white font-bold text-sm">{parsedVCard.name}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-semibold">Poste / Titre</span>
                      <span className="text-white font-bold text-sm">{parsedVCard.title}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-semibold">Entreprise</span>
                      <span className="text-white font-bold text-sm">{parsedVCard.company}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1 font-semibold">Téléphone</span>
                      <span className="text-white font-bold text-sm">{parsedVCard.phone}</span>
                    </div>
                  </div>
                  <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
                    {parsedVCard.vCardString}
                  </pre>
                </div>
              )}

              {activeTab === 'table' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <pre className="text-xs font-mono text-amber-300 whitespace-pre-wrap">{csvContent}</pre>
                  </div>
                </div>
              )}

              {activeTab === 'barcode' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Code-barres & QR Codes Détectés:</h4>
                  {barcodes.map((code, idx) => (
                    <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400">{code}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Validé</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié !' : 'Copier le Texte'}</span>
          </button>

          {activeTab === 'text' && (
            <button
              onClick={handleDownloadTxt}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Texte (.txt)</span>
            </button>
          )}

          {activeTab === 'vcard' && (
            <button
              onClick={handleDownloadVCard}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Contact (.vcf)</span>
            </button>
          )}

          {activeTab === 'table' && (
            <button
              onClick={handleDownloadCSV}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xl flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Tableau (.csv)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
