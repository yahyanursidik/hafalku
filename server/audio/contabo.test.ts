import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { expect, vi } from "vitest";
import { buildObjectKey, createContaboAudioManifest, JUZ_AMMA_SURAH_NUMBERS, writeAudioUploadManifest } from "./contabo";

const environment = {
  S3_ENDPOINT: "https://eu2.contabostorage.com",
  S3_REGION: "EU",
  S3_ACCESS_KEY_ID: "key",
  S3_SECRET_ACCESS_KEY: "secret",
  S3_BUCKET: "hafalku",
  S3_PUBLIC_BASE_URL: "https://audio.example.test/hafalku",
};

async function localAudioDirectory() {
  const directory = await mkdtemp(join(tmpdir(), "hafalku-audio-"));
  await Promise.all(JUZ_AMMA_SURAH_NUMBERS.map((surahNumber) => writeFile(join(directory, `${String(surahNumber).padStart(3, "0")}.mp3`), `audio-${surahNumber}`)));
  return directory;
}

describe("Contabo Juz Amma uploader", () => {
  it("creates stable object keys", () => {
    expect(buildObjectKey("/quran/audio/husary/", 78)).toBe("quran/audio/husary/078.mp3");
  });

  it("uploads only the complete Juz Amma set and writes attribution metadata", async () => {
    const send = vi.fn(async (command: HeadObjectCommand | PutObjectCommand) => {
      if (command instanceof HeadObjectCommand) throw Object.assign(new Error("missing"), { name: "NotFound" });
      return {};
    });
    const manifest = await createContaboAudioManifest({ sourceDirectory: await localAudioDirectory(), prefix: "quran/audio/husary", environment, client: { send } });
    expect(manifest.files).toHaveLength(37);
    expect(manifest.files.every((file) => file.status === "uploaded")).toBe(true);
    expect(send.mock.calls.filter(([command]) => command instanceof PutObjectCommand)).toHaveLength(37);
    expect(manifest.reciter.name).toBe("Mahmoud Khalil Al Hosary");
  });

  it("creates parent directories for a machine-readable manifest", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hafalku-manifest-"));
    const path = await writeAudioUploadManifest(join(directory, "nested", "manifest.json"), {
      manifestVersion: 1,
      scope: "Juz Amma (78-114)",
      generatedAt: "2026-09-17T00:00:00.000Z",
      reciter: { name: "Mahmoud Khalil Al Hosary", riwayah: "Hafs 'an 'Asim", style: "Murattal", source: "Way2Quran", licenseNote: "Educational" },
      bucket: "hafalku",
      prefix: "quran/audio/husary",
      files: [],
    });
    expect(JSON.parse(await readFile(path, "utf8"))).toMatchObject({ scope: "Juz Amma (78-114)" });
  });
});
