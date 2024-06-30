import { MARK_FONT, ROW_SPACE, ROW_HEIGHT, BEAT_WIDTH, MARGIN_X, MARGIN_Y } from "../../beatmap/const";
import { DrawTextAction } from "../../utils/drawAction";
import type { Change } from "../../types";

/**
 * 绘制bpm，scroll等相关标记
 * @param context
 * @param gridInfo
 * @param options
 */
export function getMarkActions(options: { bar: number; barBeatCount: number; row: number; rowBeatCount: number; showBar: boolean; change?: Change }) {
  const { bar, barBeatCount, row, rowBeatCount, showBar, change } = options;

  const actions: DrawTextAction[] = [];

  if (barBeatCount === 0 && showBar) {
    const action = new DrawTextAction({
      font: MARK_FONT,
      color: "black",
      text: `${bar}`,
      x: MARGIN_X + rowBeatCount * BEAT_WIDTH + 5,
      y: MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row - 5,
    });
    actions.push(action);
  }

  // 和小节数字标记的间隔
  let margin = 20;
  if (bar >= 10) margin = 25;
  if (bar >= 100) margin = 30;

  const firstX = MARGIN_X + rowBeatCount * BEAT_WIDTH + margin;
  const firstY = MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row - 5;

  let drawBpm = false;
  let bpmIsFloat = false;

  // bpm标注
  if (change?.bpm) {
    drawBpm = true;
    bpmIsFloat = Math.floor(change.bpm) < change.bpm;
    const action = new DrawTextAction({
      font: MARK_FONT,
      color: "black",
      text: `bpm${bpmIsFloat ? change.bpm.toFixed(2) : change.bpm}`,
      x: firstX,
      y: firstY,
    });
    actions.push(action);
  }

  const secondX = MARGIN_X + rowBeatCount * BEAT_WIDTH + margin + (bpmIsFloat ? 65 : 55);
  const secondY = MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row - 5;

  // scroll标注
  if (change?.hs) {
    const isFloat = Math.floor(change.hs) < change.hs;
    actions.push(
      new DrawTextAction({
        font: MARK_FONT,
        color: "black",
        text: `hs ${isFloat ? change.hs.toFixed(2) : change.hs}`,
        x: drawBpm ? secondX : firstX,
        y: drawBpm ? secondY : firstY,
      })
    );
  }

  return actions;
}
