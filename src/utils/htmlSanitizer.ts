const ALLOWED_HTML_TAGS = new Set([
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
  'code', 'pre', 'blockquote',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'a', 'span', 'div'
]);

const STRIP_WITH_CONTENT_TAGS = [
  'script', 'style', 'iframe', 'frame', 'frameset',
  'object', 'embed', 'applet', 'svg', 'math',
  'noscript', 'template', 'form', 'input', 'textarea', 'select', 'button'
];

const VOID_TAGS = new Set(['br', 'hr']);

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeBasicHtmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#([0-9]+);?/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&colon;/gi, ':')
    .replace(/&tab;/gi, '\t')
    .replace(/&newline;/gi, '\n');
}

export function sanitizeUrl(
  rawUrl: unknown,
  options: { allowRelative?: boolean; allowMailtoTel?: boolean } = {}
): string {
  const { allowRelative = true, allowMailtoTel = false } = options;
  if (typeof rawUrl !== 'string') return '';

  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Decode obfuscated entities and strip ASCII control chars / whitespace before scheme check
  const decoded = decodeBasicHtmlEntities(trimmed)
    .replace(/[\u0000-\u001F\u007F\s]+/g, '')
    .trim();

  if (!decoded) return '';

  // Block protocol-relative URLs (//evil.com) and backslash tricks (/\evil.com)
  if (decoded.startsWith('//') || decoded.startsWith('/\\') || decoded.startsWith('\\')) {
    return '';
  }

  // Relative paths and in-page anchors
  if (
    allowRelative &&
    (decoded.startsWith('/') || decoded.startsWith('./') || decoded.startsWith('../') || decoded.startsWith('#'))
  ) {
    // Make sure relative string doesn't sneak in a scheme before first slash/query
    const cleanedRel = trimmed.replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cleanedRel)) return '';
    return cleanedRel;
  }

  const lower = decoded.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return '';
  }

  if (allowMailtoTel && (lower.startsWith('mailto:') || lower.startsWith('tel:'))) {
    return trimmed.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  }

  try {
    const parsed = new URL(trimmed.replace(/[\u0000-\u001F\u007F]/g, '').trim());
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
    return '';
  } catch {
    return '';
  }
}

function sanitizeClassOrIdAttr(val: string): string {
  return val.replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 120);
}

export function sanitizeHtml(rawHtml: unknown): string {
  if (typeof rawHtml !== 'string' || !rawHtml) return '';

  let html = rawHtml;

  // 1. Remove HTML comments and CDATA
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

  // 2. Remove dangerous executable/embedded tags WITH their inner contents
  for (const tag of STRIP_WITH_CONTENT_TAGS) {
    const blockRegex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    html = html.replace(blockRegex, '');
    const selfRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    html = html.replace(selfRegex, '');
  }

  // 3. Process remaining tags against strict allowlist
  html = html.replace(/<\/?([a-zA-Z0-9:-]+)(\s+[^<>]*)?\s*\/?>/g, (fullMatch, rawTagName: string, rawAttrs: string = '') => {
    const tag = rawTagName.toLowerCase();
    const isClosing = fullMatch.startsWith('</');

    if (!ALLOWED_HTML_TAGS.has(tag)) {
      return '';
    }

    if (isClosing) {
      return VOID_TAGS.has(tag) ? '' : `</${tag}>`;
    }

    if (VOID_TAGS.has(tag)) {
      return `<${tag} />`;
    }

    const attrs: string[] = [];

    if (rawAttrs) {
      // Extract safe attributes (strip all on* handlers, style, src, srcdoc, etc.)
      const attrRegex = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
      let m: RegExpExecArray | null;
      let safeHref = '';
      let safeTitle = '';
      let safeClass = '';
      let safeId = '';

      while ((m = attrRegex.exec(rawAttrs)) !== null) {
        const attrName = m[1].toLowerCase();
        const attrVal = m[2] ?? m[3] ?? m[4] ?? '';

        if (attrName.startsWith('on') || attrName === 'style' || attrName === 'srcdoc') {
          continue;
        }
        if (tag === 'a' && attrName === 'href') {
          safeHref = sanitizeUrl(attrVal, { allowRelative: true, allowMailtoTel: true });
        } else if (tag === 'a' && attrName === 'title') {
          safeTitle = escapeHtml(attrVal.slice(0, 200));
        } else if (attrName === 'class') {
          safeClass = sanitizeClassOrIdAttr(attrVal);
        } else if (attrName === 'id') {
          safeId = sanitizeClassOrIdAttr(attrVal);
        }
      }

      if (safeId) attrs.push(`id="${escapeHtml(safeId)}"`);
      if (safeClass) attrs.push(`class="${escapeHtml(safeClass)}"`);

      if (tag === 'a') {
        if (safeHref) {
          attrs.push(`href="${escapeHtml(safeHref)}"`);
          if (safeHref.startsWith('http://') || safeHref.startsWith('https://')) {
            attrs.push('target="_blank"');
            attrs.push('rel="noopener noreferrer"');
          }
        }
        if (safeTitle) {
          attrs.push(`title="${safeTitle}"`);
        }
      }
    }

    return attrs.length > 0 ? `<${tag} ${attrs.join(' ')}>` : `<${tag}>`;
  });

  return html;
}
