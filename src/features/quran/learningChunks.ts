// Learning metadata only. This file never alters canonical Arabic text.
const phraseChunkEnds: Record<string, number[]> = {
  "112:1": [2, 4], "112:2": [2], "112:3": [2, 4], "112:4": [3, 6],
  "113:1": [3], "113:2": [4], "113:3": [5], "113:4": [3, 6], "113:5": [5],
  "114:1": [3], "114:2": [2], "114:3": [2], "114:4": [4], "114:5": [2, 5], "114:6": [3],
};

function createFlowChunkEnds(wordCount: number): number[] {
  if (wordCount < 1) return [];

  const ends: number[] = [];
  let consumed = 0;
  while (consumed < wordCount) {
    const remaining = wordCount - consumed;
    // These are continuous visual groups for practice, never waqaf markers.
    const groupSize = remaining <= 4 ? remaining : remaining === 5 ? 2 : 3;
    consumed += groupSize;
    ends.push(consumed);
  }
  return ends;
}

export function getPhraseChunkEnds(surahNumber: number, ayahNumber: number, wordCount: number): number[] {
  return phraseChunkEnds[`${surahNumber}:${ayahNumber}`] ?? createFlowChunkEnds(wordCount);
}
