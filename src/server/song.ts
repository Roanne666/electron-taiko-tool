import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { convertSongToTja, isDir } from "./utils";
import iconv from "iconv-lite";
import type { Song, DifficlutyType, DifficultyInfo } from "./types";

const DEFAULT_EXCLUDE = ["S1 Dan-i Dojo", "S2 Taiko Towers", "X1 Favorite", "X2 Recent", "X3 Search By Difficulty"];

export function modifySong(song: Song) {
  const tjaString = convertSongToTja(song);
  const buffers = iconv.encode(tjaString, "Shift_JIS");
  writeFileSync(resolve(song.dir, song.name + ".tja"), buffers);
  return true;
}

export async function loadSongs(root: string, exclude = DEFAULT_EXCLUDE, use1P = true) {
  const stat = await isDir(root);
  if (!stat) return [];
  const songs: Song[] = [];
  let id = 0;

  // 读取类目文件夹
  const genreDirs = readdirSync(root);

  for (const g of genreDirs) {
    const genreDirPath = join(root, g);
    if (exclude.includes(g)) continue;

    const stat = await isDir(genreDirPath);
    if (!stat) continue;

    // 读取歌曲文件夹
    const songDirs = readdirSync(genreDirPath);
    if (!songDirs.includes("box.def")) continue;
    const { genre } = parseBoxDef(join(genreDirPath, "box.def"));

    for (const d of songDirs) {
      const songDirPath = join(genreDirPath, d);
      const stat = await isDir(songDirPath);
      if (!stat) continue;

      // 读取歌曲相关文件
      const songFiles = readdirSync(songDirPath);
      if (!songFiles.find((s) => s.includes(".tja"))) continue;

      let fileType = "";
      let wavePath = "";
      let tjaSrc = "";
      for (const f of songFiles) {
        if (f.endsWith("ogg") || f.endsWith("mp3")) {
          if (f.endsWith("ogg")) fileType = "ogg";
          if (f.endsWith("mp3")) fileType = "mp3";
          wavePath = join(songDirPath, f);
        }
        if (f.endsWith("tja")) tjaSrc = f;
      }
      if (tjaSrc === "") continue;
      const songName = tjaSrc.split(".tja")[0];
      const song = parseSong(songName, songDirPath, genre, join(songDirPath, tjaSrc));
      song.fileType = fileType;
      song.wavePath = wavePath;
      song.id = id;
      id += 1;

      songs.push(song);

      // 获取分数
      if (!songFiles.find((s) => (use1P ? s.includes("tja1P.score") : s.includes("tja2P.score")))) continue;
      const scorePath = use1P ? join(songDirPath, songName + ".tja1P.score.ini") : join(songDirPath, songName + ".tja2P.score.ini");
      const scores = parseScores(scorePath);

      for (const key in scores) {
        const d = song.difficulties.find((d) => d.name === key);
        if (d) d.score = scores[key as DifficlutyType];
      }
    }
  }
  return songs;
}

function parseBoxDef(path: string) {
  const content = readFileSync(path).toString();
  const lines = content.split("#");
  return { genre: lines[1].split(":")[1].trim() };
}

function parseSong(songName: string, dir: string, genre: string, filePath: string) {
  const song: Song = {
    id: 0,
    name: songName,
    dir,
    genre,
    bpm: 0,
    offset: 0,
    wave: "",
    wavePath: "",
    fileType: "",
    difficulties: [],
  };

  let content = readFileSync(filePath).toString();
  if (content.includes("�")) {
    const binary = readFileSync(filePath, { encoding: "binary" });
    const buffers = Buffer.from(binary, "binary");
    content = iconv.decode(buffers, "Shift_JIS");
  }

  const lines = content.split("\n");

  // 当前难度信息
  let dInfo = createNewDifficultyInfo("oni");

  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();

    if (line.includes("wave:")) song.wave = lines[i].split(":")[1];

    if (line.includes("bpm:")) song.bpm = Number(line.split(":")[1]);

    if (line.includes("offset:")) song.offset = Number(line.split(":")[1]);

    if (line.includes("course:")) {
      const d = line.split(":")[1];
      if (d === "edit" || d === "extreme" || d === "4") dInfo = createNewDifficultyInfo("extreme");
      else if (d === "oni" || d === "3") dInfo = createNewDifficultyInfo("oni");
      else if (d === "hard" || d === "2") dInfo = createNewDifficultyInfo("hard");
      else if (d === "normal" || d === "1") dInfo = createNewDifficultyInfo("normal");
      else if (d === "easy" || d === "0") dInfo = createNewDifficultyInfo("easy");
      else continue;
      song.difficulties.push(dInfo);
    }

    if (line.includes("level:")) dInfo.level = Number(line.split(":")[1]);

    if (line.includes("balloon:")) {
      dInfo.balloon = line
        .split(":")[1]
        .split(",")
        .map((s) => Number(s));
    }
    if (line.includes("scoreinit:")) dInfo.scoreInit = Number(line.split(":")[1]);
    if (line.includes("scorediff:")) dInfo.scoreDiff = Number(line.split(":")[1]);

    if (line.includes("#start")) start = i;
    if (line.includes("#end")) dInfo.beatmapData = lines.slice(start, i + 1);
  }

  return song;
}

function createNewDifficultyInfo(difficulty: "easy" | "normal" | "hard" | "oni" | "extreme"): DifficultyInfo {
  return {
    name: difficulty,
    level: 0,
    score: 0,
    scoreInit: 0,
    scoreDiff: 0,
    balloon: [],
    beatmapData: [],
  };
}

function parseScores(path: string) {
  const scores = {
    easy: 0,
    normal: 0,
    hard: 0,
    oni: 0,
    extreme: 0,
  };

  const content = readFileSync(path).toString();
  const lines = content.split("\r\n");
  for (const l of lines) {
    if (l.includes("HiScore1")) scores.easy = Number(l.split("=")[1]);
    if (l.includes("HiScore2")) scores.normal = Number(l.split("=")[1]);
    if (l.includes("HiScore3")) scores.hard = Number(l.split("=")[1]);
    if (l.includes("HiScore4")) scores.oni = Number(l.split("=")[1]);
    if (l.includes("HiScore5")) scores.extreme = Number(l.split("=")[1]);
  }
  return scores;
}
