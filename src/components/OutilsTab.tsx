import React, { useState } from 'react';
import {
  ArrowLeft, Search, Sparkles, CreditCard, FileText, UserCheck, Calculator,
  Image as ImageIcon, BookOpen, Presentation, Layout, Clock, FolderInput,
  Stamp, Lock, Merge, Split, QrCode, FileSpreadsheet, Sparkle
} from 'lucide-react';

interface OutilsTabProps {
  onSelectTool: (toolName: string) => void;
  onBackToAccueil?: () => void;
  theme?: 'light' | 'dark';
}

export const OutilsTab: React.FC<OutilsTabProps> = ({
  onSelectTool,
  onBackToAccueil,
  theme = 'light',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isLight = theme === 'light';

  const toolsCategories = [
    {
      title: 'Scanner & Capture IA',
      items: [
        { name: "Cartes d'identité", icon: CreditCard, colorLight: 'bg-teal-50 text-teal-600 border-teal-200', colorDark: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
        { name: "Extraire Tx.", icon: FileText, colorLight: 'bg-cyan-50 text-cyan-600 border-cyan-200', colorDark: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
        { name: "Photos d'identité", icon: UserCheck, colorLight: 'bg-indigo-50 text-indigo-600 border-indigo-200', colorDark: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
        { name: "Solver AI", icon: Calculator, colorLight: 'bg-emerald-50 text-emerald-600 border-emerald-200', colorDark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
        { name: "Convertir Photos", icon: ImageIcon, colorLight: 'bg-blue-50 text-blue-600 border-blue-200', colorDark: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
        { name: "Livre", icon: BookOpen, colorLight: 'bg-sky-50 text-sky-600 border-sky-200', colorDark: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
        { name: "Diapositives", icon: Presentation, colorLight: 'bg-amber-50 text-amber-600 border-amber-200', colorDark: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
        { name: "Tableau blanc", icon: Layout, colorLight: 'bg-teal-50 text-teal-600 border-teal-200', colorDark: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
        { name: "Horodatage", icon: Clock, colorLight: 'bg-purple-50 text-purple-600 border-purple-200', colorDark: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      ],
    },
    {
      title: 'Importer & Organiser',
      items: [
        { name: "Importer images", icon: ImageIcon, colorLight: 'bg-emerald-50 text-emerald-600 border-emerald-200', colorDark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
        { name: "Importer fichiers", icon: FolderInput, colorLight: 'bg-indigo-50 text-indigo-600 border-indigo-200', colorDark: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
      ],
    },
    {
      title: 'Convertir PDF',
      items: [
        { name: "Au Word", icon: FileText, colorLight: 'bg-blue-50 text-blue-600 border-blue-200', colorDark: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
        { name: "Au Excel", icon: FileSpreadsheet, colorLight: 'bg-emerald-50 text-emerald-600 border-emerald-200', colorDark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
        { name: "Au format PPT", icon: Presentation, colorLight: 'bg-orange-50 text-orange-600 border-orange-200', colorDark: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
        { name: "PDF en images", icon: ImageIcon, colorLight: 'bg-purple-50 text-purple-600 border-purple-200', colorDark: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      ],
    },
    {
      title: 'Édition & Sécurité PDF',
      items: [
        { name: "Signature", icon: Stamp, colorLight: 'bg-teal-50 text-teal-600 border-teal-200', colorDark: 'bg-teal-500/15 text-teal-400 border-teal-500/30' },
        { name: "Protection AES", icon: Lock, colorLight: 'bg-rose-50 text-rose-600 border-rose-200', colorDark: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
        { name: "Fusion PDF", icon: Merge, colorLight: 'bg-indigo-50 text-indigo-600 border-indigo-200', colorDark: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
        { name: "Division PDF", icon: Split, colorLight: 'bg-amber-50 text-amber-600 border-amber-200', colorDark: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
        { name: "Scanner QR", icon: QrCode, colorLight: 'bg-cyan-50 text-cyan-600 border-cyan-200', colorDark: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'app-expert-bg geo-grid-pattern text-white'} pb-32 w-full relative select-none transition-colors duration-300`}>
      
      {/* Translucent Ribbon Waves in Dark Mode */}
      {!isLight && (
        <>
          <div className="ambient-wave-top" />
          <div className="ambient-wave-bottom" />
        </>
      )}

      {/* Header Bar */}
      <div className={`sticky top-0 z-30 ${isLight ? 'bg-white/95 border-b border-slate-200 shadow-xs text-slate-900' : 'bg-[#091b30]/85 border-b border-cyan-500/20 text-white'} backdrop-blur-xl px-4 md:px-8 py-3.5 flex items-center justify-between shadow-md`}>
        <div className="max-w-md md:max-w-4xl lg:max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToAccueil}
              className={`p-2 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-emerald-600' : 'bg-[#0c243f]/80 border-cyan-500/30 text-cyan-400 hover:text-white'} border shadow-xs transition-all active:scale-90 flex items-center justify-center`}
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className={`text-lg md:text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Catalogue des Outils PDF & IA
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTool('Solver AI')}
              className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Nouveauté IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Responsive Layout */}
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 md:px-8 pt-4 space-y-6 relative z-10">
        
        {/* Banner BANON AI */}
        <div
          onClick={() => onSelectTool('Solver AI')}
          className={`relative overflow-hidden rounded-3xl ${isLight ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-lg' : 'bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-cyan-500/30 text-white shadow-2xl'} p-5 cursor-pointer group hover:opacity-95 transition-all`}
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-wider text-white">BANON AI ✨</span>
                <Sparkle className="w-5 h-5 text-amber-300 animate-pulse fill-amber-300" />
              </div>
              <p className="text-xs text-white/90 mt-1 max-w-md">
                Assistant multimodal : Résolution d'équations, extraction OCR multilingue et retouche photo par IA.
              </p>
            </div>

            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0 ml-3">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Search Bar for Tools */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un outil (Word, Excel, Signature, OCR...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-emerald-500' : 'bg-slate-900/90 border-slate-800 text-white focus:border-cyan-400'} border outline-none shadow-xs transition-all`}
          />
        </div>

        {/* Categories Grid */}
        {toolsCategories.map((cat, idx) => {
          const filteredItems = cat.items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-3">
              <h3 className={`font-extrabold text-xs md:text-sm uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'} px-1`}>
                {cat.title}
              </h3>

              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filteredItems.map((item, itemIdx) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={itemIdx}
                      onClick={() => onSelectTool(item.name)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl ${isLight ? 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md' : 'bg-slate-900/80 border-slate-800/80 hover:border-cyan-500/40'} border transition-all active:scale-90 hover:-translate-y-0.5 cursor-pointer group`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl ${isLight ? item.colorLight : item.colorDark} border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110`}
                      >
                        <Icon className="w-5.5 h-5.5 stroke-[2.2]" />
                      </div>
                      <span className={`text-[11px] font-extrabold ${isLight ? 'text-slate-800' : 'text-slate-200'} text-center leading-tight mt-2 transition-colors group-hover:text-emerald-600 dark:group-hover:text-cyan-400 break-words w-full px-0.5`}>
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
