import { motion } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import SkeletonCard from './SkeletonCard';

const STRENGTH_STYLES = {
  strong: {
    label: 'strong match',
    bg: 'rgba(132,204,22,0.10)',
    border: 'rgba(132,204,22,0.40)',
    text: '#84cc16',
    glow: 'rgba(132,204,22,0.18)',
  },
  good: {
    label: 'good match',
    bg: 'rgba(56,189,248,0.10)',
    border: 'rgba(56,189,248,0.40)',
    text: '#38bdf8',
    glow: 'rgba(56,189,248,0.18)',
  },
};

// Coerce any legacy strength value into one of the two supported styles so the
// UI never shows a weakness color even if the model regresses.
const normalizeStrength = (s) => (s === 'strong' ? 'strong' : 'good');

const GROUPS = [
  { key: 'technical_skills', title: 'Technical Skills' },
  { key: 'experience', title: 'Experience' },
  { key: 'education', title: 'Education' },
];

const Tag = ({ name, strength, index }) => {
  const style = STRENGTH_STYLES[normalizeStrength(strength)];
  return (
    <motion.span
      className="inline-flex items-center gap-2 font-mono text-sm px-3 py-1.5 rounded-md cursor-default"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{
        scale: 1.04,
        boxShadow: `0 0 20px ${style.glow}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.text }} />
      {name}
    </motion.span>
  );
};

const FitTagsSection = ({ fit, isStreaming, fitStreaming }) => {
  // While we're still waiting for the FIT block, render skeletons.
  const showSkeletons = !fit;

  return (
    <section className="section-container">
      <SectionHeader
        title="Why I Fit the Role"
        subtitle="The match, at a glance"
        index="03 · fit"
      />

      <div className="max-w-5xl mx-auto">
        {showSkeletons ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GROUPS.map((group, i) => (
              <SkeletonCard key={group.key} label={group.title} lines={3 + (i % 2)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GROUPS.map((group, gi) => {
              const items = Array.isArray(fit[group.key]) ? fit[group.key] : [];
              return (
                <motion.div
                  key={group.key}
                  className="dark-panel p-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: gi * 0.06 }}
                >
                  <p className="font-mono text-xs text-[#38bdf8]/70 mb-4 uppercase tracking-widest">
                    // {group.title.toLowerCase()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.length === 0 ? (
                      <span className="font-mono text-xs text-white/30">
                        // no entries
                      </span>
                    ) : (
                      items.map((item, i) => (
                        <Tag
                          key={`${item.name}-${i}`}
                          name={item.name}
                          strength={item.strength}
                          index={i}
                        />
                      ))
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {showSkeletons && fitStreaming && (
          <p className="text-center font-mono text-xs text-white/40 mt-6">
            // parsing fit analysis...
          </p>
        )}
        {showSkeletons && !fitStreaming && isStreaming && (
          <p className="text-center font-mono text-xs text-white/30 mt-6">
            // waiting for plan to finish before scoring fit...
          </p>
        )}
      </div>
    </section>
  );
};

export default FitTagsSection;
