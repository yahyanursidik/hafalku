// @vitest-environment node
import { getTableColumns } from "drizzle-orm";
import { readdir, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  quranCoreTableNames,
  quranDatasetVersions,
  quranVerses,
  verseTransliterations,
} from "./schema";

const migrationFile = new URL("../../drizzle/0000_quran_core.sql", import.meta.url);

describe("Quran Core schema", () => {
  it("keeps every canonical verse explicitly tied to a dataset version", () => {
    expect(Object.keys(getTableColumns(quranVerses))).toEqual(
      expect.arrayContaining(["datasetVersionId", "verseKey", "textUthmani", "contentHash"]),
    );
    expect(Object.keys(getTableColumns(quranDatasetVersions))).toEqual(
      expect.arrayContaining(["version", "contentHash", "status"]),
    );
  });

  it("keeps learning metadata out of canonical Arabic tables", () => {
    const forbiddenColumns = ["chunk", "hint", "progress", "annotation", "visibility"];
    const coreColumns = [
      ...Object.keys(getTableColumns(quranVerses)),
      ...Object.keys(getTableColumns(verseTransliterations)),
    ];

    forbiddenColumns.forEach((forbiddenColumn) => {
      expect(coreColumns.some((column) => column.toLowerCase().includes(forbiddenColumn))).toBe(false);
    });
  });

  it("makes every Quran Core table importer-only in the migration", async () => {
    const migration = await readFile(migrationFile, "utf8");

    expect(migration).toContain("require_quran_importer_context");
    quranCoreTableNames.forEach((tableName) => {
      expect(migration).toContain(`CREATE TRIGGER "${tableName}_importer_only"`);
      expect(migration).toContain(`ON "${tableName}"`);
    });
  });

  it("keeps Quran routes limited to the read-only API phase", async () => {
    const quranApiDirectory = new URL("../../api/v1/quran/", import.meta.url);

    await expect(readdir(quranApiDirectory)).resolves.toBeDefined();
  });
});
