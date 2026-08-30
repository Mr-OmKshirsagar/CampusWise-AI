import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleDir = path.resolve(__dirname, '../../sample_data');

if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

async function createPdf(pagesData) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const pageInfo of pagesData) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;

    // Header Title
    page.drawText(pageInfo.title, {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0.1, 0.2, 0.5),
    });
    y -= 25;

    // Subtitle
    if (pageInfo.subtitle) {
      page.drawText(pageInfo.subtitle, {
        x: 50,
        y,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 25;
    }

    // Body lines
    for (const line of pageInfo.lines) {
      if (y < 60) {
        // Safety margin
        break;
      }
      if (line === '') {
        y -= 12;
        continue;
      }

      const isHeading = line.startsWith('###') || line.match(/^[0-9]+\./);
      page.drawText(line.replace(/^###\s*/, ''), {
        x: 50,
        y,
        size: isHeading ? 11 : 10,
        font: isHeading ? boldFont : font,
        color: isHeading ? rgb(0.1, 0.1, 0.1) : rgb(0.2, 0.2, 0.2),
      });
      y -= 18;
    }

    // Page footer
    page.drawText(`Page ${pageInfo.pageNumber} | CampusWise AI Official Institutional Records`, {
      x: 50,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return Buffer.from(pdfBytes);
}

async function generateAll() {
  // 1. Academic Calendar 2026
  const academicCalendar = await createPdf([
    {
      pageNumber: 1,
      title: 'CAMPUSWISE UNIVERSITY - ACADEMIC CALENDAR 2026',
      subtitle: 'Spring Semester Key Dates and Examination Regulations',
      lines: [
        '1. Semester Commencement: January 12, 2026 for all undergraduate and postgraduate programs.',
        '2. Course Registration Deadline: January 19, 2026 without late fee.',
        '3. Late Registration with INR 1000 penalty: January 20 to January 24, 2026.',
        '4. Mid-Semester Examinations: March 16, 2026 to March 23, 2026.',
        '5. Minimum Attendance Requirement: Students must maintain at least 75% attendance in each enrolled course.',
        'Students with attendance between 65% and 74% may apply for condonation with valid medical certification.',
        'Students with attendance below 65% are strictly debarred from appearing in end-semester examinations.',
        '6. Spring Recess & Cultural Fest (Aura 2026): April 6, 2026 to April 12, 2026.',
        '7. Last Day of Instruction: May 5, 2026.',
      ],
    },
    {
      pageNumber: 2,
      title: 'CAMPUSWISE UNIVERSITY - ACADEMIC CALENDAR 2026',
      subtitle: 'End-Semester Assessments, Internships and Fall Schedule',
      lines: [
        '1. End-Semester Practical Examinations: May 11, 2026 to May 18, 2026.',
        '2. End-Semester Theory Examinations: May 22, 2026 to June 10, 2026.',
        '3. Mandatory Summer Internship Period: June 15, 2026 to July 31, 2026 (45 days minimum).',
        '4. Declaration of Spring Results: July 10, 2026 on the student ERP portal.',
        '5. Grade Grievance Redressal: Revaluation requests must be filed within 7 days of result publication.',
        'The revaluation fee is INR 500 per course module.',
        '6. Fall Semester Registration & Reopening: August 10, 2026.',
      ],
    },
  ]);

  // 2. Admission Guidelines
  const admissionGuidelines = await createPdf([
    {
      pageNumber: 1,
      title: 'CAMPUSWISE INSTITUTE - ADMISSION GUIDELINES 2026-27',
      subtitle: 'Eligibility Criteria, Entrance Exams & Application Procedure',
      lines: [
        '1. B.Tech Admissions: Passed 10+2 with Physics, Mathematics, and Chemistry with minimum 60% aggregate.',
        'Valid score in JEE Main or State Engineering Entrance Examination is required.',
        '2. M.Tech Admissions: Valid GATE scorecard with B.E./B.Tech degree with minimum CGPA of 6.5 or 60% marks.',
        '3. MBA Admissions: Any recognized Bachelor degree with 50% marks and CAT / MAT / CMAT percentile of 70+.',
        '4. Application Fee: Non-refundable fee of INR 1,200 for General category and INR 600 for Reserved categories.',
        '5. Required Documents: 10th & 12th Marksheets, Transfer Certificate, Migration Certificate, and Aadhaar Card.',
      ],
    },
    {
      pageNumber: 2,
      title: 'CAMPUSWISE INSTITUTE - ADMISSION GUIDELINES 2026-27',
      subtitle: 'Fee Schedule, Scholarships and Fee Refund Policy',
      lines: [
        '1. Annual Tuition Fee: B.Tech annual tuition fee is INR 1,80,000 payable in two equal semester installments.',
        '2. Security Caution Deposit: A refundable deposit of INR 10,000 is collected at the time of admission.',
        '3. Official Admission Cancellation Refund Policy:',
        '- Cancellation 15 days or more before orientation: 100% refund less INR 1,000 processing fee.',
        '- Cancellation less than 15 days before orientation: 90% refund of total tuition fee.',
        '- Cancellation within 15 days after classes commence: 80% refund of tuition fee.',
        '- Cancellation after 30 days of semester start: Only refundable caution deposit is returned.',
        '4. Merit Scholarships: Top 5% ranking entrance exam scorers receive a 50% tuition fee waiver.',
      ],
    },
  ]);

  // 3. Hostel Regulations
  const hostelRegulations = await createPdf([
    {
      pageNumber: 1,
      title: 'CAMPUSWISE RESIDENTIAL SERVICES - HOSTEL RULES 2026',
      subtitle: 'Code of Conduct, Curfew Hours and Amenities',
      lines: [
        '1. Curfew Timings: All hostel residents must return inside hostel gates by 9:30 PM on weekdays.',
        'On Saturdays and Sundays, curfew is extended up to 10:30 PM with prior warden permission.',
        '2. Biometric Attendance: Daily attendance is recorded at 9:45 PM using fingerprint scanners.',
        'Three unexcused absences result in immediate parental notification and disciplinary inquiry.',
        '3. Room Allotment: First year students receive double or triple sharing AC/Non-AC rooms.',
        '4. Prohibited Electrical Appliances: Heaters, electric kettles, induction stoves, and irons are prohibited in rooms.',
        '5. Quiet Hours: Maintained between 11:00 PM and 6:00 AM across all residential wings.',
      ],
    },
    {
      pageNumber: 2,
      title: 'CAMPUSWISE RESIDENTIAL SERVICES - HOSTEL RULES 2026',
      subtitle: 'Dining Hall Timings, Visitors and Hostel Fee Refund Rules',
      lines: [
        '1. Mess Timings: Breakfast: 7:30 AM - 9:00 AM, Lunch: 12:30 PM - 2:00 PM, Dinner: 7:30 PM - 9:00 PM.',
        '2. Visitor Regulations: Visitors are permitted in the central lounge between 10:00 AM and 6:00 PM only.',
        'No external guests or parents are allowed to stay overnight inside hostel rooms.',
        '3. Hostel Fees: AC Room is INR 1,20,000 per year; Non-AC Room is INR 85,000 per year (includes 4 meals daily).',
        '4. Hostel Fee Refund Policy:',
        '- Cancellation before room occupancy: 100% refund minus INR 2,000 administrative fee.',
        '- Cancellation within 30 days of occupancy: 50% of remaining semester hostel fee refunded.',
        '- Cancellation after 30 days of occupancy: No refund granted for the ongoing semester.',
      ],
    },
  ]);

  fs.writeFileSync(path.resolve(sampleDir, 'academic_calendar_2026.pdf'), academicCalendar);
  fs.writeFileSync(path.resolve(sampleDir, 'admission_guidelines.pdf'), admissionGuidelines);
  fs.writeFileSync(path.resolve(sampleDir, 'hostel_regulations.pdf'), hostelRegulations);

  console.log('[Sample Data] Successfully created valid multi-page PDF files in:', sampleDir);
}

generateAll().catch(console.error);
