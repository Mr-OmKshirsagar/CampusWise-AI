import assert from 'node:assert';
import test from 'node:test';
import http from 'node:http';
import app, { startServer } from '../src/server.js';
import { AuthService } from '../src/services/authService.js';
import { adminMiddleware } from '../src/middleware/adminMiddleware.js';

let server;
const TEST_PORT = 5099;
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
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
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
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

test('CampusWise AI - Phase 1: Foundation & Authentication Test Suite', async (t) => {
  // Start server before tests
  server = await startServer(TEST_PORT);

  t.after(() => {
    if (server) server.close();
  });

  let studentToken = '';
  let adminToken = '';
  const testStudentEmail = `student_${Date.now()}@campus.edu`;
  const testAdminEmail = `admin_${Date.now()}@campus.edu`;
  const testPassword = 'SecurePassword123!';

  await t.test('1. Health Check Endpoint (/api/health)', async () => {
    const res = await makeRequest('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
    assert.ok(res.data.timestamp);
    assert.ok(res.data.dbAdapter);
  });

  await t.test('2. Student Registration with valid credentials', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Aarav Sharma',
        email: testStudentEmail,
        password: testPassword,
        role: 'student',
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, testStudentEmail.toLowerCase());
    assert.strictEqual(res.data.data.user.role, 'student');
    assert.strictEqual(res.data.data.user.password, undefined, 'Password hash must never be returned');
    assert.ok(res.data.data.token, 'Must return JWT token');
    studentToken = res.data.data.token;
  });

  await t.test('3. Admin Registration', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Dean Administration',
        email: testAdminEmail,
        password: testPassword,
        role: 'admin',
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.role, 'admin');
    assert.ok(res.data.data.token);
    adminToken = res.data.data.token;
  });

  await t.test('4. Prevent Duplicate Email Registration', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Duplicate Aarav',
        email: testStudentEmail,
        password: 'AnotherPassword123',
      },
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.error, /already exists/i);
  });

  await t.test('5. Reject Registration with Weak Password (< 6 chars)', async () => {
    const res = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Short Pass',
        email: `short_${Date.now()}@campus.edu`,
        password: '123',
      },
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.match(res.data.error, /at least 6 characters/i);
  });

  await t.test('6. User Login with valid credentials', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: testStudentEmail,
        password: testPassword,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, testStudentEmail.toLowerCase());
    assert.ok(res.data.data.token);
  });

  await t.test('7. Reject Login with invalid password', async () => {
    const res = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: testStudentEmail,
        password: 'WrongPassword999',
      },
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await t.test('8. Protected Profile Route (/api/auth/me) with valid token', async () => {
    const res = await makeRequest('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.email, testStudentEmail.toLowerCase());
  });

  await t.test('9. Reject Protected Route without token', async () => {
    const res = await makeRequest('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await t.test('10. RBAC Unit Check: Admin vs Student Roles', () => {
    const studentUser = { id: 's1', role: 'student' };
    const adminUser = { id: 'a1', role: 'admin' };

    let studentAllowed = false;
    const reqStudent = { user: studentUser };
    const resStudent = {
      status: (code) => ({
        json: (data) => {
          assert.strictEqual(code, 403);
          assert.match(data.error, /Administrator privileges required/i);
        },
      }),
    };
    adminMiddleware(reqStudent, resStudent, () => { studentAllowed = true; });
    assert.strictEqual(studentAllowed, false, 'Student must not pass adminMiddleware');

    let adminAllowed = false;
    const reqAdmin = { user: adminUser };
    const resAdmin = {};
    adminMiddleware(reqAdmin, resAdmin, () => { adminAllowed = true; });
    assert.strictEqual(adminAllowed, true, 'Admin must pass adminMiddleware');
  });
});
