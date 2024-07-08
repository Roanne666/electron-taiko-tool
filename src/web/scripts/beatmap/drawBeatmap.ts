import type { Song, DifficlutyType, DifficultyInfo } from "@server/types";
import { drawBackground } from "./draw/background";
import {
  MARGIN_X,
  BEAT_WIDTH,
  MARGIN_Y,
  ROW_HEIGHT,
  ROW_SPACE,
  BALLOON_COLOR,
  YELLOW_COLOR,
  BIG_NOTE_RADIUS,
  SMALL_NOTE_RADIUS,
  DON_COLOR,
  KA_COLOR,
  MARK_FONT,
  CANVAS_WIDTH,
} from "./const";
import { DrawAction, DrawTextAction } from "./drawAction";
import { drawRow, getBeatActions, getLongActions, getMarkActions, getNoteAction } from "./draw";
import type { BeatPos, Measure } from "../types";
import { ratio } from "../stores/global";
import { Beatmap } from "./beatmap";

export function drawBeatmap(
  canvas: HTMLCanvasElement,
  song: Song,
  difficulty: DifficlutyType,
  options: { showBar: boolean; showBpm: boolean; showHs: boolean }
) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const difficultyInfo = song.difficulties.find((d) => d.name === difficulty) as DifficultyInfo;

  const beatmap = new Beatmap(difficultyInfo.beatmapData, song.bpm);
  console.log(beatmap);
  const { balloon } = difficultyInfo;

  // 调整canvas大小并绘制背景
  canvas.width = CANVAS_WIDTH * ratio.value;
  canvas.height = (MARGIN_Y + (beatmap.rows.length + 1) * (ROW_HEIGHT + ROW_SPACE) - ROW_SPACE + 25) * ratio.value;
  drawBackground(canvas, song.name, difficultyInfo);

  // 初始化数据
  const beatActions: DrawAction[] = [];
  const markActions: DrawAction[] = [];
  const noteActions: DrawAction[] = [];

  // 当前音符数
  let currentNoteIndex = -1;
  // 当前节拍数
  let currentBeat = -1;
  // 当前行数
  let currentRow = 0;
  // 行内节拍数
  let rowBeatCount = -1;

  // 气球索引
  let balloonIndex = 0;

  // 当前绘制的长条，small和big为黄条，ballon为气球
  let currentLong: "" | "small" | "big" | "balloon" = "";

  let measure: Measure = [4, 4];

  const firstChange = beatmap.changes[0];
  if (firstChange.measure) measure = firstChange.measure;

  drawRow(context, currentRow);

  for (let i = 0; i < beatmap.bars.length; i++) {
    const bar = beatmap.bars[i];

    for (let j = 0; j < bar.length; j++) {
      const beat = bar[j];
      currentBeat += 1;
      rowBeatCount += 1;

      if (rowBeatCount >= beatmap.rows[currentRow]) {
        rowBeatCount = 0;
        currentRow += 1;
        drawRow(context, currentRow);
      }

      let beatPos: BeatPos = "start";

      if (measure[0] > 1) {
        if (j > 0 && j < measure[0] - 1) {
          beatPos = "middle";
        } else if (j === measure[0] - 1) {
          beatPos = "end";
        }
      }

      // 绘制节拍
      beatActions.push(...getBeatActions(currentRow, rowBeatCount, j, i, beatPos, firstChange));

      // tja当前行没有写notes时（特殊情况）
      if (beat.length === 0 && currentLong !== "") {
        const x = MARGIN_X + currentBeat * BEAT_WIDTH;
        const y = MARGIN_Y + currentRow * (ROW_HEIGHT + ROW_SPACE) + ROW_HEIGHT / 2;

        const color = currentLong === "balloon" ? BALLOON_COLOR : YELLOW_COLOR;
        const radius = currentLong === "big" ? BIG_NOTE_RADIUS : SMALL_NOTE_RADIUS;
        const longActions = getLongActions({ x, y, color, radius, drawType: "middle", interval: BEAT_WIDTH });
        noteActions.push(...longActions);
      }

      // 音符间隔
      const noteInterval = BEAT_WIDTH / beat.length;

      // 绘制音符
      for (let k = 0; k < beat.length; k++) {
        const note = beat[k];
        const subBeatCount = k / beat.length;

        currentNoteIndex += 1;
        const change = beatmap.changes.find((c) => c.noteIndex === currentNoteIndex);
        if (change) {
          if (change.measure) measure = change.measure;

          // 根据bpm和scroll变化绘制标记
          if (!options.showBpm) change.bpm = undefined;
          if (!options.showHs) change.hs = undefined;

          markActions.push(
            ...getMarkActions({
              bar: i + 1,
              row: currentRow,
              rowBeatCount: rowBeatCount + subBeatCount,
              isStart: beatPos === "start",
              change,
            })
          );
        }

        const noteX = MARGIN_X + rowBeatCount * BEAT_WIDTH + k * noteInterval;
        const noteY = MARGIN_Y + currentRow * (ROW_HEIGHT + ROW_SPACE) + ROW_HEIGHT / 2;

        if (note === 0) {
          if (currentLong === "") continue;
          const color = currentLong === "balloon" ? BALLOON_COLOR : YELLOW_COLOR;
          const radius = currentLong === "big" ? BIG_NOTE_RADIUS : SMALL_NOTE_RADIUS;
          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color,
            radius,
            drawType: "middle",
            interval: noteInterval,
          });
          noteActions.push(...longActions);
        } else if (note === 1) noteActions.push(getNoteAction(noteX, noteY, DON_COLOR, SMALL_NOTE_RADIUS, "full"));
        else if (note === 2) noteActions.push(getNoteAction(noteX, noteY, KA_COLOR, SMALL_NOTE_RADIUS, "full"));
        else if (note === 3) noteActions.push(getNoteAction(noteX, noteY, DON_COLOR, BIG_NOTE_RADIUS, "full"));
        else if (note === 4) noteActions.push(getNoteAction(noteX, noteY, KA_COLOR, BIG_NOTE_RADIUS, "full"));
        else if (note === 5) {
          currentLong = "small";
          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color: YELLOW_COLOR,
            radius: SMALL_NOTE_RADIUS,
            drawType: "start",
            interval: noteInterval,
          });
          noteActions.push(...longActions);
        } else if (note === 6) {
          currentLong = "big";
          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color: YELLOW_COLOR,
            radius: BIG_NOTE_RADIUS,
            drawType: "start",
            interval: noteInterval,
          });
          noteActions.push(...longActions);
        } else if (note === 7) {
          currentLong = "balloon";

          // 气球数字标记
          const balloonNum = balloon[balloonIndex];
          const textAction = new DrawTextAction({
            font: MARK_FONT,
            color: "black",
            text: `${balloonNum}`,
            x: noteX - 4,
            y: noteY + 4,
          });
          markActions.push(textAction);

          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color: BALLOON_COLOR,
            radius: SMALL_NOTE_RADIUS,
            drawType: "start",
            interval: noteInterval,
          });
          noteActions.push(...longActions);

          balloonIndex += 1;
        } else if (note === 8) {
          if (currentLong === "") continue;
          const color = currentLong === "balloon" ? BALLOON_COLOR : YELLOW_COLOR;
          const radius = currentLong === "big" ? BIG_NOTE_RADIUS : SMALL_NOTE_RADIUS;
          const longActions = getLongActions({
            x: noteX,
            y: noteY,
            color,
            radius,
            drawType: "end",
            interval: noteInterval,
          });
          noteActions.push(...longActions);

          currentLong = "";
        }
      }
    }
  }

  // 绘制储存的所有动作
  beatActions.forEach((a) => a.draw(context));
  noteActions.forEach((a) => a.draw(context));
  markActions.forEach((a) => a.draw(context));

  return { beatmap, imageData: { uid: Math.floor(Math.random() * 100000), data: canvas.toDataURL("image/jpg") } };
}
