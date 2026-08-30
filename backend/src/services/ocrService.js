import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';
import { env } from '../config/env.js';

export class OcrService {
  /**
   * Checks if a MIME type or file extension is an image
   * @param {string} mimeOrExt
   * @returns {boolean}
   */
  static isImage(mimeOrExt) {
    if (!mimeOrExt) return false;
    const lower = mimeOrExt.toLowerCase();
    return (
      lower.includes('image/') ||
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.webp')
    );
  }

  /**
   * Determines MIME type from file extension
   */
  static getMimeType(filePath) {
    const ext = path.extname(filePath || '').toLowerCase();
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      case '.pdf':
        return 'application/pdf';
      default:
        return 'image/png';
    }
  }

  /**
   * Checks if extracted PDF page text represents a scanned/image page
   * @param {string} text
   * @returns {boolean}
   */
  static isScannedPage(text) {
    return !text || text.trim().length < 40;
  }

  /**
   * Extracts text from an image buffer using Gemini Multimodal Vision or Tesseract OCR fallback
   * @param {Buffer|string} input - Image buffer or file path
   * @param {string} mimeType - e.g. 'image/png', 'image/jpeg'
   * @returns {Promise<string>} Transcribed text with human-readable dates
   */
  static async extractTextFromImage(input, mimeType = 'image/png') {
    let buffer;
    if (typeof input === 'string') {
      buffer = fs.readFileSync(input);
      mimeType = this.getMimeType(input);
    } else {
      buffer = input;
    }

    // 1. High-Precision Google Gemini Vision OCR
    if (env.ai.geminiApiKey && env.ai.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: env.ai.geminiModel });

        const imagePart = {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: mimeType.startsWith('image/') ? mimeType : 'image/png',
          },
        };

        const prompt = `You are a high-precision OCR and document analysis engine for college documents.
Transcribe and extract ALL text, tables, academic calendars, semester dates, holidays, signatures, stamps, and guidelines from this document image.
CRITICAL FORMATTING RULES:
1. Format all dates in clear, human-readable format (e.g. "June 15, 2026", "November 13, 2026 to November 30, 2026") alongside their corresponding academic events.
2. For calendar tables, ensure EVERY row has its full Month and Year filled in clearly.
3. NEVER use LaTeX math notation (e.g. do NOT write "$08^{\\text{th}}$" or "$\\text{to}$"). Write plain text like "June 8, 2026 to June 13, 2026".
4. Timetable & Schedule Grid Preservation: Accurately preserve all table headers, rows, columns, and grid relationships in clean Markdown table format. For class timetables, examination schedules, or event calendars, transcribe the exact time slots (e.g. "10:00 AM - 11:00 AM", "11:30 AM - 12:30 PM", "02:00 PM - 03:00 PM", "03:30 PM - 04:30 PM"), shift divisions (Morning Shift vs Evening Shift), lecture periods, lab/practical sessions, and breaks (Lunch Break, Short Break, Recess) without omitting any timing or interval.
5. Official Stamps, Seals & Signatures: Accurately transcribe any official rubber stamps, circular institutional seals, approval marks, date stamps, and authority signatures (e.g. "[Official Stamp/Seal: G H Raisoni College of Engineering and Management, Pune]", "[Signed by: Dr. Amit Gupta, Head of Department]").
6. Preserve table and paragraph structure cleanly in Markdown format.
7. Do NOT include commentary, greetings, or explanations—output ONLY the transcribed document content.`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        if (responseText && responseText.trim().length > 0) {
          console.log('[OcrService] Successfully extracted text using Gemini Vision OCR.');
          return responseText.trim();
        }
      } catch (err) {
        console.warn(`[OcrService] Gemini Vision OCR failed: ${err.message}. Failing over to backup OCR engines...`);
      }
    }

    // 2. xAI Grok Vision OCR Fallback
    if (env.ai.grokApiKey && env.ai.grokApiKey !== 'your_grok_api_key_here') {
      try {
        console.log('[OcrService] Performing cloud OCR with xAI Grok Vision...');
        const grok = new OpenAI({
          apiKey: env.ai.grokApiKey,
          baseURL: 'https://api.x.ai/v1',
        });
        const base64Data = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Data}`;
        const prompt = `You are a high-precision OCR and document analysis engine for college documents.
Transcribe and extract ALL text, tables, academic calendars, semester dates, holidays, signatures, stamps, and guidelines from this document image.
1. Format all dates in clear, human-readable format (e.g. "June 15, 2026").
2. Accurately transcribe any official rubber stamps, circular institutional seals, approval marks, date stamps, and authority signatures.
3. Preserve table and paragraph structure cleanly in Markdown format.
4. Output ONLY the transcribed document content.`;

        const response = await grok.chat.completions.create({
          model: 'grok-2-vision-latest',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
        });

        if (response.choices && response.choices[0]?.message?.content) {
          console.log('[OcrService] Successfully extracted text using Grok Vision OCR.');
          return response.choices[0].message.content.trim();
        }
      } catch (err) {
        console.warn(`[OcrService] Grok Vision OCR failed: ${err.message}. Falling back to Tesseract OCR.`);
      }
    }

    // 2. Offline / Local Fallback via Tesseract.js
    try {
      console.log('[OcrService] Performing local OCR with Tesseract.js...');
      const worker = await createWorker('eng');
      const ret = await worker.recognize(buffer);
      await worker.terminate();

      const extractedText = ret.data.text ? ret.data.text.trim() : '';
      console.log(`[OcrService] Tesseract extracted ${extractedText.length} characters.`);
      return extractedText;
    } catch (err) {
      console.error(`[OcrService] Tesseract OCR failed: ${err.message}`);
      return '';
    }
  }

  /**
   * Extracts page-by-page text from a scanned PDF buffer using Gemini Multimodal Vision
   * @param {Buffer|string} input - PDF buffer or file path
   * @returns {Promise<Array<{ pageNumber: number, text: string }>>}
   */
  static async extractTextFromPdf(input) {
    let buffer;
    if (typeof input === 'string') {
      buffer = fs.readFileSync(input);
    } else {
      buffer = input;
    }

    if (env.ai.geminiApiKey && env.ai.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        console.log('[OcrService] Processing scanned PDF with Gemini Multimodal Vision...');
        const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: env.ai.geminiModel });

        const pdfPart = {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        };

        const prompt = `You are a high-precision OCR and document analysis engine for college documents.
Transcribe and extract ALL text, tables, academic calendars, semester dates, holidays, signatures, stamps, and guidelines from this scanned PDF document.
CRITICAL FORMATTING RULES:
1. Format all dates in clear, human-readable format (e.g. "June 15, 2026", "November 13, 2026 to November 30, 2026") alongside their corresponding academic events.
2. For calendar tables, ensure EVERY row has its full Month and Year filled in clearly.
3. NEVER use LaTeX math notation (e.g. do NOT write "$08^{\\text{th}}$"). Write plain text like "June 8, 2026 to June 13, 2026".
4. Timetable & Schedule Grid Preservation: Accurately preserve all table headers, rows, columns, and grid relationships in clean Markdown table format. For class timetables, examination schedules, or event calendars, transcribe the exact time slots (e.g. "10:00 AM - 11:00 AM", "11:30 AM - 12:30 PM", "02:00 PM - 03:00 PM", "03:30 PM - 04:30 PM"), shift divisions (Morning Shift vs Evening Shift), lecture periods, lab/practical sessions, and breaks (Lunch Break, Short Break, Recess) without omitting any timing or interval.
5. Official Stamps, Seals & Signatures: Accurately transcribe any official rubber stamps, circular institutional seals, approval marks, date stamps, and authority signatures (e.g. "[Official Stamp/Seal: G H Raisoni College of Engineering and Management, Pune]", "[Signed by: Dr. N. U. Korde, Dean Academics]").
6. Organize page by page with explicit "--- PAGE X ---" headers (e.g. "--- PAGE 1 ---", "--- PAGE 2 ---").
7. Output ONLY the transcribed document content.`;

        const result = await model.generateContent([prompt, pdfPart]);
        const responseText = result.response.text();

        if (responseText && responseText.trim().length > 0) {
          const rawPages = responseText.split(/---\s*PAGE\s+(\d+)\s*---/i);
          const parsedPages = [];

          if (rawPages.length > 1) {
            for (let i = 1; i < rawPages.length; i += 2) {
              const pageNum = parseInt(rawPages[i], 10) || Math.floor(i / 2) + 1;
              const content = (rawPages[i + 1] || '').trim();
              if (content.length > 0) {
                parsedPages.push({ pageNumber: pageNum, text: content });
              }
            }
          }

          if (parsedPages.length > 0) {
            console.log(`[OcrService] Successfully extracted ${parsedPages.length} pages from scanned PDF.`);
            return parsedPages;
          }

          // If no page split tags were found, return the whole document as page 1
          return [{ pageNumber: 1, text: responseText.trim() }];
        }
      } catch (err) {
        console.error(`[OcrService] Gemini PDF OCR failed: ${err.message}`);
      }
    }

    return [];
  }
}
