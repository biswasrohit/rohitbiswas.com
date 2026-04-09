// Netlify Edge Function: POST /api/first-90-days
// - Validates input
// - Rate-limits to 10 requests per IP per hour using Netlify Blobs
// - Calls Groq (Llama 3.3 70B) with streaming enabled
// - Transforms Groq's SSE delta stream into a plain text stream and pipes back
//
// Env: GROQ_API_KEY must be set in Netlify dashboard.

import { getStore } from '@netlify/blobs';
import { getResumeContextText } from '../../src/lib/buildResumeContext.js';

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_COMPANY_LEN = 100;
const MAX_ROLE_LEN = 100;
const MAX_DESCRIPTION_LEN = 4000;

const SYSTEM_PROMPT = `You are pitching Rohit Biswas to a hiring manager. Your job is to make the case that he is a great hire for this specific role — grounded ONLY in his actual resume below. Never invent skills, projects, or experience.

TONE: Confident, concrete, sales-oriented. Substantive but scannable — this is a pitch document, not a Twitter thread. Strong verbs. No hedging (no "might", "could", "try to", "hopefully"). Write like he's already been hired. NEVER mention gaps, weaknesses, unknowns, or things he would need to learn. This is a pitch, not a gap analysis.

LENGTH: Aim for a healthy medium. Bullets should be full, meaningful sentences — not one-liners that feel low-effort, and not 3-sentence paragraphs that feel bloated. A reader should feel you actually thought about their company.

OUTPUT FORMAT — follow EXACTLY. Use these literal sentinel headers. No preamble, no explanations outside the sentinels.

§§RESEARCH§§
### Company Background
2-3 sentences about the company's mission, what they build, and who they serve. Make it specific to them — not generic filler. Cite details from the user-provided description when available.
### Problems I Can Help With
- <bullet, 15-25 words, a concrete engineering or product problem this role tackles>
- <bullet>
- <bullet>
### Stack Overlap
- **<Their tool>** → <my matching experience, one full sentence with a specific project or context, ~15-20 words>
- **<Their tool>** → <my matching experience>
- **<Their tool>** → <my matching experience>
### Why I'm a Fit
- <bullet, 20-30 words, cite a SPECIFIC project or skill from the resume AND tie it back to what this role needs>
- <bullet>
- <bullet>

§§PLAN§§
### Days 1-30: Foundation
**Headline:** <one punchy sentence, 15-22 words, the thesis of this phase — what Rohit will have accomplished by day 30>
- <bullet, 18-28 words, strong verb, reference a specific resume item AND explain the concrete action>
- <bullet>
- <bullet>
### Days 31-60: Contributing
**Headline:** <one punchy sentence, 15-22 words>
- <bullet, 18-28 words>
- <bullet>
- <bullet>
### Days 61-90: Ownership
**Headline:** <one punchy sentence, 15-22 words>
- <bullet, 18-28 words>
- <bullet>
- <bullet>

Every bullet must start with a strong verb (Ship, Own, Lead, Build, Extend, Integrate, Launch, Drive, etc.). Every bullet must cite a specific skill, tool, or project Rohit already has (e.g. "leverage my Splunk SPL library from NYCHA" or "apply patterns from my ContractPilot RAG pipeline") AND describe the concrete action in this role. One substantive sentence per bullet — enough to feel thoughtful, not so much that it becomes a paragraph.

§§FIT§§
{
  "technical_skills": [{"name": "<skill>", "strength": "strong|good"}, ...],
  "experience":       [{"name": "<area>", "strength": "strong|good"}, ...],
  "education":        [{"name": "<credential>", "strength": "strong|good"}, ...]
}

The FIT block MUST be valid JSON, no trailing commas, no markdown fences. Include 3-5 entries per category. Use "strong" for direct matches, "good" for solid transferable. Select ONLY items where Rohit has a clear, defensible match — if fewer than 3 qualify in a category, return exactly what qualifies. Never fabricate, never pad, never include growth areas or weaknesses.

RESUME (single source of truth — do not invent beyond this):
${getResumeContextText()}`;

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const validateBody = (body) => {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be JSON.' };
  }
  const { company, role, description } = body;
  if (typeof company !== 'string' || company.trim().length === 0) {
    return { error: 'Company is required.' };
  }
  if (typeof role !== 'string' || role.trim().length === 0) {
    return { error: 'Role is required.' };
  }
  if (typeof description !== 'string' || description.trim().length === 0) {
    return { error: 'Description is required.' };
  }
  if (company.length > MAX_COMPANY_LEN) {
    return { error: `Company name must be <= ${MAX_COMPANY_LEN} characters.` };
  }
  if (role.length > MAX_ROLE_LEN) {
    return { error: `Role must be <= ${MAX_ROLE_LEN} characters.` };
  }
  if (description.length > MAX_DESCRIPTION_LEN) {
    return { error: `Description must be <= ${MAX_DESCRIPTION_LEN} characters.` };
  }
  return {
    value: {
      company: company.trim(),
      role: role.trim(),
      description: description.trim(),
    },
  };
};

const checkRateLimit = async (ip) => {
  const hourBucket = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
  const store = getStore('first-90-days-ratelimit');
  const key = `${ip}:${hourBucket}`;
  const raw = await store.get(key);
  const current = raw ? parseInt(raw, 10) : 0;
  if (current >= RATE_LIMIT_MAX) {
    const nextWindowMs = (hourBucket + 1) * RATE_LIMIT_WINDOW_MS - Date.now();
    return { allowed: false, retryAfterSec: Math.ceil(nextWindowMs / 1000) };
  }
  await store.set(key, String(current + 1));
  return { allowed: true };
};

// Groq returns OpenAI-style SSE chunks: lines like `data: {"choices":[{"delta":{"content":"..."}}]}`
// terminated by `data: [DONE]`. We parse those and forward only the raw content text
// to the client as a plain text stream.
const transformGroqStream = (groqBody) => {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream({
    async start(controller) {
      const reader = groqBody.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Ignore malformed chunks; Groq sometimes sends keepalives.
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
};

export default async (request, context) => {
  if (request.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const apiKey = Netlify.env.get('GROQ_API_KEY');
  if (!apiKey) {
    return jsonResponse(500, { error: 'Server is not configured (missing GROQ_API_KEY).' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body.' });
  }

  const validation = validateBody(body);
  if (validation.error) {
    return jsonResponse(400, { error: validation.error });
  }
  const { company, role, description } = validation.value;

  const ip =
    context?.ip ||
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'anon';

  try {
    const { allowed, retryAfterSec } = await checkRateLimit(ip);
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. You can generate up to 10 plans per hour.',
          retryAfterSec,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
          },
        }
      );
    }
  } catch (err) {
    console.error('Rate limit storage error:', err);
    // Fail open — better UX than blocking on infrastructure hiccup
  }

  const userMessage = `Company: ${company}
Role: ${role}

Job description / company description:
${description}`;

  let groqRes;
  try {
    groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        stream: true,
        temperature: 0.4,
        max_tokens: 2400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });
  } catch (err) {
    console.error('Groq fetch failed:', err);
    return jsonResponse(502, { error: 'Failed to reach the model provider.' });
  }

  if (!groqRes.ok || !groqRes.body) {
    const errText = await groqRes.text().catch(() => '');
    console.error('Groq error response:', groqRes.status, errText);
    return jsonResponse(502, {
      error: `Model provider returned ${groqRes.status}.`,
    });
  }

  const stream = transformGroqStream(groqRes.body);
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
};

export const config = { path: '/api/first-90-days' };
