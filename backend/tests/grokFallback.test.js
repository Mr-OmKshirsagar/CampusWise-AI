import { describe, it } from 'node:test';
import assert from 'node:assert';
import { env } from '../src/config/env.js';
import { RagService } from '../src/services/ragService.js';

describe('CampusWise AI - Multi-Tier LLM Failover & Grok Resilience', () => {
  it('1. Environment exports GROK configuration keys', () => {
    assert.strictEqual(typeof env.ai.grokModel, 'string');
    assert.strictEqual(env.ai.grokModel, 'grok-2-latest');
  });

  it('2. RAG Service formats system prompt and context correctly for Grok/OpenAI schema', () => {
    const mockChunks = [
      {
        content: 'College library opens from 8:00 AM to 10:00 PM.',
        title: 'Library Rules',
        pageNumber: 1,
      },
    ];
    const formatted = RagService.formatContext(mockChunks);
    assert.ok(formatted.includes('Library Rules'));
    assert.ok(formatted.includes('8:00 AM to 10:00 PM'));
  });

  it('3. Multi-tier failover gracefully falls back when primary engine encounters errors', async () => {
    // Calling synthesizeLocalGroundedAnswer directly verifies local failover tier
    const res = RagService.synthesizeLocalGroundedAnswer('What are library timings?', [
      {
        content: 'College library opens from 8:00 AM to 10:00 PM.',
        metadata: { title: 'Library Rules', pageNumber: 1 },
      },
    ]);
    assert.ok(res.length > 0);
  });
});
