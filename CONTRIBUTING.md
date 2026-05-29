# Contributing to unspook

Thanks for taking the time to contribute! 🎉 unspook aims to be a small,
dependency-free, **precise** tool. Contributions are reviewed with that in mind.

## Getting started

```bash
git clone https://github.com/didrod205/unspook.git
cd unspook
npm install
```

| Command | What it does |
| ------- | ------------ |
| `npm test` | Run the test suite (Vitest). |
| `npm run test:watch` | Re-run tests on change. |
| `npm run typecheck` | Type-check without emitting. |
| `npm run build` | Build the library + CLI (`dist/`). |
| `npm run build:web` | Build the web app (`docs/`). |
| `npm run dev` | Run the web app locally (`vite`). Run `npm run build` once first. |

## Good contributions

- **New code points / categories.** Add them to `src/data.ts` with a correct
  Unicode name, category, severity, and replacement. **Cite a reference**
  (Unicode chart, CVE, confusables data) and add a test.
- **Homoglyph mappings.** Keep them high-confidence (the character must
  genuinely look like its Latin target). Add a test.
- **Bug fixes / docs / web UX.**

## Rules of the road

1. Every behavior change needs a test. For invisible characters, define them
   with `\u` escapes so the source stays unambiguous.
2. `npm run typecheck` and `npm test` must pass.
3. Keep the public API small and the package **zero-dependency**.
4. Don't change visible text by default — destructive transforms stay opt-in.

## Reporting bugs

Open an issue with the **exact input** (use `\u` escapes or paste the code
points), the option set, what you expected, and what you got.

By contributing you agree your contributions are licensed under the project's
[MIT License](./LICENSE).
