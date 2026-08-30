import assert from 'node:assert';
import test from 'node:test';
import http from 'node:http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { startServer } from '../src/server.js';
import { AuthService } from '../src/services/authService.js';
import { DocumentService } from '../src/services/documentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
const TEST_PORT = 5097;
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
      if (typeof options.body === 'string') {
        req.write(options.body);
      } else {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(options.body));
      }
    }
    req.end();
  });
}

test('CampusWise AI - Phase 3 & 4: Vector Retrieval, RAG Engine & Chat Pipeline Test Suite', async (t) => {
  server = await startServer(TEST_PORT);

  t.after(() => {
    if (server) server.close();
  });

  let studentToken = '';
  let studentUser = null;
  let conversationId = '';

  await t.test('1. Ingest Official College Documents (Academic, Admissions, Hostel)', async () => {
    const adminRes = await AuthService.register({
      name: 'Registrar Office',
      email: `registrar_${Date.now()}@campus.edu`,
      password: 'AdminPassword123!',
      role: 'admin',
    });

    const sampleDir = path.resolve(__dirname, '../sample_data');

    // 1. Academic Calendar
    await DocumentService.ingestDocument({
      file: {
        originalname: 'academic_calendar_2026.pdf',
        filename: 'academic_calendar_2026.pdf',
        path: path.resolve(sampleDir, 'academic_calendar_2026.pdf'),
        size: fs.statSync(path.resolve(sampleDir, 'academic_calendar_2026.pdf')).size,
      },
      title: 'Official Academic Calendar 2026',
      category: 'Academics',
      userId: adminRes.user.id,
    });

    // 2. Admission Guidelines
    await DocumentService.ingestDocument({
      file: {
        originalname: 'admission_guidelines.pdf',
        filename: 'admission_guidelines.pdf',
        path: path.resolve(sampleDir, 'admission_guidelines.pdf'),
        size: fs.statSync(path.resolve(sampleDir, 'admission_guidelines.pdf')).size,
      },
      title: 'Admission Guidelines 2026',
      category: 'Admissions',
      userId: adminRes.user.id,
    });

    // 3. Hostel Regulations
    await DocumentService.ingestDocument({
      file: {
        originalname: 'hostel_regulations.pdf',
        filename: 'hostel_regulations.pdf',
        path: path.resolve(sampleDir, 'hostel_regulations.pdf'),
        size: fs.statSync(path.resolve(sampleDir, 'hostel_regulations.pdf')).size,
      },
      title: 'Hostel Code of Conduct 2026',
      category: 'Hostel',
      userId: adminRes.user.id,
    });

    const stats = await DocumentService.getStats();
    assert.ok(stats.totalDocuments >= 3, 'Must have at least 3 documents indexed');
    assert.ok(stats.totalChunks >= 6, 'Must have indexed semantic chunks');
  });

  await t.test('2. Register Student & Create Chat Conversation Session', async () => {
    const studentRes = await AuthService.register({
      name: 'Rohan Verma',
      email: `rohan_${Date.now()}@campus.edu`,
      password: 'StudentPassword123!',
      role: 'student',
    });
    studentToken = studentRes.token;
    studentUser = studentRes.user;

    const convRes = await makeRequest('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: {
        title: 'Campus Inquiries',
      },
    });

    assert.strictEqual(convRes.status, 201);
    assert.strictEqual(convRes.data.success, true);
    assert.ok(convRes.data.data.conversation.id);
    conversationId = convRes.data.data.conversation.id;
  });

  await t.test('3. Grounded Query: Minimum attendance requirement for examinations', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: {
        query: 'What is the minimum attendance required to appear for examinations?',
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.assistantMessage.content);
    assert.match(res.data.data.assistantMessage.content, /75%/i, 'Must cite 75% attendance requirement');
    assert.ok(res.data.data.sources.length > 0, 'Must provide source citations');
    assert.match(res.data.data.sources[0].document_title, /Academic/i);
    assert.strictEqual(res.data.data.sources[0].page_number, 1);
  });

  await t.test('4. Grounded Query: Hostel curfew timings on weekdays', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: {
        query: 'What are the hostel curfew timings on weekdays?',
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.match(res.data.data.assistantMessage.content, /9:30/i, 'Must cite 9:30 PM curfew');
    assert.ok(res.data.data.sources.length > 0);
    assert.match(res.data.data.sources[0].document_title, /Hostel/i);
  });

  await t.test('5. Grounded Query: B.Tech tuition fee and refund policy', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: {
        query: 'What is the B.Tech tuition fee and admission refund policy?',
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.match(res.data.data.assistantMessage.content, /1,80,000|refund/i);
    assert.ok(res.data.data.sources.length > 0);
    assert.match(res.data.data.sources[0].document_title, /Admission/i);
  });

  await t.test('6. Strict Unknown Handling: Reject out-of-scope questions without hallucination', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
      body: {
        query: 'What is the recipe for baking chocolate brownies in space?',
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    // Anti-hallucination check
    assert.match(
      res.data.data.assistantMessage.content,
      /not available in the uploaded college documents/i,
      'Must trigger anti-hallucination fallback'
    );
  });

  await t.test('7. Multi-Turn Conversation History Retrieval', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.messages.length >= 8, 'Must have recorded questions and assistant answers');
    assert.strictEqual(res.data.data.messages[0].sender, 'user');
    assert.strictEqual(res.data.data.messages[1].sender, 'assistant');
  });

  await t.test('8. Delete Conversation Thread', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);

    // Verify conversation is gone
    const checkRes = await makeRequest(`/api/chat/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    assert.strictEqual(checkRes.status, 404);
  });
});
