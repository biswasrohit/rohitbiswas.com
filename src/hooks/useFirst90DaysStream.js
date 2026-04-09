import { useEffect, useRef, useState } from 'react';

const RESEARCH_SENTINEL = '§§RESEARCH§§';
const PLAN_SENTINEL = '§§PLAN§§';
const FIT_SENTINEL = '§§FIT§§';

const STATUS = {
  IDLE: 'idle',
  STREAMING: 'streaming',
  DONE: 'done',
  ERROR: 'error',
};

/**
 * Splits an accumulated stream buffer into three named sections based on sentinel
 * markers. Returns whatever has streamed so far for each section (possibly empty).
 */
const parseSections = (buffer) => {
  const researchStart = buffer.indexOf(RESEARCH_SENTINEL);
  const planStart = buffer.indexOf(PLAN_SENTINEL);
  const fitStart = buffer.indexOf(FIT_SENTINEL);

  const sliceBetween = (startMarker, startIdx, endIdx) => {
    if (startIdx === -1) return '';
    const from = startIdx + startMarker.length;
    const to = endIdx === -1 ? buffer.length : endIdx;
    if (to <= from) return '';
    return buffer.slice(from, to).trim();
  };

  const research = sliceBetween(
    RESEARCH_SENTINEL,
    researchStart,
    planStart !== -1 ? planStart : fitStart
  );
  const plan = sliceBetween(
    PLAN_SENTINEL,
    planStart,
    fitStart
  );
  const fitRaw = sliceBetween(FIT_SENTINEL, fitStart, -1);

  return { research, plan, fitRaw };
};

/**
 * Attempts to parse the FIT JSON block. The model emits raw JSON without
 * markdown fences, but we strip any accidental ```json wrappers just in case.
 */
const parseFit = (fitRaw) => {
  if (!fitRaw) return null;
  let cleaned = fitRaw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  // Only attempt parse if it looks like a complete JSON object
  if (!cleaned.endsWith('}')) return null;
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

export function useFirst90DaysStream({ company, role, description } = {}) {
  const [research, setResearch] = useState('');
  const [plan, setPlan] = useState('');
  const [fit, setFit] = useState(null);
  const [fitStreaming, setFitStreaming] = useState(false);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!company || !role || !description) {
      return undefined;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setResearch('');
    setPlan('');
    setFit(null);
    setFitStreaming(false);
    setError(null);
    setStatus(STATUS.STREAMING);

    let cancelled = false;
    let buffer = '';

    const run = async () => {
      try {
        const response = await fetch('/api/first-90-days', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company, role, description }),
          signal: controller.signal,
        });

        if (!response.ok) {
          let payload = null;
          try {
            payload = await response.json();
          } catch {
            // ignore
          }
          const message = payload?.error || `Request failed with status ${response.status}.`;
          if (response.status === 429 && payload?.retryAfterSec) {
            throw new Error(`${message} Try again in ~${Math.ceil(payload.retryAfterSec / 60)} min.`);
          }
          throw new Error(message);
        }

        if (!response.body) {
          throw new Error('Response had no body.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const { research: nextResearch, plan: nextPlan, fitRaw } = parseSections(buffer);
          setResearch(nextResearch);
          setPlan(nextPlan);
          setFitStreaming(buffer.includes(FIT_SENTINEL));

          const parsedFit = parseFit(fitRaw);
          if (parsedFit) setFit(parsedFit);
        }

        // Final flush + final parse pass once stream completes
        const final = parseSections(buffer);
        setResearch(final.research);
        setPlan(final.plan);
        const finalFit = parseFit(final.fitRaw);
        if (finalFit) setFit(finalFit);
        setStatus(STATUS.DONE);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Something went wrong.');
        setStatus(STATUS.ERROR);
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [company, role, description]);

  return {
    research,
    plan,
    fit,
    fitStreaming,
    status,
    error,
    isStreaming: status === STATUS.STREAMING,
    isDone: status === STATUS.DONE,
    isError: status === STATUS.ERROR,
  };
}
