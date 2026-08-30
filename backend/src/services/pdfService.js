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
   * @returns {Promise<Array<{ pageNumber: number, text: string }>>}
   */
  static async extractTextWithPages(input, mimeType = null) {
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
      const extractedText = await OcrService.extractTextFromImage(dataBuffer, mimeType || 'image/png');
      return [
        {
          pageNumber: 1,
          text: extractedText || 'No readable text identified in the uploaded image.',
        },
      ];
    }

    // 2. PDF Document Processing
    try {
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
          if (lastY === item.transform[5] || lastY === null) {
            pageText += (pageText.length > 0 && !pageText.endsWith(' ') && !item.str.startsWith(' ') ? ' ' : '') + item.str;
          } else {
            pageText += '\n' + item.str;
          }
          lastY = item.transform[5];
        }

        const cleanText = pageText.replace(/[ \t]+/g, ' ').trim();
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
        const ocrPages = await OcrService.extractTextFromPdf(dataBuffer);
        if (ocrPages && ocrPages.length > 0) {
          return ocrPages;
        }
      }

      if (pages.length === 0) {
        throw new Error('No text could be extracted from the provided PDF document.');
      }

      return pages;
    } catch (err) {
      console.warn(`[PdfService] Standard PDF parsing encountered error: ${err.message}. Attempting Multimodal OCR fallback...`);
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
    if (text.length <= chunkSize) return [text.trim()];

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

    splitRecursively(text);

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

    for (const page of pages) {
      const pageChunks = this.splitText(page.text, env.rag.chunkSize, env.rag.chunkOverlap);

      for (const chunkContent of pageChunks) {
        allChunks.push({
          document_id: docMetadata.documentId,
          content: chunkContent,
          chunk_index: globalChunkIndex++,
          page_number: page.pageNumber,
          metadata: {
            document_title: docMetadata.title || 'Untitled Document',
            category: docMetadata.category || 'General',
            char_count: chunkContent.length,
            page_number: page.pageNumber,
          },
        });
      }
    }

    return allChunks;
  }
}
