import { motion } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import MarkdownBlock from './MarkdownBlock';
import SkeletonCard from './SkeletonCard';

const PLACEHOLDER_LABELS = [
  'company background',
  'key challenges',
  'tech stack overlap',
  'my relevance',
];

/**
 * Splits a markdown chunk into subsections by '### ' headers and returns
 * [{ title, body }, ...] in encounter order. Subsection titles are humanized
 * (no markdown formatting).
 */
const splitIntoCards = (markdown) => {
  if (!markdown) return [];
  const segments = markdown.split(/\n(?=### )/);
  return segments
    .map((segment) => {
      const headingMatch = segment.match(/^###\s+(.+?)\n([\s\S]*)/);
      if (!headingMatch) return null;
      return {
        title: headingMatch[1].trim(),
        body: headingMatch[2].trim(),
      };
    })
    .filter(Boolean);
};

const ResearchContextSection = ({ markdown, isStreaming }) => {
  const cards = splitIntoCards(markdown);
  const showSkeletons = cards.length === 0;

  return (
    <section className="section-container">
      <SectionHeader
        title="Research & Context"
        subtitle="What I'd want to know about your team before day one"
        index="01 · research"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {showSkeletons
          ? PLACEHOLDER_LABELS.map((label, i) => (
              <SkeletonCard key={label} label={label} lines={4 + (i % 2)} />
            ))
          : cards.map((card, i) => (
              <motion.div
                key={card.title}
                className="dark-panel p-6 hover:border-[#38bdf8]/20 transition-colors duration-300"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <p className="font-mono text-xs text-[#38bdf8]/70 mb-3 uppercase tracking-widest">
                  // {card.title.toLowerCase()}
                </p>
                <MarkdownBlock>{card.body}</MarkdownBlock>
              </motion.div>
            ))}
      </div>

      {/* While we have at least one card but the stream is still going, show a final
          shimmer placeholder so users see "more is coming". */}
      {!showSkeletons && isStreaming && cards.length < PLACEHOLDER_LABELS.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mt-5">
          <SkeletonCard
            label={PLACEHOLDER_LABELS[cards.length] || 'loading'}
            lines={3}
          />
        </div>
      )}
    </section>
  );
};

export default ResearchContextSection;
