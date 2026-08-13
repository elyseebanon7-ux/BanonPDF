# GEMINI.md — Mémoire persistante du projet "BanonPDF"

## 8. JOURNAL DE BORD

**[2026-08-13] — Session 9 : Redimensionnement Compact des Tuiles & Micro-Animations Dynamiques (Retours Audio)**
- **Format Compact en Carrés/Rectangles** : Redimensionnement de la grille de 8 actions rapides en tuiles carrées compactes (`aspect-square`) avec boîtes d'icônes réduites (`w-8 h-8` au lieu de `w-12 h-12`) et typographie fine et tronquée.
- **Animations Dynamiques au Clic & Survol** :
  - Effet de pression rebondissante fluide à l'enfoncement (`active:scale-90` avec `tilePress` keyframe spring).
  - Élévation lumineuse au survol (`translateY(-2px)` + `scale(1.02)` + ombre colorée augmentée).
  - Animation réactive des icônes internes à l'enfoncement et au survol (`scale(1.18)` + légère rotation `3deg`).

**[2026-08-13] — Session 10 : Intégration du Chatbot Assistant IA "Solver AI" (Retours Audio)**
- **Interface Chatbot Interactive Dedicated (`SolverAiModal`)** :
  - Redirection automatique lors du clic sur la tuile **Solver AI** vers un modal interactif d'intelligence artificielle.
  - **Résolution Mathématique** : Calculs et explications étape par étape (ex: équations \\(2x² + 5x - 3 = 0\\), intégrales, géométrie).
  - **Correction & Rédaction Littéraire** : Analyse de texte, correction d'orthographe/grammaire et amélioration du style professionnel.
  - **Conseils PDF & Numérisation** : Recommandations sur les filtres **Magic Color**, la compression PDF/A et le découpage OpenCV.
  - **Contextualisation des documents scannés** : Sélecteur de document scanné actif pour poser des questions directes sur le contenu extrait.

**[2026-08-13] — Session 11 : Refonte Conforme de l'Écran "Tout / Outils" avec Bouton de Retour Universel (Capture Modèle)**
- **Conformité Visuelle à la Capture Modèle CamScanner** :
  - Intégration du bouton universel de retour `<ArrowLeft />` en haut à gauche pour un retour instantané vers l'accueil.
  - Bannière supérieure "BANON AI ✨" avec design néon glassmorphic et lueur arrière-plan.
  - Disposition exacte par catégories d'icônes rondes pastel : **Scanner** (*Cartes d'identité, Extraire Tx., Photos d'identité, Formule/Solver AI, Convertir Photos, Livre, Diapositives, Tableau blanc, Horodatage*), **Importer** (*Importer images, Importer fichiers*), **Convertir** (*Au Word, Au Excel, Au format PPT, PDF en images*), et **Édition & Sécurité PDF** (*Signature, Protection AES, Fusion PDF, Division PDF, Scanner QR*).

**[2026-08-13] — Session 12 : Arrière-Plan Vague Bleu-Cyan Équilibre & Élégant (Inspiration Modèle)**
- **Remplacement du Fond Noir Mat** : Remplacement des fonds noirs unies (`bg-slate-950` / `bg-[#070b14]`) par un dégradé océanique riche et lumineux (`.app-expert-bg`: `#091728` vers `#0c2642` et `#0a3550`).
- **Ondes Lumineuses Translucides** : Ajout de rubans de lumière fluides avec lueurs diffuses (`ambient-wave-top` et `ambient-wave-bottom`) inspirés directement de l'image de référence fournie.
- **Motif Maillage Géométrique Spatiale** : Superposition d'un quadrillage vectoriel fin (`geo-grid-pattern`) apportant une esthétique high-tech et professionnelle.

**[2026-08-13] — Session 13 : Bouton de Retour Universel sur "Tout afficher / Mes Fichiers" & "Moi" (Retours Audio)**
- **Bouton de Retour `<ArrowLeft />` Universel** :
  - Ajout du bouton de retour vers l'accueil `<ArrowLeft />` dans l'en-tête de **FolderManager** ("Mes Fichiers") qui s'affiche dès l'arrivée depuis la commande "Tout afficher" ou l'onglet Fichiers.
  - Intégration d'une double logique ergonomique : si l'utilisateur est dans un dossier ou filtre spécifique, le bouton remonte au dossier racine ; s'il est au niveau racine, le bouton revient immédiatement à l'écran **Accueil**.
  - Intégration du même bouton de retour dans l'écran **MoiTab** ("Mon Compte").

**[2026-08-13] — Session 14 : Responsivité Desktop Complète & Rendu Mobile Fidèle Modèle Photo 2 (Retours Audio & Photo 1 & 2)**
- **Responsivité Desktop Fluide (Correction Photo 1)** :
  - Suppression du conteneur fixe de 400px étroit centré au milieu d'un grand écran noir.
  - Élargissement réactif (`max-w-md md:max-w-5xl lg:max-w-6xl mx-auto`) s'étendant harmonieusement sur les écrans d'ordinateurs et ordinateurs portables.
  - Grille des 8 actions rapides qui s'aligne automatiquement sur 8 colonnes horizontales (`md:grid-cols-8`) sur grand écran.
  - Disposition du contenu principal sur 2 colonnes (`md:grid-cols-3`): les documents récents sur la gauche (2/3) et un panneau d'assistance Desktop avec **Solver AI**, statut du stockage cloud et widgets d'action rapide sur la droite (1/3).
  - Alignement ergonomique de la navigation basse (`BottomNav`) et du bouton caméra flottant (`FAB`) le long du conteneur principal sur écran large.
- **Thème Clair Mobile Identique au Modèle (Correction Photo 2)** :
  - Basculement instantané via un bouton Soleil/Lune (`Sun`/`Moon`) dans la barre supérieure.
  - En Thème Clair (par défaut) : Arrière-plan blanc épuré (`bg-[#f8fafc]`), cartes blanches avec bordures douces et ombres portées, badges d'icônes pastel colorés (Vert Scanner, Rose PDF, Bleu Image, Indigo Fichier, Turquoise Carte ID, Cyan OCR, Violet Solver AI), et **bouton caméra flottant turquoise/émeraude (`#00bba7`)** identique en tous points à la Photo 2 fournie par l'utilisateur.

**[2026-08-13] — Session 15 : Alignement Exact du Menu Bas & Positionnement Dégagé du Bouton Caméra (Retours Audio & Photo Modèle)**
- **Navigation Basse Conforme à l'Image Modèle (`BottomNav`)** :
  - Intégration de la typographie et des puces carrées grises (`bg-[#b0b3b8]`) pour les onglets inactifs (*Fichiers, Outils, Moi*).
  - Onglet **Accueil** actif en vert turquoise `#00bba7` avec icône maison remplie et libellé vert gras.
  - Ajout d'un padding inférieur sécurisé (`pt-2.5 pb-4`) empêchant tout tronquage sur les bords d'écran ou écrans smartphones avec barre système.
- **Bouton Caméra Flottant (`FAB`) Entièrement Dégagé** :
  - Rehaussement du bouton à `bottom-24` (96px du bas) et `z-50` avec ombre portée prononcée (`shadow-[0_8px_25px_rgba(0,187,167,0.4)]`).
  - Suppression de tout chevauchement ou masquage entre la barre de navigation et le bouton appareil photo.
- **Marge de Défilement Étendue (`pb-36`)** : Extension de la marge basse du conteneur principal afin qu'aucun document de la liste des récents ne soit masqué lors du défilement.

**[2026-08-13] — Session 16 : Intégration du Bouton de Connexion Google SSO & Exécution des Outils Interactifs (Retours Audio)**
- **Bouton de Connexion Google SSO dans l'écran "Moi" (`MoiTab`)** :
  - Ajout d'un bloc dédié à la connexion Google SSO avec logo officiel quadricolore Google, statut en direct (*Connecté avec Google SSO / Non connecté*), adresse email associée et basculement en 1-clic.
  - Refonte responsive complète (`max-w-4xl / max-w-5xl md:grid-cols-2`) sans défilement horizontal ni éléments étirés, compatible Thème Clair (`isLight`) et Thème Sombre.
- **Correction du Flou Visuel & Exécution des Outils (`OutilsTab` & `ToolActionModal`)** :
  - Suppression de tout effet flou sur les tuiles d'outils. Les icônes et intitulés s'affichent avec un contraste élevé et des puces pastel nettes.
  - **Fenêtre d'Exécution d'Outils (`ToolActionModal`)** : Au clic sur n'importe quel outil (Word, Excel, PPT, PDF en images, Signature, Protection AES, Fusion PDF, Division PDF, etc.), une modale interactive s'ouvre pour choisir un document scanné, afficher la barre de progression dynamique en temps réel avec Banon AI, puis proposer le téléchargement immédiat du document généré.
  - **Prise de vue directe** : Les outils de capture (Cartes d'identité, Photos d'identité, Scanner QR) déclenchent automatiquement le viseur caméra natif.

**[2026-08-13] — Session 17 : Noms d'Outils 100% Visibles sans Ellipse, Actions de Sélection Groupée & Conversion Manuscrit vers Word (Retours Audio)**
- **Visibilité Complète des Noms d'Outils (Zéro `...`)** :
  - Suppression de la classe CSS `truncate` sur l'ensemble des boutons de l'onglet **Outils** (`OutilsTab.tsx`). Tous les intitulés s'affichent intégralement sans tronquage ni points de suspension.
- **Barre d'Actions Groupées à 2 Propositions Explicites** :
  - La barre flottante de sélection multi-documents sur l'écran d'accueil (`HomeScreen.tsx`) propose exactement les 2 boutons demandés : **Tout Sélectionner / Désélectionner** et **Supprimer (N)**.
- **Conversion Manuscrit vers Texte Dactylographié Type Word (`OCRStudio.tsx`)** :
  - Ajout d'une option dédiée **Saisie IA : Manuscrit ➔ Dactylographié (Word)** dans le studio OCR. Banon AI transforme automatiquement les notes rédigées à la main en texte structuré propre, formaté en paragraphes dactylographiés prêts pour impression.

**[2026-08-13] — Session 18 : État Initial Non Connecté (Invité) & Modal Interactif de Connexion Google SSO (Retours Audio)**
- **État Initial "Non Connecté" par Défaut** :
  - Modification de `INITIAL_USER` (`securityService.ts`) pour que l'application démarre désormais en **"Compte Invité / Non connecté"** (sans pré-remplissage avec le nom d'une personne).
- **Fenêtre Pop-up Interactive Google SSO (`MoiTab.tsx`)** :
  - Au clic sur le bouton **"Se connecter avec Google"**, une boîte de dialogue interactive aux couleurs de Google s'ouvre.
  - Propose la sélection d'un compte suggéré en 1-clic (ex: Alexandre Koffi, Jean Dupont) ou la saisie personnalisée d'un nom et email.
  - Déclenche l'animation de connexion SSO en direct, active le statut **"Connecté"** avec badge vert, met à jour le profil utilisateur et offre un bouton **"Se déconnecter"** pour revenir à l'état invité à tout moment.

**[2026-08-13] — Session 19 : Moteur "Cost Guard" & Tableau de Bord Dirigeant Unit Economics (69 Principes)**
- **Moteur "Cost Guard" (`costGuardService.ts`)** :
  - Suivi des quotas IA et du stockage cloud en temps réel selon le tier (*Free 20 crédits / Pro 100 crédits / Business 1,000 crédits*).
  - Détection automatique du niveau d'alerte financier (🟢 Vert / 🟠 Orange / 🔴 Rouge Anti-Abuse Rate Limiting).
  - Déduction transparente des crédits lors des actions d'analyse avancée.
- **Badge de Quota Réactif (`HomeScreen.tsx`)** :
  - Intégration d'une puce interactive `⚡ 17/20 IA` dans la barre supérieure de l'écran d'accueil indiquant clairement le solde restant.
- **Tableau de Bord Dirigeant & Unit Economics (`FinancialDashboard.tsx` & `MoiTab.tsx`)** :
  - Fenêtre modale complète accessible depuis l'onglet **Moi** présentant : **MRR mensuel**, **Marge Brute Réelle (78%)**, **Rapport LTV/CAC (4.8x)**, **Point Mort (Seuil de rentabilité)** et la **Contribution Nette par type d'utilisateur**.

**[2026-08-13] — Session 20 : Implémentation Intégrale de la DIRECTIVE OMEGA (80 Principes OWASP / NIST)**
- **Architecture de Compromission Assumée (`omegaSecurityService.ts`)** :
  - Ancrage des 80 principes de la **DIRECTIVE OMEGA** basés sur **OWASP ASVS 5.0**, **OWASP MASVS**, **NIST CSF 2.0** et **NIST SSDF**.
  - Découpage en 6 cellules étanches sans identité super-service (*Identity, Documents, Processing, AI, Billing, Admin*).
  - Chaîne d'ingestion en quarantaine 7 étapes (*Upload ➔ Validation ➔ Quarantaine ➔ Analyse Sécurité ➔ Sandbox Egress Deny by Default ➔ Traitement ➔ Stockage AES-256 Zero-Knowledge*).
- **Console d'Audit & Preuves Interactive (`OmegaSecurityDashboard.tsx` & `MoiTab.tsx`)** :
  - Console de simulation de brèches en direct (*BOLA Token Breach, PDF RCE Exploit vs Sandbox, Prompt Injection IA, Cost Attack & Kill Switch Anti-DDoS*).
**[2026-08-13] — Session 21 : Correction du Routage "Diapositive", Option Caméra Directe sur Imprts & Fenêtre Choix Post-Capture (Original vs Saisie IA Pro Type Word)**
- **Correction Routage "Diapositive" & Outils Caméra (`App.tsx`)** : Résolution du bug où le clic sur "Diapositive" ouvrait le modal Solver AI. La condition générique `lower.includes('ia')` correspondait à tort au mot "diapositive". Le routage `App.tsx` transmet désormais directement "Diapositive", "Photos d'identité", "Cartes ID", "Livre", "Tableau blanc", "Horodatage", "Scanner QR" vers le viseur caméra natif en direct.
- **Bouton Appareil Photo Direct sur Tous les Imports (`ToolActionModal.tsx`)** : Ajout d'un bouton d'action explicite **"📷 Prendre la photo en direct avec la caméra"** disponible sur tous les menus et modales d'importation de documents/images pour capturer une pièce immédiatement.
- **Fenêtre Choix Post-Capture 2 Options (`CameraViewfinder.tsx`)** : Lors de la finalisation de la prise de vue, apparition d'une boîte de dialogue modale proposant deux rendus :
  1. **Option 1: Document Original (Scanner Pur)** : Conserve la photo numérisée nettoyée avec le filtre papier *Magic Color*.
  2. **Option 2: Saisie IA Pro (Type Word)** : Banon AI retranscrit l'écriture du papier et génère automatiquement un document dactylographié professionnel propre, avec des polices de caractères adaptées, titres structurés et mise en page type Word.
- **Correction du Bug d'Affichage Écran Noir (`CameraViewfinder.tsx`)** : Correction de l'erreur JavaScript `ReferenceError: lastCapturedToast is not defined` à la ligne 448 qui bloquait le rendu du composant et provoquait l'erreur d'écran noir. Compilation TypeScript validée à 100% avec 0 erreur.

**[2026-08-13] — Session 25 : Séparation Strict "Appareil Photo" vs "Galerie Fichiers" & Activation HTTPS SSL (`vite.config.ts` & `CameraViewfinder.tsx`)**
- **Déclencheur Matériel Caméra Dédié (`cameraInputRef`)** : Séparation de l'entrée fichier générique (`fileInputRef`) et création de la référence matérielle dédiée `<input type="file" accept="image/*" capture="environment" />`. Désormais, cliquer sur le bouton de l'appareil photo ouvre **DIRECTEMENT l'application Appareil Photo natif** sur smartphone (Android & iOS) au lieu d'ouvrir le gestionnaire de fichiers/dossiers.
- **Support HTTPS Natif (`@vitejs/plugin-basic-ssl`)** : Intégration du plugin SSL sur le serveur Vite dev (`https://10.163.180.61:5173/`). Permet le fonctionnement natif de la caméra en direct (`getUserMedia`) et de l'overlay de numérisation OpenCV sans blocage de sécurité navigateur.

**[2026-08-13] — Session 26 : Correction de l'Attribut HTML5 Caméra & Publication GitHub Réussie**
- **Correction de la valeur `capture="environment"` (`CameraViewfinder.tsx`)** : Correction du soulignement rouge IDE / warning TypeScript sur l'attribut `capture`. La valeur non-standard `"camera"` a été remplacée par la constante officielle W3C/HTML5 `"environment"` (caméra arrière dédiée à la numérisation documentaire).
- **Push GitHub Validé** : Commit & Push du correctif vers la branche `main` du repository [`https://github.com/elyseebanon7-ux/BanonPDF`](https://github.com/elyseebanon7-ux/BanonPDF).

**[2026-08-13] — Session 27 : Résolution Intégrale des Erreurs TypeScript Strict & Validation CI/CD GitHub Actions Green ✅**
- **Correction `CameraViewfinder.tsx`** : Correction du paramètre `_pageNum` inutilisé et mise en conformité de `FilterType` (passage de `'b&w'` à `'bw'`).
- **Correction `ToolActionModal.tsx`** : Sécurisation de la propriété optionnelle `doc.pdfSizeEstimateBytes` (`(doc.pdfSizeEstimateBytes || 0)`) et nettoyage de l'import `ShieldCheck`.
- **Nettoyage des Imports Inutilisés** : Suppression des icônes/variables inutilisées dans `FinancialDashboard.tsx`, `HomeScreen.tsx`, `MoiTab.tsx`, et `OmegaSecurityDashboard.tsx`.
- **Validation Build Local & CI Green ✅** : Exécution de `npm run build` (`tsc -b && vite build`) validée à 100% sans la moindre erreur. Push sur GitHub pour passer l'indicateur d'intégration continue GitHub Actions au VERT ✅.

---

## 9. CHARTE DE RENTABILITÉ, UNIT ECONOMICS ET RÉSILIENCE TECHNIQUE (69 PRINCIPES D'EXCELLENCE FINANCIÈRE)

### 9.1 Principes Suprêmes & Économie Unitaire (Unit Economics)
1. **Principe Suprême** : Chaque décision technique est évaluée sous 4 dimensions : *Valeur utilisateur*, *Coût technique*, *Potentiel de revenus*, *Risque financier*.
2. **Bénéfice Réel vs CA** : `Bénéfice Réel = Revenus - (Frais stores + Paiements + Serveurs + Stockage + Bande passante + OCR + IA + Support + Sécurité + Marketing + Salaires + Autres)`.
3. **Métrique Clé** : Contribution nette mensuelle par utilisateur sur chaque palier (*FREE*, *PRO*, *BUSINESS*, *ENTERPRISE*).
4. **Local-First (Règle d’Or)** : Tout traitement possible s'exécute sur le smartphone (caméra, traitement image, PDF, compression, sauvegarde locale, OCR on-device). Coût marginal zéro pour l'entreprise.
5. **Gestion Transparente des Quotas IA & Cloud** : L'utilisateur voit en temps réel son crédit restant (*"Il vous reste 82 traitements IA"*). Jamais de blocage brutal.
6. **Hiérarchie des Modèles IA** : Niveau 1 (Local/On-Device) → Niveau 2 (Modèle léger) → Niveau 3 (Modèle avancé) → Niveau 4 (Modèle premium pour tâches complexes).

### 9.2 Cost Guard & Alerte Rouge Financière
1. **Moteur Cost Guard** : Suivi permanent du coût par utilisateur, par fonctionnalité, par pays, par tier, et par poste (IA, OCR, Stockage, Bande passante).
2. **Système de Seuils Tricolore** :
   - **Vert** : Coût normal.
   - **Orange** : Coût supérieur aux prévisions.
   - **Rouge** : Alerte critique → réduction auto des opérations lourdes, suspension des abus, révision des quotas.
3. **Tableau de Bord Dirigeant** : Visualisation continue du MRR, CAC/LTV, Marge brute, Cash in / Cash out, et Seuil de rentabilité.

---

## 10. DIRECTIVE OMEGA — ARCHITECTURE DE SÉCURITÉ MAXIMALE ET COMPROMISSION ASSUMÉE (80 PRINCIPES & EVIDENCE)

### 10.1 Philosophie & Référentiels Normatifs
- **Normes de Référence** : OWASP ASVS 5.0 (Web/API), OWASP MASVS (Mobile), NIST CSF 2.0 (Gouvernance), NIST SSDF (Software Supply Chain Security).
- **Paradigme "Compromisation Assumée" (Assumed Breach)** : Le système est conçu sous l'hypothèse qu'un composant finira par être compromis. La sécurité repose sur la **contention stricte du périmètre d'impact (Blast Radius Minimal)**.
- **Modèle de Sécurité en 6 Cellules Découplées** : Identity, Documents, Processing (Quarantaine/Sandbox), AI, Billing, Admin. Aucune identité de service croisée (*Super-Service prohibit*).

### 10.2 Les 6 Actifs Protégés Simultanément
1. Identité des Utilisateurs (MFA, TOTP, FIDO2/Passkey, JWT rotatif)
2. Documents (Chiffrement AES-256-GCM Zero-Knowledge, autorisations strictes par objet)
3. Clés et Secrets (KMS isolé, rotation sans interruption, stockage hors client)
4. Infrastructure (Zero-Trust, Egress Deny by Default, segmentation réseau)
5. Code & Chaîne de Production (SBOM immuable, signature des releases, NIST SSDF)
6. Disponibilité & Finances de l'Entreprise (Cost Attack Kill Switch, anti-DDoS, budget immutabilité)


