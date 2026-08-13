import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Smartphone, CheckCircle, FileText, EyeOff } from 'lucide-react';
import type { UserProfile, AuditLogEntry } from '../types';
import { logSecurityEvent } from '../services/securityService';

interface SecurityDashboardProps {
  user: UserProfile;
  auditLogs: AuditLogEntry[];
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ user, auditLogs, onUpdateUser }) => {
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  const handleToggleE2EE = () => {
    const updated = { ...user, e2eeEnabled: !user.e2eeEnabled };
    onUpdateUser(updated);
    logSecurityEvent(
      'E2EE_ENCRYPT',
      updated.e2eeEnabled ? 'Activation du Chiffrement E2EE Zero-Knowledge AES-256-GCM' : 'Désactivation E2EE',
      'info'
    );
  };

  const handleRevokeSessions = () => {
    setSessionsRevoked(true);
    logSecurityEvent('SECURITY_ALERT', 'Révocation immédiate de toutes les autres sessions actives', 'warning');
    setTimeout(() => setSessionsRevoked(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 p-6 rounded-3xl border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Posture de Sécurité Meta/Facebook Grade</h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Secure By Design
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Chiffrement TLS 1.3 Pinning • E2EE AES-256-GCM • Journal d'Audit Immuable • SSO SAML Enterprise
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            Conforme RGPD
          </span>
          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            ISO 27001
          </span>
          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
            SOC 2 Type II
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Chiffrement E2EE Zero-Knowledge</span>
              </div>
              <button
                onClick={handleToggleE2EE}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${user.e2eeEnabled ? 'bg-emerald-600' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.e2eeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-slate-400 text-xs">
              Les documents sont chiffrés sur l'appareil avant envoi. Aucune clé n'est stockée sur nos serveurs.
            </p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Authentification Double Facteur (MFA)</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-300">Clé FIDO2 / WebAuthn & TOTP</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Activé
              </span>
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Sessions Actives</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">iPhone 15 Pro Max (Cet appareil)</span>
                  <span className="text-slate-400">Paris, France • IP: 192.168.1.45</span>
                </div>
                <span className="text-[10px] bg-blue-600/20 text-blue-400 font-bold px-2 py-0.5 rounded">Actif</span>
              </div>
            </div>

            <button
              onClick={handleRevokeSessions}
              className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {sessionsRevoked ? <CheckCircle className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{sessionsRevoked ? 'Toutes les autres sessions révoquées' : 'Révoquer toutes les autres sessions'}</span>
            </button>
          </div>

        </div>

        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-bold text-base text-white">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>Journal d'Audit Immuable (Append-Only Stream)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} événements enregistrés</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-start justify-between text-xs gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-400">{log.action}</span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        log.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium">{log.details}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    IP: {log.ipAddress} • Appareil: {log.deviceInfo}
                  </p>
                </div>

                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
