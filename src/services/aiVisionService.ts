import { performOCR } from './ocrEngine';
import { applyFilterToCanvas } from './imageProcessor';

export const GEMINI_VISION_AI_SYSTEM_PROMPT = `
Tu es Gemini 1.5 Pro Vision AI, un expert de pointe en OCR Multimodal et en mise en page DTP (Desktop Publishing).
Ta mission est d'analyser l'image d'un document scanné (texte manuscrit ou imprimé) et de retranscrire TOUT son contenu avec une fidélité absolue et une mise en page dactylographiée professionnelle (DTP / Word).

Règles de transcription et formatage :
1. Extraction exhaustive : Extrais chaque mot, chiffre, titre et paragraphe du document sans omission.
2. Structure préservée : Conserve la hiérarchie visuelle d'origine (Titres H1/H2, paragraphes, listes à puces, tableaux).
3. Rendu Dactylographié Pro : Formate le texte sous forme de paragraphes propres, avec des titres en gras et une typographie digne d'un document Word saisi sur ordinateur.
4. Correction intelligente : Corrige la syntaxe et la mise en forme sans altérer le sens d'origine.
5. Sortie HTML / Markdown : Fournis un format structuré propre avec balises sémantiques.
`;

export interface DigitizeResult {
  text: string;
  html: string;
  markdown: string;
  dtpCanvasUrl: string;
}

/**
 * Converts image source (URL string or HTMLCanvasElement) to HTMLCanvasElement
 */
function imageSourceToCanvas(imageSource: string | HTMLCanvasElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    if (imageSource instanceof HTMLCanvasElement) {
      resolve(imageSource);
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth || 1200;
      canvas.height = img.naturalHeight || 1600;
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      resolve(canvas);
    };
    img.onerror = () => {
      resolve(canvas);
    };
    img.src = imageSource;
  });
}

/**
 * Action 1: Améliorer le Scan (IA)
 * Conserve l'image/document d'origine et applique un traitement visuel 
 * (dépoussiérage, correction de perspective, contraste, suppression des ombres et blanchiment du fond).
 */
export async function enhanceScanWithAI(
  imageSource: string | HTMLCanvasElement
): Promise<{ enhancedImageUrl: string }> {
  const canvas = await imageSourceToCanvas(imageSource);
  const enhancedCanvas = applyFilterToCanvas(canvas, 'magic', 12, 18);
  return { enhancedImageUrl: enhancedCanvas.toDataURL('image/jpeg', 0.94) };
}

/**
 * Action 2: Numériser & Retaper le texte (IA) (OCR Multimodal + DTP Word)
 * Extrait et transcrit le texte RÉEL de l'image (manuscrit ou dactylographié) 
 * et génère une mise en page ordinateur professionnelle (Word/PDF).
 */
export async function digitizeTextWithVisionAI(
  imageSource: string | HTMLCanvasElement,
  existingText?: string
): Promise<DigitizeResult> {
  let extractedText = '';

  // 1. If user typed custom text manually, use it
  if (
    existingText &&
    existingText.trim() &&
    !existingText.includes('DOCUMENT PAPIER NUMÉRISÉ (PAGE') &&
    !existingText.includes('TEXTE SÉLECTIONNÉ OU EXTRAIT')
  ) {
    extractedText = existingText.trim();
  }

  // 2. Otherwise, perform real OCR / Vision AI extraction on the actual photo
  if (!extractedText) {
    const srcCanvas = await imageSourceToCanvas(imageSource);
    
    // First try: OCR on high-contrast binarized canvas for optimal text detection
    try {
      const binarizedCanvas = applyFilterToCanvas(srcCanvas, 'bw', 20, 25);
      const ocrResult = await performOCR(binarizedCanvas, 'fra');
      if (ocrResult.text && ocrResult.text.trim()) {
        extractedText = ocrResult.text.trim();
      }
    } catch (err) {
      console.warn('Primary OCR pass failed:', err);
    }

    // Second try: OCR on magic color canvas if primary pass returned empty
    if (!extractedText) {
      try {
        const magicCanvas = applyFilterToCanvas(srcCanvas, 'magic', 10, 15);
        const ocrResultMagic = await performOCR(magicCanvas, 'fra');
        if (ocrResultMagic.text && ocrResultMagic.text.trim()) {
          extractedText = ocrResultMagic.text.trim();
        }
      } catch (err) {
        console.warn('Secondary OCR pass failed:', err);
      }
    }

    // Third try: Direct raw canvas OCR
    if (!extractedText) {
      try {
        const ocrResultRaw = await performOCR(srcCanvas, 'fra');
        if (ocrResultRaw.text && ocrResultRaw.text.trim()) {
          extractedText = ocrResultRaw.text.trim();
        }
      } catch (err) {
        console.warn('Raw OCR pass failed:', err);
      }
    }
  }

  // 3. Fallback message if no text was detected on the image
  if (!extractedText) {
    extractedText = `AUCUN TEXTE N'A POUVOIR ÊTRE DÉTECTÉ SUR CETTE PHOTO

Veuillez vérifier que la photo est bien nette et cadrée sur un document texte.
Vous pouvez également utiliser le bouton "Éditer / Saisir le texte" ci-dessous pour ajouter votre texte manuellement.`;
  }

  // 4. Format HTML & Markdown (Computer DTP Layout)
  const lines = extractedText.split('\n');
  let htmlLines: string[] = [];
  let mdLines: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      htmlLines.push('<br/>');
      mdLines.push('');
      return;
    }

    if (trimmed.toUpperCase() === trimmed && trimmed.length < 60 && !trimmed.startsWith('•')) {
      htmlLines.push(`<h2 style="font-size:18px; font-weight:800; color:#0f172a; margin-top:16px; margin-bottom:8px;">${trimmed}</h2>`);
      mdLines.push(`## ${trimmed}`);
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      htmlLines.push(`<li style="font-size:14px; color:#334155; margin-left:16px; margin-bottom:4px;">${trimmed.replace(/^[•-]\s*/, '')}</li>`);
      mdLines.push(`* ${trimmed.replace(/^[•-]\s*/, '')}`);
    } else {
      htmlLines.push(`<p style="font-size:14px; line-height:1.6; color:#334155; margin-bottom:8px;">${trimmed}</p>`);
      mdLines.push(trimmed);
    }
  });

  const fullHtml = `<div style="font-family: system-ui, -apple-system, sans-serif; background:#ffffff; color:#0f172a; padding:40px; border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width:800px; margin:auto;">
    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 0;">BANON VISION AI — RENDU DACTYLOGRAPHIÉ</h1>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Transcrit et mis en page automatiquement</p>
      </div>
      <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px;">IA DTP WORD</span>
    </header>
    <main>${htmlLines.join('')}</main>
  </div>`;

  const fullMarkdown = mdLines.join('\n');

  // 5. Render high-resolution computer-typed A4 canvas ("mise en page ordinateur")
  const dtpCanvasUrl = generateComputerDtpCanvas(extractedText);

  return {
    text: extractedText,
    html: fullHtml,
    markdown: fullMarkdown,
    dtpCanvasUrl,
  };
}

/**
 * Generates an A4 computer-typed canvas layout ("Mise en page ordinateur / Word")
 * Rendering actual extracted text cleanly line by line
 */
function generateComputerDtpCanvas(rawText: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean A4 paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1200, 1600);

  // Top header line
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(90, 80, 1020, 4);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('BANON AI — RENDU DACTYLOGRAPHIÉ DTP (TYPE WORD)', 90, 68);

  const marginX = 90;
  const maxWidth = 1020;
  let currentY = 130;

  const lines = rawText.split('\n');

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      currentY += 16;
      return;
    }

    if (currentY > 1500) return; // Prevent overflow beyond single A4 page render

    const isHeader = (trimmed.toUpperCase() === trimmed && trimmed.length < 60 && !trimmed.startsWith('•')) || trimmed.startsWith('#');
    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');

    if (isHeader) {
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#0f172a';
      currentY += 10;
    } else if (isBullet) {
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#0284c7';
    } else {
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#334155';
    }

    const words = trimmed.split(' ');
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(currentLine.trim(), marginX, currentY);
        currentLine = words[n] + ' ';
        currentY += isHeader ? 38 : 34;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.trim()) {
      ctx.fillText(currentLine.trim(), marginX, currentY);
      currentY += isHeader ? 40 : 34;
    }

    if (isHeader) currentY += 8;
  });

  // Footer line
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(90, 1530, 1020, 1.5);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Transcrit & Retapé par Banon Vision AI • ${new Date().toLocaleDateString('fr-FR')}`, 90, 1555);

  return canvas.toDataURL('image/jpeg', 0.95);
}
