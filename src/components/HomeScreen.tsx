import React, { useState } from 'react';
import {
  Search, RefreshCw, Crown, Camera, FileText, Image as ImageIcon,
  FolderInput, CreditCard, Type, Sparkles, Grid, Share2, FileType,
  Eye, CheckSquare, Square, ChevronRight, Trash2, CheckCircle2, MoreVertical,
  Sun, Moon, ShieldCheck, Zap
} from 'lucide-react';
import type { DocumentItem, CloudSyncStatus } from '../types';
import { formatBytes } from '../services/pdfGenerator';

import { getQuotaStatus } from '../services/costGuardService';

interface HomeScreenProps {
  documents: DocumentItem[];
  syncStatus: CloudSyncStatus;
  onOpenScan: (preset?: string) => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onOpenPricing: () => void;
  onNavigateTab: (tab: 'fichiers' | 'outils' | 'moi') => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (id: string) => void;
  onOpenSolverAi?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  documents,
  syncStatus,
  onOpenScan,
  onOpenDocument,
  onOpenPricing,
  onNavigateTab,
  onFileUpload,
  onDeleteDocument,
  onOpenSolverAi,
  theme = 'light',
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents[0]?.id || null);
  const [selectedMultiDocs, setSelectedMultiDocs] = useState<Set<string>>(new Set());

  const isLight = theme === 'light';

  // Filter documents by search
  const activeDocs = documents.filter((d) => !d.isDeleted);
  const filteredDocs = activeDocs.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.pages.some((p) => p.ocrText?.toLowerCase().includes(q));
  });

  const featuredDoc = activeDocs.find((d) => d.id === selectedDocId) || activeDocs[0];

  const handleToggleSelectDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMultiDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected = filteredDocs.length > 0 && selectedMultiDocs.size === filteredDocs.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedMultiDocs(new Set());
    } else {
      setSelectedMultiDocs(new Set(filteredDocs.map((d) => d.id)));
    }
  };

  const handleBatchDelete = () => {
    if (selectedMultiDocs.size === 0) return;
    if (confirm(`Voulez-vous supprimer les ${selectedMultiDocs.size} document(s) sélectionné(s) ?`)) {
      selectedMultiDocs.forEach((id) => onDeleteDocument(id));
      setSelectedMultiDocs(new Set());
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'app-expert-bg geo-grid-pattern text-white'} pb-36 w-full relative select-none transition-colors duration-300`}>
      
      {/* Translucent Ambient Waves in Dark Mode */}
      {!isLight && (
        <>
          <div className="ambient-wave-top" />
          <div className="ambient-wave-bottom" />
        </>
      )}

      {/* 1.1 Responsive Glassmorphic Top Bar */}
      <div className={`sticky top-0 z-30 ${isLight ? 'bg-white/95 border-b border-slate-200/80 shadow-sm text-slate-800' : 'bg-[#091b30]/85 border-b border-cyan-500/20 text-white'} backdrop-blur-xl px-4 md:px-8 py-3.5 flex items-center justify-between gap-3 shadow-md`}>
        <div className="max-w-md md:max-w-5xl lg:max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
          {/* Sleek Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-cyan-300/70'} absolute left-3.5 top-1/2 -translate-y-1/2`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherche (titre, contenu OCR...)"
              className={`w-full ${isLight ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white' : 'bg-[#0c243f]/80 border-cyan-500/30 text-white placeholder-cyan-200/50 focus:border-cyan-400'} border rounded-2xl pl-10 pr-4 py-2 text-xs transition-all shadow-inner focus:outline-none`}
            />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-emerald-600' : 'bg-[#0c243f]/80 border-cyan-500/30 text-amber-300 hover:text-amber-200'} border transition-all active:scale-90`}
              title={isLight ? "Passer au thème sombre Néon" : "Passer au thème clair CamScanner"}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 fill-amber-300/20" />}
            </button>

            {/* Sync Status Button */}
            <button
              onClick={() => {}}
              className={`p-2 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#0c243f]/80 border-cyan-500/30 text-cyan-200'} border transition-colors`}
              title="Statut de synchronisation Cloud"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin text-emerald-500' : isLight ? 'text-blue-500' : 'text-cyan-200'}`} />
            </button>

            {/* Cost Guard Quota Badge */}
            <button
              onClick={() => onNavigateTab('moi')}
              className={`px-2.5 py-1.5 rounded-2xl ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'} border font-mono font-black text-xs flex items-center gap-1 transition-all active:scale-95`}
              title="Crédits IA Cost Guard restants ce mois"
            >
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-500" />
              <span>{getQuotaStatus().remainingAiCredits}/{getQuotaStatus().totalAiCredits} IA</span>
            </button>

            {/* Premium Button */}
            <button
              onClick={onOpenPricing}
              className="px-3.5 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="hidden sm:inline">Premium</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1.2 Modern Quick Actions Grid (8 Compact Tiles: 2 Rows of 4 on Mobile, 1 Row of 8 on Desktop) */}
      <div className="max-w-md md:max-w-5xl lg:max-w-6xl mx-auto px-4 md:px-8 py-4 relative z-10">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3.5">
          
          {/* 1. Smart Scan */}
          <button
            onClick={() => onOpenScan('standard')}
            className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(16,185,129,0.08)] hover:border-emerald-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-emerald-500/30 shadow-[0_2px_12px_rgba(16,185,129,0.12)] hover:border-emerald-400 text-white'} border group aspect-square`}
          >
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Scan</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Scanner</span>
          </button>

          {/* 2. PDF Tools */}
          <button
            onClick={() => onNavigateTab('outils')}
            className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(244,63,94,0.08)] hover:border-rose-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-rose-500/30 shadow-[0_2px_12px_rgba(244,63,94,0.12)] hover:border-rose-400 text-white'} border group aspect-square`}
          >
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <FileText className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Outils PDF</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Convertir</span>
          </button>

          {/* 3. Import Images */}
          <label className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(59,130,246,0.08)] hover:border-blue-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-blue-500/30 shadow-[0_2px_12px_rgba(59,130,246,0.12)] hover:border-blue-400 text-white'} border group cursor-pointer aspect-square`}>
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <ImageIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Images</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Importer</span>
            <input type="file" accept="image/*" onChange={onFileUpload} className="hidden" />
          </label>

          {/* 4. Import Files */}
          <label className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(99,102,241,0.08)] hover:border-indigo-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-indigo-500/30 shadow-[0_2px_12px_rgba(99,102,241,0.12)] hover:border-indigo-400 text-white'} border group cursor-pointer aspect-square`}>
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <FolderInput className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Fichiers</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Importer</span>
            <input type="file" accept=".pdf,.doc,.docx" onChange={onFileUpload} className="hidden" />
          </label>

          {/* 5. ID Cards */}
          <button
            onClick={() => onOpenScan('id_card')}
            className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(20,184,166,0.08)] hover:border-teal-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-teal-500/30 shadow-[0_2px_12px_rgba(20,184,166,0.12)] hover:border-teal-400 text-white'} border group aspect-square`}
          >
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-teal-500/20 text-teal-400 border-teal-500/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">ID Cards</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Cartes ID</span>
          </button>

          {/* 6. Extract Text */}
          <button
            onClick={() => onNavigateTab('outils')}
            className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(6,182,212,0.08)] hover:border-cyan-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-cyan-500/30 shadow-[0_2px_12px_rgba(6,182,212,0.12)] hover:border-cyan-400 text-white'} border group aspect-square`}
          >
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-cyan-50 text-cyan-600 border-cyan-200' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <Type className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Extraire Tx.</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>OCR</span>
          </button>

          {/* 7. Solver AI */}
          <button
            onClick={() => onOpenSolverAi ? onOpenSolverAi() : alert("Solver AI Chatbot prêt.")}
            className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-purple-200 shadow-[0_2px_10px_rgba(168,85,247,0.08)] hover:border-purple-500 hover:shadow-md text-slate-800' : 'bg-slate-900/80 border-purple-500/30 shadow-[0_2px_12px_rgba(168,85,247,0.12)] hover:border-purple-400 text-white'} border group aspect-square`}
          >
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-gradient-to-tr from-purple-600/30 to-pink-600/30 text-purple-300 border-purple-400/40'} border flex items-center justify-center shadow-sm mb-1`}>
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Solver AI</span>
            <span className={`text-[8.5px] ${isLight ? 'text-purple-600 font-semibold' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Assistant</span>
          </button>

          {/* 8. All */}
          <button
            onClick={() => onNavigateTab('outils')}
            className={`action-tile flex flex-col items-center justify-center p-2.5 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-sm hover:border-slate-400 text-slate-800' : 'bg-slate-900/80 border-slate-700/70 shadow-sm hover:border-slate-500 text-white'} border group aspect-square`}
          >
            <div className={`action-tile-icon w-8 h-8 rounded-xl ${isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/80 text-slate-300 border-slate-700'} border flex items-center justify-center shadow-sm mb-1`}>
              <Grid className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-center leading-tight truncate w-full">Tout</span>
            <span className={`text-[8.5px] ${isLight ? 'text-slate-500' : 'text-slate-400'} text-center leading-none truncate w-full mt-0.5`}>Options</span>
          </button>

        </div>
      </div>

      {/* 1.3 Main Responsive Content Section (Split on Desktop) */}
      <div className="max-w-md md:max-w-5xl lg:max-w-6xl mx-auto px-4 md:px-8 pt-2 relative z-10">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          
          {/* Main Documents Column (2 cols on Desktop) */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h3 className={`font-extrabold text-base md:text-lg ${isLight ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                Récents
              </h3>

              {/* Selection Actions Toolbar */}
              {selectedMultiDocs.size > 0 ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAllToggle}
                    className={`text-xs ${isLight ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'} hover:underline font-extrabold flex items-center gap-1 px-3 py-1 rounded-xl border`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAllSelected ? 'Désélectionner tout' : 'Tout Sélectionner'}</span>
                  </button>

                  <button
                    onClick={handleBatchDelete}
                    className="text-xs text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 hover:underline font-extrabold flex items-center gap-1 px-3 py-1 rounded-xl border"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer ({selectedMultiDocs.size})</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigateTab('fichiers')}
                  className={`text-xs ${isLight ? 'text-emerald-600 hover:text-emerald-700' : 'text-cyan-400'} font-bold flex items-center gap-0.5 transition-colors`}
                >
                  <span>Tout afficher</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Featured Document Item (Large Card) */}
            {featuredDoc && (
              <div
                onClick={() => onOpenDocument(featuredDoc)}
                className={`${isLight ? 'bg-white border-slate-200/90 shadow-md hover:border-emerald-500/80' : 'bg-slate-900/80 border-slate-800 shadow-2xl hover:border-cyan-500/40'} backdrop-blur-xl rounded-3xl border p-4 space-y-3 cursor-pointer transition-all relative`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-28 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'} rounded-2xl overflow-hidden border shrink-0 shadow-sm relative group`}>
                    <img
                      src={featuredDoc.pages[0]?.thumbnailUrl}
                      alt={featuredDoc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full ${isLight ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} border`}>
                        DERNIER DOCUMENT
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert("Options du document");
                        }}
                        className={`${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'} p-1`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className={`font-extrabold text-sm md:text-base ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                      {featuredDoc.title}
                    </h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(featuredDoc.updatedAt).toLocaleDateString()} • {featuredDoc.pages.length} page(s)
                    </p>
                    <div className={`flex items-center gap-1.5 text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} font-mono pt-0.5`}>
                      <span>~ {formatBytes(featuredDoc.pdfSizeEstimateBytes || 420000)}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'} border`}>
                        PDF
                      </span>
                    </div>
                  </div>

                  {/* Selection Checkbox */}
                  <button
                    onClick={(e) => handleToggleSelectDoc(featuredDoc.id, e)}
                    className="p-2 text-slate-400 hover:text-emerald-600 self-start"
                  >
                    {selectedMultiDocs.has(featuredDoc.id) ? (
                      <CheckSquare className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-cyan-400'}`} />
                    ) : (
                      <Square className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Quick Action 3-Button Bar */}
                <div className={`grid grid-cols-3 gap-2 pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => alert(`Lien de partage généré pour ${featuredDoc.title}`)}
                    className={`py-2 ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80'} rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Partager</span>
                  </button>

                  <button
                    onClick={() => onOpenDocument(featuredDoc)}
                    className={`py-2 ${isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/80'} rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors`}
                  >
                    <FileType className="w-3.5 h-3.5 text-amber-500" />
                    <span>Au format...</span>
                  </button>

                  <button
                    onClick={() => onOpenDocument(featuredDoc)}
                    className={`py-2 ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950'} rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all`}
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Voir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Vertical List of Recent Documents */}
            <div className="space-y-2.5 pt-1">
              {filteredDocs.slice(1).map((doc) => {
                const isChecked = selectedMultiDocs.has(doc.id);

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      onOpenDocument(doc);
                    }}
                    className={`border p-3.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? isLight
                          ? 'bg-emerald-50/80 border-emerald-400'
                          : 'bg-cyan-500/10 border-cyan-500/60'
                        : isLight
                        ? 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={doc.pages[0]?.thumbnailUrl}
                        alt={doc.title}
                        className={`w-12 h-12 object-cover rounded-xl border ${isLight ? 'border-slate-200' : 'border-slate-700'} shrink-0 shadow-xs`}
                      />
                      <div className="min-w-0">
                        <h4 className={`font-bold text-xs md:text-sm ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                          {doc.title}
                        </h4>
                        <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5 flex items-center gap-2`}>
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-400" />
                            {doc.pages.length} page(s)
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleSelectDoc(doc.id, e)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600"
                    >
                      {isChecked ? (
                        <CheckSquare className={`w-5 h-5 ${isLight ? 'text-emerald-600' : 'text-cyan-400'}`} />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Sidebar Widget (Only visible on MD/LG screens) */}
          <div className="hidden md:block md:col-span-1 space-y-4">
            
            {/* 1. Solver AI Quick Assistant Card */}
            <div className={`${isLight ? 'bg-white border-purple-200 shadow-sm' : 'bg-slate-900/90 border-purple-500/30'} border rounded-3xl p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Solver AI Assistant</h4>
                    <p className="text-[10px] text-purple-600 font-semibold">Intelligence Documentaire</p>
                  </div>
                </div>
              </div>

              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                Posez vos questions mathématiques, résumez vos documents ou générez une synthèse en 1-clic.
              </p>

              <button
                onClick={() => onOpenSolverAi ? onOpenSolverAi() : alert("Solver AI prêt")}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ouvrir l'assistant IA</span>
              </button>
            </div>

            {/* 2. Cloud Storage & Security Status */}
            <div className={`${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'} border rounded-3xl p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <h4 className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-1.5`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Stockage Cloud Chiffré</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">AES-256</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Espace utilisé</span>
                  <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>1.2 Mo / 50 Go</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-emerald-500 w-[5%] rounded-full" />
                </div>
              </div>

              <div className={`p-2.5 rounded-2xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border flex items-center justify-between text-xs`}>
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>Sauvegarde auto</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-500" /> Actif
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Floating Multi-Selection Action Deck */}
      {selectedMultiDocs.size > 0 && (
        <div className={`fixed bottom-24 left-4 right-4 md:left-auto md:right-12 md:w-[420px] z-50 ${isLight ? 'bg-white border-emerald-500/40 text-slate-900 shadow-2xl' : 'bg-slate-900/95 border-cyan-500/50 text-white shadow-2xl'} border backdrop-blur-md p-3.5 rounded-3xl flex items-center justify-between gap-2.5 animate-slide-up`}>
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full ${isLight ? 'bg-emerald-600 text-white' : 'bg-cyan-500 text-slate-950'} font-black text-xs flex items-center justify-center shrink-0`}>
              {selectedMultiDocs.size}
            </span>
            <span className="text-xs font-extrabold truncate">
              {selectedMultiDocs.size} doc(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Action 1: Tout Sélectionner / Désélectionner */}
            <button
              onClick={handleSelectAllToggle}
              className={`px-3 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isAllSelected
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isAllSelected ? 'Désélectionner' : 'Tout Sélectionner'}</span>
            </button>

            {/* Action 2: Supprimer (N) */}
            <button
              onClick={handleBatchDelete}
              className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer ({selectedMultiDocs.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* 1.4 Floating Camera Action Button (FAB) - Matching CamScanner Teal Button in Photo 2 */}
      <button
        onClick={() => onOpenScan('standard')}
        className={`fixed bottom-24 md:bottom-12 right-5 md:right-12 lg:right-24 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full ${isLight ? 'bg-[#00bba7] hover:bg-[#00a392] text-white shadow-[0_8px_25px_rgba(0,187,167,0.4)]' : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/40'} flex items-center justify-center border-2 border-white dark:border-slate-900 transition-all active:scale-90 hover:scale-105 cursor-pointer`}
        title="Scanner un nouveau document"
      >
        <Camera className="w-7 h-7 stroke-[2.5]" />
      </button>

    </div>
  );
};
