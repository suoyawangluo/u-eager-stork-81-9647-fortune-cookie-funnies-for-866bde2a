// Fortune Cookie Funnies for Engineers — entry program.
// Writes a single-line fortune cookie message (<=120 chars) to /output/entry.txt.
// The fortune is built from named parts so the turn lands at the end.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const PARTS = {
  promise: "You will find the bug today.",
  history: "It has been in production since Tuesday,",
  sting: "and it has your name on it.",
};

function buildEntry(): string {
  return [PARTS.promise, PARTS.history, PARTS.sting].join(" ");
}

type GateReport = { ok: boolean; chars: number; lines: number };

function validateEntry(entry: string): GateReport {
  const chars = [...entry].length;
  const lines = entry.split("\n").length;
  const ok =
    chars >= 1 && chars <= 120 && lines === 1 && entry.trim().length > 0;
  return { ok, chars, lines };
}

function verifyWritten(target: string): string {
  const back = readFileSync(target, "utf8");
  return createHash("sha256").update(back, "utf8").digest("hex");
}

function main(): void {
  const entry = buildEntry();
  const report = validateEntry(entry);
  if (!report.ok) {
    throw new Error(
      `gate failed: ${report.chars} chars, ${report.lines} lines`,
    );
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, entry, "utf8");
  const sha = verifyWritten(target);
  console.log(
    `gate passes: ${report.chars} characters, ${report.lines} line, sha256 ${sha}`,
  );
  console.log(`verified: ${JSON.stringify(entry)}`);
}

main();
