import type { DifficultyInfo } from "@server/types";
import { BEATMAP_BG_COLOR, SONG_NAME_FONT, DIFFICULTY_FONT, LEVEL_FONT, CANVAS_WIDTH } from "../const";
import { DrawRectAction, DrawTextAction } from "../drawAction";

const difficultyNames = {
  easy: "梅",
  normal: "竹",
  hard: "松",
  oni: "鬼",
  extreme: "里",
};

/**
 * 绘制图片背景
 * @param canvas
 * @param song
 * @param difficulty
 */
export function drawBackground(canvas: HTMLCanvasElement, songName: string, difficultyInfo: DifficultyInfo) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  const { name, level } = difficultyInfo;

  // 图片底色
  new DrawRectAction({
    color: BEATMAP_BG_COLOR,
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: canvas.height,
  }).draw(context);

  // 歌名
  new DrawTextAction({
    font: SONG_NAME_FONT,
    color: "black",
    text: songName,
    x: 10,
    y: 30,
  }).draw(context);

  // 难度
  new DrawTextAction({
    font: DIFFICULTY_FONT,
    color: "black",
    text: difficultyNames[name],
    x: 10,
    y: 55,
  }).draw(context);

  // 星级
  let levelText = "";
  for (let i = 0; i < 10; i++) {
    levelText += i < level ? "★" : "☆";
  }

  new DrawTextAction({
    font: LEVEL_FONT,
    color: "black",
    text: levelText,
    x: 35,
    y: 57,
  }).draw(context);
}
