import type { DocumentItem, FolderItem, ScanPage } from '../types';
import { getDefaultCorners } from './imageProcessor';

const DOCUMENTS_KEY = 'banonpdf_documents_v1';
const FOLDERS_KEY = 'banonpdf_folders_v1';

export const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'f-factures', name: 'Factures & Reçus', color: '#3b82f6', createdAt: Date.now() - 86400000 * 5 },
  { id: 'f-identite', name: 'Pièces d\'Identité', color: '#10b981', createdAt: Date.now() - 86400000 * 10 },
  { id: 'f-contrats', name: 'Contrats & Juridique', color: '#8b5cf6', createdAt: Date.now() - 86400000 * 2 },
  { id: 'f-equipe', name: 'Projets Équipe', color: '#f59e0b', createdAt: Date.now() - 86400000 * 1 },
];

function generateSampleCanvas(title: string, subtitle: string, bgColor: string, textColor: string = '#000000'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1200, 1600);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 12;
  ctx.strokeRect(40, 40, 1120, 1520);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('BANONPDF SCANNER PRO', 100, 140);

  ctx.fillStyle = '#64748b';
  ctx.font = '24px sans-serif';
  ctx.fillText('Document Numérisé Haute Résolution - Mode Magic Color', 100, 185);

  ctx.beginPath();
  ctx.moveTo(100, 220);
  ctx.lineTo(1100, 220);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(title, 100, 320);

  ctx.fillStyle = '#334155';
  ctx.font = '30px sans-serif';
  const lines = subtitle.split('\n');
  lines.forEach((line, idx) => {
    ctx.fillText(line, 100, 400 + idx * 50);
  });

  ctx.fillStyle = '#2563eb';
  ctx.fillRect(850, 280, 200, 200);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('VERIFIED PDF', 880, 390);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function getSampleDocuments(): DocumentItem[] {
  const invoiceImg = generateSampleCanvas(
    'FACTURE ACME CORP #2026-88',
    'Date de facturation: 12/08/2026\nFournisseur: ACME Technologies SAS\nMontant H.T.: 2 450.00 €\nTVA (20%): 490.00 €\nTotal TTC: 2 940.00 €\nStatut: PAYÉ PAR CARTE',
    '#fafafa',
    '#0f172a'
  );

  const contractImg = generateSampleCanvas(
    'CONTRAT DE PRESTATION DE SERVICE',
    'Entre les soussignés:\n- BanonPDF Technologies (Le Prestataire)\n- Enterprise Cloud Ltd (Le Client)\nObjet: Fourniture d\'infrastructure SaaS sécurisée\nDurée: 24 mois renouvelables par tacite reconduction.',
    '#ffffff',
    '#1e1b4b'
  );

  const bizCardImg = generateSampleCanvas(
    'CARTE DE VISITE - ALEXANDRE MARTIN',
    'Alexandre Martin\nChief Technology Officer\nEmail: alexandre.martin@banonpdf.com\nTél: +33 6 12 34 56 78\nSociété: BanonPDF Software Inc.\nSite: https://banonpdf.com',
    '#f8fafc',
    '#0369a1'
  );

  const samplePage1: ScanPage = {
    id: 'p-1',
    originalImageUrl: invoiceImg,
    processedImageUrl: invoiceImg,
    thumbnailUrl: invoiceImg,
    corners: getDefaultCorners(1200, 1600),
    rotation: 0,
    filter: 'magic',
    brightness: 0,
    contrast: 0,
    ocrText: 'FACTURE ACME CORP #2026-88\nDate de facturation: 12/08/2026\nFournisseur: ACME Technologies SAS\nMontant H.T.: 2 450.00 €\nTVA (20%): 490.00 €\nTotal TTC: 2 940.00 €\nStatut: PAYÉ',
    ocrLanguage: 'fra',
    ocrConfidence: 98,
    createdAt: Date.now() - 86400000,
  };

  const samplePage2: ScanPage = {
    id: 'p-2',
    originalImageUrl: contractImg,
    processedImageUrl: contractImg,
    thumbnailUrl: contractImg,
    corners: getDefaultCorners(1200, 1600),
    rotation: 0,
    filter: 'bw',
    brightness: 0,
    contrast: 0,
    ocrText: 'CONTRAT DE PRESTATION DE SERVICE\nBanonPDF Technologies & Enterprise Cloud Ltd\nObjet: Infrastructure SaaS Cloud Sécurisée',
    ocrLanguage: 'fra',
    ocrConfidence: 96,
    createdAt: Date.now() - 86400000 * 2,
  };

  const samplePage3: ScanPage = {
    id: 'p-3',
    originalImageUrl: bizCardImg,
    processedImageUrl: bizCardImg,
    thumbnailUrl: bizCardImg,
    corners: getDefaultCorners(1200, 1600),
    rotation: 0,
    filter: 'original',
    brightness: 0,
    contrast: 0,
    ocrText: 'Alexandre Martin\nChief Technology Officer\nEmail: alexandre.martin@banonpdf.com\nTél: +33 6 12 34 56 78\nBanonPDF Software Inc.',
    ocrLanguage: 'fra',
    ocrConfidence: 99,
    extractedData: {
      type: 'business_card',
      vCard: {
        name: 'Alexandre Martin',
        title: 'Chief Technology Officer',
        company: 'BanonPDF Software Inc.',
        email: 'alexandre.martin@banonpdf.com',
        phone: '+33 6 12 34 56 78',
        website: 'https://banonpdf.com',
      },
    },
    createdAt: Date.now() - 86400000 * 3,
  };

  return [
    {
      id: 'doc-1',
      title: 'Facture ACME Corp #2026-88',
      type: 'receipt',
      folderId: 'f-factures',
      tags: ['Comptabilité', 'Urgent', 'Payé'],
      pages: [samplePage1],
      isFavorite: true,
      isEncrypted: false,
      isDeleted: false,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
      pdfSizeEstimateBytes: 420000,
    },
    {
      id: 'doc-2',
      title: 'Contrat Prestation SaaS Enterprise',
      type: 'standard',
      folderId: 'f-contrats',
      tags: ['Juridique', 'Confidentiel'],
      pages: [samplePage2],
      isFavorite: true,
      isEncrypted: true,
      isDeleted: false,
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
      pdfSizeEstimateBytes: 850000,
    },
    {
      id: 'doc-3',
      title: 'Carte de Visite - Alexandre Martin CTO',
      type: 'business_card',
      folderId: 'f-equipe',
      tags: ['Contact', 'VIP'],
      pages: [samplePage3],
      isFavorite: false,
      isEncrypted: false,
      isDeleted: false,
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
      pdfSizeEstimateBytes: 310000,
    },
  ];
}

export function loadDocuments(): DocumentItem[] {
  try {
    const saved = localStorage.getItem(DOCUMENTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  const samples = getSampleDocuments();
  saveDocuments(samples);
  return samples;
}

export function saveDocuments(docs: DocumentItem[]) {
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents to localStorage:', err);
  }
}

export function loadFolders(): FolderItem[] {
  try {
    const saved = localStorage.getItem(FOLDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  saveFolders(INITIAL_FOLDERS);
  return INITIAL_FOLDERS;
}

export function saveFolders(folders: FolderItem[]) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save folders to localStorage:', err);
  }
}
