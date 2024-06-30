import { PART_BG_COLOR, ROW_HEIGHT, ROW_SPACE, MARGIN_Y, CANVAS_WIDTH } from "../../beatmap/const";
import { ratio } from "../../stores/global";
import { DrawRectAction } from "../../utils";

/**
 * 绘制行
 * @param context
 * @param row
 * @param canvasWidth
 */
export function drawRow(context: CanvasRenderingContext2D, row: number, canvasWidth: number) {
  // 黑色边
  new DrawRectAction({
    color: "black",
    x: 0,
    y: MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE) - 2,
    width: CANVAS_WIDTH,
    height: ROW_HEIGHT + 4,
  }).draw(context);

  // 灰色底
  new DrawRectAction({
    color: PART_BG_COLOR,
    x: 0,
    y: MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE),
    width: CANVAS_WIDTH,
    height: ROW_HEIGHT,
  }).draw(context);

  // 白色内边
  new DrawRectAction({
    color: "white",
    x: 0,
    y: MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE),
    width: CANVAS_WIDTH,
    height: 4,
  }).draw(context);
  new DrawRectAction({
    color: "white",
    x: 0,
    y: MARGIN_Y + row * (ROW_HEIGHT + ROW_SPACE) + ROW_HEIGHT - 4,
    width: CANVAS_WIDTH,
    height: 4,
  }).draw(context);
}
