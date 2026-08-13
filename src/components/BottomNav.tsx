import React from 'react';
import { Home, FileText, Grid, User } from 'lucide-react';

export type MainTab = 'accueil' | 'fichiers' | 'outils' | 'moi';

interface BottomNavProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  theme?: 'light' | 'dark';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, theme = 'light' }) => {
  const tabs: { id: MainTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'fichiers', label: 'Fichiers', icon: FileText },
    { id: 'outils', label: 'Outils', icon: Grid },
    { id: 'moi', label: 'Moi', icon: User },
  ];

  const isLight = theme === 'light';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${isLight ? 'bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]' : 'bg-slate-900 border-t border-slate-800'} backdrop-blur-xl`}>
      <nav className="flex items-center justify-around pt-2.5 pb-4 md:pb-3 px-4 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center px-3 group transition-transform active:scale-95 cursor-pointer"
            >
              {/* Icon Badge - Matches uploaded CamScanner screenshot */}
              <div
                className={`w-7 h-7 flex items-center justify-center transition-all ${
                  isActive
                    ? isLight
                      ? 'text-[#00bba7] scale-110'
                      : 'text-emerald-400 scale-110'
                    : isLight
                    ? 'bg-[#b0b3b8] text-white rounded-lg shadow-xs group-hover:bg-[#9ca0a6]'
                    : 'bg-slate-800 text-slate-400 rounded-lg group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-[#00bba7] stroke-[#00bba7] dark:fill-emerald-400 dark:stroke-emerald-400' : 'stroke-[2.5]'}`} />
              </div>

              {/* Label below icon */}
              <span
                className={`text-[11.5px] tracking-tight mt-1 transition-colors ${
                  isActive
                    ? isLight
                      ? 'text-[#00bba7] font-extrabold'
                      : 'text-emerald-400 font-extrabold'
                    : isLight
                    ? 'text-[#8e8e93] font-semibold group-hover:text-slate-700'
                    : 'text-slate-400 font-semibold group-hover:text-slate-200'
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
