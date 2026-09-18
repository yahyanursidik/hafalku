import { resolve } from "node:path";
import { createContaboAudioManifest, writeAudioUploadManifest } from "../audio/contabo";
import { createVerifiedJuzAmmaAudioTimingManifest, describeTimingInputs, writeVerifiedAudioTimingManifest } from "../audio/timings";
import { diffQuranDatasets } from "../quran/diff";
import { loadQuranDataset } from "../quran/dataset";
import { activateQuranDataset, importQuranDataset } from "../quran/importer";
import { createMp3QuranJuzAmmaAudio, writeMp3QuranAudio } from "../quran/mp3quran";
import { writeValidationReport } from "../quran/report";
import { validateQuranDataset } from "../quran/validate";

type Command = "import" | "validate" | "diff" | "activate" | "audio:mp3quran" | "audio:contabo" | "audio:timings";

function readOption(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requireOption(name: string): string {
  const value = readOption(name);
  if (!value || value.startsWith("--")) throw new Error(`Missing required --${name} option`);
  return value;
}

function defaultReportPath(version: string): string {
  return resolve("reports", "quran", `${version}.validation.json`);
}

async function validateDirectory(datasetDirectory: string, reportPath?: string) {
  const dataset = await loadQuranDataset(datasetDirectory);
  const report = validateQuranDataset(dataset);
  const outputPath = await writeValidationReport(reportPath ?? defaultReportPath(dataset.metadata.version), report);
  return { dataset, report, outputPath };
}

async function run(): Promise<void> {
  const command = process.argv[2] as Command | undefined;
  if (!command || !["import", "validate", "diff", "activate", "audio:mp3quran", "audio:contabo", "audio:timings"].includes(command)) {
    throw new Error("Use one of: import, validate, diff, activate, audio:mp3quran, audio:contabo, audio:timings");
  }

  if (command === "activate") {
    console.log(JSON.stringify(await activateQuranDataset(requireOption("version"))));
    return;
  }

  if (command === "diff") {
    const from = await loadQuranDataset(requireOption("from"));
    const to = await loadQuranDataset(requireOption("to"));
    console.log(JSON.stringify(diffQuranDatasets(from, to), null, 2));
    return;
  }

  if (command === "audio:mp3quran") {
    const readId = Number(requireOption("read"));
    if (!Number.isInteger(readId) || readId <= 0) throw new Error("--read must be a positive MP3Quran timing-read ID");
    const dataset = await loadQuranDataset(requireOption("dataset"));
    const entries = await createMp3QuranJuzAmmaAudio(
      readId,
      dataset.verses.filter((verse) => verse.surahNumber >= 78 && verse.surahNumber <= 114).map((verse) => verse.verseKey),
    );
    const outputPath = await writeMp3QuranAudio(dataset.directory, dataset.audio, entries);
    console.log(JSON.stringify({ outputPath, audioEntries: entries.length, reciter: entries[0]?.reciter, scope: "Juz Amma (78-114)" }, null, 2));
    return;
  }

  if (command === "audio:contabo") {
    const prefix = readOption("prefix") ?? "quran/audio/mahmoud-khalil-al-hosary/hafs-murattal";
    const manifest = await createContaboAudioManifest({
      sourceDirectory: requireOption("source"),
      prefix,
      dryRun: process.argv.includes("--dry-run"),
      attribution: readOption("audio-source") || readOption("license-note")
        ? {
          source: readOption("audio-source") ?? "Way2Quran",
          licenseNote: readOption("license-note") ?? "Source metadata collected by the Hafalku uploader.",
        }
        : undefined,
    });
    const manifestPath = await writeAudioUploadManifest(
      readOption("manifest") ?? resolve("reports", "audio", "mahmoud-khalil-al-hosary.juz-amma.json"),
      manifest,
    );
    console.log(JSON.stringify({
      manifestPath,
      audioFiles: manifest.files.length,
      uploaded: manifest.files.filter((file) => file.status === "uploaded").length,
      skipped: manifest.files.filter((file) => file.status === "skipped").length,
      dryRun: process.argv.includes("--dry-run"),
      reciter: manifest.reciter,
    }, null, 2));
    return;
  }

  if (command === "audio:timings") {
    const manifest = await createVerifiedJuzAmmaAudioTimingManifest({
      surahJsonPath: requireOption("surah-json"),
      segmentsJsonPath: requireOption("segments-json"),
      referenceAudioDirectory: requireOption("reference-audio"),
      contaboAudioManifestPath: requireOption("audio-manifest"),
    });
    const outputPath = await writeVerifiedAudioTimingManifest(
      readOption("output") ?? resolve("reports", "audio", "mahmoud-khalil-al-hosary.juz-amma.timings.json"),
      manifest,
    );
    const frontendOutput = readOption("frontend-output");
    if (frontendOutput) await writeVerifiedAudioTimingManifest(frontendOutput, manifest);
    console.log(JSON.stringify({ outputPath, frontendOutput, entries: manifest.entries.length, contentHashSha256: manifest.contentHashSha256, inputs: describeTimingInputs() }, null, 2));
    return;
  }

  const { dataset, report, outputPath } = await validateDirectory(requireOption("dataset"), readOption("report"));
  if (command === "validate") {
    console.log(JSON.stringify({ reportPath: outputPath, ...report }, null, 2));
    if (!report.valid) process.exitCode = 1;
    return;
  }

  if (!report.valid) {
    console.log(JSON.stringify({ reportPath: outputPath, ...report }, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({ reportPath: outputPath, ...(await importQuranDataset(dataset, report)) }, null, 2));
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  console.error(JSON.stringify({ error: { code: "QURAN_CLI_ERROR", message } }));
  process.exitCode = 1;
});
