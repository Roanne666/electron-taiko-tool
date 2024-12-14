export type DifficlutyType = "easy" | "normal" | "hard" | "oni" | "extreme";

export type DifficultyInfo = {
  name: DifficlutyType;
  level: number;
  score: number;
  scoreInit: number;
  scoreDiff: number;
  balloon: number[];
  beatmapData: string[];
};

export type Song = {
  id: number;
  name: string;
  bpm: number;
  wave: string;
  wavePath: string;
  fileType: string;
  offset: number;
  dir: string;
  genre: string;
  difficulties: DifficultyInfo[];
};
