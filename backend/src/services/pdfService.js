// Polyfill harmless browser graphics classes to keep console clean in Node.js
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {};
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {};
}

import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { OcrService } from './ocrService.js';
import { env } from '../config/env.js';

export class PdfService {
  /**
   * Extracts text page-by-page from a PDF or Image buffer / file path
   * @param {Buffer|string} input - PDF or Image buffer or file path
   * @param {string} mimeType - Optional MIME type
   * @param {Function} [onProgress]
   * @returns {Promise<Array<{ pageNumber: number, text: string }>>}
   */
  static async extractTextWithPages(input, mimeType = null, onProgress = null) {
    let dataBuffer;
    let filePath = null;
    if (typeof input === 'string') {
      filePath = input;
      dataBuffer = fs.readFileSync(input);
      if (!mimeType) mimeType = OcrService.getMimeType(input);
    } else {
      dataBuffer = input;
    }

    // 1. Direct Image Processing (PNG, JPG, JPEG, WEBP)
    if (OcrService.isImage(mimeType) || (filePath && OcrService.isImage(filePath))) {
      console.log(`[PdfService] Processing uploaded image document via OCR (${mimeType || 'image'})...`);
      onProgress?.({
        stage: 'ocr_image',
        progress: 35,
        message: 'Processing document image with Gemini Multimodal Vision OCR...',
      });
      const extractedText = await OcrService.extractTextFromImage(dataBuffer, mimeType || 'image/png');
      onProgress?.({
        stage: 'ocr_complete',
        progress: 55,
        message: 'Document OCR completed. Preparing semantic chunking...',
      });
      return [
        {
          pageNumber: 1,
          text: extractedText || 'No readable text identified in the uploaded image.',
        },
      ];
    }

    // 2. PDF Document Processing
    try {
      onProgress?.({
        stage: 'pdf_parse',
        progress: 25,
        message: 'Parsing PDF document structure, fonts & layout stream...',
      });

      const uint8Array = new Uint8Array(dataBuffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true,
      });

      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      const pages = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        let pageText = '';
        let lastY = null;

        for (const item of textContent.items) {
          const sanitizedStr = (item.str || '').replace(/\u0000/g, '').replace(/\0/g, '');
          if (lastY === item.transform[5] || lastY === null) {
            pageText += (pageText.length > 0 && !pageText.endsWith(' ') && !sanitizedStr.startsWith(' ') ? ' ' : '') + sanitizedStr;
          } else {
            pageText += '\n' + sanitizedStr;
          }
          lastY = item.transform[5];
        }

        const cleanText = pageText.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').trim();
        if (cleanText.length > 0) {
          pages.push({
            pageNumber: pageNum,
            text: cleanText,
          });
        }
      }

      // Check if PDF is a scanned document (empty or low text layer)
      const totalTextLength = pages.reduce((sum, p) => sum + p.text.length, 0);
      if (pages.length === 0 || totalTextLength < 40 * numPages) {
        console.log(`[PdfService] PDF has sparse/empty text layer (${totalTextLength} chars across ${numPages} pages). Running Multimodal Scanned PDF OCR...`);
        onProgress?.({
          stage: 'ocr_pdf',
          progress: 40,
          message: `PDF has sparse text layer. Processing ${numPages} scanned pages with Gemini Multimodal Vision OCR...`,
        });
        const ocrPages = await OcrService.extractTextFromPdf(dataBuffer);
        if (ocrPages && ocrPages.length > 0) {
          onProgress?.({
            stage: 'ocr_complete',
            progress: 55,
            message: `Multimodal Vision OCR successfully transcribed ${ocrPages.length} scanned pages.`,
          });
          return ocrPages;
        }
      }

      if (pages.length === 0) {
        throw new Error('No text could be extracted from the provided PDF document.');
      }

      onProgress?.({
        stage: 'pdf_parsed',
        progress: 50,
        message: `Extracted structured text layer across ${pages.length} PDF pages.`,
      });

      return pages;
    } catch (err) {
      console.warn(`[PdfService] Standard PDF parsing encountered error: ${err.message}. Attempting Multimodal OCR fallback...`);
      onProgress?.({
        stage: 'ocr_fallback',
        progress: 40,
        message: 'Parsing fallback: Processing scanned document with Gemini Multimodal Vision...',
      });
      const ocrPages = await OcrService.extractTextFromPdf(dataBuffer);
      if (ocrPages && ocrPages.length > 0) {
        return ocrPages;
      }
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }

  /**
   * Splits a single piece of text into chunks with overlap
   * @param {string} text
   * @param {number} chunkSize
   * @param {number} chunkOverlap
   * @returns {Array<string>}
   */
  static splitText(text, chunkSize = env.rag.chunkSize, chunkOverlap = env.rag.chunkOverlap) {
    if (!text || text.trim().length === 0) return [];
    const cleanText = text.replace(/\u0000/g, '').replace(/\0/g, '').trim();
    if (cleanText.length <= chunkSize) return [cleanText];

    const separators = ['\n\n', '\n', '. ', '? ', '! ', '; ', ' '];
    const chunks = [];

    const splitRecursively = (str, sepIdx = 0) => {
      if (str.length <= chunkSize || sepIdx >= separators.length) {
        if (str.trim().length > 0) {
          chunks.push(str.trim());
        }
        return;
      }

      const separator = separators[sepIdx];
      const splits = str.split(separator);
      let currentChunk = '';

      for (let i = 0; i < splits.length; i++) {
        const piece = splits[i];
        const nextCombined = currentChunk ? currentChunk + separator + piece : piece;

        if (nextCombined.length <= chunkSize) {
          currentChunk = nextCombined;
        } else {
          if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
          }
          if (piece.length > chunkSize) {
            splitRecursively(piece, sepIdx + 1);
            currentChunk = '';
          } else {
            currentChunk = piece;
          }
        }
      }

      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
    };

    splitRecursively(cleanText);

    // Apply overlap consolidation if needed
    if (chunkOverlap > 0 && chunks.length > 1) {
      const overlappedChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        let chunk = chunks[i];
        if (i > 0) {
          const prevChunk = chunks[i - 1];
          const overlapText = prevChunk.slice(-chunkOverlap);
          if (!chunk.startsWith(overlapText)) {
            chunk = `...${overlapText} ${chunk}`;
          }
        }
        overlappedChunks.push(chunk);
      }
      return overlappedChunks;
    }

    return chunks;
  }

  /**
   * Processes a document (pages list) into indexed semantic chunks
   * @param {Array<{ pageNumber: number, text: string }>} pages
   * @param {object} docMetadata - { documentId, title, category }
   * @returns {Array<object>} Processed chunks ready for vector store
   */
  static processDocumentChunks(pages, docMetadata = {}) {
    const allChunks = [];
    let globalChunkIndex = 0;
    const cleanTitle = (docMetadata.title || 'Untitled Document').replace(/\u0000/g, '').replace(/\0/g, '');
    const cleanCategory = (docMetadata.category || 'General').replace(/\u0000/g, '').replace(/\0/g, '');

    for (const page of pages) {
      const pageText = (page.text || '').replace(/\u0000/g, '').replace(/\0/g, '');
      const pageChunks = this.splitText(pageText, env.rag.chunkSize, env.rag.chunkOverlap);

      for (const chunkContent of pageChunks) {
        const sanitizedContent = chunkContent.replace(/\u0000/g, '').replace(/\0/g, '');
        allChunks.push({
          document_id: docMetadata.documentId,
          content: sanitizedContent,
          chunk_index: globalChunkIndex++,
          page_number: page.pageNumber,
          metadata: {
            document_title: cleanTitle,
            category: cleanCategory,
            char_count: sanitizedContent.length,
            page_number: page.pageNumber,
          },
        });
      }
    }

    return allChunks;
  }
}
