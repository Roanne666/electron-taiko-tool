import { statSync } from "fs";
import type { Song } from "./types";

export async function isDir(path: string) {
  return new Promise<boolean>((resolve) => {
    const stat = statSync(path);
    resolve(stat.isDirectory());
  });
}

export function convertSongToTja(song: Song): string {
  const TITLE = `TITLE:${song.name}`;
  const SUBTITLE = `SUBTITLE:--`;
  const BPM = `BPM:${song.bpm}`;
  const WAVE = `WAVE:${song.wave}`;
  const SONGVOL = `SONGVOL:100`;
  const SEVOL = `SEVOL:100`;
  const OFFSET = `OFFSET:${song.offset}`;
  const DEMOSTART = `DEMOSTART:0`;

  let tjaString = `${TITLE}\n${SUBTITLE}\n${BPM}\n${WAVE}\n${SONGVOL}\n${SEVOL}\n${OFFSET}\n${DEMOSTART}\n`;

  for (const d of song.difficulties) {
    let COURSE = `COURSE:`;
    if (d.name === "extreme") COURSE += "4";
    if (d.name === "oni") COURSE += "3";
    if (d.name === "hard") COURSE += "2";
    if (d.name === "normal") COURSE += "1";
    if (d.name === "easy") COURSE += "0";

    const LEVEL = `LEVEL:${d.level}`;
    const BALLOON = `BALLOON:${d.balloon.join(",")}`;
    const SCOREINIT = `SCOREINIT:0`;
    const SCOREDIFF = `SCOREDIFF:0`;

    tjaString += `\n${COURSE}\n${LEVEL}\n${BALLOON}\n${SCOREINIT}\n${SCOREDIFF}\n${d.beatmapData.join("\n")}\n`;
  }

  return tjaString;
}
