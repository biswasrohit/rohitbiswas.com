import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirst90DaysStream } from '../hooks/useFirst90DaysStream';
import ResearchContextSection from '../components/first90days/ResearchContextSection';
import PlanTimelineSection from '../components/first90days/PlanTimelineSection';
import FitTagsSection from '../components/first90days/FitTagsSection';

const First90DaysPage = () => {
  const location = useLocation();
  const state = location.state || null;

  // Always call the hook (rules of hooks). When state is missing, the hook
  // sees undefined inputs and stays idle, then we redirect below.
  const {
    research,
    plan,
    fit,
    fitStreaming,
    error,
    isStreaming,
    isError,
  } = useFirst90DaysStream(state || {});

  useEffect(() => {
    if (state) document.title = `${state.company} · 90 Days · Rohit Biswas`;
    return () => {
      document.title = 'Rohit Biswas';
    };
  }, [state]);

  if (!state) {
    return <Navigate to="/#first-90-days-form" replace />;
  }

  const { company, role } = state;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Slim top nav */}
      <nav className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm text-white/60 hover:text-white transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>cd ~/</span>
          </Link>
          <p className="font-mono text-xs text-white/30 hidden sm:block">
            // streaming via groq · llama 3.3 70b
          </p>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-container !pb-8">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs text-[#38bdf8]/60 mb-3 uppercase tracking-widest">
            // first 90 days · {role.toLowerCase()}
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: "'Syne', system-ui, sans-serif", letterSpacing: '-0.04em' }}
          >
            <span className="text-white">Rohit at </span>
            <span className="text-gradient-cyber">{company}</span>
          </h1>
          <p className="text-lg text-white/50">
            A personalized onboarding plan grounded in my actual skills, projects, and experience.
          </p>

          {/* Status pill */}
          <div className="mt-6 inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-md border"
            style={{
              borderColor: isError
                ? 'rgba(217,70,239,0.4)'
                : isStreaming
                ? 'rgba(56,189,248,0.4)'
                : 'rgba(132,204,22,0.4)',
              color: isError ? '#d946ef' : isStreaming ? '#38bdf8' : '#84cc16',
              background: isError
                ? 'rgba(217,70,239,0.08)'
                : isStreaming
                ? 'rgba(56,189,248,0.08)'
                : 'rgba(132,204,22,0.08)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isError ? '#d946ef' : isStreaming ? '#38bdf8' : '#84cc16',
                animation: isStreaming ? 'cursorBlink 1.1s step-end infinite' : undefined,
              }}
            />
            {isError ? 'error' : isStreaming ? 'streaming...' : 'plan ready'}
          </div>
        </motion.div>
      </section>

      {/* Error banner */}
      {isError && (
        <div className="max-w-3xl mx-auto px-6 mb-8">
          <div
            className="dark-panel p-5"
            style={{ borderColor: 'rgba(217,70,239,0.4)' }}
          >
            <p className="font-mono text-xs text-[#d946ef] mb-2 uppercase tracking-widest">
              // error
            </p>
            <p className="text-sm text-white/70 mb-4">{error}</p>
            <Link to="/#first-90-days-form" className="btn-ghost-dark">
              ← Try again
            </Link>
          </div>
        </div>
      )}

      {/* Sections */}
      <ResearchContextSection markdown={research} isStreaming={isStreaming} />
      <PlanTimelineSection markdown={plan} isStreaming={isStreaming} />
      <FitTagsSection
        fit={fit}
        isStreaming={isStreaming}
        fitStreaming={fitStreaming}
      />

      {/* Footer CTA */}
      <section className="section-container !pt-0">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-mono text-xs text-white/30 mb-4">
            // generated for {company} · {role}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/#first-90-days-form" className="btn-ghost-dark">
              ← Generate another
            </Link>
            <Link to="/#contact" className="btn-glow">
              <span aria-hidden="true">$</span>
              <span>Get in touch</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default First90DaysPage;
