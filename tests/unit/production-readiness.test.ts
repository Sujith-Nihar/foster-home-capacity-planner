import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const PROCESSED_DIR = join(ROOT, "data", "processed");
const SUPABASE_MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

const FORBIDDEN_UI_LABEL_PATTERNS = [
  /\blabel:\s*["'`][^"'`]*\b(beds?|vacancies|vacancy)\b/i,
  /\blabel:\s*["'`][^"'`]*\brisk score\b/i,
  /\blabel:\s*["'`][^"'`]*\bprediction\b/i,
  /\btitle:\s*["'`][^"'`]*\b(beds?|vacancies|vacancy)\b/i,
  /\btitle:\s*["'`][^"'`]*\brisk score\b/i,
];

const MACHINE_DATE_PATTERNS = [
  /\bnew Date\s*\(/,
  /\bDate\.now\s*\(/,
];

function walkFiles(directory: string, extension: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath, extension));
      continue;
    }
    if (fullPath.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

function readTrackedFiles(pattern: string): string[] {
  try {
    return execSync(`git ls-files ${pattern}`, { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

describe("production readiness guards", () => {
  it("does not reference SUPABASE_SECRET_KEY in src/", () => {
    const sourceFiles = walkFiles(SRC_DIR, ".ts").concat(walkFiles(SRC_DIR, ".tsx"));
    for (const file of sourceFiles) {
      const contents = readFileSync(file, "utf8");
      expect(contents, relative(ROOT, file)).not.toMatch(/SUPABASE_SECRET_KEY/);
    }
  });

  it("does not use machine current date for metrics in src/", () => {
    const sourceFiles = walkFiles(SRC_DIR, ".ts").concat(walkFiles(SRC_DIR, ".tsx"));
    for (const file of sourceFiles) {
      const contents = readFileSync(file, "utf8");
      for (const pattern of MACHINE_DATE_PATTERNS) {
        expect(contents, relative(ROOT, file)).not.toMatch(pattern);
      }
    }
  });

  it("does not use beds, vacancies, prediction, or risk score as UI labels", () => {
    const componentFiles = walkFiles(join(SRC_DIR, "components"), ".tsx").concat(
      walkFiles(join(SRC_DIR, "app"), ".tsx"),
    );

    for (const file of componentFiles) {
      const contents = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_UI_LABEL_PATTERNS) {
        expect(contents, relative(ROOT, file)).not.toMatch(pattern);
      }
    }
  });

  it("does not commit raw CSV files", () => {
    const trackedRawCsv = readTrackedFiles("data/raw/*.csv");
    expect(trackedRawCsv).toEqual([]);
  });

  it("does not commit processed CSV files", () => {
    const trackedProcessedCsv = readTrackedFiles("data/processed/*.csv");
    expect(trackedProcessedCsv).toEqual([]);
  });

  it("does not include id_child in Supabase public table migrations", () => {
    const migrationFiles = readdirSync(SUPABASE_MIGRATIONS_DIR).filter((file) =>
      file.endsWith(".sql"),
    );

    for (const file of migrationFiles) {
      const contents = readFileSync(join(SUPABASE_MIGRATIONS_DIR, file), "utf8");
      expect(contents, file).not.toMatch(/\bid_child\b/i);
    }
  });

  it("does not include id_child in committed processed artifacts when present locally", () => {
    const processedJsonFiles = readTrackedFiles("data/processed/*.json").filter(
      (file) => !file.endsWith("data_profile.json"),
    );
    for (const file of processedJsonFiles) {
      const contents = readFileSync(join(ROOT, file), "utf8");
      expect(contents, file).not.toMatch(/\bid_child\b/);
    }

    let processedCsvFiles: string[] = [];
    try {
      processedCsvFiles = readdirSync(PROCESSED_DIR).filter((file) => file.endsWith(".csv"));
    } catch {
      processedCsvFiles = [];
    }

    for (const file of processedCsvFiles) {
      const firstLine = readFileSync(join(PROCESSED_DIR, file), "utf8").split("\n")[0] ?? "";
      expect(firstLine.toLowerCase(), file).not.toContain("id_child");
    }
  });
});
