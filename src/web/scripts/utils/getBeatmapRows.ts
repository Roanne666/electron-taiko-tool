import type { Beatmap, Measure } from "../types";

/**
 * 解析获取每一行的节拍数
 * @param beatmap
 * @returns
 */
export function getBeatmapRows(beatmap: Beatmap) {
  const rows: number[] = [];

  // 当前行的节拍数
  let rowBeatCount = -1;

  let barBeatCount = -1;

  let lastMeasure: Measure = [4, 4];

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  for (let i = 0; i < beatmap.beats.length; i++) {
    rowBeatCount += 1;
    barBeatCount += 1;
    if (barBeatCount >= lastMeasure[0]) barBeatCount = 0;

    const notes = beatmap.beats[i];

    const change = beatmap.changes[i];
    const measureChange = false;

    if (change?.measure) lastMeasure = change.measure;

    let beatOverflow = false;
    if (rowBeatCount >= 16) {
      beatOverflow = true;
    } else if (barBeatCount === 0 && rowBeatCount + lastMeasure[0] > 16) {
      beatOverflow = true;
    }

    // 超过一行小节数时或者节拍变化时换行
    if (beatOverflow) {
      rows.push(rowBeatCount);
      rowBeatCount = 0;
    } else if (measureChange) {
      // 没有超过小节数，仅节拍变化时，长条优先不换行
      if (currentLong === "") {
        rows.push(rowBeatCount);
        rowBeatCount = 0;
      }
    }

    // 绘制音符
    for (let j = 0; j < notes.length; j++) {
      const note = notes[j];

      if (note === 5) {
        currentLong = "small";
      } else if (note === 6) {
        currentLong = "big";
      } else if (note === 7) {
        currentLong = "balloon";
      } else if (note === 8) {
        currentLong = "";
      }
    }
  }

  return rows;
}
