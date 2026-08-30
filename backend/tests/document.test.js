import assert from 'node:assert';
import test from 'node:test';
import http from 'node:http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { startServer } from '../src/server.js';
import { PdfService } from '../src/services/pdfService.js';
import { AuthService } from '../src/services/authService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
const TEST_PORT = 5098;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Helper function to make HTTP requests
async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsedUrl = new URL(url);

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      if (Buffer.isBuffer(options.body)) {
        req.write(options.body);
      } else if (typeof options.body === 'string') {
        req.write(options.body);
      } else {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(options.body));
      }
    }
    req.end();
  });
}

// Helper to create multipart/form-data payload with file
function createMultipartFormData(boundary, fields, fileField) {
  const crlf = '\r\n';
  const parts = [];

  // Add text fields
  for (const [key, value] of Object.entries(fields)) {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${key}"${crlf}${crlf}${value}${crlf}`
      )
    );
  }

  // Add file field
  if (fileField) {
    parts.push(
      Buffer.from(
        `--${boundary}${crlf}Content-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"${crlf}Content-Type: ${fileField.contentType}${crlf}${crlf}`
      )
    );
    parts.push(fileField.buffer);
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));
  return Buffer.concat(parts);
}

test('CampusWise AI - Phase 2: Document Ingestion, PDF Parsing & Chunking Test Suite', async (t) => {
  server = await startServer(TEST_PORT);

  t.after(() => {
    if (server) server.close();
  });

  let adminToken = '';
  let studentToken = '';
  let uploadedDocId = '';

  const samplePdfPath = path.resolve(__dirname, '../sample_data/academic_calendar_2026.pdf');
  const samplePdfBuffer = fs.readFileSync(samplePdfPath);

  await t.test('1. Setup Admin & Student Accounts', async () => {
    const adminRes = await AuthService.register({
      name: 'Admin Document Head',
      email: `admin_doc_${Date.now()}@campus.edu`,
      password: 'AdminPassword123!',
      role: 'admin',
    });
    adminToken = adminRes.token;

    const studentRes = await AuthService.register({
      name: 'Student Reader',
      email: `student_reader_${Date.now()}@campus.edu`,
      password: 'StudentPassword123!',
      role: 'student',
    });
    studentToken = studentRes.token;

    assert.ok(adminToken);
    assert.ok(studentToken);
  });

  await t.test('2. Pure Service: PdfService extracts multi-page text with accurate page numbers', async () => {
    const pages = await PdfService.extractTextWithPages(samplePdfPath);
    assert.ok(pages.length >= 2, 'Should extract at least 2 pages');
    assert.strictEqual(pages[0].pageNumber, 1);
    assert.strictEqual(pages[1].pageNumber, 2);
    assert.match(pages[0].text, /ACADEMIC CALENDAR/i);
    assert.match(pages[0].text, /75% attendance/i);
  });

  await t.test('3. Pure Service: Semantic recursive chunking preserves metadata and overlap', async () => {
    const pages = await PdfService.extractTextWithPages(samplePdfPath);
    const chunks = PdfService.processDocumentChunks(pages, {
      documentId: 'test-doc-123',
      title: 'Academic Calendar 2026',
      category: 'Academics',
    });

    assert.ok(chunks.length > 0);
    assert.strictEqual(chunks[0].document_id, 'test-doc-123');
    assert.strictEqual(chunks[0].metadata.document_title, 'Academic Calendar 2026');
    assert.ok(chunks[0].page_number >= 1);
  });

  await t.test('4. RBAC: Reject Student from uploading documents (403)', async () => {
    const boundary = '----CampusWiseFormBoundary' + Date.now();
    const payload = createMultipartFormData(
      boundary,
      { title: 'Student Upload Attempt', category: 'General' },
      { name: 'file', filename: 'academic_calendar_2026.pdf', contentType: 'application/pdf', buffer: samplePdfBuffer }
    );

    const res = await makeRequest('/api/admin/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${studentToken}`,
      },
      body: payload,
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.error, /Administrator privileges required/i);
  });

  await t.test('5. Admin Upload PDF Document (Multipart Ingestion & Vector Indexing)', async () => {
    const boundary = '----CampusWiseFormBoundary' + Date.now();
    const payload = createMultipartFormData(
      boundary,
      { title: 'Academic Calendar 2026', category: 'Academics' },
      { name: 'file', filename: 'academic_calendar_2026.pdf', contentType: 'application/pdf', buffer: samplePdfBuffer }
    );

    const res = await makeRequest('/api/admin/documents/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `Bearer ${adminToken}`,
      },
      body: payload,
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.document.id);
    assert.strictEqual(res.data.data.document.title, 'Academic Calendar 2026');
    assert.strictEqual(res.data.data.document.category, 'Academics');
    assert.ok(res.data.data.totalChunks > 0);

    uploadedDocId = res.data.data.document.id;
  });

  await t.test('6. List all indexed documents (GET /api/admin/documents)', async () => {
    const res = await makeRequest('/api/admin/documents', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.documents));
    const found = res.data.data.documents.find(d => d.id === uploadedDocId);
    assert.ok(found, 'Uploaded document must be listed');
    assert.strictEqual(found.title, 'Academic Calendar 2026');
  });

  await t.test('7. Get Document by ID with chunks (GET /api/admin/documents/:id)', async () => {
    const res = await makeRequest(`/api/admin/documents/${uploadedDocId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.document.id, uploadedDocId);
    assert.ok(Array.isArray(res.data.data.document.chunks));
    assert.ok(res.data.data.document.chunks.length > 0);
  });

  await t.test('8. Admin Statistics (GET /api/admin/stats)', async () => {
    const res = await makeRequest('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.stats.totalDocuments >= 1);
    assert.ok(res.data.data.stats.totalChunks >= 1);
    assert.ok(res.data.data.stats.categories['Academics'] >= 1);
  });

  await t.test('9. Delete Document with cascading chunks (DELETE /api/admin/documents/:id)', async () => {
    const res = await makeRequest(`/api/admin/documents/${uploadedDocId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    // Verify document no longer exists
    const checkRes = await makeRequest(`/api/admin/documents/${uploadedDocId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(checkRes.status, 404);
  });
});
