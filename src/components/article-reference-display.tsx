'use client';

import React from 'react';

const URL_REGEX = /https?:\/\/[^\s)]+/gi;
const DOI_REGEX = /10\.\d{4,}\/[^\s)]+/gi;

/** Remove trailing sentence punctuation so DOI/URL resolves (e.g. "10.1016/xx.005." -> "10.1016/xx.005"). */
function trimTrailingPunctuation(s: string): string {
  return s.replace(/[.,;:]+$/, '');
}

type Span = { type: 'text'; value: string } | { type: 'link'; value: string; href: string };

function parseReference(str: string): Span[] {
  const spans: Span[] = [];
  const re = new RegExp(`(${URL_REGEX.source})|(${DOI_REGEX.source})`, 'gi');
  let lastEnd = 0;
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(str)) !== null) {
    if (m.index > lastEnd) {
      spans.push({ type: 'text', value: str.slice(lastEnd, m.index) });
    }
    const raw = m[0];
    const clean = trimTrailingPunctuation(raw);
    const href = raw.startsWith('10.') ? `https://doi.org/${clean}` : (raw.startsWith('http') ? clean : raw);
    spans.push({ type: 'link', value: raw, href });
    lastEnd = re.lastIndex;
  }
  if (lastEnd < str.length) {
    spans.push({ type: 'text', value: str.slice(lastEnd) });
  }
  return spans.length > 0 ? spans : [{ type: 'text', value: str }];
}

/**
 * Renders article reference with URLs and DOIs as clickable links (APA 7–style when DOI/URL present).
 */
export function ArticleReferenceDisplay({
  articleReference,
  doi,
  className,
}: {
  articleReference: string | null | undefined;
  doi?: string | null;
  className?: string;
}) {
  if (!articleReference?.trim()) return null;

  const str = articleReference.trim();
  const spans = parseReference(str);

  return (
    <p className={`whitespace-pre-wrap text-sm ${className ?? ''}`}>
      {spans.map((s, i) =>
        s.type === 'text' ? (
          <span key={i}>{s.value}</span>
        ) : (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80 break-all"
          >
            {s.value}
          </a>
        )
      )}
      {doi && (() => {
        const cleanDoi = trimTrailingPunctuation(doi.replace(/^https?:\/\/doi\.org\/?/i, ''));
        return (
          <>
            {' '}
            <a
              href={`https://doi.org/${cleanDoi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:opacity-80"
            >
              https://doi.org/{cleanDoi}
            </a>
          </>
        );
      })()}
    </p>
  );
}
