import React from 'react';
import { DollarSign, ShieldAlert, TrendingUp, Cpu, PieChart, CheckCircle2, ArrowRight, Zap, RefreshCw, BarChart3 } from 'lucide-react';
import { calculateUnitEconomics, getQuotaStatus } from '../services/costGuardService';
import type { SubscriptionTier } from '../types';

interface FinancialDashboardProps {
  onClose: () => void;
  tier?: SubscriptionTier;
  theme?: 'light' | 'dark';
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  onClose,
  tier = 'free',
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const economics = calculateUnitEconomics();
  const quota = getQuotaStatus(tier);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className={`max-w-4xl w-full ${isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-white border-slate-800'} border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              <DollarSign className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-xl leading-tight">Tableau de Bord Dirigeant & Cost Guard</h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  69 Principes Validés
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Unit Economics, Suivi des Marges Brutes & Moteur Anti-Abus IA en Temps Réel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-all text-sm font-bold`}
          >
            ✕
          </button>
        </div>

        {/* 4 Financial Key Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className={`p-4 rounded-2xl ${isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/30 border-emerald-800/50'} border space-y-1`}>
            <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">MRR Mensuel</span>
            <p className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">€{economics.mrr.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-800/70 dark:text-emerald-400/70 font-semibold">+18.4% ce mois</p>
          </div>

          <div className={`p-4 rounded-2xl ${isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-800/50'} border space-y-1`}>
            <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">Marge Brute Réelle</span>
            <p className="text-xl md:text-2xl font-black text-blue-600 dark:text-blue-400">{economics.grossMarginPercent}%</p>
            <p className="text-[10px] text-blue-800/70 dark:text-blue-400/70 font-semibold">Objectif SaaS &gt; 75%</p>
          </div>

          <div className={`p-4 rounded-2xl ${isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-purple-950/30 border-purple-800/50'} border space-y-1`}>
            <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400">LTV / CAC</span>
            <p className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400">{economics.ltvToCacRatio}x</p>
            <p className="text-[10px] text-purple-800/70 dark:text-purple-400/70 font-semibold">Rendement d'Acquisition</p>
          </div>

          <div className={`p-4 rounded-2xl ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-950/30 border-amber-800/50'} border space-y-1`}>
            <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Point Mort</span>
            <p className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400">{economics.breakEvenUsersCount}</p>
            <p className="text-[10px] text-amber-800/70 dark:text-amber-400/70 font-semibold">Abonnés Pro requis</p>
          </div>
        </div>

        {/* Section 1: Contribution Net per User Segment */}
        <div className={`p-5 rounded-3xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <span>Contribution Nette par Catégorie d'Utilisateur</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500">Coût moyen/user : €{economics.costPerUser}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Free */}
            <div className={`p-3.5 rounded-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border flex items-center justify-between`}>
              <div>
                <span className="text-xs font-black uppercase text-slate-500">Tier Free (Local-First)</span>
                <p className="text-xs font-semibold text-slate-400">Caméra + Filtres locaux</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-amber-500">€{economics.contributionPerUser.free}/mois</span>
                <p className="text-[9px] text-slate-400 font-bold">Coût marginal maîtrisé</p>
              </div>
            </div>

            {/* Pro */}
            <div className={`p-3.5 rounded-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border flex items-center justify-between`}>
              <div>
                <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Tier Pro (€8.99/m)</span>
                <p className="text-xs font-semibold text-slate-400">OCR + IA 100 crédits</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">+€{economics.contributionPerUser.pro}/mois</span>
                <p className="text-[9px] text-emerald-500 font-bold">Contribution net positive</p>
              </div>
            </div>

            {/* Business */}
            <div className={`p-3.5 rounded-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border flex items-center justify-between`}>
              <div>
                <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">Tier Business (€19.99/m)</span>
                <p className="text-xs font-semibold text-slate-400">Équipe & Cloud 500 Go</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">+€{economics.contributionPerUser.business}/mois</span>
                <p className="text-[9px] text-purple-500 font-bold">Haute rentabilité</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cost Guard Engine Status & AI Quota Real-Time */}
        <div className={`p-5 rounded-3xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-extrabold text-sm">Statut Moteur Cost Guard & Surveillance Quota IA</h3>
                <p className="text-[11px] text-slate-500">Protection active contre l'explosion des coûts d'infrastructure</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 ${
                quota.alertLevel === 'GREEN'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : quota.alertLevel === 'ORANGE'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                NIVEAU {quota.alertLevel}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Crédits IA Consommés ce mois ({quota.usedAiCredits} / {quota.totalAiCredits})</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{quota.remainingAiCredits} traitements IA restants</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((quota.usedAiCredits / quota.totalAiCredits) * 100))}%` }}
              />
            </div>
          </div>

          {/* Breakdown of Variable Infrastructure Costs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
              <span className="text-[10px] text-slate-400 font-bold">Frais Stores (15%)</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">€{economics.variableCostsBreakdown.storeFees}</p>
            </div>
            <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
              <span className="text-[10px] text-slate-400 font-bold">Infrastructure Cloud</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">€{economics.variableCostsBreakdown.infrastructure}</p>
            </div>
            <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
              <span className="text-[10px] text-slate-400 font-bold">API IA & OCR</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">€{economics.variableCostsBreakdown.aiAndOcr}</p>
            </div>
            <div className={`p-3 rounded-xl ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'} border`}>
              <span className="text-[10px] text-slate-400 font-bold">Bande Passante & CDN</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">€{economics.variableCostsBreakdown.bandwidth}</p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Fermer le Tableau de Bord</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
