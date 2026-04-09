import { motion } from 'framer-motion';

const ShimmerLine = ({ width = '100%', delay = 0 }) => (
  <motion.div
    className="h-3 rounded"
    style={{
      width,
      background:
        'linear-gradient(90deg, rgba(56,189,248,0.05) 0%, rgba(56,189,248,0.18) 50%, rgba(56,189,248,0.05) 100%)',
      backgroundSize: '200% 100%',
    }}
    animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
    transition={{
      duration: 1.8,
      repeat: Infinity,
      ease: 'linear',
      delay,
    }}
  />
);

/**
 * Pulsing skeleton block matching the dark-panel styling.
 * Used in the placeholders before each streamed section arrives.
 */
const SkeletonCard = ({ lines = 4, label, className = '' }) => {
  return (
    <div className={`dark-panel p-6 ${className}`}>
      {label && (
        <p className="font-mono text-xs text-[#38bdf8]/40 mb-4 uppercase tracking-widest">
          // {label}
        </p>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <ShimmerLine
            key={i}
            width={i === lines - 1 ? '60%' : '100%'}
            delay={i * 0.15}
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonCard;
