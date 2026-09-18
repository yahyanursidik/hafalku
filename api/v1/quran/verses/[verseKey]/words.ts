import type { VercelRequest, VercelResponse } from "@vercel/node";
import { respondToQuranGet, requireRouteValue } from "../../../../../server/quran/http";
import { createQuranReadRepository } from "../../../../../server/quran/repository";
import { getVerseWords } from "../../../../../server/quran/read";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  await respondToQuranGet(request, response, "/api/v1/quran/verses/:verseKey/words", () =>
    getVerseWords(createQuranReadRepository(), requireRouteValue(request, "verseKey")),
  );
}
