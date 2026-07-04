import { Fragment, type ReactNode } from "react";

/**
 * Minimal, dependency-free Markdown renderer for AI narration.
 * Supports the subset our prompts produce: ## headings, paragraphs,
 * unordered lists, **bold** and *italic*. Everything is rendered as React
 * text nodes — no HTML injection is possible by construction.
 */

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on **bold** first, then *italic* inside remaining segments.
  const boldParts = text.split(/\*\*([^*]+)\*\*/g);
  boldParts.forEach((part, i) => {
    if (i % 2 === 1) {
      nodes.push(<strong key={`b${i}`}>{part}</strong>);
      return;
    }
    const italicParts = part.split(/\*([^*]+)\*/g);
    italicParts.forEach((seg, j) => {
      if (j % 2 === 1) nodes.push(<em key={`i${i}-${j}`}>{seg}</em>);
      else if (seg) nodes.push(<Fragment key={`t${i}-${j}`}>{seg}</Fragment>);
    });
  });
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const heading = trimmed.match(/^#{1,3}\s+(.*)$/);
        if (heading) {
          return (
            <h2
              key={i}
              className="pt-2 font-display text-2xl italic text-ember-300"
            >
              {renderInline(heading[1])}
            </h2>
          );
        }

        const lines = trimmed.split("\n");
        if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 text-parchment-100/90">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.trim().replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="leading-relaxed text-parchment-100/90">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
