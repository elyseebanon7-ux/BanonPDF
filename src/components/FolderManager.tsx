import React, { useState } from 'react';
import { Folder, Search, Star, Plus, Grid, List, ArrowLeft, Trash2, RotateCcw } from 'lucide-react';
import type { DocumentItem, FolderItem } from '../types';

interface FolderManagerProps {
  documents: DocumentItem[];
  folders: FolderItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onCreateFolder: (name: string, color: string) => void;
  onToggleFavorite: (id: string) => void;
  onMoveToTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onBackToAccueil?: () => void;
}

export const FolderManager: React.FC<FolderManagerProps> = ({
  documents,
  folders,
  onSelectDocument,
  onCreateFolder,
  onToggleFavorite,
  onMoveToTrash,
  onRestoreFromTrash,
  onBackToAccueil,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'trash'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');

  const filteredDocs = documents.filter((doc) => {
    if (activeFilter === 'trash') return doc.isDeleted;
    if (doc.isDeleted) return false;
    if (activeFilter === 'favorites' && !doc.isFavorite) return false;
    if (selectedFolderId && doc.folderId !== selectedFolderId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = doc.title.toLowerCase().includes(q);
      const ocrMatch = doc.pages.some((p) => p.ocrText?.toLowerCase().includes(q));
      const tagMatch = doc.tags.some((t) => t.toLowerCase().includes(q));
      return titleMatch || ocrMatch || tagMatch;
    }

    return true;
  });

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="min-h-screen app-expert-bg geo-grid-pattern text-white p-4 pb-24 max-w-md mx-auto space-y-5 select-none relative overflow-x-hidden">
      
      {/* Translucent Glowing Ambient Ribbon Waves */}
      <div className="ambient-wave-top" />
      <div className="ambient-wave-bottom" />
      
      {/* Header Bar with Universal Back Button */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          {selectedFolderId || activeFilter !== 'all' ? (
            <button
              onClick={() => {
                setSelectedFolderId(null);
                setActiveFilter('all');
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:bg-slate-800 shadow-md transition-transform active:scale-90"
              title="Retour aux dossiers"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={onBackToAccueil}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white hover:border-cyan-400 shadow-md transition-all active:scale-90 flex items-center justify-center"
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          <div>
            <h2 className="text-lg font-extrabold text-white">
              {selectedFolder ? selectedFolder.name : activeFilter === 'favorites' ? 'Favoris' : activeFilter === 'trash' ? 'Corbeille' : 'Mes Fichiers'}
            </h2>
            <p className="text-slate-400 text-xs">{filteredDocs.length} document(s)</p>
          </div>
        </div>

        <button
          onClick={() => setShowNewFolderModal(true)}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Dossier</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Recherche dans dossiers & OCR..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => {
              setActiveFilter('all');
              setSelectedFolderId(null);
            }}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeFilter === 'all' && !selectedFolderId ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous
          </button>

          <button
            onClick={() => setActiveFilter('favorites')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeFilter === 'favorites' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Favoris
          </button>

          <button
            onClick={() => setActiveFilter('trash')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              activeFilter === 'trash' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Corbeille
          </button>
        </div>

        <button
          onClick={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
          className="p-1.5 bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800"
        >
          {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
        </button>
      </div>

      {/* Folder Pills Bar */}
      {folders.length > 0 && activeFilter === 'all' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(selectedFolderId === f.id ? null : f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
                selectedFolderId === f.id ? 'bg-blue-600 text-white border-blue-400 shadow-md' : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Documents List / Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg space-y-2"
          >
            <div className="relative aspect-[3/4] w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <img src={doc.pages[0]?.thumbnailUrl} alt={doc.title} className="w-full h-full object-cover" />
              
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {activeFilter === 'trash' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestoreFromTrash(doc.id);
                    }}
                    className="p-1.5 bg-slate-950/80 rounded-full text-emerald-400 hover:bg-slate-900 shadow-md"
                    title="Restaurer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(doc.id);
                      }}
                      className="p-1.5 bg-slate-950/80 rounded-full text-slate-300 hover:text-amber-400 shadow-md"
                    >
                      <Star className={`w-3.5 h-3.5 ${doc.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToTrash(doc.id);
                      }}
                      className="p-1.5 bg-slate-950/80 rounded-full text-slate-400 hover:text-rose-400 shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-white truncate">{doc.title}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {new Date(doc.updatedAt).toLocaleDateString()} • {doc.pages.length} p.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolderSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-xs w-full space-y-4 shadow-2xl">
            <h3 className="text-white font-bold text-sm">Nouveau Dossier</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nom du dossier..."
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Couleur:</span>
              <div className="flex items-center gap-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewFolderColor(c)}
                    className={`w-5 h-5 rounded-full ${newFolderColor === c ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
              >
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
