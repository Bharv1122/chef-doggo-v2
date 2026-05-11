import React from 'react';

// Minimal Markdown renderer for assistant replies. Handles:
//   - **bold** (and __bold__)
//   - *italic* (and _italic_)
//   - blank-line separated paragraphs
//   - lines starting with "- " or "* " grouped into <ul><li>
// Not a full Markdown implementation — just enough for our prompt outputs
// from both the LLM-backed chat and the rule-based fallback.

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  const pattern = /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/;
  while (remaining.length > 0) {
    const match = pattern.exec(remaining);
    if (!match) {
      parts.push(remaining);
      break;
    }
    if (match.index > 0) parts.push(remaining.slice(0, match.index));
    const bold = match[2] ?? match[3];
    const italic = match[4] ?? match[5];
    if (bold !== undefined) {
      parts.push(<strong key={`b-${key++}`}>{bold}</strong>);
    } else if (italic !== undefined) {
      parts.push(<em key={`i-${key++}`}>{italic}</em>);
    }
    remaining = remaining.slice(match.index + match[0].length);
  }
  return parts;
}

export function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="my-2 list-disc space-y-0.5 pl-5">
        {listBuffer.map((item, index) => (
          <li key={`li-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };
  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    blocks.push(
      <p key={`p-${key++}`} className="whitespace-pre-wrap">
        {renderInline(paragraphBuffer.join(' '))}
      </p>
    );
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.trim() === '') {
      flushList();
      flushParagraph();
      continue;
    }
    const listMatch = /^\s*[-*]\s+(.*)$/.exec(line);
    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1]);
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushList();
  flushParagraph();

  return <div className="space-y-1">{blocks}</div>;
}
