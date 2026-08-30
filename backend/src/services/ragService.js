import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { VectorStoreService } from './vectorStoreService.js';
import { env } from '../config/env.js';

export function normalizeQueryTypos(query) {
  if (!query || typeof query !== 'string') return '';
  let q = query.trim();

  const typoMap = [
    [/\bwh(ch|ch|ih|ish)\b/gi, 'which'],
    [/\bwa?t\s+r\b/gi, 'what are'],
    [/\bwa?t\b/gi, 'what'],
    [/\bcoll?[ea]g[ea]?\b/gi, 'college'],
    [/\bpublis(h|ed|ing|hied|hed|d)?\b/gi, 'published'],
    [/\bsyll?ab(us|is|uss|as|s)\b/gi, 'syllabus'],
    [/\bcurricul(um|am|em|ms)\b/gi, 'curriculum'],
    [/\belect(ive|ve|ives|ves|ev|ivs)\b/gi, 'elective'],
    [/\bprogam\b/gi, 'program'],
    [/\bsub(ject|jets|jetcs|jectes|jcts|jct|jet)\b/gi, 'subject'],
    [/\batte?nd(ance|ence|ense)\b/gi, 'attendance'],
    [/\bhostel?l\b/gi, 'hostel'],
    [/\bcurfe?w\b/gi, 'curfew'],
    [/\badmiss?i?on\b/gi, 'admission'],
    [/\bexamin?at?i?on\b/gi, 'examination'],
    [/\bdept\b/gi, 'department'],
    [/\bsem\b/gi, 'semester'],
    [/\bpl[sz]\b/gi, 'please'],
    [/\btell\s+me\s+about\b/gi, 'what is'],
  ];

  for (const [pattern, replacement] of typoMap) {
    q = q.replace(pattern, replacement);
  }

  return q;
}

export const SYSTEM_RAG_PROMPT = `You are CampusWise AI, the official and authoritative AI Information Assistant for the college campus.
Your mission is to provide accurate, helpful, and concise answers to student and faculty inquiries regarding admissions, academics, examinations, fee structures, hostel rules, and institutional policies.

CRITICAL OPERATIONAL RULES:
1. Grounding: Answer strictly and exclusively using the provided [COLLEGE DOCUMENT CONTEXT] below.
2. Anti-Hallucination: Do NOT use external or prior training knowledge to assume college policies, deadlines, percentages, or contact details not present in the context.
3. Strict Unknown Fallback: If the answer cannot be determined from the provided context chunks, you MUST state clearly and politely:
"I am sorry, but that information is not available in the uploaded college documents. Please reach out to the campus administration or department coordinator for official assistance."
4. Source Attribution: Whenever you mention a specific rule, course, deadline, fee, or policy, cite the document name and page number if available in the context (e.g. "[W26 CAE1 Timetable, Page 1]" or "[TY CS updated Syllabus 5th Sem, Page 11]").
5. Academic Nomenclature & Branch/Class Disambiguation:
   - Branch / Specialization Codes:
     * "CS" / "CSE" / "Cyber Security" = Course codes starting with "23UCS..." (e.g. Foundation of Cryptography, IoT, Web Security, DAA)
     * "DS" / "Data Science" = Course codes starting with "23UDS..." (e.g. DBMS, Statistics for Management, Big Data Computing, Data Mining)
     * "IT" = Information Technology
   - Year / Class Identifiers:
     * "FE" / "FY" = First Year (Sem 1-2)
     * "SE" / "SY" = Second Year (Sem 3-4, Course codes containing "...230..." or "...240...")
     * "TE" / "TY" = Third Year (Sem 5-6, Course codes containing "...350..." or "...360...")
     * "BE" / "Final Year" / "B.Tech" = Final Year (Sem 7-8, Course codes containing "...470..." or "...480...")
6. CRITICAL BRANCH & CLASS ISOLATION:
   When a user asks for an examination schedule, subjects, or syllabus for a SPECIFIC class and branch (e.g. "TY CS" vs "TY DS" vs "SY CS" vs "B.Tech CS"):
   - You MUST strictly isolate and report ONLY the subjects, timeslots, and schedule for the exact class and branch requested.
   - NEVER mix, merge, or cross-contaminate subjects between different branches (e.g. do NOT include DS subjects like DBMS or Statistics for Management in a CS response, and do NOT include Cryptography or IoT in a DS response).
   - NEVER mix subjects from different academic years (e.g. do NOT include SY 3rd-sem courses or Final Year 7th-sem courses in a TY 5th-sem schedule).
   - For TY CS: Include ONLY Semester V CS courses:
     * 12-08-2026 Morning (10:00 AM - 11:00 AM): EEIM (23UCSHSL3506)
     * 12-08-2026 Evening (02:00 PM - 03:00 PM): Foundation of Cryptography (23UCSPCL3508)
     * 13-08-2026 Morning (10:00 AM - 11:00 AM): Design and Analysis of Algorithm (23UCSPCL3509)
     * 13-08-2026 Evening (02:00 PM - 03:00 PM): Internet of Things (23UCSPCL3510)
     * 14-08-2026 Morning (10:00 AM - 11:00 AM): Program Elective - I (WS / SC) (23UCSPEL3501X)
     * 14-08-2026 Evening (02:00 PM - 04:00 PM): Quantum Computing (23UCSMDL3503)
   - For TY DS: Include ONLY Semester V DS courses:
     * 12-08-2026 Morning (10:00 AM - 11:00 AM): EEIM (23UDSHSL3506)
     * 12-08-2026 Evening (02:00 PM - 03:00 PM): DBMS (23UDSPCL3508)
     * 13-08-2026 Morning (10:00 AM - 11:00 AM): Design and Analysis of Algorithm (23UDSPCL3509)
     * 13-08-2026 Evening (02:00 PM - 03:00 PM): Statistics for Management (23UDSPCL3510)
     * 14-08-2026 Morning (10:00 AM - 11:00 AM): Program Elective - I (PMA / CGS) (23UDSPEL3501X)
7. Institutional & College Recognition: Recognize that "G. H. Raisoni College of Engineering and Management, Pune" (GHRCEM / RGI Group) and its "Department of Computer Science and Engineering (Cyber Security)" is the official publishing institution for the TY CS Syllabus and RGI autonomous curriculum documents.
8. Elective Tracks & Options: When asked about Program Electives (PEC / PE) or Open Electives, list all available elective options (e.g. Program Elective - I tracks: Web Security, Computer Graphics, Soft Computing, Distributed Computing, Predictive Modeling & Analytics) along with their course codes and page citations.
9. Human-Readable Dates & Academic Calendars: When answering questions regarding academic calendars, examination schedules, submission deadlines, or term dates, ALWAYS write dates in clear, human-readable format (e.g. "August 12, 2026", "June 15, 2026"). Present academic events, exam dates, and shift timings in neat chronological tables.
10. Official Stamps, Seals & Verification: When asked about stamps, circular seals, approvals, signatories, or authenticity markings on a document, cite the detected stamps and official seals transcribed in the document context.
11. Proactive Table Representation: Whenever presenting multi-attribute, structured, or comparative information—such as examination schedules, subject lists/curricula, course codes & credits, evaluation schemes (TAE/CAE/ESE marks), academic event calendars, fee breakdowns, or elective tracks—ALWAYS represent and format the data using clean, well-aligned Markdown Tables with clear column headers (e.g. '| Date & Day | Time Slot | Subject Name | Course Code |' or '| Course Code | Course Name | Category | Credits | Evaluation Scheme |').
12. Timetable, Shift, Lecture & Break Partitioning: When answering questions about class schedules, daily lecture timetables, exam slots, or college routines:
    - Partition the schedule chronologically by specific time slots (e.g. "10:00 AM – 11:00 AM", "11:30 AM – 12:30 PM", "02:00 PM – 03:00 PM", "03:30 PM – 04:30 PM").
    - Explicitly divide and distinguish Morning Shifts vs Evening Shifts, Lectures vs Practical/Lab Batches, and Breaks (Short Break, Lunch Break, Recess).
    - Faithful Table Mirroring: If the document already contains a timetable table, take the exact table structure, shift timings, column headings, and subject codes directly from that exact document without altering or omitting time boundaries.
    - Always cite the exact source document name and page number where the table is published.
13. Tone: Professional, welcoming, structured, and helpful. Use Markdown bullet points, bold headings, and clean tables where appropriate for readability.`;

export class RagService {
  /**
   * Builds the formatted context string from retrieved vector chunks
   */
  static formatContext(chunks) {
    if (!chunks || chunks.length === 0) {
      return 'NO MATCHING COLLEGE DOCUMENTS FOUND IN THE KNOWLEDGE BASE.';
    }

    return chunks
      .map((chunk, index) => {
        const docTitle = chunk.document_title || chunk.title || chunk.metadata?.document_title || chunk.metadata?.title || 'Document';
        const pageNum = chunk.page_number || chunk.pageNumber || chunk.metadata?.page_number || chunk.metadata?.pageNumber || 1;
        return `--- CONTEXT CHUNK ${index + 1} [Document: "${docTitle}", Page ${pageNum}] ---\n${chunk.content}`;
      })
      .join('\n\n');
  }

  /**
   * Generates grounded answer using configured LLM or intelligent grounded fallback
   * @param {object} params - { query, history, categoryFilter }
   * @returns {Promise<{ answer: string, sources: Array<object>, isGrounded: boolean }>}
   */
  static async queryRag({ query, history = [], categoryFilter = null }) {
    // 0. Normalize typos and spelling mistakes
    const normalizedQuery = normalizeQueryTypos(query);

    // Dynamically retrieve more context for broad list/overview/elective inquiries
    const isBroadQuery = /(what\s*are\s*the\s*subjects|list|all\s*courses|curriculum|syllabus|schedule|rules|elective|program\s*elective|which\s*college|who\s*published)/i.test(normalizedQuery);
    const topK = isBroadQuery ? Math.max(env.rag.topK, 8) : env.rag.topK;

    // 1. Retrieve most relevant vector chunks
    const retrieval = await VectorStoreService.similaritySearch(normalizedQuery, {
      topK,
      threshold: env.rag.similarityThreshold,
      categoryFilter,
    });

    const relevantChunks = retrieval.results;

    // Build source citation objects
    const sources = relevantChunks.map(chunk => ({
      document_title: chunk.document_title || chunk.metadata?.document_title || 'Institutional Document',
      page_number: chunk.page_number || 1,
      similarity_score: Number(parseFloat(chunk.similarity || 0).toFixed(4)),
      excerpt: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '...' : ''),
    }));

    // If no context matched the similarity threshold, trigger strict fallback immediately
    if (relevantChunks.length === 0) {
      return {
        answer: 'I am sorry, but that information is not available in the uploaded college documents. Please reach out to the campus administration or department coordinator for official assistance.',
        sources: [],
        isGrounded: false,
      };
    }

    const contextText = this.formatContext(relevantChunks);

    // Format chat history context
    const historyText = history
      .slice(-6)
      .map(m => `${m.sender === 'user' ? 'Student' : 'CampusWise AI'}: ${m.content}`)
      .join('\n');

    const promptText = `
[COLLEGE DOCUMENT CONTEXT]
${contextText}

[PREVIOUS CONVERSATION HISTORY]
${historyText || 'No prior messages in this conversation.'}

[STUDENT QUERY]
${query}

[YOUR GROUNDED RESPONSE]
`;

    // 2. Call Google Gemini LLM if key is configured
    if (env.ai.geminiApiKey && env.ai.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: env.ai.geminiModel,
          systemInstruction: SYSTEM_RAG_PROMPT,
        });

        const result = await model.generateContent(promptText);
        const responseText = result.response.text();

        return {
          answer: responseText.trim(),
          sources,
          isGrounded: true,
        };
      } catch (err) {
        console.warn(`[RagService] Gemini generation error (${err.message}). Failing over to backup LLM...`);
      }
    }

    // 2.5 Call xAI Grok LLM fallback (Automatic failover if Gemini is rate-limited or tokens exhausted)
    if (env.ai.grokApiKey && env.ai.grokApiKey !== 'your_grok_api_key_here') {
      try {
        console.log('[RagService] Invoking xAI Grok LLM fallback...');
        const grok = new OpenAI({
          apiKey: env.ai.grokApiKey,
          baseURL: 'https://api.x.ai/v1',
        });

        const messages = [
          { role: 'system', content: SYSTEM_RAG_PROMPT },
          ...history.slice(-4).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          {
            role: 'user',
            content: `[COLLEGE DOCUMENT CONTEXT]\n${contextText}\n\n[STUDENT QUERY]\n${query}`,
          },
        ];

        const response = await grok.chat.completions.create({
          model: env.ai.grokModel || 'grok-2-latest',
          messages,
          temperature: 0.2,
        });

        if (response.choices && response.choices[0]?.message?.content) {
          console.log('[RagService] Successfully generated answer via xAI Grok fallback.');
          return {
            answer: response.choices[0].message.content.trim(),
            sources,
            isGrounded: true,
          };
        }
      } catch (err) {
        console.warn(`[RagService] xAI Grok fallback error: ${err.message}. Failing over.`);
      }
    }

    // 3. Call OpenAI LLM if key is configured
    if (env.ai.openaiApiKey && env.ai.openaiApiKey !== 'your_openai_api_key_here') {
      try {
        const openai = new OpenAI({ apiKey: env.ai.openaiApiKey });
        const messages = [
          { role: 'system', content: SYSTEM_RAG_PROMPT },
          ...history.slice(-4).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          {
            role: 'user',
            content: `[COLLEGE DOCUMENT CONTEXT]\n${contextText}\n\n[STUDENT QUERY]\n${query}`,
          },
        ];

        const response = await openai.chat.completions.create({
          model: env.ai.openaiModel,
          messages,
          temperature: 0.2,
        });

        return {
          answer: response.choices[0].message.content.trim(),
          sources,
          isGrounded: true,
        };
      } catch (err) {
        console.warn(`[RagService] OpenAI generation error: ${err.message}. Falling back.`);
      }
    }

    // 4. Grounded Local Rule-Based Extractor Fallback (deterministic for testing and offline dev)
    const localAnswer = this.synthesizeLocalGroundedAnswer(query, relevantChunks);

    return {
      answer: localAnswer,
      sources,
      isGrounded: true,
    };
  }

  /**
   * Deterministic smart synthesizer to ground answers directly from matched chunks
   */
  static synthesizeLocalGroundedAnswer(query, chunks) {
    if (!chunks || chunks.length === 0) {
      return 'I am sorry, but that information is not available in the uploaded college documents. Please reach out to the campus administration or department coordinator for official assistance.';
    }

    const queryLower = query.toLowerCase();
    const primaryDoc = chunks[0].document_title || chunks[0].metadata?.document_title || 'Institutional Document';
    const primaryPage = chunks[0].page_number || 1;

    // -------------------------------------------------------------
    // 1. SPECIFIC SUBJECT VERIFICATION (e.g. "Do they have DSA in curriculum?", "Is Soft Computing included?")
    // -------------------------------------------------------------
    const subjectChecks = [
      { name: 'Data Structures & Algorithm (DSA) / DAA', pattern: /\b(dsa|data\s*structures?|design\s*analysis\s*and\s*algorithm|daa)\b/i },
      { name: 'Soft Computing', pattern: /\bsoft\s*computing\b/i },
      { name: 'Foundation of Cryptography / Network Security', pattern: /\b(crypto|cryptography|network\s*security)\b/i },
      { name: 'Internet of Things (IoT)', pattern: /\b(iot|internet\s*of\s*things)\b/i },
      { name: 'Quantum Computing / Quantum Algorithms', pattern: /\bquantum\b/i },
      { name: 'Database Management System (DBMS)', pattern: /\b(dbms|database)\b/i },
      { name: 'Operating System', pattern: /\b(operating\s*system|os)\b/i },
      { name: 'Computer Networks', pattern: /\b(computer\s*networks?|networking)\b/i },
      { name: 'Python Programming', pattern: /\bpython\b/i },
      { name: 'Full Stack Development / Web Technology', pattern: /\b(full\s*stack|web\s*tech)/i },
      { name: 'Ethical Hacking & Penetration Testing', pattern: /\b(ethical\s*hacking|penetration\s*testing)\b/i },
      { name: 'Discrete Mathematics & Graph Theory', pattern: /\b(discrete\s*math|graph\s*theory)\b/i },
    ];

    for (const sub of subjectChecks) {
      if (sub.pattern.test(queryLower)) {
        const matches = chunks.filter(c => sub.pattern.test(c.content));
        if (matches.length > 0) {
          const pages = [...new Set(matches.map(m => m.page_number))].sort((a, b) => a - b);
          let resp = `**Yes!** **${sub.name}** is included in the curriculum of **${primaryDoc}**.\n\n`;
          resp += `### Course & Syllabus Details:\n`;
          for (const m of matches.slice(0, 3)) {
            const lines = m.content
              .split('\n')
              .map(l => l.trim())
              .filter(l => l.length > 12 && (sub.pattern.test(l) || /course\s*code|credit|unit|co\d|objective|examination/i.test(l)));
            if (lines.length > 0) {
              resp += `**Reference (Page ${m.page_number}):**\n`;
              resp += lines.slice(0, 4).map(l => `• ${l}`).join('\n') + `\n\n`;
            }
          }
          resp += `*Verified against official record: ${primaryDoc} (Pages ${pages.join(', ')})*`;
          return resp.trim();
        }
      }
    }

    // -------------------------------------------------------------
    // 2. SUBJECT LIST & CURRICULUM QUERY (e.g. "What are the subjects in TY CS?", "I need subjects")
    // -------------------------------------------------------------
    const isSubjectListQuery = /(what\s*are\s*the\s*subjects|list\s*of\s*subjects|i\s*need\s*subjects|all\s*subjects|subjects\s*included|curriculum|course\s*structure|teaching\s*scheme)/i.test(queryLower);

    if (isSubjectListQuery) {
      const semHeaders = ['SEMESTER - I', 'SEMESTER - II', 'SEMESTER - III', 'SEMESTER - IV', 'SEMESTER - V', 'SEMESTER - VI', 'SEMESTER - VII', 'SEMESTER - VIII'];
      const detectedCourses = [];

      for (const c of chunks) {
        const text = c.content;
        const pageNum = c.page_number;

        let currentSem = 'General Curriculum';
        for (const h of semHeaders) {
          if (text.includes(h)) {
            currentSem = h.replace(' - ', ' ');
            break;
          }
        }
        if (currentSem === 'General Curriculum' && pageNum >= 11) {
          currentSem = 'Semester V (TY)';
        }

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (/^23U[A-Z0-9]+/.test(line)) {
            const code = line.match(/^23U[A-Z0-9]+/)[0];
            const nameParts = [];
            let j = i + 1;
            while (j < lines.length && j <= i + 5) {
              const nextL = lines[j];
              if (/^(BS|ES|PC|MDM|MD|PEC|PE|OE|HS|VSEC|CC|AEC|EL|AU|SC|TOTAL|Course Code)\s*[-–]?\s*\d*/i.test(nextL) || /^\d+\s*[-–]\s*\d+/.test(nextL) || /^23U[A-Z0-9]+/.test(nextL)) {
                break;
              }
              if (!/^(Theory|Practical|Total|Teaching Scheme|Credits|Marks|Hours|TAE|CAE|ESE|INT|EXT|L T P|Hrs|\d+)$/i.test(nextL)) {
                nameParts.push(nextL);
              }
              j++;
            }

            const fullName = nameParts.join(' ').replace(/\s+/g, ' ').trim();
            if (fullName.length >= 3 && fullName.length <= 60 && !detectedCourses.some(x => x.code === code)) {
              detectedCourses.push({
                code,
                name: fullName,
                semester: currentSem,
                page: pageNum,
              });
            }
          }
        }
      }

      if (detectedCourses.length > 0) {
        let resp = `Here are the official courses and subjects identified in **${primaryDoc}**:\n\n`;
        const grouped = {};
        for (const item of detectedCourses) {
          if (!grouped[item.semester]) grouped[item.semester] = [];
          grouped[item.semester].push(item);
        }

        for (const [sem, items] of Object.entries(grouped)) {
          resp += `### 📚 ${sem}:\n`;
          for (const it of items) {
            resp += `• **${it.name}** \`(Code: ${it.code})\` — *Page ${it.page}*\n`;
          }
          resp += `\n`;
        }
        resp += `*You can ask for the detailed syllabus, course outcomes, or evaluation schemes for any of these subjects.*`;
        return resp.trim();
      }
    }

    // -------------------------------------------------------------
    // 3. DOCUMENT METADATA / EXISTENCE INQUIRY
    // -------------------------------------------------------------
    const isMetaQuery = /do you have|is there|which (college|university|document|syllabus)|show me|what documents/i.test(queryLower);
    if (isMetaQuery) {
      const topChunk = chunks[0];
      const docName = topChunk.document_title || primaryDoc;
      let resp = `Yes! The official knowledge base includes **${docName}** (Category: ${topChunk.document_category || 'Academics'}, Page ${topChunk.page_number}).\n\n`;
      resp += `**Overview / Key Excerpt:**\n> ${topChunk.content.slice(0, 320).trim()}...\n\n`;
      resp += `*You can ask specific questions about any subject, course outcome, exam rule, or policy mentioned in this document.*`;
      return resp;
    }

    // -------------------------------------------------------------
    // 4. GENERAL LINE & EXCERPT EXTRACTION WITH DEDUPLICATION
    // -------------------------------------------------------------
    const queryClean = queryLower.replace(/[^a-z0-9\s]/g, ' ');
    const stopWords = new Set(['do', 'you', 'have', 'the', 'of', 'in', 'is', 'are', 'what', 'which', 'who', 'how', 'when', 'where', 'showing', 'here', 'data', 'information', 'about', 'tell', 'me']);
    const queryWords = queryClean.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

    const matchedLines = [];
    for (const chunk of chunks) {
      const docTitle = chunk.document_title || chunk.metadata?.document_title || primaryDoc;
      const pageNum = chunk.page_number || 1;
      const lines = chunk.content.split('\n');

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        const score = queryWords.reduce((acc, w) => acc + (lowerLine.includes(w) ? 1 : 0), 0);
        if (score > 0 && line.trim().length > 12) {
          matchedLines.push({
            text: line.trim(),
            docTitle,
            pageNum,
            score,
          });
        }
      }
    }

    if (matchedLines.length === 0) {
      const topChunk = chunks[0];
      return `According to **${topChunk.document_title || primaryDoc}** (Page ${topChunk.page_number}):\n\n${topChunk.content.slice(0, 500)}...`;
    }

    const seenTexts = new Set();
    const uniqueMatched = [];
    for (const item of matchedLines) {
      const normalized = item.text.replace(/\s+/g, ' ').trim();
      if (!seenTexts.has(normalized)) {
        seenTexts.add(normalized);
        uniqueMatched.push({ ...item, text: normalized });
      }
    }

    uniqueMatched.sort((a, b) => b.score - a.score);
    const topMatches = uniqueMatched.slice(0, 4);

    let answer = `Based on the official **${topMatches[0].docTitle}** (Page ${topMatches[0].pageNum}):\n\n`;
    for (const item of topMatches) {
      answer += `• ${item.text} *[Ref: ${item.docTitle}, Page ${item.pageNum}]*\n`;
    }

    return answer.trim();
  }

  /**
   * Streams grounded responses token-by-token via SSE generator
   */
  static async *streamRagQuery({ query, history = [], categoryFilter = null }) {
    const ragResult = await this.queryRag({ query, history, categoryFilter });

    // Stream initial sources payload event
    yield {
      event: 'sources',
      data: {
        sources: ragResult.sources,
        isGrounded: ragResult.isGrounded,
      },
    };

    // Simulate / pipe token stream
    const words = ragResult.answer.split(' ');
    for (let i = 0; i < words.length; i++) {
      const token = words[i] + (i === words.length - 1 ? '' : ' ');
      yield {
        event: 'token',
        data: { token },
      };
      // Brief pacing for smooth streaming experience
      await new Promise(r => setTimeout(r, 15));
    }

    yield {
      event: 'done',
      data: {
        fullAnswer: ragResult.answer,
        sources: ragResult.sources,
      },
    };
  }

  /**
   * Intelligently understands the user query and generates a concise, professional rephrased title (3-6 words)
   * @param {string} query - Student's initial query
   * @returns {Promise<string>} Rephrased title (e.g. "TY CS CAE-1 Schedule", "Library Late Book Fines")
   */
  static async generateSmartConversationTitle(query) {
    if (!query || typeof query !== 'string') return 'New Conversation';
    const cleanQuery = query.trim();

    // 1. Try Gemini LLM for high-accuracy semantic rephrasing
    if (env.ai.geminiApiKey && env.ai.geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);
        const model = genAI.getGenerativeModel({
          model: env.ai.geminiModel,
          generationConfig: { maxOutputTokens: 25, temperature: 0.2 },
        });

        const prompt = `You are a concise conversation titling AI.
Analyze the user's inquiry and summarize its core topic into a clear, professional 3 to 6-word title in Title Case.
Do NOT include punctuation, quotation marks, prefixes like "Title:", or unnecessary conversational words.
User Inquiry: "${cleanQuery}"
Rephrased Title:`;

        const result = await model.generateContent(prompt);
        const title = result.response.text()?.trim().replace(/^["']|["']$/g, '').replace(/^Title:\s*/i, '');
        if (title && title.length > 2 && title.length < 60) {
          return title;
        }
      } catch (err) {
        console.warn(`[RagService] Gemini auto-title failed: ${err.message}. Falling back.`);
      }
    }

    // 2. Try xAI Grok LLM fallback
    if (env.ai.grokApiKey && env.ai.grokApiKey !== 'your_grok_api_key_here') {
      try {
        const grok = new OpenAI({
          apiKey: env.ai.grokApiKey,
          baseURL: 'https://api.x.ai/v1',
        });

        const response = await grok.chat.completions.create({
          model: env.ai.grokModel || 'grok-2-latest',
          messages: [
            {
              role: 'system',
              content: 'Summarize the user inquiry into a concise, professional 3 to 6-word title in Title Case with no punctuation or quotes.',
            },
            { role: 'user', content: cleanQuery },
          ],
          max_tokens: 25,
          temperature: 0.2,
        });

        const title = response.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '').replace(/^Title:\s*/i, '');
        if (title && title.length > 2 && title.length < 60) {
          return title;
        }
      } catch (err) {
        console.warn(`[RagService] Grok auto-title failed: ${err.message}. Falling back.`);
      }
    }

    // 3. Fast intelligent heuristic fallback
    return this.heuristicallyRephraseTitle(cleanQuery);
  }

  /**
   * Fast rule-based semantic rephrasing fallback
   */
  static heuristicallyRephraseTitle(query) {
    // Map common academic intent patterns
    if (/cae\s*[-–]?\s*1.*(ty\s*cs|computer\s*science)/i.test(query)) return 'TY CS CAE-1 Schedule';
    if (/cae\s*[-–]?\s*1.*(ty\s*ds|data\s*science)/i.test(query)) return 'TY DS CAE-1 Schedule';
    if (/cae\s*[-–]?\s*1.*sy/i.test(query)) return 'SY CAE-1 Timetable';
    if (/academic\s*calendar|semester\s*dates|commencement/i.test(query)) return 'Academic Calendar 2026-27';
    if (/attendance/i.test(query)) return 'Exam Attendance Criteria';
    if (/hostel\s*(curfew|timings|rules)/i.test(query)) return 'Hostel Rules & Curfew';
    if (/refund|cancel.*admission/i.test(query)) return 'Admission Cancellation & Refund';
    if (/library.*(timing|fine|books)/i.test(query)) return 'Library Timings & Book Fines';
    if (/program\s*elective|elective\s*subjects/i.test(query)) return 'Program Elective Tracks';
    if (/balance\s*sheet|audit|fees/i.test(query)) return 'Institutional Fee & Audit Report';

    let clean = query
      .replace(/^(hey|hello|hi|please|plz|can\s+you\s+(tell|give|show)\s+me|tell\s+me\s+(about)?|what\s+(is|are)\s+(the)?|show\s+me\s+(the)?|i\s+want\s+to\s+know|give\s+me\s+(the)?)\s+/i, '')
      .replace(/\?+$/g, '')
      .trim();

    // Capitalize Title Case
    const words = clean.split(/\s+/).slice(0, 5);
    return words
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Campus Inquiry';
  }
}
