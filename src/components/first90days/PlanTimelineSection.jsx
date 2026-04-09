import { motion } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import MarkdownBlock from './MarkdownBlock';
import SkeletonCard from './SkeletonCard';

const PHASES = [
  { key: 'foundation', label: 'Days 1–30', subtitle: 'Foundation', accent: '#38bdf8' },
  { key: 'contributing', label: 'Days 31–60', subtitle: 'Contributing', accent: '#818cf8' },
  { key: 'ownership', label: 'Days 61–90', subtitle: 'Ownership', accent: '#84cc16' },
];

/**
 * Splits the streamed PLAN markdown into [{ heading, body }] segments by '### ' headers.
 * Each phase becomes one timeline node.
 */
const splitIntoPhases = (markdown) => {
  if (!markdown) return [];
  const segments = markdown.split(/\n(?=### )/);
  return segments
    .map((segment) => {
      const match = segment.match(/^###\s+(.+?)\n([\s\S]*)/);
      if (!match) return null;
      return {
        heading: match[1].trim(),
        body: match[2].trim(),
      };
    })
    .filter(Boolean);
};

const PlanTimelineSection = ({ markdown, isStreaming }) => {
  const phases = splitIntoPhases(markdown);
  const showSkeletons = phases.length === 0;

  return (
    <section className="section-container">
      <SectionHeader
        title="First 90 Days Plan"
        subtitle="A phased onboarding plan grounded in my actual experience"
        index="02 · plan"
      />

      <div className="max-w-3xl mx-auto">
        {showSkeletons
          ? PHASES.map((phase, i) => (
              <div key={phase.key} className="relative flex gap-6 pb-12">
                {i < PHASES.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-px bg-white/8" />
                )}
                <div
                  className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.10)',
                  }}
                />
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
                      {phase.label}
                    </p>
                    <p className="text-sm text-white/40 mt-0.5">{phase.subtitle}</p>
                  </div>
                  <SkeletonCard lines={5} />
                </div>
              </div>
            ))
          : PHASES.map((phase, i) => {
              const matched = phases[i];
              const isLast = i === PHASES.length - 1;
              return (
                <div key={phase.key} className="relative flex gap-6 pb-12">
                  {!isLast && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-px bg-white/8" />
                  )}

                  {/* Timeline dot */}
                  <motion.div
                    className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2"
                    style={{
                      background: phase.accent,
                      borderColor: `${phase.accent}40`,
                      boxShadow: `0 0 16px ${phase.accent}44`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: phase.accent }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <div className="mb-3">
                      <p
                        className="font-mono text-xs uppercase tracking-widest"
                        style={{ color: phase.accent }}
                      >
                        {phase.label}
                      </p>
                      <p
                        className="text-base font-bold text-white mt-0.5"
                        style={{
                          fontFamily: "'Syne', system-ui, sans-serif",
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {phase.subtitle}
                      </p>
                    </div>
                    <div className="dark-panel p-6 hover:border-white/15 transition-colors duration-300">
                      {matched ? (
                        <MarkdownBlock>{matched.body}</MarkdownBlock>
                      ) : (
                        <SkeletonCard lines={5} className="!p-0 !bg-transparent !border-0" />
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
      </div>

      {isStreaming && phases.length > 0 && phases.length < PHASES.length && (
        <p className="text-center font-mono text-xs text-white/30 mt-4">
          // generating phase {phases.length + 1} of {PHASES.length}...
        </p>
      )}
    </section>
  );
};

export default PlanTimelineSection;
