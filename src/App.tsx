import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { FolderManager } from './components/FolderManager';
import { OutilsTab } from './components/OutilsTab';
import { MoiTab } from './components/MoiTab';
import { BottomNav } from './components/BottomNav';
import type { MainTab } from './components/BottomNav';
import { CameraViewfinder } from './components/CameraViewfinder';
import { DocumentViewer } from './components/DocumentViewer';
import { PricingModal } from './components/PricingModal';
import { SampleSelectorModal } from './components/SampleSelectorModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SolverAiModal } from './components/SolverAiModal';
import { ToolActionModal } from './components/ToolActionModal';

import type { DocumentItem, FolderItem, UserProfile, AuditLogEntry, CloudSyncStatus, ScanPage, SubscriptionTier } from './types';
import { loadDocuments, saveDocuments, loadFolders, saveFolders } from './services/storageService';
import { getUserProfile, saveUserProfile, getAuditLogs, logSecurityEvent } from './services/securityService';
import { subscribeSyncStatus, queueOfflineChange } from './services/syncService';

export function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('accueil');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isScanning, setIsScanning] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [user, setUser] = useState<UserProfile>(getUserProfile());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(getAuditLogs());
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isOnline: true,
    pendingSyncCount: 0,
    isSyncing: false,
  });

  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSampleSelector, setShowSampleSelector] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSolverAi, setShowSolverAi] = useState(false);
  const [activeToolModal, setActiveToolModal] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(loadDocuments());
    setFolders(loadFolders());

    const unsubscribe = subscribeSyncStatus(setSyncStatus);
    return () => {
      unsubscribe();
    };
  }, []);

  const updateDocumentsState = (newDocs: DocumentItem[]) => {
    setDocuments(newDocs);
    saveDocuments(newDocs);
    queueOfflineChange();
  };

  const updateFoldersState = (newFolders: FolderItem[]) => {
    setFolders(newFolders);
    saveFolders(newFolders);
  };

  const handleCaptureCompleted = (newPages: ScanPage[]) => {
    if (activeDocument) {
      const updatedDoc: DocumentItem = {
        ...activeDocument,
        pages: [...activeDocument.pages, ...newPages],
        updatedAt: Date.now(),
        pdfSizeEstimateBytes: (activeDocument.pages.length + newPages.length) * 450000,
      };
      handleUpdateDocument(updatedDoc);
    } else {
      const newDocId = `doc-${Date.now()}`;
      const title = `Scan ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0, 5)}`;
      
      const newDoc: DocumentItem = {
        id: newDocId,
        title,
        type: 'standard',
        tags: ['Nouveau Scan'],
        pages: newPages,
        isFavorite: false,
        isEncrypted: user.e2eeEnabled,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pdfSizeEstimateBytes: newPages.length * 450000,
      };

      const updated = [newDoc, ...documents];
      updateDocumentsState(updated);
      setActiveDocument(newDoc);
    }

    setIsScanning(false);
    logSecurityEvent('DOCUMENT_SCAN', `Nouveau scan ajouté avec ${newPages.length} page(s)`, 'info');
  };

  const handleSampleSelected = (imageSrc: string, title: string, type: any) => {
    const newDoc: DocumentItem = {
      id: `doc-sample-${Date.now()}`,
      title,
      type,
      tags: ['Échantillon HD', 'Test OCR'],
      pages: [
        {
          id: `p-sample-${Date.now()}`,
          originalImageUrl: imageSrc,
          processedImageUrl: imageSrc,
          thumbnailUrl: imageSrc,
          corners: { topLeft: { x: 50, y: 50 }, topRight: { x: 1150, y: 50 }, bottomRight: { x: 1150, y: 1550 }, bottomLeft: { x: 50, y: 1550 } },
          rotation: 0,
          filter: 'magic',
          brightness: 0,
          contrast: 0,
          ocrText: `${title}\nDocument Échantillon HD Numérisé.\nSystème de vision par ordinateur BanonPDF v2.6.`,
          ocrLanguage: 'fra',
          ocrConfidence: 99,
          createdAt: Date.now(),
        },
      ],
      isFavorite: true,
      isEncrypted: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pdfSizeEstimateBytes: 450000,
    };

    const updated = [newDoc, ...documents];
    updateDocumentsState(updated);
    setActiveDocument(newDoc);
    setShowSampleSelector(false);
    logSecurityEvent('DOCUMENT_SCAN', `Échantillon HD [${title}] chargé avec succès`, 'info');
  };

  const handleUpdateDocument = (updatedDoc: DocumentItem) => {
    const updated = documents.map((d) => (d.id === updatedDoc.id ? updatedDoc : d));
    updateDocumentsState(updated);
    setActiveDocument(updatedDoc);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, isDeleted: true } : d));
    updateDocumentsState(updated);
    if (activeDocument?.id === id) {
      setActiveDocument(null);
    }
  };

  const handleRestoreFromTrash = (id: string) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, isDeleted: false } : d));
    updateDocumentsState(updated);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d));
    updateDocumentsState(updated);
  };

  const handleCreateFolder = (name: string, color?: string) => {
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name,
      color: color || '#3b82f6',
      createdAt: Date.now(),
    };
    updateFoldersState([...folders, newFolder]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDoc: DocumentItem = {
        id: `doc-import-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: 'standard',
        tags: ['Fichier Importé'],
        pages: [
          {
            id: `p-${Date.now()}`,
            originalImageUrl: dataUrl,
            processedImageUrl: dataUrl,
            thumbnailUrl: dataUrl,
            corners: { topLeft: { x: 0, y: 0 }, topRight: { x: 800, y: 0 }, bottomRight: { x: 800, y: 1000 }, bottomLeft: { x: 0, y: 1000 } },
            rotation: 0,
            filter: 'original',
            brightness: 0,
            contrast: 0,
            createdAt: Date.now(),
          },
        ],
        isFavorite: false,
        isEncrypted: false,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pdfSizeEstimateBytes: file.size,
      };

      updateDocumentsState([newDoc, ...documents]);
      setActiveDocument(newDoc);
      logSecurityEvent('DOCUMENT_SCAN', `Fichier importé: ${file.name}`, 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleUpgradeTier = (tier: SubscriptionTier) => {
    const updated = { ...user, tier };
    setUser(updated);
    saveUserProfile(updated);
    logSecurityEvent('LOGIN', `Mise à niveau de l'abonnement vers le plan ${tier.toUpperCase()}`, 'info');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans transition-colors duration-300`}>
      
      {isScanning ? (
        <CameraViewfinder
          onCaptureCompleted={handleCaptureCompleted}
          onClose={() => setIsScanning(false)}
        />
      ) : activeDocument ? (
        <DocumentViewer
          document={activeDocument}
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument}
          onBack={() => setActiveDocument(null)}
          onAddPage={() => setIsScanning(true)}
        />
      ) : (
        <>
          {activeTab === 'accueil' && (
            <HomeScreen
              documents={documents}
              syncStatus={syncStatus}
              onOpenScan={() => setIsScanning(true)}
              onOpenDocument={(doc) => setActiveDocument(doc)}
              onOpenPricing={() => setShowPricingModal(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onFileUpload={handleFileUpload}
              onDeleteDocument={handleDeleteDocument}
              onOpenSolverAi={() => setShowSolverAi(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          )}

          {activeTab === 'fichiers' && (
            <FolderManager
              documents={documents}
              folders={folders}
              onSelectDocument={(doc) => setActiveDocument(doc)}
              onCreateFolder={handleCreateFolder}
              onToggleFavorite={handleToggleFavorite}
              onMoveToTrash={handleDeleteDocument}
              onRestoreFromTrash={handleRestoreFromTrash}
              onBackToAccueil={() => setActiveTab('accueil')}
            />
          )}

          {activeTab === 'outils' && (
            <OutilsTab
              theme={theme}
              onBackToAccueil={() => setActiveTab('accueil')}
              onSelectTool={(toolName) => {
                const name = toolName.toLowerCase().trim();
                if (name.includes('solver') || name.includes('formule')) {
                  setShowSolverAi(true);
                } else if (
                  name.includes('diapositive') ||
                  name.includes('carte') ||
                  name.includes('photo d') ||
                  name.includes('livre') ||
                  name.includes('tableau blanc') ||
                  name.includes('horodatage') ||
                  name.includes('qr') ||
                  name.includes('convertir photo')
                ) {
                  setIsScanning(true);
                } else {
                  setActiveToolModal(toolName);
                }
              }}
            />
          )}

          {activeTab === 'moi' && (
            <MoiTab
              user={user}
              auditLogs={auditLogs}
              theme={theme}
              onOpenPricing={() => setShowPricingModal(true)}
              onUpdateUser={(updated) => {
                setUser(updated);
                saveUserProfile(updated);
                setAuditLogs(getAuditLogs());
              }}
              onBackToAccueil={() => setActiveTab('accueil')}
            />
          )}

          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </>
      )}

      {showPricingModal && (
        <PricingModal user={user} onUpgradeTier={handleUpgradeTier} onClose={() => setShowPricingModal(false)} />
      )}

      {showSampleSelector && (
        <SampleSelectorModal
          onSelectSample={handleSampleSelected}
          onClose={() => setShowSampleSelector(false)}
        />
      )}

      {showOnboarding && <OnboardingModal onFinish={() => setShowOnboarding(false)} />}

      {showSolverAi && (
        <SolverAiModal
          documents={documents}
          onClose={() => setShowSolverAi(false)}
        />
      )}

      {activeToolModal && (
        <ToolActionModal
          toolName={activeToolModal}
          documents={documents}
          theme={theme}
          onClose={() => setActiveToolModal(null)}
          onOpenScan={() => setIsScanning(true)}
        />
      )}

    </div>
  );
}
