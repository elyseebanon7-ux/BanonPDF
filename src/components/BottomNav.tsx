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
      color: '#00bba7',
      darkColor: '#10b981',
      bgLight: '#e6f8f6',
      borderLight: '#99e6de',
      textLight: '#007a6d',
      bgDark: 'rgba(16, 185, 129, 0.2)',
      borderDark: 'rgba(16, 185, 129, 0.4)',
      textDark: '#34d399',
    },
    {
      id: 'fichiers' as MainTab,
      label: 'Fichiers',
      icon: Folder,
      color: '#2563eb',
      darkColor: '#3b82f6',
      bgLight: '#eff6ff',
      borderLight: '#bfdbfe',
      textLight: '#1d4ed8',
      bgDark: 'rgba(59, 130, 246, 0.2)',
      borderDark: 'rgba(59, 130, 246, 0.4)',
      textDark: '#60a5fa',
    },
    {
      id: 'outils' as MainTab,
      label: 'Outils',
      icon: Grid,
      color: '#8b5cf6',
      darkColor: '#a855f7',
      bgLight: '#f5f3ff',
      borderLight: '#ddd6fe',
      textLight: '#6d28d9',
      bgDark: 'rgba(168, 85, 247, 0.2)',
      borderDark: 'rgba(168, 85, 247, 0.4)',
      textDark: '#c084fc',
    },
    {
      id: 'moi' as MainTab,
      label: 'Moi',
      icon: User,
      color: '#f43f5e',
      darkColor: '#fb7185',
      bgLight: '#fff1f2',
      borderLight: '#fecdd3',
      textLight: '#be123c',
      bgDark: 'rgba(244, 63, 94, 0.2)',
      borderDark: 'rgba(244, 63, 94, 0.4)',
      textDark: '#fda4af',
    },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl transition-colors duration-200 ${
        isLight
          ? 'bg-white/95 border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.12)]'
          : 'bg-slate-950/95 border-t border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]'
      }`}
    >
      <nav className="flex items-center justify-around pt-2.5 pb-3.5 px-3 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const activeBg = isLight ? tab.color : tab.darkColor;
          const activeText = isLight ? tab.color : tab.darkColor;

          const pillStyle: React.CSSProperties = isActive
            ? {
                backgroundColor: activeBg,
                borderColor: activeBg,
                color: '#ffffff',
                boxShadow: `0 4px 14px ${activeBg}55`,
                transform: 'scale(1.06)',
              }
            : {
                backgroundColor: isLight ? tab.bgLight : tab.bgDark,
                borderColor: isLight ? tab.borderLight : tab.borderDark,
                color: isLight ? tab.color : tab.darkColor,
              };

          const textStyle: React.CSSProperties = {
            color: isActive ? activeText : isLight ? tab.textLight : tab.textDark,
            fontWeight: isActive ? 900 : 800,
          };

          const iconStyle: React.CSSProperties = {
            color: isActive ? (isLight ? '#ffffff' : '#090d16') : isLight ? tab.color : tab.darkColor,
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center px-3 group transition-all duration-200 active:scale-90 cursor-pointer"
            >
              <div
                style={pillStyle}
                className="w-10 h-8 rounded-xl flex items-center justify-center border transition-all duration-200"
              >
                <Icon style={iconStyle} className="w-4 h-4 stroke-[2.5]" />
              </div>

              <span style={textStyle} className="text-[11px] tracking-tight mt-1 transition-colors duration-200 flex items-center gap-1">
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    style={{ backgroundColor: activeBg }}
                    className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                  />
                )}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
