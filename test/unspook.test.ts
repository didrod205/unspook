import { describe, expect, it } from "vitest";
import { clean, isClean, reveal, scan, stats } from "../src/index.js";

// All special characters are defined via escapes so the source stays pure ASCII
// and the exact code points are unambiguous.
const ZWSP = "​";
const BOM = "﻿";
const RLO = "‮";
const LRI = "⁦";
const PDI = "⁩";
const NBSP = " ";
const IDEO = "　"; // ideographic space
const SHY = "­"; // soft hyphen
const CYR_A = "а"; // Cyrillic small a
const LQUO = "“";
const RQUO = "”";
const EMDASH = "—";
const ELLIPSIS = "…";
const HEART = "❤️"; // heart + variation selector 16
const FULLWIDTH_ABC = "ＡＢＣ"; // ABC

describe("scan", () => {
  it("finds a zero-width space", () => {
    const f = scan(`hi${ZWSP}there`);
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({
      index: 2,
      hex: "U+200B",
      name: "ZERO WIDTH SPACE",
      category: "zero-width",
      severity: "warning",
    });
  });

  it("reports nothing for clean ASCII", () => {
    expect(scan("Hello, world!\n")).toEqual([]);
    expect(isClean("Hello, world!\n")).toBe(true);
  });

  it("flags a BOM", () => {
    expect(scan(`${BOM}content`)[0]).toMatchObject({ category: "zero-width", hex: "U+FEFF" });
  });

  it("detects the Trojan Source bidi-override attack as danger", () => {
    const evil = `access = "user${RLO} ${LRI}// Check if admin${PDI}";`;
    const findings = scan(evil);
    expect(findings.some((f) => f.category === "bidi" && f.severity === "danger")).toBe(true);
  });

  it("detects Unicode tag characters (invisible prompt injection)", () => {
    const f = scan("Summarize\u{e0001}\u{e0073}\u{e0065}\u{e0063}");
    expect(f.length).toBeGreaterThan(0);
    expect(f.every((x) => x.category === "tag")).toBe(true);
    expect(f[0]!.severity).toBe("danger");
  });

  it("detects homoglyphs", () => {
    const f = scan(`${CYR_A}dmin`);
    expect(f[0]).toMatchObject({ category: "homoglyph", name: 'HOMOGLYPH OF "a"' });
  });

  it("tracks correct indices with astral characters present", () => {
    const f = scan(`\u{1F600}${ZWSP}`); // emoji is 2 UTF-16 units
    expect(f[0]!.index).toBe(2);
  });
});

describe("clean", () => {
  it("removes zero-width characters by default", () => {
    expect(clean(`Hello${ZWSP}world`)).toBe("Helloworld");
  });

  it("removes bidi and tag characters by default", () => {
    expect(clean(`a${RLO}b`)).toBe("ab");
    expect(clean("a\u{e0041}b")).toBe("ab");
  });

  it("normalizes exotic spaces to a normal space", () => {
    expect(clean(`a${NBSP}b`)).toBe("a b");
    expect(clean(`a${IDEO}b`)).toBe("a b");
  });

  it("drops the soft hyphen entirely", () => {
    expect(clean(`ab${SHY}cd`)).toBe("abcd");
  });

  it("leaves smart punctuation alone unless asked", () => {
    expect(clean(`${LQUO}hi${RQUO}`)).toBe(`${LQUO}hi${RQUO}`);
    expect(clean(`${LQUO}hi${RQUO} ${EMDASH} ok${ELLIPSIS}`, { smartPunctuation: true })).toBe(
      '"hi" -- ok...',
    );
  });

  it("maps homoglyphs only when enabled", () => {
    expect(clean(`${CYR_A}dmin`)).toBe(`${CYR_A}dmin`);
    expect(clean(`${CYR_A}dmin`, { homoglyphs: true })).toBe("admin");
    expect(clean(FULLWIDTH_ABC, { homoglyphs: true })).toBe("ABC");
  });

  it("keeps emoji intact (variation selectors preserved by default)", () => {
    expect(clean(HEART)).toBe(HEART);
  });

  it("normalizes newlines and can collapse/trim", () => {
    expect(clean("a\r\nb\rc")).toBe("a\nb\nc");
    expect(clean("  a   b  ", { collapseWhitespace: true, trim: true })).toBe("a b");
  });

  it("is idempotent", () => {
    const messy = `${BOM}He${ZWSP}llo ${LQUO}world${RQUO}${RLO}!`;
    const once = clean(messy, { smartPunctuation: true });
    expect(clean(once, { smartPunctuation: true })).toBe(once);
  });

  it("leaves already-clean text untouched", () => {
    const ok = "The quick brown fox.\nLine two!";
    expect(clean(ok)).toBe(ok);
  });
});

describe("reveal", () => {
  it("makes invisible characters visible but leaves the rest", () => {
    expect(reveal(`a${ZWSP}b`)).toBe("a[U+200B]b");
    expect(reveal(`nbsp${NBSP}here`)).toBe("nbsp[U+00A0]here");
  });

  it("does not tokenize visible smart punctuation", () => {
    expect(reveal(`${LQUO}hi${RQUO}`)).toBe(`${LQUO}hi${RQUO}`);
  });

  it("supports a custom token renderer", () => {
    expect(reveal(`a${ZWSP}b`, { token: (f) => `<${f.name}>` })).toBe("a<ZERO WIDTH SPACE>b");
  });
});

describe("stats", () => {
  it("summarizes by category and severity", () => {
    const s = stats(`a${ZWSP}${RLO}${NBSP}${CYR_A}`);
    expect(s.total).toBe(4);
    expect(s.byCategory["zero-width"]).toBe(1);
    expect(s.byCategory.bidi).toBe(1);
    expect(s.byCategory["invisible-space"]).toBe(1);
    expect(s.byCategory.homoglyph).toBe(1);
    expect(s.bySeverity.danger).toBe(1);
  });
});
