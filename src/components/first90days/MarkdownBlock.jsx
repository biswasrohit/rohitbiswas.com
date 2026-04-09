import ReactMarkdown from 'react-markdown';

// Themed react-markdown wrapper. Component overrides keep streamed content
// consistent with the rest of the site (mono labels, cyan accents, dark surfaces).
const components = {
  h1: ({ children }) => (
    <h3
      className="text-xl font-bold text-white mb-3"
      style={{ fontFamily: "'Syne', system-ui, sans-serif", letterSpacing: '-0.02em' }}
    >
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3
      className="text-lg font-bold text-white mb-3"
      style={{ fontFamily: "'Syne', system-ui, sans-serif", letterSpacing: '-0.02em' }}
    >
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4
      className="text-base font-semibold text-white/90 mb-2"
      style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
    >
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-sm text-white/70 leading-7 mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-3">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-3 mb-3 list-none counter-reset-list">{children}</ol>
  ),
  li: ({ children, ordered }) => {
    if (ordered) {
      return (
        <li className="flex gap-3 text-sm text-white/70 leading-7">
          <span
            className="font-mono text-xs text-[#38bdf8]/70 flex-shrink-0 mt-1.5"
            aria-hidden="true"
          >
            ▸
          </span>
          <span>{children}</span>
        </li>
      );
    }
    return (
      <li className="flex gap-2 text-sm text-white/70 leading-7">
        <span className="text-[#38bdf8]/60 flex-shrink-0 mt-1 font-mono text-xs">
          //
        </span>
        <span>{children}</span>
      </li>
    );
  },
  strong: ({ children }) => (
    <strong className="text-white/95 font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-[#38bdf8]/80">{children}</em>,
  code: ({ children }) => (
    <code
      className="font-mono text-xs px-1.5 py-0.5 rounded"
      style={{
        background: 'rgba(56,189,248,0.08)',
        border: '1px solid rgba(56,189,248,0.2)',
        color: '#38bdf8',
      }}
    >
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#38bdf8] hover:text-[#38bdf8]/80 underline underline-offset-2 transition-colors duration-200"
    >
      {children}
    </a>
  ),
};

const MarkdownBlock = ({ children, className = '' }) => {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
};

export default MarkdownBlock;
