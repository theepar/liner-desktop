import { romanize as romanizeHangul } from "@romanize/korean";
import { detectNonLatinLanguage } from "@braccato/core/text";
import type { Lyric } from "@braccato/parsers";

export function romanizeLine(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (detectNonLatinLanguage(trimmed) !== "ko") return null;
  const romanized = romanizeHangul(trimmed).trim();
  return romanized && romanized !== trimmed ? romanized : null;
}

export function hasRomanizableLyrics(lyrics: readonly Lyric[]): boolean {
  return lyrics.some((line) => detectNonLatinLanguage(line.words) === "ko");
}

export function romanizeLyrics(lyrics: readonly Lyric[]): (string | null)[] {
  return lyrics.map((line) =>
    (line as { isInstrumental?: boolean }).isInstrumental
      ? null
      : romanizeLine(line.words),
  );
}
