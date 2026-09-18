import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, vi } from "vitest";
import { QuranAudioPlayer } from "./QuranAudioPlayer";

describe("QuranAudioPlayer", () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play");
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");

  beforeEach(() => {
    play.mockResolvedValue();
    pause.mockImplementation(() => undefined);
  });

  it("plays an ayah exactly the selected number of times", async () => {
    const user = userEvent.setup();
    render(<QuranAudioPlayer source="/audio/surah.mp3" startMs={1_000} endMs={2_500} />);
    await user.click(screen.getByRole("button", { name: "Ulangi 3 kali" }));
    await user.click(screen.getByRole("button", { name: "Putar audio" }));
    const audio = screen.getByTestId("quran-audio") as HTMLAudioElement;
    expect(audio.currentTime).toBe(1);
    pause.mockClear();
    await act(async () => {
      audio.currentTime = 2.5;
      fireEvent.timeUpdate(audio);
      audio.currentTime = 2.5;
      fireEvent.timeUpdate(audio);
      audio.currentTime = 2.5;
      fireEvent.timeUpdate(audio);
    });
    expect(play).toHaveBeenCalledTimes(3);
    expect(pause).toHaveBeenCalledTimes(3);
  });

  it("cancels a current repeat when the selected verse changes", async () => {
    const user = userEvent.setup();
    const view = render(<QuranAudioPlayer source="/audio/surah.mp3" startMs={1_000} endMs={2_500} />);
    await user.click(screen.getByRole("button", { name: "Ulangi 5 kali" }));
    await user.click(screen.getByRole("button", { name: "Putar audio" }));
    view.rerender(<QuranAudioPlayer source="/audio/surah.mp3" startMs={2_600} endMs={4_000} />);
    const audio = screen.getByTestId("quran-audio") as HTMLAudioElement;
    expect(audio.currentTime).toBe(2.6);
    expect(screen.getByRole("button", { name: "Putar audio" })).toBeVisible();
  });

  it("cancels playback when the verse player unmounts", async () => {
    const user = userEvent.setup();
    const view = render(<QuranAudioPlayer source="/audio/surah.mp3" startMs={1_000} endMs={2_500} />);
    await user.click(screen.getByRole("button", { name: "Putar audio" }));
    view.unmount();
    expect(pause).toHaveBeenCalled();
  });
});
