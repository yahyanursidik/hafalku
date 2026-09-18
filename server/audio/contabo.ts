import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";
import { loadObjectStorageEnv, type ObjectStorageEnv } from "../config/env";

export const JUZ_AMMA_SURAH_NUMBERS = Array.from({ length: 37 }, (_, index) => index + 78);
const reciter = "Mahmoud Khalil Al Hosary";
const riwayah = "Hafs 'an 'Asim";
const style = "Murattal";
const defaultSource = "Way2Quran";
const defaultLicenseNote = "Educational and non-commercial use with attribution to Way2Quran and Mahmoud Khalil Al Hosary; do not redistribute beyond the confirmed permission scope.";

const uploadedAudioSchema = z.object({
  surahNumber: z.number().int().min(78).max(114),
  sourceFile: z.string().min(1),
  objectKey: z.string().min(1),
  publicUrl: z.string().url(),
  bytes: z.number().int().positive(),
  checksumSha256: z.string().regex(/^[a-f0-9]{64}$/),
  status: z.enum(["uploaded", "skipped"]),
});

export type UploadedAudio = z.infer<typeof uploadedAudioSchema>;

export type AudioUploadManifest = {
  manifestVersion: 1;
  scope: "Juz Amma (78-114)";
  generatedAt: string;
  reciter: { name: string; riwayah: string; style: string; source: string; licenseNote: string };
  bucket: string;
  prefix: string;
  files: UploadedAudio[];
};

type AudioFile = { surahNumber: number; path: string; fileName: string; bytes: Buffer; checksumSha256: string };

type S3Like = { send(command: HeadObjectCommand | PutObjectCommand, options?: { abortSignal?: AbortSignal }): Promise<unknown> };
const S3_REQUEST_TIMEOUT_MS = 20_000;

function expectedFileName(surahNumber: number) {
  return `${String(surahNumber).padStart(3, "0")}.mp3`;
}

export function buildObjectKey(prefix: string, surahNumber: number): string {
  return `${prefix.replace(/^\/+|\/+$/g, "")}/${expectedFileName(surahNumber)}`;
}

function publicUrl(baseUrl: string, objectKey: string): string {
  return new URL(objectKey, `${baseUrl.replace(/\/$/, "")}/`).toString();
}

function objectMissing(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === "object"
    && (("name" in error && (error.name === "NotFound" || error.name === "NoSuchKey"))
      || ("$metadata" in error
        && typeof error.$metadata === "object"
        && error.$metadata !== null
        && "httpStatusCode" in error.$metadata
        && error.$metadata.httpStatusCode === 404)),
  );
}

async function sendWithTimeout(client: S3Like, command: HeadObjectCommand | PutObjectCommand): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), S3_REQUEST_TIMEOUT_MS);
  try {
    return await client.send(command, { abortSignal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`Contabo request timed out after ${S3_REQUEST_TIMEOUT_MS / 1000} seconds.`);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function inspectLocalAudio(sourceDirectory: string): Promise<AudioFile[]> {
  const directory = resolve(sourceDirectory);
  const files = await readdir(directory, { withFileTypes: true });
  const mp3Names = files.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3")).map((entry) => entry.name).sort();
  const expectedNames = JUZ_AMMA_SURAH_NUMBERS.map(expectedFileName);
  if (mp3Names.join("\0") !== expectedNames.join("\0")) {
    throw new Error("Audio source must contain exactly 078.mp3 through 114.mp3 and no other MP3 files.");
  }

  return Promise.all(JUZ_AMMA_SURAH_NUMBERS.map(async (surahNumber) => {
    const fileName = expectedFileName(surahNumber);
    const path = join(directory, fileName);
    const bytes = await readFile(path);
    if (bytes.byteLength === 0) throw new Error(`Audio file is empty: ${fileName}`);
    return { surahNumber, path, fileName, bytes, checksumSha256: createHash("sha256").update(bytes).digest("hex") };
  }));
}

export async function createContaboAudioManifest(options: {
  sourceDirectory: string;
  prefix: string;
  attribution?: { source: string; licenseNote: string };
  environment?: ObjectStorageEnv;
  client?: S3Like;
  dryRun?: boolean;
}): Promise<AudioUploadManifest> {
  const environment = options.environment ?? loadObjectStorageEnv();
  const client = options.client ?? new S3Client({
    endpoint: environment.S3_ENDPOINT,
    region: environment.S3_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: environment.S3_ACCESS_KEY_ID, secretAccessKey: environment.S3_SECRET_ACCESS_KEY },
  });
  const files = await inspectLocalAudio(options.sourceDirectory);
  const attribution = options.attribution ?? { source: defaultSource, licenseNote: defaultLicenseNote };
  const uploaded: UploadedAudio[] = [];

  for (const file of files) {
    const objectKey = buildObjectKey(options.prefix, file.surahNumber);
    let status: UploadedAudio["status"] = "uploaded";
    if (!options.dryRun) {
      try {
        const existing = await sendWithTimeout(client, new HeadObjectCommand({ Bucket: environment.S3_BUCKET, Key: objectKey })) as { Metadata?: Record<string, string> };
        if (existing.Metadata?.sha256 === file.checksumSha256) {
          status = "skipped";
        } else {
          throw new Error(`Refusing to overwrite ${objectKey}: existing checksum does not match local audio.`);
        }
      } catch (error) {
        if (!objectMissing(error)) throw error;
        await sendWithTimeout(client, new PutObjectCommand({
          Bucket: environment.S3_BUCKET,
          Key: objectKey,
          Body: file.bytes,
          ContentType: "audio/mpeg",
          CacheControl: "public, max-age=31536000, immutable",
          Metadata: {
            sha256: file.checksumSha256,
            reciter: reciter,
            riwayah,
            style,
            source: attribution.source.toLowerCase(),
          },
        }));
      }
    }
    uploaded.push(uploadedAudioSchema.parse({
      surahNumber: file.surahNumber,
      sourceFile: basename(file.path),
      objectKey,
      publicUrl: publicUrl(environment.S3_PUBLIC_BASE_URL, objectKey),
      bytes: file.bytes.byteLength,
      checksumSha256: file.checksumSha256,
      status,
    }));
  }

  return {
    manifestVersion: 1,
    scope: "Juz Amma (78-114)",
    generatedAt: new Date().toISOString(),
    reciter: { name: reciter, riwayah, style, source: attribution.source, licenseNote: attribution.licenseNote },
    bucket: environment.S3_BUCKET,
    prefix: options.prefix,
    files: uploaded,
  };
}

export async function writeAudioUploadManifest(path: string, manifest: AudioUploadManifest): Promise<string> {
  const outputPath = resolve(path);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return outputPath;
}
