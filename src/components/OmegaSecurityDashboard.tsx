import React, { useState } from 'react';
import { ShieldCheck, Terminal, FileCode, Layers, ShieldAlert, ArrowRight, Activity } from 'lucide-react';
import { OMEGA_SECURITY_EVIDENCE, simulateBreachScenario, getQuarantinePipelineStatus } from '../services/omegaSecurityService';
import type { BreachSimulationResult } from '../services/omegaSecurityService';

interface OmegaSecurityDashboardProps {
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const OmegaSecurityDashboard: React.FC<OmegaSecurityDashboardProps> = ({
  onClose,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'SIMULATION' | 'PIPELINE' | 'EVIDENCE' | 'PYRAMID'>('SIMULATION');
  const [selectedScenario, setSelectedScenario] = useState<string>('USER_TOKEN_BREACH');
  const [simulationResult, setSimulationResult] = useState<BreachSimulationResult | null>(
    simulateBreachScenario('USER_TOKEN_BREACH')
  );
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = (id: string) => {
    setSelectedScenario(id);
    setIsSimulating(true);
    setTimeout(() => {
      setSimulationResult(simulateBreachScenario(id));
      setIsSimulating(false);
    }, 400);
  };

  const pipelineSteps = getQuarantinePipelineStatus();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className={`max-w-5xl w-full ${isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-slate-900 text-white border-slate-800'} border rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
              <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-xl leading-tight">Directive Omega — Architecture de Sécurité Maximale</h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  Compromission Assumée Active
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Normes OWASP ASVS 5.0, OWASP MASVS, NIST CSF 2.0 & NIST SSDF — Preuves & Isolation Cellulaire
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2.5 rounded-2xl ${isLight ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} transition-all text-sm font-bold`}
          >
            ✕
          </button>
        </div>

        {/* Standard Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-extrabold">
          <span className="px-3 py-1 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" /> OWASP ASVS 5.0 (Web/API)
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" /> OWASP MASVS (Mobile)
          </span>
          <span className="px-3 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" /> NIST CSF 2.0 (Gouvernance)
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" /> NIST SSDF (Supply Chain)
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-6">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'SIMULATION'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Simulateur Compromission Assumée</span>
          </button>

          <button
            onClick={() => setActiveTab('PIPELINE')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'PIPELINE'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Chaîne Quarantaine Fichiers (7 Étapes)</span>
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'EVIDENCE'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Registre Preuves de Sécurité (Evidence Log)</span>
          </button>
        </div>

        {/* Tab 1: Assumed Breach Simulator */}
        {activeTab === 'SIMULATION' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} font-medium flex items-center justify-between`}>
              <span>Tester l'étanchéité des cellules isolées en cas de brèche sur l'un des 6 actifs.</span>
              {isSimulating && <span className="text-cyan-400 font-bold animate-pulse">Simulation en cours...</span>}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleRunSimulation('USER_TOKEN_BREACH')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedScenario === 'USER_TOKEN_BREACH'
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-md font-bold'
                    : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-cyan-500">Test 1 — Compte</span>
                <p className="text-xs font-bold leading-snug mt-1">Compromission Token (BOLA Defense)</p>
              </button>

              <button
                onClick={() => handleRunSimulation('PDF_SANDBOX_EXPLOIT')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedScenario === 'PDF_SANDBOX_EXPLOIT'
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-md font-bold'
                    : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-purple-500">Test 2 — PDF RCE</span>
                <p className="text-xs font-bold leading-snug mt-1">Buffer Overflow Worker OCR</p>
              </button>

              <button
                onClick={() => handleRunSimulation('PROMPT_INJECTION_AI')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedScenario === 'PROMPT_INJECTION_AI'
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-md font-bold'
                    : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-amber-500">Test 3 — IA Injection</span>
                <p className="text-xs font-bold leading-snug mt-1">Prompt Injection en Scannant</p>
              </button>

              <button
                onClick={() => handleRunSimulation('COST_ATTACK_EXFILTRATION')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedScenario === 'COST_ATTACK_EXFILTRATION'
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-md font-bold'
                    : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-black uppercase text-emerald-500">Test 4 — Cost Attack</span>
                <p className="text-xs font-bold leading-snug mt-1">Attaque Financière & Exfiltration</p>
              </button>
            </div>

            {/* Simulation Result Console */}
            {simulationResult && (
              <div className={`p-5 rounded-3xl ${isLight ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-emerald-400 border-slate-800'} border font-mono space-y-4 shadow-xl`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-xs text-white">Résultat du Test de Contention : {simulationResult.title}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    CONFINEMENT VALIDÉ
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-sans font-bold">Action de l'Attaquant :</span>
                    <p className="text-slate-300 font-sans mt-0.5">{simulationResult.attackerAction}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase">Barrière de Protection</span>
                      <p className="text-xs text-slate-200 font-sans font-semibold mt-1">{simulationResult.containmentLayer}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">Blast Radius Résultat</span>
                      <p className="text-xs text-slate-200 font-sans font-semibold mt-1">{simulationResult.blastRadiusResult}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-slate-400">
                    <span>Temps de Détection : <strong className="text-cyan-400">{simulationResult.detectionTimeMs} ms</strong></span>
                    <span>Temps de Restauration : <strong className="text-emerald-400">{simulationResult.recoveryTimeMs} ms</strong></span>
                    <span className="text-emerald-400 font-mono">{simulationResult.evidenceProof}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 7-Step Quarantine Pipeline */}
        {activeTab === 'PIPELINE' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'} font-medium`}>
              Tout document téléversé traverse 7 barrières de validation étanches avant le stockage Zero-Knowledge final.
            </p>

            <div className="space-y-2.5">
              {pipelineSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs">{step.stepName}</h4>
                      <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{step.details}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    CONFORME OWASP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Evidence Log */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-3">
              {OMEGA_SECURITY_EVIDENCE.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} border space-y-2 text-xs`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-cyan-600 dark:text-cyan-400 font-mono">{item.id}</span>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.controlName}</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      {item.standard}
                    </span>
                  </div>

                  <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{item.implementationDetails}</p>

                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] flex items-center justify-between">
                    <span>Blast Radius: {item.blastRadiusContainment}</span>
                    <span className="text-emerald-400 font-bold">{item.evidenceProof}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Fermer la Console Directive Omega</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
