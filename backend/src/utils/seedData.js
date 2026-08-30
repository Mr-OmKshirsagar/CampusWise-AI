import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from '../config/db.js';
import { AuthService } from '../services/authService.js';
import { DocumentService } from '../services/documentService.js';
import { UserModel, DocumentModel } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  await initDb();

  console.log('[Seed] Seeding default accounts and official college PDFs...');

  // 1. Create default admin if not exists
  let admin = await UserModel.findByEmail('admin@campus.edu');
  if (!admin) {
    const adminRes = await AuthService.register({
      name: 'Campus Administrator',
      email: 'admin@campus.edu',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    admin = adminRes.user;
    console.log('[Seed] Created default admin account (admin@campus.edu / AdminPassword123!)');
  } else {
    console.log('[Seed] Admin account already exists.');
  }

  // 2. Create default student if not exists
  let student = await UserModel.findByEmail('student@campus.edu');
  if (!student) {
    const studentRes = await AuthService.register({
      name: 'Aarav Sharma',
      email: 'student@campus.edu',
      password: 'StudentPassword123!',
      role: 'student',
    });
    student = studentRes.user;
    console.log('[Seed] Created default student account (student@campus.edu / StudentPassword123!)');
  } else {
    console.log('[Seed] Student account already exists.');
  }

  // 3. Ingest sample documents if not already present
  const sampleDir = path.resolve(__dirname, '../../sample_data');
  const existingDocs = await DocumentModel.findAll();

  const documentsToSeed = [
    {
      file: 'academic_calendar_2026.pdf',
      title: 'Official Academic Calendar 2026',
      category: 'Academics',
    },
    {
      file: 'admission_guidelines.pdf',
      title: 'Admission Guidelines & Fee Policy 2026',
      category: 'Admissions',
    },
    {
      file: 'hostel_regulations.pdf',
      title: 'Hostel Code of Conduct & Rules 2026',
      category: 'Hostel',
    },
  ];

  for (const item of documentsToSeed) {
    const exists = existingDocs.some(d => d.title === item.title || d.filename === item.file);
    if (!exists) {
      const filePath = path.resolve(sampleDir, item.file);
      if (fs.existsSync(filePath)) {
        await DocumentService.ingestDocument({
          file: {
            originalname: item.file,
            filename: item.file,
            path: filePath,
            size: fs.statSync(filePath).size,
          },
          title: item.title,
          category: item.category,
          userId: admin.id,
        });
        console.log(`[Seed] Ingested & indexed ${item.title}`);
      }
    } else {
      console.log(`[Seed] ${item.title} already indexed.`);
    }
  }

  const stats = await DocumentService.getStats();
  console.log('[Seed] Complete! Total documents indexed:', stats.totalDocuments, 'Total vector chunks:', stats.totalChunks);
}

seed().catch(console.error);
