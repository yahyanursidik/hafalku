import { getPhraseChunkEnds } from "./learningChunks";

describe("learning flow chunks", () => {
  it("keeps explicitly reviewed chunks where available", () => {
    expect(getPhraseChunkEnds(112, 1, 4)).toEqual([2, 4]);
  });

  it("creates continuous visual practice groups without changing the verse", () => {
    expect(getPhraseChunkEnds(78, 1, 2)).toEqual([2]);
    expect(getPhraseChunkEnds(78, 14, 6)).toEqual([3, 6]);
    expect(getPhraseChunkEnds(78, 40, 11)).toEqual([3, 6, 8, 11]);
  });
});
