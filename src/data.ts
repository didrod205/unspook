/**
 * Character data tables for unspook.
 *
 * Every code point we care about, grouped by category, with a human-readable
 * name, a severity, and (where relevant) an ASCII/Latin replacement.
 */

export type Category =
  | "zero-width" // invisible, no width — ZWSP, BOM, word joiner, …
  | "bidi" // bidirectional controls — the "Trojan Source" attack class
  | "tag" // Unicode tag chars — invisible prompt-injection / watermarking
  | "variation-selector" // VS1–256 — can be used to hide data on a base char
  | "invisible-space" // looks like a space but isn't (NBSP, soft hyphen, …)
  | "control" // C0/C1 control characters
  | "smart-punctuation" // curly quotes, em dash, ellipsis → ASCII
  | "homoglyph"; // letters that look Latin but aren't (Cyrillic а, Greek ο, …)

export type Severity = "danger" | "warning" | "info";

export interface CharInfo {
  name: string;
  category: Category;
  severity: Severity;
  /** What to put in place of this char when cleaning. `""` = drop entirely. */
  replacement: string;
}

export const SEVERITY_BY_CATEGORY: Record<Category, Severity> = {
  bidi: "danger",
  tag: "danger",
  "zero-width": "warning",
  control: "warning",
  homoglyph: "warning",
  "variation-selector": "warning",
  "invisible-space": "info",
  "smart-punctuation": "info",
};

const def = (name: string, category: Category, replacement: string): CharInfo => ({
  name,
  category,
  severity: SEVERITY_BY_CATEGORY[category],
  replacement,
});

/** Explicitly enumerated special characters, keyed by code point. */
export const SPECIAL: Map<number, CharInfo> = new Map([
  // — Zero-width / invisible —
  [0x200b, def("ZERO WIDTH SPACE", "zero-width", "")],
  [0x200c, def("ZERO WIDTH NON-JOINER", "zero-width", "")],
  [0x200d, def("ZERO WIDTH JOINER", "zero-width", "")],
  [0x2060, def("WORD JOINER", "zero-width", "")],
  [0x2061, def("FUNCTION APPLICATION", "zero-width", "")],
  [0x2062, def("INVISIBLE TIMES", "zero-width", "")],
  [0x2063, def("INVISIBLE SEPARATOR", "zero-width", "")],
  [0x2064, def("INVISIBLE PLUS", "zero-width", "")],
  [0xfeff, def("ZERO WIDTH NO-BREAK SPACE (BOM)", "zero-width", "")],
  [0x180e, def("MONGOLIAN VOWEL SEPARATOR", "zero-width", "")],

  // — Bidirectional controls (Trojan Source, CVE-2021-42574) —
  [0x202a, def("LEFT-TO-RIGHT EMBEDDING", "bidi", "")],
  [0x202b, def("RIGHT-TO-LEFT EMBEDDING", "bidi", "")],
  [0x202c, def("POP DIRECTIONAL FORMATTING", "bidi", "")],
  [0x202d, def("LEFT-TO-RIGHT OVERRIDE", "bidi", "")],
  [0x202e, def("RIGHT-TO-LEFT OVERRIDE", "bidi", "")],
  [0x2066, def("LEFT-TO-RIGHT ISOLATE", "bidi", "")],
  [0x2067, def("RIGHT-TO-LEFT ISOLATE", "bidi", "")],
  [0x2068, def("FIRST STRONG ISOLATE", "bidi", "")],
  [0x2069, def("POP DIRECTIONAL ISOLATE", "bidi", "")],
  [0x200e, def("LEFT-TO-RIGHT MARK", "bidi", "")],
  [0x200f, def("RIGHT-TO-LEFT MARK", "bidi", "")],
  [0x061c, def("ARABIC LETTER MARK", "bidi", "")],

  // — Spaces that aren't a normal space —
  [0x00a0, def("NO-BREAK SPACE", "invisible-space", " ")],
  [0x202f, def("NARROW NO-BREAK SPACE", "invisible-space", " ")],
  [0x2007, def("FIGURE SPACE", "invisible-space", " ")],
  [0x2008, def("PUNCTUATION SPACE", "invisible-space", " ")],
  [0x2009, def("THIN SPACE", "invisible-space", " ")],
  [0x200a, def("HAIR SPACE", "invisible-space", " ")],
  [0x2000, def("EN QUAD", "invisible-space", " ")],
  [0x2001, def("EM QUAD", "invisible-space", " ")],
  [0x2002, def("EN SPACE", "invisible-space", " ")],
  [0x2003, def("EM SPACE", "invisible-space", " ")],
  [0x2004, def("THREE-PER-EM SPACE", "invisible-space", " ")],
  [0x2005, def("FOUR-PER-EM SPACE", "invisible-space", " ")],
  [0x2006, def("SIX-PER-EM SPACE", "invisible-space", " ")],
  [0x205f, def("MEDIUM MATHEMATICAL SPACE", "invisible-space", " ")],
  [0x3000, def("IDEOGRAPHIC SPACE", "invisible-space", " ")],
  [0x1680, def("OGHAM SPACE MARK", "invisible-space", " ")],
  [0x00ad, def("SOFT HYPHEN", "invisible-space", "")],
  [0x2028, def("LINE SEPARATOR", "invisible-space", "\n")],
  [0x2029, def("PARAGRAPH SEPARATOR", "invisible-space", "\n")],

  // — Smart / typographic punctuation → ASCII —
  [0x201c, def("LEFT DOUBLE QUOTATION MARK", "smart-punctuation", '"')],
  [0x201d, def("RIGHT DOUBLE QUOTATION MARK", "smart-punctuation", '"')],
  [0x201e, def("DOUBLE LOW-9 QUOTATION MARK", "smart-punctuation", '"')],
  [0x201f, def("DOUBLE HIGH-REVERSED-9 QUOTATION MARK", "smart-punctuation", '"')],
  [0x00ab, def("LEFT-POINTING DOUBLE ANGLE QUOTATION MARK", "smart-punctuation", '"')],
  [0x00bb, def("RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK", "smart-punctuation", '"')],
  [0x2018, def("LEFT SINGLE QUOTATION MARK", "smart-punctuation", "'")],
  [0x2019, def("RIGHT SINGLE QUOTATION MARK", "smart-punctuation", "'")],
  [0x201a, def("SINGLE LOW-9 QUOTATION MARK", "smart-punctuation", "'")],
  [0x201b, def("SINGLE HIGH-REVERSED-9 QUOTATION MARK", "smart-punctuation", "'")],
  [0x2039, def("SINGLE LEFT-POINTING ANGLE QUOTATION MARK", "smart-punctuation", "'")],
  [0x203a, def("SINGLE RIGHT-POINTING ANGLE QUOTATION MARK", "smart-punctuation", "'")],
  [0x2032, def("PRIME", "smart-punctuation", "'")],
  [0x2033, def("DOUBLE PRIME", "smart-punctuation", '"')],
  [0x2013, def("EN DASH", "smart-punctuation", "-")],
  [0x2014, def("EM DASH", "smart-punctuation", "--")],
  [0x2015, def("HORIZONTAL BAR", "smart-punctuation", "--")],
  [0x2212, def("MINUS SIGN", "smart-punctuation", "-")],
  [0x2026, def("HORIZONTAL ELLIPSIS", "smart-punctuation", "...")],
]);

/** Names for the C0 control characters worth labelling. */
const C0_NAMES: Record<number, string> = {
  0x00: "NULL", 0x01: "START OF HEADING", 0x02: "START OF TEXT", 0x03: "END OF TEXT",
  0x04: "END OF TRANSMISSION", 0x05: "ENQUIRY", 0x06: "ACKNOWLEDGE", 0x07: "BELL",
  0x08: "BACKSPACE", 0x0b: "LINE TABULATION", 0x0c: "FORM FEED", 0x0e: "SHIFT OUT",
  0x0f: "SHIFT IN", 0x10: "DATA LINK ESCAPE", 0x1b: "ESCAPE", 0x7f: "DELETE",
};

/**
 * Homoglyphs: characters that render like a Latin letter/number but aren't.
 * Mapped to their Latin look-alike. (A curated, high-confidence subset of the
 * Unicode confusables data.)
 */
export const HOMOGLYPHS: Map<number, string> = new Map([
  // Cyrillic (lowercase)
  [0x0430, "a"], [0x0435, "e"], [0x043e, "o"], [0x0440, "p"], [0x0441, "c"],
  [0x0443, "y"], [0x0445, "x"], [0x0455, "s"], [0x0456, "i"], [0x0458, "j"],
  [0x04bb, "h"], [0x0501, "d"], [0x043a, "k"], [0x043c, "m"], [0x0442, "t"],
  // Cyrillic (uppercase)
  [0x0410, "A"], [0x0412, "B"], [0x0415, "E"], [0x041a, "K"], [0x041c, "M"],
  [0x041d, "H"], [0x041e, "O"], [0x0420, "P"], [0x0421, "C"], [0x0422, "T"],
  [0x0423, "Y"], [0x0425, "X"], [0x0405, "S"], [0x0406, "I"], [0x0408, "J"],
  // Greek
  [0x03bf, "o"], [0x03b1, "a"], [0x03b3, "y"], [0x03c1, "p"], [0x03c5, "u"],
  [0x0391, "A"], [0x0392, "B"], [0x0395, "E"], [0x0396, "Z"], [0x0397, "H"],
  [0x0399, "I"], [0x039a, "K"], [0x039c, "M"], [0x039d, "N"], [0x039f, "O"],
  [0x03a1, "P"], [0x03a4, "T"], [0x03a5, "Y"], [0x03a7, "X"],
  // Latin look-alikes / letterlike symbols
  [0x212f, "e"], [0x2113, "l"], [0x0131, "i"],
]);

const ASCII_PRINTABLE = (cp: number): boolean => cp >= 0x20 && cp <= 0x7e;

/** Classify a single code point, or return `null` if it's unremarkable. */
export function classify(cp: number): CharInfo | null {
  const special = SPECIAL.get(cp);
  if (special) return special;

  // Tag characters (used for invisible prompt injection / watermarking).
  if (cp >= 0xe0000 && cp <= 0xe007f) {
    return def("TAG CHARACTER", "tag", "");
  }
  // Variation selectors (can hide data on a base glyph).
  if ((cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef)) {
    return def("VARIATION SELECTOR", "variation-selector", "");
  }
  // Fullwidth ASCII forms → normal ASCII.
  if (cp >= 0xff01 && cp <= 0xff5e) {
    return def("FULLWIDTH FORM", "homoglyph", String.fromCharCode(cp - 0xfee0));
  }
  // Explicit homoglyph table.
  const latin = HOMOGLYPHS.get(cp);
  if (latin !== undefined) {
    return def(`HOMOGLYPH OF "${latin}"`, "homoglyph", latin);
  }
  // C0/C1 control characters (excluding tab, newline, carriage return).
  if (
    (cp <= 0x1f && cp !== 0x09 && cp !== 0x0a && cp !== 0x0d) ||
    cp === 0x7f ||
    (cp >= 0x80 && cp <= 0x9f)
  ) {
    const name = C0_NAMES[cp] ?? "CONTROL CHARACTER";
    return def(name, "control", "");
  }
  // Everything else (incl. normal ASCII, emoji, CJK, accented Latin) is fine.
  void ASCII_PRINTABLE;
  return null;
}
