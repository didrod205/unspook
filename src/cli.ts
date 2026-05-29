#!/usr/bin/env node
/**
 * unspook CLI — clean or scan text from files or stdin.
 *
 *   unspook file.txt                 # print cleaned text
 *   cat file.txt | unspook           # works as a filter
 *   unspook --scan README.md         # report findings, exit 1 if any (great for CI)
 *   unspook -w notes.md              # clean in place
 *   unspook --aggressive --reveal x  # show what's hiding
 */
import { readFileSync, writeFileSync } from "node:fs";
import { AGGRESSIVE_OPTIONS, clean, reveal, scan, type CleanOptions } from "./index.js";

const HELP = `unspook — find & remove invisible / dangerous / confusable characters

Usage:
  unspook [options] [files...]
  cat file | unspook [options]

Options:
  -s, --scan         Report findings instead of cleaning; exit 1 if any found
  -w, --write        Rewrite files in place (with cleaned output)
  -r, --reveal       Print text with invisible characters made visible
  -a, --aggressive   Also normalize smart punctuation, homoglyphs & whitespace
      --smart-quotes Convert smart punctuation to ASCII
      --homoglyphs   Map look-alike letters to Latin (Cyrillic а → a)
      --collapse     Collapse runs of whitespace
      --trim         Trim leading/trailing whitespace
      --keep-nbsp    Keep non-breaking & exotic spaces
  -h, --help         Show this help
  -v, --version      Show version
`;

function parseArgs(argv: string[]) {
  const flags = new Set<string>();
  const files: string[] = [];
  const alias: Record<string, string> = {
    "-s": "--scan", "-w": "--write", "-r": "--reveal",
    "-a": "--aggressive", "-h": "--help", "-v": "--version",
  };
  for (const arg of argv) {
    if (arg.startsWith("-")) flags.add(alias[arg] ?? arg);
    else files.push(arg);
  }
  return { flags, files };
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function optionsFromFlags(flags: Set<string>): CleanOptions {
  if (flags.has("--aggressive")) return AGGRESSIVE_OPTIONS;
  return {
    smartPunctuation: flags.has("--smart-quotes"),
    homoglyphs: flags.has("--homoglyphs"),
    collapseWhitespace: flags.has("--collapse"),
    trim: flags.has("--trim"),
    invisibleSpaces: !flags.has("--keep-nbsp"),
  };
}

function report(name: string, text: string): number {
  const findings = scan(text);
  const label = name || "<stdin>";
  if (findings.length === 0) {
    process.stderr.write(`✓ ${label}: clean\n`);
    return 0;
  }
  process.stderr.write(`✗ ${label}: ${findings.length} finding(s)\n`);
  for (const f of findings) {
    process.stderr.write(`    ${f.hex.padEnd(10)} ${f.severity.padEnd(8)} ${f.category.padEnd(18)} ${f.name} @ ${f.index}\n`);
  }
  return 1;
}

async function main(): Promise<number> {
  const { flags, files } = parseArgs(process.argv.slice(2));

  if (flags.has("--help")) {
    process.stdout.write(HELP);
    return 0;
  }
  if (flags.has("--version")) {
    process.stdout.write("unspook 0.1.0\n");
    return 0;
  }

  const options = optionsFromFlags(flags);
  const inputs: { name: string; text: string }[] =
    files.length > 0
      ? files.map((name) => ({ name, text: readFileSync(name, "utf8") }))
      : [{ name: "", text: readStdin() }];

  if (flags.has("--scan")) {
    let code = 0;
    for (const { name, text } of inputs) code = report(name, text) || code;
    return code;
  }

  let exitCode = 0;
  for (const { name, text } of inputs) {
    const output = flags.has("--reveal") ? reveal(text) : clean(text, options);
    if (flags.has("--write") && name) {
      writeFileSync(name, output);
      process.stderr.write(`✓ cleaned ${name}\n`);
    } else {
      process.stdout.write(output);
    }
  }
  return exitCode;
}

main().then((code) => process.exit(code));
