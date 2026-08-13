import React from 'react';
import { Camera, Folder, Shield, Zap, RefreshCw, Smartphone, Monitor, Crown } from 'lucide-react';
import type { UserProfile, CloudSyncStatus } from '../types';

interface NavbarProps {
  activeTab: 'camera' | 'documents' | 'studio' | 'security';
  setActiveTab: (tab: 'camera' | 'documents' | 'studio' | 'security') => void;
  user: UserProfile;
  syncStatus: CloudSyncStatus;
  onOpenPricing: () => void;
  isMobileDeviceFrame: boolean;
  setIsMobileDeviceFrame: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  syncStatus,
  onOpenPricing,
  isMobileDeviceFrame,
  setIsMobileDeviceFrame,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                BanonPDF
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO SAAS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Scanner Documentaire & Cloud OCR</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">Viseur Caméra</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span className="hidden md:inline">Mes Documents</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Web Companion</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Sécurité Meta</span>
          </button>
        </nav>

        {/* Right Controls: Device Mode, Cloud Status, Subscription Tier */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setIsMobileDeviceFrame(!isMobileDeviceFrame)}
            title={isMobileDeviceFrame ? "Basculer en vue Web Desktop" : "Basculer en vue Mockup Mobile iOS"}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs"
          >
            {isMobileDeviceFrame ? <Smartphone className="w-4 h-4 text-blue-400" /> : <Monitor className="w-4 h-4 text-emerald-400" />}
            <span>{isMobileDeviceFrame ? 'Cadre Mobile' : 'Mode Plein Écran'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin text-blue-400' : 'text-emerald-400'}`} />
            <span className="hidden lg:inline">
              {syncStatus.isSyncing ? 'Sync...' : syncStatus.isOnline ? 'Cloud Synchro' : 'Mode Hors-Ligne'}
            </span>
          </div>

          <button
            onClick={onOpenPricing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-md ${
              user.tier === 'business'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90'
                : user.tier === 'premium'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:opacity-90'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span className="uppercase">{user.tier}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
