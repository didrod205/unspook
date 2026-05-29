# unspook — Product & Strategy

This document captures the thinking behind unspook: why it exists, who it's for,
how it's positioned, and how it could sustain itself.

## 1. Why this idea

People paste text dozens of times a day — from websites, PDFs, Word, Slack,
email, and AI chatbots. That text routinely carries **characters you cannot see**
that cause real, maddening problems:

- A **zero-width space** or **BOM** breaks an `===` check, a search, a primary
  key, or a CSV import — and you can't see why.
- A **non-breaking space** silently fails string matches ("but it looks the same!").
- **Bidi control characters** enable *Trojan Source* (CVE-2021-42574): source
  code that reads one way to a human and compiles another way.
- **Unicode tag characters** can smuggle **invisible instructions** into prompts
  sent to LLMs (a live prompt-injection / "ASCII smuggling" vector).
- **Homoglyphs** (Cyrillic `а`, Greek `ο`, fullwidth `Ａ`) power phishing and
  break lookups.

These are **deterministic, spec-defined** problems — exactly the kind of thing
an LLM should *not* be trusted to eyeball, and exactly the kind of thing a small,
tested, local tool nails. The "aha" is huge: most people have no idea their text
is contaminated until a tool shows them.

It also satisfies hard product constraints: **no server**, **no API key**,
**runs in the browser or terminal**, immediate value, broad audience.

## 2. Competitor analysis

| Tool | What it does | Gaps unspook fills |
| ---- | ------------ | ------------------ |
| Online "remove zero-width space" pages | Strip one or two characters | Single-purpose, ad-heavy, and **you paste sensitive text into their server** |
| "Invisible character" detector sites | Reveal hidden chars | Detection only, no structured API/CLI, server-side, narrow coverage |
| `strip-bom`, `remove-bom`, misc npm one-offs | Strip a single code point | Tiny scope; you'd need 8+ packages to cover what unspook does |
| Editor extensions (e.g. "Gremlins" for VS Code) | Highlight odd chars in the editor | Editor-locked; not usable by writers/marketers; no programmatic cleaning |
| `DOMPurify` | Sanitize HTML for XSS | Different problem entirely (markup, not invisible Unicode) |
| General "text cleaner" utilities | Case/whitespace tweaks | Don't address bidi, tag chars, homoglyphs, or security framing |

**Nobody** combines: broad code-point coverage **+ security framing (Trojan
Source / prompt injection) + homoglyphs + a friendly local web app + a library +
a CI-ready CLI** in one zero-dependency package.

## 3. Differentiation

1. **Local-first by principle.** A privacy/security tool that uploads your text
   is self-defeating. unspook never makes a network call.
2. **Breadth + structure.** 8 categories, dozens of code points, each with a
   name, severity, and position — not a one-off regex.
3. **Security-aware.** First-class handling of Trojan Source bidi attacks and
   invisible prompt-injection tag characters, with `danger` severities.
4. **Three surfaces, one core.** Web app (non-devs), library (apps), CLI
   (automation/CI) — all from the same tested engine.
5. **Reversible by design.** Destructive transforms (smart quotes, homoglyphs)
   are opt-in; the default preserves your visible meaning.

## 9. GitHub Topics

```
invisible-characters, zero-width-space, unicode, sanitize, homoglyph,
trojan-source, bidi, smart-quotes, non-breaking-space, text-cleaner,
prompt-injection, security, privacy, cli, zero-dependency
```

## 10. Product Hunt launch copy

**Tagline:** Reveal & remove the invisible characters hiding in your text — 100% locally.

**Description:**
> Ever had two strings that look identical but won't match? Or pasted text that
> mysteriously broke your code, CSV, or search? Your text is probably full of
> characters you can't see — zero-width spaces, BOMs, non-breaking spaces, smart
> quotes, and even bidirectional "Trojan Source" controls and invisible
> prompt-injection characters.
>
> unspook reveals them instantly and cleans them up — in your browser, on your
> machine, with nothing uploaded. There's also a zero-dependency npm library and
> a CLI you can drop into CI to fail the build when invisible characters sneak in.
>
> Free, open-source (MIT), no sign-up, no API key. 👻

**First comment (maker):** the origin story — "I lost an hour to a non-breaking
space once; never again" — plus a link to the live app and the GitHub repo.

## 11. npm package name

- **Primary:** `unspook` (brandable, memorable, available).
- Keyword-rich aliases to consider reserving / linking in docs: `invisible-characters`,
  `zero-width`, `unicode-sanitize` (for discoverability via search).

## 12. SEO keyword strategy

Target long-tail, intent-rich queries people actually type:

- "remove zero width space", "delete invisible characters"
- "non breaking space remover", "nbsp to space"
- "smart quotes to straight quotes converter"
- "detect hidden unicode characters", "show invisible characters online"
- "trojan source detector", "bidi override checker"
- "homoglyph detector", "cyrillic look alike letters"
- "clean text before publishing", "why won't my strings match"

Tactics: a clear `<title>`/`meta description` on the web app (done), a README that
uses these phrases naturally, a short blog post / `docs` page per problem
("How to remove zero-width spaces"), and GitHub topics. The hosted app on GitHub
Pages is itself an indexable landing page.

## 13. Monetization (without compromising the free, local-first promise)

The core stays free, open-source, and local forever. Sustainable, non-creepy
options layered on top:

1. **Sponsorship** — GitHub Sponsors, Buy Me a Coffee, Ko-fi, Lemon Squeezy
   (already wired up). Clear "where it goes" note builds trust.
2. **Paid integrations / Pro extras** — a paid VS Code extension or JetBrains
   plugin, a GitHub App that auto-comments on PRs introducing invisible/bidi
   characters, or a hosted "team policy" dashboard. Each is opt-in and never
   gates the core.
3. **Sponsored/funded feature work** — companies pay to prioritize features
   (e.g. custom confusables sets, SARIF output for security pipelines).
4. **Merch / "I got unspooked"** — negligible, but community-building.

Guardrails: never add telemetry to the free tool, never upload user text, never
paywall the existing functionality.
