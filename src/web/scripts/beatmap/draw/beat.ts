import { MARGIN_X, BEAT_WIDTH, MARGIN_Y, ROW_HEIGHT, ROW_SPACE, GOGOTIME_BG_COLOR, DARK_LINE_COLOR, LIGHT_LINE_COLOR } from "../../beatmap/const";
import { DrawRectAction, DrawStrokeAction, type DrawAction } from "../../utils/drawAction";
import type { BeatPos, Change } from "../../types";

/**
 * 节拍相关（节拍线和gogotime）
 * @param row
 * @param rowBeatCount
 * @param beatPos
 * @param change
 * @returns
 */
export function getBeatActions(row: number, rowBeatCount: number, beatPos: BeatPos, change: Change) {
  const BEGIN_X = MARGIN_X + rowBeatCount * BEAT_WIDTH;
  const BEGIN_Y = MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row - 15;
  const END_X = MARGIN_X + rowBeatCount * BEAT_WIDTH;
  const END_Y = MARGIN_Y + (ROW_HEIGHT + ROW_SPACE) * row + ROW_HEIGHT;

  const actions: DrawAction[] = [];

  // gogotime背景色
  if (change.gogotime) actions.push(getGogotimeAction(rowBeatCount, BEGIN_X, BEGIN_Y));

  const { barEndLineAction, barStartLineAction, beatEndLineAction, beatSubLine } = getLineActions(BEGIN_X, BEGIN_Y, END_X, END_Y);

  // 节拍竖线，如果是小节起始拍，则画小节起始线，最后一拍时画小节结束线
  if (beatPos === "start") {
    actions.push(barStartLineAction);
    actions.push(beatSubLine);
    actions.push(beatEndLineAction);
  } else if (beatPos === "middle") {
    actions.push(beatSubLine);
    actions.push(beatEndLineAction);
  } else {
    actions.push(beatSubLine);
    actions.push(barEndLineAction);
  }

  return actions;
}

function getGogotimeAction(rowBeatCount: number, beginX: number, beginY: number) {
  // 当前行第一拍时补齐左侧，最后一拍时补齐右侧
  if (rowBeatCount === 0) {
    return new DrawRectAction({
      color: GOGOTIME_BG_COLOR,
      x: beginX - MARGIN_X,
      y: beginY - 2,
      width: BEAT_WIDTH + MARGIN_X,
      height: 15,
    });
  } else if (rowBeatCount === 15) {
    return new DrawRectAction({
      color: GOGOTIME_BG_COLOR,
      x: beginX,
      y: beginY - 2,
      width: BEAT_WIDTH + MARGIN_X,
      height: 15,
    });
  } else {
    return new DrawRectAction({
      color: GOGOTIME_BG_COLOR,
      x: beginX,
      y: beginY - 2,
      width: BEAT_WIDTH,
      height: 15,
    });
  }
}

function getLineActions(BEGIN_X: number, BEGIN_Y: number, END_X: number, END_Y: number) {
  // 拍子中间线
  const beatSubLine = new DrawStrokeAction({
    lineWidth: 2,
    color: DARK_LINE_COLOR,
    x1: BEGIN_X + BEAT_WIDTH / 2,
    y1: BEGIN_Y + 20,
    x2: END_X + BEAT_WIDTH / 2,
    y2: END_Y - 5,
  });

  // 拍子结束线
  const beatEndLineAction = new DrawStrokeAction({
    lineWidth: 2,
    color: LIGHT_LINE_COLOR,
    x1: BEGIN_X + BEAT_WIDTH,
    y1: BEGIN_Y + 20,
    x2: END_X + BEAT_WIDTH,
    y2: END_Y - 5,
  });

  // 小节起始线
  const barStartLineAction = new DrawStrokeAction({
    lineWidth: 2,
    color: "white",
    x1: BEGIN_X,
    y1: BEGIN_Y,
    x2: END_X,
    y2: END_Y,
  });

  // 小节结束线
  const barEndLineAction = new DrawStrokeAction({
    lineWidth: 2,
    color: "white",
    x1: BEGIN_X + BEAT_WIDTH,
    y1: BEGIN_Y,
    x2: END_X + BEAT_WIDTH,
    y2: END_Y,
  });

  return { beatEndLineAction, barEndLineAction, beatSubLine, barStartLineAction };
}
