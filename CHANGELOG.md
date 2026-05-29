# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1]

### Changed

- Docs only: sponsorship now points solely to Lemon Squeezy. No code changes.

## [0.1.0]

### Added

- Initial release.
- `scan(text)` — find every suspicious character with name, code point,
  category, severity and position.
- `clean(text, options?)` — remove/normalize invisible, dangerous and (opt-in)
  confusable characters, with sensible defaults and an `AGGRESSIVE_OPTIONS` preset.
- `reveal(text)`, `stats(text)`, `isClean(text)`.
- Eight categories: zero-width, bidi (Trojan Source), tag (prompt injection),
  variation selectors, exotic spaces, control chars, smart punctuation, homoglyphs.
- `unspook` CLI: clean/scan/reveal from files or stdin, `--scan` exits non-zero
  for CI, `-w` in-place, `--aggressive` and granular flags.
- Free, local-only web app (deployed to GitHub Pages).
- Zero runtime dependencies; ESM + CJS + TypeScript types.

[Unreleased]: https://github.com/didrod205/unspook/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/didrod205/unspook/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/didrod205/unspook/releases/tag/v0.1.0
