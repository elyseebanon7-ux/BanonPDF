# BanonPDF 📄✨

> **Mobile-First Professional Smartphone Document Scanner & PDF Processing Application**
> Built with React, TypeScript, Vite, TailwindCSS, Tesseract.js (On-Device OCR), and OpenCV.

---

## 🌟 Core Features

- **Real-Time Camera Capture & Perspective Correction**: Live edge detection and automatic perspective deskew using OpenCV natif bindings.
- **Magic Color & Document Filters**: High-contrast paper whitening, Magic Color enhancement, grayscale, and black & white document filters.
- **On-Device OCR**: Offline-first text extraction supporting 30+ languages, table extraction (CSV/Excel), and business card parsing (.vcf).
- **Saisie IA Pro (Type Word)**: Clean A4 dactylographed document rendering from handwritten/printed photos without watermarks.
- **Interactive Assistant IA "Solver AI"**: Mathematical equation solving, literary proofreading, and document-contextual Q&A.
- **Zero-Knowledge Security (DIRECTIVE OMEGA)**: Local-first architecture, AES-256-GCM encryption, strict blast radius containment, and Cost Guard unit economics monitoring.

---

## 🔒 Security & Secrets Policy

This codebase strictly adheres to the **DIRECTIVE OMEGA** security architecture (OWASP ASVS 5.0, OWASP MASVS, NIST CSF 2.0 / SSDF):

1. **Zero Hardcoded Secrets**: No API keys, passwords, private keys, or service-role credentials are versioned in Git.
2. **Local-First Processing**: Sensitive documents, OCR, and PDF transformations run on-device within client memory.
3. **Environment Isolation**: Production secrets are managed via Secret Managers and never exposed to client applications.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install
```bash
git clone https://github.com/elyseebanon7-ux/BanonPDF.git
cd BanonPDF
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` template to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

- **Local Access**: `https://localhost:5173/`
- **Mobile LAN Access**: `https://<YOUR_LAN_IP>:5173/`

---

## 🧪 Verification & Build

```bash
# Typecheck TypeScript code
npx tsc --noEmit

# Production Bundle Build
npm run build
```

---

## 🛡️ License & Contact

Developed by **BanonPDF Core Engineering Team**. All rights reserved.
