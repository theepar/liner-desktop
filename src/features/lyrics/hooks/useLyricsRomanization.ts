import { useEffect, type RefObject } from "react";
import { injectRomanization } from "@braccato/core";
import { ROMANIZED_LYRICS_CLASS } from "@braccato/core/constants";
import type { Lyric } from "@braccato/parsers";
import { romanizeLyrics } from "../engine/lyricsRomanization";

const LYRICS_LOADED_EVENT = "braccato:lyrics-loaded";

export function syncRomanization(el: any, lyrics: Lyric[], enabled: boolean) {
  const renderer = el.renderer;
  if (!renderer) return;
  const lines: readonly any[] = renderer.lines;
  let changed = false;

  if (enabled) {
    const texts = romanizeLyrics(lyrics);
    // Each lyric builds exactly one line; anything else means the view is mid-rebuild.
    if (texts.length !== lines.length) return;
    lines.forEach((line, i) => {
      const text = texts[i];
      if (!text) return;
      if (line.lyricElement.querySelector(`.${ROMANIZED_LYRICS_CLASS}`)) return;
      injectRomanization(document, line.lyricElement, line, text);
      changed = true;
    });
  } else {
    for (const line of lines) {
      const node = line.lyricElement.querySelector(
        `.${ROMANIZED_LYRICS_CLASS}`,
      );
      if (!node) continue;
      node.remove();
      changed = true;
    }
  }

  if (changed) {
    renderer.scheduleLyricPositionUpdate(
      () => el.isConnected,
      () => {},
    );
  }
}

export function useLyricsRomanization(
  elementRef: RefObject<any>,
  lyrics: Lyric[],
  enabled: boolean,
) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const sync = () => syncRomanization(el, lyrics, enabled);
    sync();
    el.addEventListener(LYRICS_LOADED_EVENT, sync);
    return () => el.removeEventListener(LYRICS_LOADED_EVENT, sync);
  }, [elementRef, lyrics, enabled]);
}
