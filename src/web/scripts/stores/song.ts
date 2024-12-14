import type { DifficlutyType, Song } from "@server/types";
import type { DataTableColumn, DataTableColumnGroup } from "naive-ui";
import type { TableBaseColumn } from "naive-ui/es/data-table/src/interface";
import { ElectronAPIs } from "../../../api";
import { reactive } from "vue";
import { BeatmapStat } from "../types";

// ------- 常量 -------
export type DifficultyTypes = "all" | DifficlutyType;

/**
 * 等级列表
 */
export const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type LevelTypes = (typeof levels)[number];

/**
 * 分数评价列表
 */
export const scores = {
  全部: [0, 9999999],
  未合格: [0, 500000],
  白粋: [500000, 600000],
  銅粋: [600000, 700000],
  銀粋: [700000, 800000],
  金雅: [800000, 900000],
  桃雅: [900000, 950000],
  紫雅: [950000, 1000000],
  極: [1000000, 9999999],
} as const;

/**
 * 分数评价类型
 */
export type ScoreTypes = keyof typeof scores;

/**
 * 表格基础列
 */
export const basicColumns: (DataTableColumn<Song> | DataTableColumnGroup<Song>)[] = [
  {
    title: "类目",
    key: "genre",
    align: "center",
    width: 120,
  },
  {
    title: "曲名",
    key: "name",
    align: "center",
    width: 230,
  },
];

/**
 * 等级子列
 * @param key
 * @returns
 */
export const createLevelSubCloumn = (key: DifficlutyType): TableBaseColumn<Song> => {
  return {
    title: "等级",
    key: `${key}level`,
    align: "center",
    width: 50,
    render(row) {
      const d = row.difficulties.find((d) => d.name === key);
      return d ? `${d.level}★` : "";
    },
  };
};

// ------- 歌曲相关 -------

/**
 * 所有歌曲
 */
export const allSongs = reactive<Song[]>([]);

/**
 * 歌曲类目
 */
export const genres = reactive<string[]>([]);

/**
 * 所有谱面数据表
 */
export const allBeatmapStats = reactive<BeatmapStat[]>([]);

/**
 * 获取所有歌曲
 */
export async function fetchAllSongs() {
  if ("electronAPI" in window) {
    const apis = window.electronAPI as ElectronAPIs;
    const newSongs = await apis.getSongs();

    allSongs.length = 0;

    for (const s of newSongs) {
      allSongs.push(s);

      // for (const d of s.difficulties) {
      //   const { bpmStats, hsStats, noteStats, speedStats } = analyzeBeatmap(d.beatmapData);
      //   allBeatmapStats.push({
      //     songName: s.name,
      //     genre: s.genre,
      //     difficultyType: d.name,
      //     level: d.level,
      //     beatmapStats: { bpmStats, hsStats, noteStats, speedStats },
      //   });
      // }

      if (genres.includes(s.genre)) continue;
      genres.push(s.genre);
    }

    console.log(allSongs);
  }
}
