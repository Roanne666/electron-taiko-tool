export type Measure = [number, number];

export type Change = {
  bpm?: number;
  hs?: number;
  measure?: Measure;
  gogotime?: boolean;
  barline?: boolean;
  delay?: number;
};

export type Beatmap = {
  changes: {
    [beatIndex: number]: Change;
  };
  beats: number[][];
};

export type BeatPos = "start" | "middle" | "end";

export type ImageData = {
  uid: number;
  data: string;
};
