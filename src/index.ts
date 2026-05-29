/**
 * unspook — find and remove the invisible, dangerous, and confusable
 * characters hiding in your text.
 *
 * Zero dependencies. Pure functions. Runs anywhere JavaScript does.
 */

import { classify, type Category, type Severity } from "./data.js";

export type { Category, Severity } from "./data.js";

export interface Finding {
  /** UTF-16 index of the character in the source string. */
  index: number;
  /** The offending character itself. */
  char: string;
  /** Unicode code point. */
  codePoint: number;
  /** Formatted code point, e.g. `"U+200B"`. */
  hex: string;
  /** Human-readable Unicode name. */
  name: string;
  category: Category;
  severity: Severity;
}

export interface CleanOptions {
  /** Remove zero-width / invisible characters (ZWSP, BOM, word joiner…). Default `true`. */
  zeroWidth?: boolean;
  /** Remove bidirectional control characters (the "Trojan Source" class). Default `true`. */
  bidi?: boolean;
  /** Remove Unicode tag characters (invisible prompt-injection / watermarks). Default `true`. */
  tag?: boolean;
  /** Remove C0/C1 control characters. Default `true`. */
  control?: boolean;
  /** Remove variation selectors. Default `false` (they're legitimate in emoji). */
  variationSelectors?: boolean;
  /** Normalize exotic spaces (NBSP→space, soft hyphen→removed, line sep→newline). Default `true`. */
  invisibleSpaces?: boolean;
  /** Convert smart/typographic punctuation to ASCII (“ ”→", —→--, …→...). Default `false`. */
  smartPunctuation?: boolean;
  /** Map homoglyphs to their Latin look-alike (Cyrillic а→a, fullwidth Ａ→A). Default `false`. */
  homoglyphs?: boolean;
  /** Collapse runs of spaces/tabs into one space. Default `false`. */
  collapseWhitespace?: boolean;
  /** Normalize `\r\n` and `\r` to `\n`. Default `true`. */
  normalizeNewlines?: boolean;
  /** Trim leading/trailing whitespace from the whole string. Default `false`. */
  trim?: boolean;
}

/** The default, safe cleaning profile: strip the dangerous & invisible, keep meaning. */
export const DEFAULT_OPTIONS: Required<CleanOptions> = {
  zeroWidth: true,
  bidi: true,
  tag: true,
  control: true,
  variationSelectors: false,
  invisibleSpaces: true,
  smartPunctuation: false,
  homoglyphs: false,
  collapseWhitespace: false,
  normalizeNewlines: true,
  trim: false,
};

/** Turn everything on — for when you want maximally plain ASCII-ish text. */
export const AGGRESSIVE_OPTIONS: Required<CleanOptions> = {
  zeroWidth: true,
  bidi: true,
  tag: true,
  control: true,
  variationSelectors: true,
  invisibleSpaces: true,
  smartPunctuation: true,
  homoglyphs: true,
  collapseWhitespace: true,
  normalizeNewlines: true,
  trim: true,
};

const CATEGORY_OPTION: Record<Category, keyof CleanOptions> = {
  "zero-width": "zeroWidth",
  bidi: "bidi",
  tag: "tag",
  control: "control",
  "variation-selector": "variationSelectors",
  "invisible-space": "invisibleSpaces",
  "smart-punctuation": "smartPunctuation",
  homoglyph: "homoglyphs",
};

/** Categories whose characters are genuinely invisible (used by {@link reveal}). */
const INVISIBLE_CATEGORIES = new Set<Category>([
  "zero-width",
  "bidi",
  "tag",
  "variation-selector",
  "control",
  "invisible-space",
]);

function toHex(cp: number): string {
  return "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Find every suspicious character in `text`.
 *
 * ```ts
 * scan("hi​there");
 * // [{ index: 2, char: "​", codePoint: 8203, hex: "U+200B",
 * //    name: "ZERO WIDTH SPACE", category: "zero-width", severity: "warning" }]
 * ```
 */
export function scan(text: string): Finding[] {
  const findings: Finding[] = [];
  let index = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    const info = classify(cp);
    if (info) {
      findings.push({
        index,
        char: ch,
        codePoint: cp,
        hex: toHex(cp),
        name: info.name,
        category: info.category,
        severity: info.severity,
      });
    }
    index += ch.length;
  }
  return findings;
}

/** `true` if `text` contains no suspicious characters at all. */
export function isClean(text: string): boolean {
  for (const ch of text) {
    if (classify(ch.codePointAt(0) as number)) return false;
  }
  return true;
}

export interface Stats {
  total: number;
  byCategory: Record<Category, number>;
  bySeverity: Record<Severity, number>;
}

/** Summarize what's lurking in `text` without listing every occurrence. */
export function stats(text: string): Stats {
  const byCategory = {
    "zero-width": 0, bidi: 0, tag: 0, "variation-selector": 0,
    "invisible-space": 0, control: 0, "smart-punctuation": 0, homoglyph: 0,
  } as Record<Category, number>;
  const bySeverity = { danger: 0, warning: 0, info: 0 } as Record<Severity, number>;
  let total = 0;
  for (const f of scan(text)) {
    byCategory[f.category]++;
    bySeverity[f.severity]++;
    total++;
  }
  return { total, byCategory, bySeverity };
}

/**
 * Return a cleaned copy of `text`. By default it strips the dangerous and
 * invisible characters while preserving the visible meaning of your text.
 *
 * ```ts
 * clean("Hello​world");                       // "Helloworld"
 * clean("“quote”", { smartPunctuation: true });    // '"quote"'
 * clean("аdmin", { homoglyphs: true });            // "admin" (Cyrillic а → a)
 * ```
 */
export function clean(text: string, options: CleanOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let src = text;
  if (opts.normalizeNewlines) src = src.replace(/\r\n?/g, "\n");

  let out = "";
  for (const ch of src) {
    const cp = ch.codePointAt(0) as number;
    const info = classify(cp);
    if (!info) {
      out += ch;
      continue;
    }
    const enabled = opts[CATEGORY_OPTION[info.category]];
    out += enabled ? info.replacement : ch;
  }

  if (opts.collapseWhitespace) {
    out = out.replace(/[^\S\n]+/g, " ").replace(/[ \t]*\n[ \t]*/g, "\n");
  }
  if (opts.trim) out = out.trim();

  return out;
}

export interface RevealOptions {
  /** Custom token renderer. Default: `(f) => "[" + f.hex + "]"`. */
  token?: (finding: Finding) => string;
}

/**
 * Make invisible characters visible by replacing them with a readable token,
 * leaving everything else untouched — handy for logs and terminals.
 *
 * ```ts
 * reveal("a​b"); // "a[U+200B]b"
 * ```
 */
export function reveal(text: string, options: RevealOptions = {}): string {
  const token = options.token ?? ((f: Finding) => `[${f.hex}]`);
  let out = "";
  let index = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    const info = classify(cp);
    if (info && INVISIBLE_CATEGORIES.has(info.category)) {
      out += token({
        index,
        char: ch,
        codePoint: cp,
        hex: toHex(cp),
        name: info.name,
        category: info.category,
        severity: info.severity,
      });
    } else {
      out += ch;
    }
    index += ch.length;
  }
  return out;
}
