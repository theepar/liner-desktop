import { romanize as romanizeHangul } from "@romanize/korean";
import { detectNonLatinLanguage } from "@braccato/core/text";
import type { Lyric } from "@braccato/parsers";

type Pinyin = typeof import("pinyin-pro").pinyin;

const HANGUL_RUN = /[ᄀ-ᇿ㄰-㆏가-힯]+/g;
const KANA = /[぀-ヿㇰ-ㇿ]/;
const SPACE_BEFORE_CLOSING = /\s+([，。！？、；：,.!?;:…）」』】》”’])/g;
const SPACE_AFTER_OPENING = /([（「『【《“‘])\s+/g;

let pinyin: Pinyin | null = null;

function romanizeKorean(text: string): string {
  return text.replace(HANGUL_RUN, (run) => romanizeHangul(run));
}

function romanizeChinese(text: string): string | null {
  if (!pinyin) return null;
  return pinyin(text, { nonZh: "consecutive" })
    .replace(/\s{2,}/g, " ")
    .replace(SPACE_BEFORE_CLOSING, "$1")
    .replace(SPACE_AFTER_OPENING, "$1");
}

function hasKana(lyrics: readonly Lyric[]): boolean {
  return lyrics.some((line) => KANA.test(line.words));
}

function isChineseLine(text: string, allowChinese: boolean): boolean {
  return allowChinese && detectNonLatinLanguage(text) === "zh";
}

export async function loadRomanizers(lyrics: readonly Lyric[]): Promise<void> {
  if (pinyin) return;
  const allowChinese = !hasKana(lyrics);
  if (!lyrics.some((line) => isChineseLine(line.words, allowChinese))) return;
  pinyin = (await import("pinyin-pro")).pinyin;
}

export function romanizeLine(
  text: string,
  allowChinese: boolean = true,
): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const language = detectNonLatinLanguage(trimmed);
  try {
    let romanized: string | null;
    if (language === "ko") romanized = romanizeKorean(trimmed);
    else if (language === "zh" && allowChinese)
      romanized = romanizeChinese(trimmed);
    else return null;
    romanized = romanized?.trim() ?? "";
    return romanized && romanized !== trimmed ? romanized : null;
  } catch {
    return null;
  }
}

export function hasRomanizableLyrics(lyrics: readonly Lyric[]): boolean {
  const allowChinese = !hasKana(lyrics);
  return lyrics.some(
    (line) =>
      detectNonLatinLanguage(line.words) === "ko" ||
      isChineseLine(line.words, allowChinese),
  );
}

export function romanizeLyrics(lyrics: readonly Lyric[]): (string | null)[] {
  const allowChinese = !hasKana(lyrics);
  return lyrics.map((line) =>
    (line as { isInstrumental?: boolean }).isInstrumental
      ? null
      : romanizeLine(line.words, allowChinese),
  );
}
