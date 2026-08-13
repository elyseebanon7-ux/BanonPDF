import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Calculator, BookOpen, FileCheck, Copy, Check, RefreshCw, Bot, User, HelpCircle, FileText } from 'lucide-react';
import type { DocumentItem } from '../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  category?: 'math' | 'literary' | 'pdf_tip' | 'general';
  timestamp: string;
  isThinking?: boolean;
}

interface SolverAiModalProps {
  documents: DocumentItem[];
  onClose: () => void;
}

export const SolverAiModal: React.FC<SolverAiModalProps> = ({ documents, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `Bonjour ! Je suis **Solver AI**, votre assistant intelligent d'analyse, de résolution mathématique/littéraire et d'optimisation documentaire.\n\nComment puis-je vous aider aujourd'hui ?`,
      category: 'general',
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeDocs = documents.filter((d) => !d.isDeleted);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    {
      id: 'p-math',
      label: '📐 Problème Mathématique',
      text: 'Pouvez-vous résoudre cette équation mathématique et expliquer les étapes : 2x² + 5x - 3 = 0 ?',
      category: 'math' as const,
    },
    {
      id: 'p-lit',
      label: '📝 Correction Littéraire',
      text: 'Corrigez les fautes et améliorez la rédaction du texte scanné pour lui donner un style professionnel.',
      category: 'literary' as const,
    },
    {
      id: 'p-pdf',
      label: '📄 Conseils Qualité PDF',
      text: 'Quelles sont les meilleures pratiques pour obtenir un scan PDF ultra-net et de petite taille ?',
      category: 'pdf_tip' as const,
    },
    {
      id: 'p-sum',
      label: '🔍 Résumé de Document',
      text: 'Faites un résumé concis avec les points clés et dates importantes de mon dernier document scanné.',
      category: 'general' as const,
    },
  ];

  const generateAiResponse = (userQuery: string, categoryPreference?: 'math' | 'literary' | 'pdf_tip' | 'general'): { text: string; category: 'math' | 'literary' | 'pdf_tip' | 'general' } => {
    const q = userQuery.toLowerCase();

    // 1. Math Problems
    if (categoryPreference === 'math' || q.includes('équation') || q.includes('math') || q.includes('calcul') || q.includes('2x') || q.includes('résoudre') || q.includes('formule')) {
      return {
        category: 'math',
        text: `### 📐 Résolution Mathématique Étape par Étape

**Problème analysé :** \`2x² + 5x - 3 = 0\` (Équation du second degré)

1. **Identification des coefficients :**
   - \\(a = 2\\)
   - \\(b = 5\\)
   - \\(c = -3\\)

2. **Calcul du discriminant \\(\\Delta\\) :**
   - \\(\\Delta = b² - 4ac = 5² - 4(2)(-3) = 25 + 24 = 49\\)
   - Comme \\(\\Delta > 0\\), l'équation possède **deux solutions réelles distinctes**.

3. **Calcul des racines :**
   - \\(x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{-5 - 7}{4} = \\frac{-12}{4} = -3\\)
   - \\(x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{-5 + 7}{4} = \\frac{2}{4} = 0.5\\)

✅ **Ensemble des solutions :** \\(S = \\{-3 ; 0.5\\}\\)

*Astuce Solver AI : Vous pouvez aussi scanner directement vos cahiers de calcul manuscrits avec la caméra BanonPDF pour extraction automatique !*`,
      };
    }

    // 2. Literary / Proofreading
    if (categoryPreference === 'literary' || q.includes('texte') || q.includes('rédaction') || q.includes('faute') || q.includes('corriger') || q.includes('style') || q.includes('lettre')) {
      return {
        category: 'literary',
        text: `### 📝 Analyse & Reformulation Littéraire

**Texte révisé et optimisé :**

> *"Madame, Monsieur,\nPar la présente, je sollicite votre attention concernant le traitement du dossier administratif numérisé ci-joint. Conformément aux dispositions en vigueur, l'ensemble des pièces justificatives a été scanné en haute résolution et vérifié."*

**Améliorations apportées par l'IA :**
- **Grammaire & Orthographe :** Accord des participes passés corrigé.
- **Structure & Style :** Vocabulaire professionnel renforcé pour une clarté optimale.
- **Lisibilité OCR :** Caractères ambigus nettoyés.`,
      };
    }

    // 3. PDF & Scanning Advice
    if (categoryPreference === 'pdf_tip' || q.includes('pdf') || q.includes('scan') || q.includes('optimis') || q.includes('taille') || q.includes('qualité') || q.includes('net')) {
      return {
        category: 'pdf_tip',
        text: `### 📄 Guide d'Optimisation PDF BanonPDF

Voici les 4 conseils d'expert pour obtenir un document scanné de qualité professionnelle :

1. **Éclairage uniforme (Mode Magic Color)**
   - Placez votre document à plat sous une lumière directe sans ombre directe de la main.
   - Activer le filtre **Magic Color** (blanchit le fond du papier et réhausse le noir de l'encre).

2. **Cadrage automatique OpenCV**
   - Assurez-vous que les 4 coins du document se détachent bien sur un fond contrasté.

3. **Compression PDF/A & OCR recherchable**
   - Exportez en **PDF/A avec couche de texte invisible**.
   - Vous obtenez ainsi un fichier pesant moins de **300 Ko par page** tout en restant recherchable par mot-clé !

4. **Numérisation par lot (Mode Multi-Pages)**
   - Pour les rapports de plus de 3 pages, utilisez le mode **Lot** pour scanner rapidement à la chaîne avant de générer le fichier final.`,
      };
    }

    // Default / Document Summary
    const docName = activeDocs[0]?.title || 'Document scanné';
    return {
      category: 'general',
      text: `### 🔍 Synthèse & Résumé d'Assistant IA

J'ai analysé la demande relative à **${docName}** :

- **Objectif principal :** Numérisation administrative et indexation intelligente.
- **Recommandation Solver AI :**
  1. Utiliser le filtre **Magic Color** pour éliminer les reflets d'encre.
  2. Extraire la couche texte via **OCR Multilingue (30+ langues)**.
  3. Sauvegarder sous format **PDF/A sécurisé avec chiffrement AES-256**.

Souhaitez-vous une extraction de texte complète ou un export au format Excel/Word ?`,
    };
  };

  const handleSend = (overrideText?: string, categoryPreference?: 'math' | 'literary' | 'pdf_tip' | 'general') => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAiResponse(textToSend, categoryPreference);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply.text,
        category: aiReply.category,
        timestamp: new Date().toLocaleTimeString().slice(0, 5),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex flex-col justify-end sm:justify-center p-0 sm:p-4 max-w-md mx-auto animate-fade-in select-none">
      
      {/* Container Card */}
      <div className="bg-[#090d18] border border-purple-500/40 rounded-t-3xl sm:rounded-3xl flex flex-col h-[90vh] sm:h-[85vh] shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden relative">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-60 h-60 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header */}
        <div className="bg-[#0d1326]/90 backdrop-blur-xl border-b border-purple-500/30 px-4 py-3.5 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 border border-purple-300/40">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight">Solver AI</h3>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  v2.6 ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Résolution Math • Littéraire • Conseils PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'ai',
                    text: `Discussion réinitialisée. Posez une nouvelle question mathématique, littéraire ou documentaire !`,
                    timestamp: new Date().toLocaleTimeString().slice(0, 5),
                  },
                ]);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Effacer la discussion"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Optional Document Selector Header Context */}
        {activeDocs.length > 0 && (
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-2 z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300 truncate">
              <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-slate-400 shrink-0">Context :</span>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="bg-slate-950 text-purple-300 font-semibold text-xs border border-purple-500/30 rounded-lg px-2 py-1 outline-none truncate max-w-[200px]"
              >
                <option value="">-- Sélectionner un document scanné --</option>
                {activeDocs.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.pages.length} p.)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 3. Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 custom-scrollbar">
          
          {/* Quick Prompts Container */}
          {messages.length <= 2 && (
            <div className="space-y-2 mb-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl p-3">
              <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Suggestions rapides d'assistance :</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((qp) => (
                  <button
                    key={qp.id}
                    onClick={() => handleSend(qp.text, qp.category)}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 text-left transition-all group hover:bg-purple-900/10 flex items-start gap-2"
                  >
                    <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {qp.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4.5 h-4.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed relative group ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-lg'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-xl'
                }`}
              >
                {/* Category Badge for AI */}
                {msg.sender === 'ai' && msg.category && (
                  <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      {msg.category === 'math' && <Calculator className="w-3 h-3 text-emerald-400" />}
                      {msg.category === 'literary' && <BookOpen className="w-3 h-3 text-blue-400" />}
                      {msg.category === 'pdf_tip' && <FileCheck className="w-3 h-3 text-amber-400" />}
                      <span>
                        {msg.category === 'math' && 'Résolution Mathématique'}
                        {msg.category === 'literary' && 'Littéraire & Rédaction'}
                        {msg.category === 'pdf_tip' && 'Conseil Numérisation PDF'}
                        {msg.category === 'general' && 'Assistant IA'}
                      </span>
                    </span>

                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
                      title="Copier le texte"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans space-y-1">{msg.text}</div>

                <div
                  className={`text-[9px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-purple-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-4.5 h-4.5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center text-slate-400 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800 w-fit">
              <div className="w-7 h-7 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <span className="animate-pulse">Solver AI réfléchit et formule la solution...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Footer Input Bar */}
        <div className="bg-[#0d1326]/95 backdrop-blur-xl border-t border-purple-500/30 p-3 z-10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Posez une question mathématique, littéraire ou PDF..."
              className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 shadow-lg shadow-purple-500/30 border border-purple-300/30 transition-transform active:scale-90"
              title="Envoyer"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
