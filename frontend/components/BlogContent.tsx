import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { Block } from "@/lib/blog";
import { headingId } from "@/lib/blog";

// Inline syntax used inside paragraph/list text: **bold** and [label](href).
// Content is authored in-repo (trusted), but we still parse into real React nodes —
// internal links become <Link> for client-side nav, external links open safely.
//
// Both forms are resolved against ONE ordered token stream (not links-first /
// bold-on-leftovers) so that bold wrapping a link — **[label](/path)** — and bold
// containing a link both render correctly. Bold inner text is recursively parsed,
// so a link inside bold still becomes a real link.
const LINK_ONLY_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;

// A FRESH token regex per renderInline() call. It must not be a shared /g regex:
// renderInline recurses on bold inner text, and a recursive call would reset a shared
// regex's lastIndex, sending the outer loop back to position 0 — an infinite loop.
const tokenRe = () => /(\*\*[^*]+?\*\*)|(\[[^\]]+\]\([^)]+\))/g;

function renderLink(label: string, href: string, key: string): ReactNode {
  if (href.startsWith("/")) {
    return (
      <Link key={key} href={href} className="blog-link">
        {label}
      </Link>
    );
  }
  return (
    <a key={key} href={href} className="blog-link" target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = tokenRe();
  let lastIndex = 0;
  let i = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(lastIndex, match.index)}</Fragment>);
    }
    const boldTok = match[1];
    const linkTok = match[2];
    if (boldTok) {
      const inner = boldTok.slice(2, -2);
      const key = `${keyBase}-b${i}`;
      nodes.push(<strong key={key}>{renderInline(inner, key)}</strong>);
    } else if (linkTok) {
      const lm = LINK_ONLY_RE.exec(linkTok);
      if (lm) nodes.push(renderLink(lm[1], lm[2], `${keyBase}-l${i}`));
    }
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`${keyBase}-t${i}`}>{text.slice(lastIndex)}</Fragment>);
  }
  return nodes;
}

export default function BlogContent({ blocks }: { blocks: Block[] }) {
  // De-duplicate heading anchor ids in document order so the in-page TOC links (built by
  // tableOfContents() with the same algorithm) always resolve, even if two H2s slugify alike.
  const seen = new Map<string, number>();
  const nextHeadingId = (text: string) => {
    const base = headingId(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  return (
    <div className="blog-prose">
      {blocks.map((block, i) => {
        const key = `b${i}`;
        switch (block.type) {
          case "h2":
            return (
              <h2 key={key} id={nextHeadingId(block.text)}>
                {renderInline(block.text, key)}
              </h2>
            );
          case "h3":
            return <h3 key={key}>{renderInline(block.text, key)}</h3>;
          case "p":
            return <p key={key}>{renderInline(block.text, key)}</p>;
          case "ul":
            return (
              <ul key={key}>
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key}>
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`}>{renderInline(item, `${key}-${j}`)}</li>
                ))}
              </ol>
            );
          case "callout":
            return (
              <aside key={key} className="blog-callout">
                {block.title ? <p className="blog-callout-title">{block.title}</p> : null}
                <p>{renderInline(block.text, key)}</p>
              </aside>
            );
          case "quote":
            return (
              <blockquote key={key} className="blog-quote">
                <p>{renderInline(block.text, key)}</p>
                {block.cite ? <cite>{block.cite}</cite> : null}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
