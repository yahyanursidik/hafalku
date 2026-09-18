import type { VercelRequest, VercelResponse } from "@vercel/node";
import { respondToQuranGet, getQueryValue } from "../../../../server/quran/http";
import { createQuranReadRepository } from "../../../../server/quran/repository";
import { listSurahs } from "../../../../server/quran/read";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  await respondToQuranGet(request, response, "/api/v1/quran/surahs", () =>
    listSurahs(createQuranReadRepository(), { page: getQueryValue(request, "page"), limit: getQueryValue(request, "limit") }),
  );
}
