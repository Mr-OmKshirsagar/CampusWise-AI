import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { OcrService } from '../src/services/ocrService.js';
import { PdfService } from '../src/services/pdfService.js';
import { DocumentService } from '../src/services/documentService.js';
import { RagService } from '../src/services/ragService.js';
import { UserModel, DocumentModel } from '../src/models/index.js';
import { initDb } from '../src/config/db.js';

describe('CampusWise AI - Multimodal OCR & Scanned Document Ingestion', () => {
  let testAdminUser;
  let ingestedDocument;

  before(async () => {
    await initDb();
    testAdminUser = await UserModel.findByEmail('admin@campuswise.edu');
    if (!testAdminUser) {
      testAdminUser = await UserModel.create({
        name: 'OCR Admin',
        email: 'admin@campuswise.edu',
        password: 'mock_password',
        role: 'admin',
      });
    }
  });

  it('1. Correctly identifies image file extensions and MIME types', () => {
    assert.strictEqual(OcrService.isImage('image/png'), true);
    assert.strictEqual(OcrService.isImage('image/jpeg'), true);
    assert.strictEqual(OcrService.isImage('image/webp'), true);
    assert.strictEqual(OcrService.isImage('document.png'), true);
    assert.strictEqual(OcrService.isImage('notice.jpg'), true);
    assert.strictEqual(OcrService.isImage('application/pdf'), false);
    assert.strictEqual(OcrService.isImage('document.pdf'), false);
  });

  it('2. Identifies scanned/sparse PDF page text', () => {
    assert.strictEqual(OcrService.isScannedPage(''), true);
    assert.strictEqual(OcrService.isScannedPage('   '), true);
    assert.strictEqual(OcrService.isScannedPage('Page 1'), true);
    assert.strictEqual(
      OcrService.isScannedPage('This is a comprehensive academic syllabus for Third Year Computer Science students with extensive course structures and modules.'),
      false
    );
  });

  it('3. Extracts high-fidelity text from a scanned circular image using OCR', async () => {
    const sampleImagePath = path.join(process.cwd(), 'sample_data', 'notice_sample.jpg');
    if (!fs.existsSync(sampleImagePath)) {
      console.warn('Sample notice image not found, skipping extraction assertion.');
      return;
    }

    const extractedText = await OcrService.extractTextFromImage(sampleImagePath, 'image/jpeg');
    console.log('\n--- OCR Extracted Text Sample ---\n', extractedText.slice(0, 300), '...\n');

    assert.ok(extractedText && extractedText.length > 50, 'Extracted text should have content');
    assert.ok(/Library|Exam|Raisoni|GHRCEM/i.test(extractedText), 'Should detect core keywords from the notice image');
  });

  it('4. Successfully ingests, chunks, and indexes a scanned image document', async () => {
    const sampleImagePath = path.join(process.cwd(), 'sample_data', 'notice_sample.jpg');
    if (!fs.existsSync(sampleImagePath)) return;

    const fileStat = fs.statSync(sampleImagePath);
    const mockMulterFile = {
      path: sampleImagePath,
      originalname: 'GHRCEM_Official_Notice_Library_Exam.jpg',
      filename: 'GHRCEM_Official_Notice_Library_Exam.jpg',
      mimetype: 'image/jpeg',
      size: fileStat.size,
    };

    const result = await DocumentService.ingestDocument({
      file: mockMulterFile,
      title: 'GHRCEM Notice - Library Timings & Exam Guidelines',
      category: 'General',
      userId: testAdminUser.id,
    });

    assert.ok(result.document && result.document.id);
    assert.strictEqual(result.totalPages, 1);
    assert.ok(result.totalChunks >= 1, 'Should create at least 1 semantic chunk');
    ingestedDocument = result.document;
  });

  it('5. Chatbot accurately answers questions grounded in the OCR-ingested notice', async () => {
    const query = 'What are the library timings and late book return fine in the notice?';
    const response = await RagService.queryRag({ query });

    console.log('\n--- Chatbot Response to Scanned Notice Query ---\n', response.answer);
    assert.strictEqual(response.isGrounded, true);
    assert.ok(/8:00\s*AM|10:00\s*PM/i.test(response.answer), 'Should include library timings');
    assert.ok(/10/i.test(response.answer), 'Should include late fine amount');
  });
});
