import { DifficlutyType } from "@server/types";

export type Measure = [number, number];

export type Bar = Beat[];

export type Beat = number[];

export type Change = {
  noteIndex: number;
  realNoteIndex: number;
  bpm?: number;
  hs?: number;
  measure?: Measure;
  gogotime?: boolean;
  barline?: boolean;
  delay?: number;
};

export type BeatPos = "start" | "middle" | "end";

export type ImageData = {
  uid: number;
  data: string;
};

export type Stat = {
  name: string;
  value: number;
};

export type BeatmapStat = {
  genre: string;
  songName: string;
  difficultyType: DifficlutyType;
  level: number;
  beatmapStats: { bpmStats: Stat[]; hsStats: Stat[]; speedStats: Stat[]; noteStats: Stat[] };
};
