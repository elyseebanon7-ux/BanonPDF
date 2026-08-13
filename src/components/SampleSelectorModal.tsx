import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface SampleSelectorModalProps {
  onSelectSample: (imageSrc: string, docTitle: string, docType: string) => void;
  onClose: () => void;
}

export const SAMPLE_DOCUMENTS = [
  {
    id: 's-invoice',
    title: 'Facture Commerciale A4',
    type: 'receipt',
    desc: 'Document A4 imprimé net avec tableaux et montants TTC',
    bgColor: '#ffffff',
    textColor: '#0f172a',
    headerText: 'FACTURE N° INV-2026-889',
    subText: 'Fournisseur: BanonPDF Cloud Inc.\nClient: Societe General SARL\nMontant Total H.T.: 3,400.00 €\nTVA 20%: 680.00 €\nTOTAL TTC: 4,080.00 €\nDate: 13/08/2026',
  },
  {
    id: 's-contract',
    title: 'Contrat de Confidentialité NDA',
    type: 'standard',
    desc: 'Document juridique imprimé avec texte dense',
    bgColor: '#fdfbf7',
    textColor: '#1e1b4b',
    headerText: 'CONTRAT DE CONFIDENTIALITÉ (NDA)',
    subText: 'ENTRE LES SOUSSIGNÉS:\n- BanonPDF Technologies (Partie Divulgatrice)\n- Enterprise Partner Inc (Partie Récipiendaire)\nArticle 1: Les Informations Confidentielles comprennent tout code source, prototype et algorithme d\'OCR.',
  },
  {
    id: 's-bizcard',
    title: 'Carte de Visite Executive',
    type: 'business_card',
    desc: 'Format rectangle de poche avec nom, email, téléphone et QR code',
    bgColor: '#0f172a',
    textColor: '#ffffff',
    headerText: 'ALEXANDRE MARTIN',
    subText: 'Chief Technology Officer\nBanonPDF Software Ltd\nEmail: alexandre.martin@banonpdf.com\nTél: +33 6 12 34 56 78\nWebsite: https://banonpdf.com',
  },
  {
    id: 's-whiteboard',
    title: 'Notes sur Tableau Blanc',
    type: 'whiteboard',
    desc: 'Schéma d\'architecture système écrit au feutre avec reflets',
    bgColor: '#f8fafc',
    textColor: '#2563eb',
    headerText: 'ARCHITECTURE PIPELINE OCR',
    subText: '[Camera Feed] -> [Sobel Edge Detector] -> [Quad Warp 4 Points]\n-> [Magic Color Filter] -> [Tesseract.js Engine]\n-> [Searchable PDF Export]',
  },
];

export const SampleSelectorModal: React.FC<SampleSelectorModalProps> = ({ onSelectSample, onClose }) => {
  
  const generateSampleImage = (sample: typeof SAMPLE_DOCUMENTS[0]): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = sample.bgColor;
    ctx.fillRect(0, 0, 1200, 1600);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 16;
    ctx.strokeRect(50, 50, 1100, 1500);

    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('BANONPDF SAMPLE DEMO HD', 100, 130);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(100, 160);
    ctx.lineTo(1100, 160);
    ctx.stroke();

    ctx.fillStyle = sample.textColor;
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(sample.headerText, 100, 260);

    ctx.font = '30px monospace';
    const lines = sample.subText.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, 100, 360 + idx * 60);
    });

    ctx.fillStyle = '#10b981';
    ctx.fillRect(800, 1200, 250, 250);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PASSED OCR', 830, 1330);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Échantillons de Documents HD</h3>
              <p className="text-slate-400 text-xs">Testez la détection de bords, Magic Color & l'OCR en 1 clic</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                const img = generateSampleImage(sample);
                onSelectSample(img, sample.title, sample.type);
                onClose();
              }}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-blue-500/60 cursor-pointer transition-all hover:-translate-y-1 space-y-2 group shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                  {sample.title}
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-blue-400">
                  {sample.type}
                </span>
              </div>
              <p className="text-xs text-slate-400">{sample.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
