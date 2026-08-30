import assert from 'node:assert';
import test, { describe, before, after } from 'node:test';
import http from 'node:http';
import { startServer } from '../src/server.js';
import { AuthService } from '../src/services/authService.js';
import { ChatService } from '../src/services/chatService.js';

let server;
const TEST_PORT = 5096;
const BASE_URL = `http://localhost:${TEST_PORT}`;

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
          body: json,
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

describe('CampusWise AI - Chat Renaming and Deletion API Suite', () => {
  let studentToken = null;
  let studentUser = null;
  let conversationId = null;

  before(async () => {
    server = await startServer(TEST_PORT);

    // Register or Login user
    const email = `student_rename_${Date.now()}@campuswise.edu`;
    const regRes = await AuthService.register({
      name: 'Rename Test User',
      email,
      password: 'Student@1234',
      role: 'student',
    });
    studentToken = regRes.token;
    studentUser = regRes.user;
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  test('1. Create new conversation thread', async () => {
    const res = await makeRequest('/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: { title: 'Old Chat Title' },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    conversationId = res.body.data.conversation.id;
    assert.strictEqual(res.body.data.conversation.title, 'Old Chat Title');
  });

  test('2. PATCH /api/chat/conversations/:id renames the conversation', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: { title: 'TY CS Timetable & Electives Discussion' },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.conversation.title, 'TY CS Timetable & Electives Discussion');
  });

  test('3. GET /api/chat/conversations reflects updated conversation title', async () => {
    const res = await makeRequest('/api/chat/conversations', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    const found = res.body.data.conversations.find(c => c.id === conversationId);
    assert.ok(found);
    assert.strictEqual(found.title, 'TY CS Timetable & Electives Discussion');
  });

  test('4. DELETE /api/chat/conversations/:id deletes conversation and its history', async () => {
    const res = await makeRequest(`/api/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    const getRes = await makeRequest(`/api/chat/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.strictEqual(getRes.status, 404);
  });
});
