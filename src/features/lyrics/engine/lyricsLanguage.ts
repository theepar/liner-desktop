import { detectNonLatinLanguage } from "@braccato/core/text";
import type { Lyric } from "@braccato/parsers";

export type HanLanguage = "ja" | "zh" | "yue";

const KANA = /[\p{Script=Hiragana}\p{Script=Katakana}]/gu;
const HAN = /\p{Script=Han}/gu;
const CANTONESE = /[嘅咗唔哋冇喺啲嘢佢咁嚟咩嗰睇]/g;

function count(lyrics: readonly Lyric[], pattern: RegExp): number {
  return lyrics.reduce(
    (total, line) => total + (line.words.match(pattern)?.length ?? 0),
    0,
  );
}

export function getHanLanguage(lyrics: readonly Lyric[]): HanLanguage {
  const kana = count(lyrics, KANA);
  const han = count(lyrics, HAN);
  if (kana > 0 && kana / (kana + han) >= 0.1) return "ja";
  return count(lyrics, CANTONESE) >= 2 ? "yue" : "zh";
}

export function getLineLanguage(text: string, hanLanguage: HanLanguage) {
  const language = detectNonLatinLanguage(text);
  if (language === "ja" || language === "ko") return language;
  if (language === "zh") return hanLanguage === "yue" ? null : hanLanguage;
  return null;
}
