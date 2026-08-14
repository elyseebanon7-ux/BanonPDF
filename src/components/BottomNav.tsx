import React from 'react';
import { Home, Folder, Grid, User } from 'lucide-react';

export type MainTab = 'accueil' | 'fichiers' | 'outils' | 'moi';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  theme?: 'light' | 'dark';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, theme = 'light' }) => {
  const isLight = theme === 'light';

  const tabs = [
    {
      id: 'accueil' as MainTab,
      label: 'Accueil',
      icon: Home,
      activePillLight: 'bg-[#00bba7] text-white shadow-md shadow-[#00bba7]/30 scale-105',
      activePillDark: 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105',
      activeTextLight: 'text-[#00bba7] font-black',
      activeTextDark: 'text-emerald-400 font-black',
      inactivePillLight: 'bg-[#00bba7]/15 text-[#00bba7] border border-[#00bba7]/30 group-hover:scale-105',
      inactivePillDark: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 group-hover:scale-105',
      inactiveTextLight: 'text-[#00bba7] font-bold',
      inactiveTextDark: 'text-emerald-400 font-bold',
    },
    {
      id: 'fichiers' as MainTab,
      label: 'Fichiers',
      icon: Folder,
      activePillLight: 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105',
      activePillDark: 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-105',
      activeTextLight: 'text-blue-600 font-black',
      activeTextDark: 'text-blue-400 font-black',
      inactivePillLight: 'bg-blue-500/15 text-blue-600 border border-blue-500/30 group-hover:scale-105',
      inactivePillDark: 'bg-blue-500/20 text-blue-400 border border-blue-500/40 group-hover:scale-105',
      inactiveTextLight: 'text-blue-600 font-bold',
      inactiveTextDark: 'text-blue-400 font-bold',
    },
    {
      id: 'outils' as MainTab,
      label: 'Outils',
      icon: Grid,
      activePillLight: 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105',
      activePillDark: 'bg-purple-500 text-white shadow-md shadow-purple-500/30 scale-105',
      activeTextLight: 'text-purple-600 font-black',
      activeTextDark: 'text-purple-400 font-black',
      inactivePillLight: 'bg-purple-500/15 text-purple-600 border border-purple-500/30 group-hover:scale-105',
      inactivePillDark: 'bg-purple-500/20 text-purple-400 border border-purple-500/40 group-hover:scale-105',
      inactiveTextLight: 'text-purple-600 font-bold',
      inactiveTextDark: 'text-purple-400 font-bold',
    },
    {
      id: 'moi' as MainTab,
      label: 'Moi',
      icon: User,
      activePillLight: 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105',
      activePillDark: 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105',
      activeTextLight: 'text-rose-600 font-black',
      activeTextDark: 'text-rose-400 font-black',
      inactivePillLight: 'bg-rose-500/15 text-rose-600 border border-rose-500/30 group-hover:scale-105',
      inactivePillDark: 'bg-rose-500/20 text-rose-400 border border-rose-500/40 group-hover:scale-105',
      inactiveTextLight: 'text-rose-600 font-bold',
      inactiveTextDark: 'text-rose-400 font-bold',
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${isLight ? 'bg-white/95 border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.07)]' : 'bg-slate-950/95 border-t border-slate-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.4)]'} backdrop-blur-xl transition-colors duration-200`}>
      <nav className="flex items-center justify-around pt-2.5 pb-3 px-3 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const pillClass = isActive
            ? (isLight ? tab.activePillLight : tab.activePillDark)
            : (isLight ? tab.inactivePillLight : tab.inactivePillDark);

          const textClass = isActive
            ? (isLight ? tab.activeTextLight : tab.activeTextDark)
            : (isLight ? tab.inactiveTextLight : tab.inactiveTextDark);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center px-3 group transition-transform active:scale-90 cursor-pointer"
            >
              <div className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${pillClass}`}>
                <Icon className="w-4 h-4 stroke-[2.5]" />
              </div>

              <span className={`text-[11px] tracking-tight mt-1 transition-colors duration-200 ${textClass}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
