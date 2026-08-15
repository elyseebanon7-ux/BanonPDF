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
      activePillLight: 'bg-[#00bba7] text-white shadow-md shadow-[#00bba7]/40 scale-105 border border-[#00bba7]',
      activePillDark: 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40 scale-105 border border-emerald-400',
      activeTextLight: 'text-[#00bba7] font-black',
      activeTextDark: 'text-emerald-400 font-black',
      inactivePillLight: 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 group-hover:scale-105',
      inactivePillDark: 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/50 group-hover:scale-105',
      inactiveTextLight: 'text-emerald-700 font-extrabold',
      inactiveTextDark: 'text-emerald-400 font-extrabold',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'fichiers' as MainTab,
      label: 'Fichiers',
      icon: Folder,
      activePillLight: 'bg-blue-600 text-white shadow-md shadow-blue-600/40 scale-105 border border-blue-500',
      activePillDark: 'bg-blue-500 text-white shadow-md shadow-blue-500/40 scale-105 border border-blue-400',
      activeTextLight: 'text-blue-600 font-black',
      activeTextDark: 'text-blue-400 font-black',
      inactivePillLight: 'bg-blue-500/20 text-blue-600 border border-blue-500/40 group-hover:scale-105',
      inactivePillDark: 'bg-blue-500/25 text-blue-400 border border-blue-500/50 group-hover:scale-105',
      inactiveTextLight: 'text-blue-700 font-extrabold',
      inactiveTextDark: 'text-blue-400 font-extrabold',
      iconColor: 'text-blue-500',
    },
    {
      id: 'outils' as MainTab,
      label: 'Outils',
      icon: Grid,
      activePillLight: 'bg-purple-600 text-white shadow-md shadow-purple-600/40 scale-105 border border-purple-500',
      activePillDark: 'bg-purple-500 text-white shadow-md shadow-purple-500/40 scale-105 border border-purple-400',
      activeTextLight: 'text-purple-600 font-black',
      activeTextDark: 'text-purple-400 font-black',
      inactivePillLight: 'bg-purple-500/20 text-purple-600 border border-purple-500/40 group-hover:scale-105',
      inactivePillDark: 'bg-purple-500/25 text-purple-400 border border-purple-500/50 group-hover:scale-105',
      inactiveTextLight: 'text-purple-700 font-extrabold',
      inactiveTextDark: 'text-purple-400 font-extrabold',
      iconColor: 'text-purple-500',
    },
    {
      id: 'moi' as MainTab,
      label: 'Moi',
      icon: User,
      activePillLight: 'bg-rose-600 text-white shadow-md shadow-rose-600/40 scale-105 border border-rose-500',
      activePillDark: 'bg-rose-500 text-white shadow-md shadow-rose-500/40 scale-105 border border-rose-400',
      activeTextLight: 'text-rose-600 font-black',
      activeTextDark: 'text-rose-400 font-black',
      inactivePillLight: 'bg-rose-500/20 text-rose-600 border border-rose-500/40 group-hover:scale-105',
      inactivePillDark: 'bg-rose-500/25 text-rose-400 border border-rose-500/50 group-hover:scale-105',
      inactiveTextLight: 'text-rose-700 font-extrabold',
      inactiveTextDark: 'text-rose-400 font-extrabold',
      iconColor: 'text-rose-500',
    },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${isLight ? 'bg-white/95 border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]' : 'bg-slate-950/95 border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.5)]'} backdrop-blur-xl transition-colors duration-200`}>
      <nav className="flex items-center justify-around pt-2.5 pb-3.5 px-3 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
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
              <div className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${pillClass}`}>
                <Icon className={`w-4 h-4 stroke-[2.5] ${isActive ? 'text-white dark:text-slate-950' : tab.iconColor}`} />
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
