<div align="center">

# 👻 unspook

### Reveal & remove the invisible, dangerous, and confusable characters hiding in your text.

[![npm version](https://img.shields.io/npm/v/unspook.svg?color=success)](https://www.npmjs.com/package/unspook)
[![bundle size](https://img.shields.io/bundlephobia/minzip/unspook?label=gzip)](https://bundlephobia.com/package/unspook)
[![CI](https://github.com/didrod205/unspook/actions/workflows/ci.yml/badge.svg)](https://github.com/didrod205/unspook/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/unspook.svg)](https://www.npmjs.com/package/unspook)
[![license](https://img.shields.io/npm/l/unspook.svg)](./LICENSE)

**[🌐 Try the free web app →](https://didrod205.github.io/unspook/)** &nbsp;·&nbsp; no install, nothing uploaded, works offline.

</div>

---

Your text is probably not as clean as it looks. Copy something from a website, a
PDF, a Word doc, a chat app, or an AI assistant and you'll often paste in
**characters you can't see**:

- **Zero-width spaces** and **BOMs** that break `===` comparisons, search, and CSV imports.
- **Non-breaking spaces** masquerading as normal spaces — the bane of every "why won't this match?" bug.
- **“Smart quotes”, em–dashes and ellipses…** that wreck code, JSON, and CSVs.
- **Bidi control characters** — the [*Trojan Source*](https://trojansource.codes/) attack (CVE-2021-42574) that makes code read one way and compile another.
- **Unicode "tag" characters** used to smuggle **invisible prompt-injection** instructions into text fed to LLMs.
- **Homoglyphs** — a Cyrillic `а` or Greek `ο` that looks exactly like Latin but isn't (phishing, impersonation, broken lookups).

**unspook** finds them, shows you exactly what's there, and cleans your text —
**100% locally**, with **zero dependencies** and **no API key**.

> 📸 _Screenshot / demo GIF:_ `./web/screenshot.png` — replace with a recording of the [live app](https://didrod205.github.io/unspook/).

## Why it exists

Every "text sanitizer" you find online makes you **paste sensitive content into
someone else's server**. That's exactly backwards for a privacy/security tool.
unspook runs entirely in your browser or your terminal — your text never leaves
your machine. And because detecting these characters is a precise,
spec-based problem (not a vibe), it's the kind of thing you want a small, tested,
**deterministic** tool for — not a guess.

## Who it's for

Developers (clean code, configs, commit hooks), **writers & marketers** (clean
copy before publishing), **designers** (paste-safe content), **educators &
researchers** (spot hidden characters in AI text), **ops & support** (sanitize
logs and tickets), and anyone who's ever fought a "looks identical but won't
match" bug.

## Install

**No install needed —** just open the **[web app](https://didrod205.github.io/unspook/)**.

For the library / CLI:

```bash
npm install unspook        # library
npm install -g unspook     # CLI (or use npx unspook)
```

Ships ESM **and** CommonJS, with TypeScript types.

## Usage

### In code

```ts
import { scan, clean, reveal, stats } from "unspook";

clean("Hello​world");                 // "Helloworld"  (zero-width space removed)
clean("a b");                         // "a b"         (NBSP → normal space)
clean("“quote” — dash…", { smartPunctuation: true }); // '"quote" -- dash...'
clean("аdmin", { homoglyphs: true });      // "admin"       (Cyrillic а → a)

scan("hi​there");
// [{ index: 2, char: "​", codePoint: 8203, hex: "U+200B",
//    name: "ZERO WIDTH SPACE", category: "zero-width", severity: "warning" }]

reveal("a​b");                        // "a[U+200B]b"
stats(text);                               // { total, byCategory, bySeverity }
```

### On the command line

```bash
unspook notes.md                 # print cleaned text
cat draft.txt | unspook          # use it as a filter in any pipeline
unspook -w README.md             # clean a file in place
unspook --reveal config.yml      # show what's hiding
unspook --scan src/index.ts      # report findings; exits 1 if any → perfect for CI
unspook --aggressive blog.md     # also fix smart quotes, homoglyphs & whitespace
```

Drop it into a pre-commit hook or CI to **fail the build if invisible/bidi
characters sneak into your codebase.**

### Cleaning options

| Option | Default | What it does |
| ------ | :-----: | ------------ |
| `zeroWidth` | ✅ | Remove zero-width / invisible chars (ZWSP, BOM, word joiner…) |
| `bidi` | ✅ | Remove bidirectional controls (Trojan Source) |
| `tag` | ✅ | Remove Unicode tag chars (invisible prompt injection) |
| `control` | ✅ | Remove C0/C1 control characters |
| `invisibleSpaces` | ✅ | Normalize NBSP & exotic spaces → space; drop soft hyphens |
| `variationSelectors` | ❌ | Remove variation selectors (off by default — used by emoji) |
| `smartPunctuation` | ❌ | Convert “ ” ‘ ’ — … to ASCII |
| `homoglyphs` | ❌ | Map look-alike letters to Latin (Cyrillic/Greek/fullwidth) |
| `collapseWhitespace` | ❌ | Collapse runs of spaces/tabs |
| `normalizeNewlines` | ✅ | `\r\n`, `\r` → `\n` |
| `trim` | ❌ | Trim the ends |

`DEFAULT_OPTIONS` and `AGGRESSIVE_OPTIONS` presets are exported too.

## FAQ

**Is my text uploaded anywhere?**
No. The web app and the library run entirely on your device — there is no
server, no telemetry, no network request. You can use it offline.

**Will it break my emoji?**
No. Variation selectors (which emoji rely on) are kept by default. Turn on
`variationSelectors` only if you specifically want them removed.

**Does it modify visible content?**
By default it only removes invisible/dangerous characters and normalizes odd
spaces — your visible text is preserved. Smart-quote and homoglyph conversion
are **opt-in** because they change visible characters.

**How is this different from a regex like `/[​]/g`?**
unspook covers dozens of code points across eight categories (zero-width, bidi,
tag, control, exotic spaces, smart punctuation, homoglyphs, variation selectors),
names each finding, assigns a severity, tracks positions, and gives you a tested,
maintained, reversible-by-option cleaner. No regex to copy-paste-and-get-wrong.

**Can I use it in CI / a pre-commit hook?**
Yes — `unspook --scan <files>` exits with code `1` when anything is found.

**Why "unspook"?**
It un-spooks your text: removes the ghostly invisible characters. 👻

## Contributing

Contributions are very welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[Code of Conduct](./CODE_OF_CONDUCT.md). Adding a code point or a homoglyph
mapping? Include a test and a reference.

```bash
git clone https://github.com/didrod205/unspook.git
cd unspook
npm install
npm test          # run the suite
npm run dev       # run the web app locally
```

## 💖 Sponsor

unspook is free, MIT-licensed, and built in spare time. If it saved you from a
maddening invisible-character bug — or a security incident — please consider
supporting it:

- ⭐ **Star this repo** — free, and it genuinely helps others find it.
- 💛 **[GitHub Sponsors](https://github.com/sponsors/didrod205)**
- ☕ **[Buy Me a Coffee](https://www.buymeacoffee.com/didrod205)**
- 🧋 **[Ko-fi](https://ko-fi.com/didrod205)**
- 🍋 **[Lemon Squeezy](https://elab-studio.lemonsqueezy.com/checkout/buy/5d059b89-51d0-456b-b33a-ed56994f7010)**

**Where your support goes:** keeping the character database current with new
Unicode releases, expanding the homoglyph/confusables coverage, maintaining the
free hosted web app, adding integrations (VS Code extension, ESLint plugin,
pre-commit hook), and answering issues quickly.

## License

[MIT](./LICENSE) © unspook contributors
