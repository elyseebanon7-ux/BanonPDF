import React, { useState } from 'react';
import { ArrowLeft, Download, Sparkles, PenTool, Trash2, Check, Copy, Shield, Plus, Camera } from 'lucide-react';
import type { DocumentItem, ScanPage } from '../types';
import { generatePDF, formatBytes } from '../services/pdfGenerator';
import { QuadWarpEditor } from './QuadWarpEditor';
import { FilterStudio } from './FilterStudio';
import { SignatureModal } from './SignatureModal';
import { OCRStudio } from './OCRStudio';

interface DocumentViewerProps {
  document: DocumentItem;
  onUpdateDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onBack: () => void;
  onAddPage: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: doc,
  onUpdateDocument,
  onBack,
  onAddPage,
}) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [editingWarpPage, setEditingWarpPage] = useState<ScanPage | null>(null);
  const [editingFilterPage, setEditingFilterPage] = useState<ScanPage | null>(null);
  const [editingOCRPage, setEditingOCRPage] = useState<ScanPage | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [exportWatermark, setExportWatermark] = useState(doc.watermark?.text || '');
  const [exportPassword, setExportPassword] = useState('');
  const [includeSearchableOCR, setIncludeSearchableOCR] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<number>(doc.pdfSizeEstimateBytes || 520000);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const currentPage = doc.pages[activePageIndex] || doc.pages[0];

  const handleDeletePage = (index: number) => {
    if (doc.pages.length <= 1) {
      alert('Un document doit contenir au moins une page.');
      return;
    }
    const newPages = doc.pages.filter((_, idx) => idx !== index);
    onUpdateDocument({ ...doc, pages: newPages, updatedAt: Date.now() });
    setActivePageIndex(Math.max(0, index - 1));
  };

  const handlePageSave = (updatedPage: ScanPage) => {
    const newPages = doc.pages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    onUpdateDocument({ ...doc, pages: newPages, updatedAt: Date.now() });
    setEditingWarpPage(null);
    setEditingFilterPage(null);
  };

  const handleApplySignature = (signatureDataUrl: string) => {
    onUpdateDocument({
      ...doc,
      signature: {
        imageDataUrl: signatureDataUrl,
        xPercent: 60,
        yPercent: 75,
        widthPercent: 30,
        pageIndex: activePageIndex,
      },
      updatedAt: Date.now(),
    });
  };

  const handleGeneratePDFExport = async () => {
    setIsExporting(true);
    try {
      const { sizeBytes, dataUrl } = await generatePDF(doc.pages, {
        includeOCRTextLayer: includeSearchableOCR,
        watermarkText: exportWatermark.trim() || undefined,
        watermarkOpacity: 0.25,
        signature: doc.signature,
      });

      setEstimatedSize(sizeBytes);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      a.click();
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleCopyShareLink = () => {
    const fakeLink = `https://banonpdf.cloud/share/doc_${doc.id}?exp=${Date.now() + 86400000 * 7}`;
    navigator.clipboard.writeText(fakeLink);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3 sm:p-5 space-y-4 max-w-md mx-auto">
      
      {/* Top Floating Action Header with Prominent Back Arrow Button */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 shadow-xl">
        
        {/* Prominent Back Arrow Button */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 shadow-md flex items-center justify-center transition-transform active:scale-90 shrink-0"
            title="Retour à l'accueil"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-white font-bold text-sm truncate">{doc.title}</h1>
              {doc.isEncrypted && (
                <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {doc.pages.length} p. • {formatBytes(estimatedSize)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onAddPage}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1 shadow-md"
            title="Ajouter d'autres photos de pages à ce PDF"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Page</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main Page Viewer & Options */}
      <div className="space-y-3">
        
        {/* Page Adjuster Header */}
        <div className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-300 font-semibold text-[11px]">
            Page {activePageIndex + 1} sur {doc.pages.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditingWarpPage(currentPage)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold text-[11px] flex items-center gap-1 border border-slate-700"
            >
              <Sparkles className="w-3 h-3" /> Recadrer
            </button>

            <button
              onClick={() => setEditingFilterPage(currentPage)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-[11px] flex items-center gap-1 border border-slate-700"
            >
              <Sparkles className="w-3 h-3" /> Filtres
            </button>

            <button
              onClick={() => setShowSignatureModal(true)}
              className="p-1 rounded-lg bg-slate-800 text-purple-400 hover:bg-slate-700 border border-slate-700"
              title="Signer"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDeletePage(activePageIndex)}
              className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg"
              title="Supprimer cette page"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Document Page Preview Frame */}
        <div className="relative aspect-[3/4] w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
          <img
            src={currentPage.processedImageUrl || currentPage.originalImageUrl}
            alt="Page render"
            className="max-h-full max-w-full object-contain rounded"
          />

          {doc.signature && doc.signature.pageIndex === activePageIndex && (
            <img
              src={doc.signature.imageDataUrl}
              alt="Signature stamp"
              className="absolute w-32 pointer-events-none drop-shadow-md"
              style={{
                left: `${doc.signature.xPercent}%`,
                top: `${doc.signature.yPercent}%`,
              }}
            />
          )}
        </div>

        {/* Add More Pages Prompt Banner */}
        <div
          onClick={onAddPage}
          className="bg-slate-900 border border-dashed border-emerald-500/60 p-3 rounded-2xl text-center cursor-pointer hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-extrabold">+ Prendre une autre photo (Ajouter Page {doc.pages.length + 1})</span>
        </div>

        {/* Bottom Horizontal Thumbnails Drawer */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {doc.pages.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => setActivePageIndex(idx)}
              className={`relative shrink-0 p-1 rounded-xl border cursor-pointer transition-all ${
                activePageIndex === idx
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <img src={p.thumbnailUrl} alt={`Page ${idx + 1}`} className="w-12 h-16 object-cover rounded-lg border border-slate-700" />
              <span className="absolute bottom-1 right-1 text-[9px] font-black bg-slate-950/90 px-1 rounded text-slate-200">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Sub-Modals */}
      {editingWarpPage && (
        <QuadWarpEditor page={editingWarpPage} onSave={handlePageSave} onCancel={() => setEditingWarpPage(null)} />
      )}

      {editingFilterPage && (
        <FilterStudio page={editingFilterPage} onSave={handlePageSave} onCancel={() => setEditingFilterPage(null)} />
      )}

      {editingOCRPage && (
        <OCRStudio
          page={editingOCRPage}
          onUpdateOCRText={(text) => {
            const newPages = doc.pages.map((p, idx) => (idx === activePageIndex ? { ...p, ocrText: text } : p));
            onUpdateDocument({ ...doc, pages: newPages });
          }}
          onClose={() => setEditingOCRPage(null)}
        />
      )}

      {showSignatureModal && (
        <SignatureModal onApplySignature={handleApplySignature} onClose={() => setShowSignatureModal(false)} />
      )}

      {/* PDF Export Settings Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h3 className="text-white font-bold text-lg">Paramètres d'Exportation PDF Pro</h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSearchableOCR}
                  onChange={(e) => setIncludeSearchableOCR(e.target.checked)}
                  className="accent-blue-500 w-4 h-4"
                />
                <div>
                  <span className="text-white font-bold block">Intégrer Texte Invisible OCR (Searchable PDF/A)</span>
                  <span className="text-slate-400">Permet la recherche full-text et le copier-coller dans le PDF</span>
                </div>
              </label>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Filigrane Personnalisé (Watermark)</label>
                <input
                  type="text"
                  value={exportWatermark}
                  onChange={(e) => setExportWatermark(e.target.value)}
                  placeholder="Ex: CONFIDENTIEL / BanonPDF Pro"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mot de Passe Chiffrement PDF (AES-256)</label>
                <input
                  type="password"
                  value={exportPassword}
                  onChange={(e) => setExportPassword(e.target.value)}
                  placeholder="Laisser vide pour PDF standard"
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Taille estimée du fichier:</span>
                <span className="font-bold text-emerald-400">{formatBytes(estimatedSize)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                {shareLinkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{shareLinkCopied ? 'Lien Copié !' : 'Générer Lien Temporaire'}</span>
              </button>

              <button
                onClick={handleGeneratePDFExport}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isExporting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Télécharger PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
