import React from 'react';
import { Monitor, Workflow, Layers, CheckCircle } from 'lucide-react';
import type { DocumentItem } from '../types';

interface WebCompanionStudioProps {
  documents: DocumentItem[];
  onOpenDocument: (doc: DocumentItem) => void;
}

export const WebCompanionStudio: React.FC<WebCompanionStudioProps> = ({ documents, onOpenDocument }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-white p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold shadow-lg">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Application Web Compagnon & Studio Automatisations</h2>
            <p className="text-slate-400 text-xs">Accès bureau multi-écrans, webhooks Zapier / Make, export serveur</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Webhook API Actif
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Documents Synchronisés en Temps Réel ({documents.length})
            </h3>
            <span className="text-xs text-slate-400">Accès Mobile ↔ Web Studio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex items-center gap-3"
              >
                <img src={doc.pages[0]?.thumbnailUrl} alt={doc.title} className="w-12 h-16 object-cover rounded border border-slate-700" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-white truncate">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{doc.pages.length} page(s) • Sync Cloud OK</p>
                  <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-blue-400 mt-1.5 inline-block font-mono">
                    ID: {doc.id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-white border-b border-slate-800 pb-3">
            <Workflow className="w-4 h-4 text-purple-400" />
            <span>Automatisations Zapier / Make</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Règle #1: Scan Facture → Google Drive</span>
              <p className="text-slate-400 text-[11px]">Envoi automatique de chaque facture scannée vers le dossier /Comptabilite/2026</p>
              <span className="text-[10px] text-emerald-400 font-mono block">✔ Webhook 200 OK (Dernier trigger il y a 10m)</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Règle #2: Carte de Visite → Hubspot CRM</span>
              <p className="text-slate-400 text-[11px]">Création automatique d'un contact Hubspot à partir du fichier .vcf extrait par OCR</p>
              <span className="text-[10px] text-emerald-400 font-mono block">✔ Webhook 200 OK</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
