import {
  clean,
  scan,
  stats,
  type Category,
  type CleanOptions,
  type Finding,
} from "../src/index";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const input = $<HTMLTextAreaElement>("input");
const output = $<HTMLTextAreaElement>("output");
const highlight = $<HTMLDivElement>("highlight");
const statsEl = $<HTMLDivElement>("stats");
const optionsEl = $<HTMLDivElement>("options");

interface OptionDef {
  key: keyof CleanOptions;
  label: string;
  default: boolean;
}

const OPTION_DEFS: OptionDef[] = [
  { key: "zeroWidth", label: "Zero-width / invisible", default: true },
  { key: "bidi", label: "Bidi controls (Trojan Source)", default: true },
  { key: "tag", label: "Tag chars (prompt injection)", default: true },
  { key: "control", label: "Control characters", default: true },
  { key: "invisibleSpaces", label: "Normalize odd spaces (NBSP…)", default: true },
  { key: "smartPunctuation", label: "Smart quotes → ASCII", default: false },
  { key: "homoglyphs", label: "Homoglyphs → Latin", default: false },
  { key: "variationSelectors", label: "Variation selectors", default: false },
  { key: "collapseWhitespace", label: "Collapse whitespace", default: false },
  { key: "trim", label: "Trim ends", default: false },
];

const state: CleanOptions = Object.fromEntries(
  OPTION_DEFS.map((o) => [o.key, o.default]),
) as CleanOptions;

const CATEGORY_LABEL: Record<Category, string> = {
  "zero-width": "Zero-width",
  bidi: "Bidi control",
  tag: "Tag char",
  "variation-selector": "Variation selector",
  "invisible-space": "Odd space",
  control: "Control char",
  "smart-punctuation": "Smart punctuation",
  homoglyph: "Homoglyph",
};

const INVISIBLE: ReadonlySet<Category> = new Set([
  "zero-width",
  "bidi",
  "tag",
  "variation-selector",
  "control",
  "invisible-space",
]);

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

function renderHighlight(text: string, findings: Finding[]): void {
  if (text === "") {
    highlight.innerHTML = `<span class="empty">Nothing yet — paste some text above.</span>`;
    return;
  }
  let html = "";
  let cursor = 0;
  for (const f of findings) {
    html += escapeHtml(text.slice(cursor, f.index));
    const label = INVISIBLE.has(f.category) ? f.hex : escapeHtml(f.char);
    const title = `${f.hex} ${f.name} · ${CATEGORY_LABEL[f.category]}`;
    html += `<span class="chip ${f.severity}" title="${escapeHtml(title)}">${label}</span>`;
    cursor = f.index + f.char.length;
  }
  html += escapeHtml(text.slice(cursor));
  highlight.innerHTML = html || `<span class="empty">All clean! ✨</span>`;
}

function renderStats(text: string): void {
  const s = stats(text);
  if (s.total === 0) {
    statsEl.innerHTML = `<span class="badge ok">✓ clean</span>`;
    return;
  }
  const parts: string[] = [];
  if (s.bySeverity.danger) parts.push(`<span class="badge danger">${s.bySeverity.danger} danger</span>`);
  if (s.bySeverity.warning) parts.push(`<span class="badge warning">${s.bySeverity.warning} warning</span>`);
  if (s.bySeverity.info) parts.push(`<span class="badge info">${s.bySeverity.info} info</span>`);
  statsEl.innerHTML = parts.join("");
}

function update(): void {
  const text = input.value;
  const findings = scan(text);
  renderHighlight(text, findings);
  renderStats(text);
  output.value = clean(text, state);
}

function buildOptions(): void {
  for (const def of OPTION_DEFS) {
    const id = `opt-${def.key}`;
    const wrap = document.createElement("label");
    wrap.className = "option";
    wrap.htmlFor = id;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.checked = def.default;
    cb.addEventListener("change", () => {
      (state as Record<string, boolean>)[def.key] = cb.checked;
      update();
    });
    wrap.append(cb, document.createTextNode(" " + def.label));
    optionsEl.append(wrap);
  }
}

// A sample full of nasties, built from code points so it's unambiguous.
const SAMPLE = [
  "﻿", // BOM
  "The ",
  "“quick”", // smart quotes
  " brown​ fox", // zero-width space
  " jumps", // non-breaking space
  " over the l­azy", // soft hyphen
  " dօg.\n", // Armenian homoglyph 'o' -> not in table; use cyrillic below instead
  "Admin check: if (level != ‮⁦\"user\"⁩⁦) {}\n", // bidi Trojan Source
  "Loгin as аdmin", // Cyrillic 'г','а'
  "\u{e0001}\u{e0068}\u{e0069}", // hidden tag chars
].join("");

$("sample").addEventListener("click", () => {
  input.value = SAMPLE;
  update();
});
$("clear").addEventListener("click", () => {
  input.value = "";
  update();
});
$("copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.value);
  const btn = $("copy");
  const prev = btn.textContent;
  btn.textContent = "Copied!";
  setTimeout(() => (btn.textContent = prev), 1200);
});
input.addEventListener("input", update);

buildOptions();
update();
