import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { QuranValidationReport } from "./validate";

export async function writeValidationReport(outputPath: string, report: QuranValidationReport): Promise<string> {
  const resolvedOutputPath = resolve(outputPath);
  await mkdir(dirname(resolvedOutputPath), { recursive: true });
  await writeFile(resolvedOutputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return resolvedOutputPath;
}
