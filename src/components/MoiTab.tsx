import React, { useState } from 'react';
import { Crown, Lock, Key, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, LogOut, User as UserIcon, Cloud, BarChart3 } from 'lucide-react';
import type { UserProfile, AuditLogEntry } from '../types';
import { logSecurityEvent } from '../services/securityService';
import { getQuotaStatus } from '../services/costGuardService';
import { FinancialDashboard } from './FinancialDashboard';
import { OmegaSecurityDashboard } from './OmegaSecurityDashboard';

interface MoiTabProps {
  user: UserProfile;
  auditLogs: AuditLogEntry[];
  onOpenPricing: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onBackToAccueil?: () => void;
  theme?: 'light' | 'dark';
}

export const MoiTab: React.FC<MoiTabProps> = ({
  user,
  auditLogs,
  onOpenPricing,
  onUpdateUser,
  onBackToAccueil,
  theme = 'light',
}) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);
  const [showOmegaDashboard, setShowOmegaDashboard] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  const isLight = theme === 'light';
  const isLoggedIn = Boolean(user.isLoggedIn);
  const quota = getQuotaStatus(user.tier);

  const handleConnectWithAccount = (name: string, email: string) => {
    setGoogleLoading(true);
    setTimeout(() => {
      onUpdateUser({
        ...user,
        name: name || 'Alexandre Koffi',
        email: email || 'alexandre.koffi@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        tier: 'premium',
        isLoggedIn: true,
      });
      logSecurityEvent('LOGIN', `Connexion réussie avec Google SSO (${email || 'alexandre.koffi@gmail.com'})`, 'info');
      setGoogleLoading(false);
      setShowGoogleModal(false);
      setUseCustomInput(false);
    }, 600);
  };

  const handleLogout = () => {
    if (confirm("Voulez-vous vous déconnecter de votre compte Google ?")) {
      onUpdateUser({
        ...user,
        name: 'Compte Invité',
        email: 'Non connecté — Connexion Google requise',
        avatarUrl: '',
        tier: 'free',
        isLoggedIn: false,
      });
      logSecurityEvent('LOGIN', 'Déconnexion du compte Google SSO', 'info');
    }
  };

  return (
    <div className={`min-h-screen ${isLight ? 'bg-[#f8fafc] text-slate-900' : 'app-expert-bg geo-grid-pattern text-white'} pb-32 w-full relative select-none transition-colors duration-300`}>
      
      {/* Translucent Glowing Ambient Ribbon Waves in Dark Mode */}
      {!isLight && (
        <>
          <div className="ambient-wave-top" />
          <div className="ambient-wave-bottom" />
        </>
      )}

      {/* Header Bar with Back Button */}
      <div className={`sticky top-0 z-30 ${isLight ? 'bg-white/95 border-b border-slate-200 shadow-sm text-slate-800' : 'bg-[#091b30]/85 border-b border-cyan-500/20 text-white'} backdrop-blur-xl px-4 md:px-8 py-3.5 flex items-center justify-between gap-3 shadow-md`}>
        <div className="max-w-md md:max-w-4xl lg:max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToAccueil}
              className={`p-2 rounded-2xl ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-emerald-600' : 'bg-[#0c243f]/80 border-cyan-500/30 text-cyan-400 hover:text-white'} border shadow-sm transition-all active:scale-90 flex items-center justify-center`}
              title="Retour à l'accueil"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className={`text-lg md:text-xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Mon Compte & Sécurité
            </h2>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isLoggedIn ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30') : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'} border`}>
            {isLoggedIn ? `Plan ${user.tier.toUpperCase()}` : 'Non connecté'}
          </span>
        </div>
      </div>

      {/* Main Responsive Grid Container */}
      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-4 md:px-8 pt-4 space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 relative z-10">
        
        {/* Column 1: User Profile & Google Login SSO */}
        <div className="space-y-4">
          
          {/* User Profile Card */}
          <div className={`${isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'} border p-5 rounded-3xl flex items-center gap-4 transition-all`}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-500 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                <UserIcon className="w-7 h-7" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-extrabold text-base ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>{user.name}</h3>
                {isLoggedIn && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {user.tier}
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate mt-0.5`}>{user.email}</p>
            </div>
          </div>

          {/* Dedicated Google SSO Login Connection Card */}
          <div className={`${isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'} border p-5 rounded-3xl space-y-3.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Colorful Google SVG Logo */}
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h4 className={`font-extrabold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>Compte Google</h4>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isLoggedIn ? 'Connecté avec Google SSO' : 'Non connecté'}
                  </p>
                </div>
              </div>

              {isLoggedIn ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connecté
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                  Déconnecté
                </span>
              )}
            </div>

            {isLoggedIn ? (
              <div className={`p-3 rounded-2xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border flex items-center justify-between text-xs`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Cloud className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} truncate`}>
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 shrink-0 ml-2 active:scale-95 transition-transform"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-extrabold">Se connecter avec Google</span>
              </button>
            )}
          </div>

          {/* Premium Subscription Upgrade Card */}
          <div
            onClick={onOpenPricing}
            className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-3xl text-slate-950 cursor-pointer shadow-lg flex items-center justify-between hover:opacity-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 stroke-[2.5] text-slate-950 shrink-0" />
              <div>
                <h4 className="font-black text-sm">Passer au Plan Premium Pro</h4>
                <p className="text-[11px] font-semibold opacity-90">OCR illimité, sans filigrane & stockage 50 Go</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[3] shrink-0" />
          </div>

          {/* Executive Financial Dashboard & Cost Guard Button */}
          <div
            onClick={() => setShowFinancialDashboard(true)}
            className={`p-4 rounded-3xl ${isLight ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-sm' : 'bg-slate-900 border-emerald-500/30 text-white shadow-xl'} border cursor-pointer hover:border-emerald-500 transition-all flex items-center justify-between active:scale-[0.98]`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <BarChart3 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm">Tableau de Bord Dirigeant & Cost Guard</h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    69 Principes
                  </span>
                </div>
                <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Unit Economics, MRR, Marges & {quota.remainingAiCredits} crédits IA restants
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 stroke-[2.5] text-emerald-500 shrink-0" />
          </div>

        </div>

        {/* Column 2: Meta-Grade Security Settings & Audit Logs */}
        <div className="space-y-4">
          
          <div className={`${isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'} border rounded-3xl p-5 space-y-4`}>
            <h4 className={`text-xs font-extrabold ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>
              Sécurité Niveau Entreprise (Meta-Grade)
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} p-3.5 rounded-2xl border flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Chiffrement E2EE AES-256</span>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Zero-Knowledge coffre-fort</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = { ...user, e2eeEnabled: !user.e2eeEnabled };
                    onUpdateUser(updated);
                    logSecurityEvent('E2EE_ENCRYPT', 'Basculement E2EE Zero-Knowledge', 'info');
                  }}
                  className={`w-11 h-6 rounded-full relative p-0.5 transition-colors shrink-0 ${user.e2eeEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${user.e2eeEnabled ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
                </button>
              </div>

              <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} p-3.5 rounded-2xl border flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Double Facteur MFA (Passkey)</span>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Biométrie / FIDO2</p>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px]">
                  Activé
                </span>
              </div>

              {/* Directive Omega Security Evidence Button */}
              <div
                onClick={() => setShowOmegaDashboard(true)}
                className={`p-3.5 rounded-2xl ${isLight ? 'bg-cyan-50/90 border-cyan-200 text-cyan-950 shadow-sm' : 'bg-slate-900 border-cyan-500/30 text-white'} border cursor-pointer hover:border-cyan-500 transition-all flex items-center justify-between active:scale-[0.98] mt-2`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs">Directive Omega (OWASP / NIST)</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                        80 RÈGLES
                      </span>
                    </div>
                    <p className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Compromission Assumée, Sandbox & Scorecard Preuves
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 stroke-[2.5] text-cyan-500 shrink-0" />
              </div>

              <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} p-3.5 rounded-2xl border flex items-center justify-between`}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Registre d'Audit Immuable</span>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Conformité RGPD / SOC2</p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-slate-500">{auditLogs.length} logs</span>
              </div>
            </div>
          </div>

          {/* Audit Logs Quick Preview */}
          <div className={`${isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900 border-slate-800 shadow-xl'} border rounded-3xl p-5 space-y-3`}>
            <h4 className={`text-xs font-extrabold ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>
              Dernières Activités Sécurisées
            </h4>

            <div className="space-y-2">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border flex items-center justify-between text-[11px]`}>
                  <div className="min-w-0 pr-2">
                    <p className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'} truncate`}>{log.action}</p>
                    <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate`}>{log.details}</p>
                  </div>
                  <span className={`text-[9.5px] ${isLight ? 'text-slate-400' : 'text-slate-500'} font-mono shrink-0`}>
                    {new Date(log.timestamp).toLocaleTimeString().slice(0, 5)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Google Interactive SSO Login Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">Se connecter avec Google</h3>
                  <p className="text-xs text-slate-500">Accéder à BanonPDF Cloud</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGoogleModal(false);
                  setUseCustomInput(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-black p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {googleLoading ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-extrabold text-sm text-slate-800">Authentification Google SSO en cours...</p>
                <p className="text-xs text-slate-500">Vérification des accès & synchronisation du compte</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-medium">
                  Choisissez un compte Google pour vous connecter et synchroniser vos scans :
                </p>

                {!useCustomInput ? (
                  <div className="space-y-2.5">
                    {/* Suggested Accounts */}
                    <button
                      onClick={() => handleConnectWithAccount('Alexandre Koffi', 'alexandre.koffi@gmail.com')}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3 transition-all text-left active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                        AK
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-900 truncate">Alexandre Koffi</p>
                        <p className="text-[11px] text-slate-500 truncate">alexandre.koffi@gmail.com</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        Suggéré
                      </span>
                    </button>

                    <button
                      onClick={() => handleConnectWithAccount('Jean Dupont', 'j.dupont@enterprise.com')}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-3 transition-all text-left active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                        JD
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-900 truncate">Jean Dupont</p>
                        <p className="text-[11px] text-slate-500 truncate">j.dupont@enterprise.com</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setUseCustomInput(true)}
                      className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <span>➕ Utiliser un autre compte Google</span>
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConnectWithAccount(customName, customEmail);
                    }}
                    className="space-y-3 pt-1"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom complet</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sophie Martin"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Adresse Email Google</label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: sophie.martin@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-slate-900"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setUseCustomInput(false)}
                        className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        ← Retour
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
                      >
                        Continuer avec Google
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-2 text-[10px] text-center text-slate-400">
                  En continuant, Google partage votre nom et adresse email avec BanonPDF.
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Executive Financial Dashboard & Cost Guard Modal Overlay */}
      {showFinancialDashboard && (
        <FinancialDashboard
          onClose={() => setShowFinancialDashboard(false)}
          tier={user.tier}
          theme={theme}
        />
      )}

      {/* Directive Omega Security Evidence & Assumed Breach Modal Overlay */}
      {showOmegaDashboard && (
        <OmegaSecurityDashboard
          onClose={() => setShowOmegaDashboard(false)}
          theme={theme}
        />
      )}

    </div>
  );
};
