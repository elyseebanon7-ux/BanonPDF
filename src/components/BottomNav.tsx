import React from 'react';
import { Home, Folder, Grid, User } from 'lucide-react';

export type MainTab = 'accueil' | 'fichiers' | 'outils' | 'moi';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  theme?: 'light' | 'dark';
}

interface TabConfig {
  id: MainTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  activeColorLight: string;
  activeColorDark: string;
  pillBgLight: string;
  pillBgDark: string;
  iconColorLight: string;
  iconColorDark: string;
  badgeBgLight: string;
  badgeBgDark: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, theme = 'light' }) => {
  const tabs: TabConfig[] = [
    {
      id: 'accueil',
      label: 'Accueil',
      icon: Home,
      activeColorLight: 'text-[#00bba7]',
      activeColorDark: 'text-emerald-400',
      pillBgLight: 'bg-[#00bba7]/12 border-[#00bba7]/30 shadow-emerald-500/10',
      pillBgDark: 'bg-emerald-500/20 border-emerald-500/40 shadow-emerald-500/20',
      iconColorLight: 'text-[#00bba7]',
      iconColorDark: 'text-emerald-400',
      badgeBgLight: 'bg-teal-50 text-teal-600 border border-teal-200/80',
      badgeBgDark: 'bg-teal-950/60 text-teal-300 border border-teal-800/60',
    },
    {
      id: 'fichiers',
      label: 'Fichiers',
      icon: Folder,
      activeColorLight: 'text-blue-600',
      activeColorDark: 'text-blue-400',
      pillBgLight: 'bg-blue-500/12 border-blue-500/30 shadow-blue-500/10',
      pillBgDark: 'bg-blue-500/20 border-blue-500/40 shadow-blue-500/20',
      iconColorLight: 'text-blue-600',
      iconColorDark: 'text-blue-400',
      badgeBgLight: 'bg-blue-50 text-blue-600 border border-blue-200/80',
      badgeBgDark: 'bg-blue-950/60 text-blue-300 border border-blue-800/60',
    },
    {
      id: 'outils',
      label: 'Outils',
      icon: Grid,
      activeColorLight: 'text-purple-600',
      activeColorDark: 'text-purple-400',
      pillBgLight: 'bg-purple-500/12 border-purple-500/30 shadow-purple-500/10',
      pillBgDark: 'bg-purple-500/20 border-purple-500/40 shadow-purple-500/20',
      iconColorLight: 'text-purple-600',
      iconColorDark: 'text-purple-400',
      badgeBgLight: 'bg-purple-50 text-purple-600 border border-purple-200/80',
      badgeBgDark: 'bg-purple-950/60 text-purple-300 border border-purple-800/60',
    },
    {
      id: 'moi',
      label: 'Moi',
      icon: User,
      activeColorLight: 'text-rose-600',
      activeColorDark: 'text-rose-400',
      pillBgLight: 'bg-rose-500/12 border-rose-500/30 shadow-rose-500/10',
      pillBgDark: 'bg-rose-500/20 border-rose-500/40 shadow-rose-500/20',
      iconColorLight: 'text-rose-600',
      iconColorDark: 'text-rose-400',
      badgeBgLight: 'bg-rose-50 text-rose-600 border border-rose-200/80',
      badgeBgDark: 'bg-rose-950/60 text-rose-300 border border-rose-800/60',
    },
  ];

  const isLight = theme === 'light';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${isLight ? 'bg-white/95 border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.07)]' : 'bg-slate-950/95 border-t border-slate-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.4)]'} backdrop-blur-xl transition-colors duration-200`}>
      <nav className="flex items-center justify-around pt-2.5 pb-3 px-3 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center px-3 group transition-transform active:scale-90 cursor-pointer"
            >
              {/* Icon Container with vibrant colored pill background */}
              <div
                className={`w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? isLight
                      ? `${tab.pillBgLight} border shadow-sm scale-105`
                      : `${tab.pillBgDark} border shadow-sm scale-105`
                    : isLight
                    ? `${tab.badgeBgLight} group-hover:scale-105`
                    : `${tab.badgeBgDark} group-hover:scale-105`
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-all duration-200 ${
                    isActive
                      ? isLight
                        ? `${tab.iconColorLight} stroke-[2.5]`
                        : `${tab.iconColorDark} stroke-[2.5]`
                      : isLight
                      ? `${tab.iconColorLight} stroke-[2]`
                      : `${tab.iconColorDark} stroke-[2]`
                  }`}
                />
              </div>

              {/* Label with signature color */}
              <span
                className={`text-[11px] tracking-tight mt-1 transition-colors duration-200 ${
                  isActive
                    ? isLight
                      ? `${tab.activeColorLight} font-black`
                      : `${tab.activeColorDark} font-black`
                    : isLight
                    ? 'text-slate-600 font-bold group-hover:text-slate-900'
                    : 'text-slate-400 font-bold group-hover:text-white'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
