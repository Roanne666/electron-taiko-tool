// ------ 位置/尺寸 ------

/**
 * 谱面起始位置，用于留边
 */
export const MARGIN_X = 40;
export const MARGIN_Y = 90;

/**
 * 每行的拍子数
 */
export const BEAT_PER_ROW = 16;

/**
 * 拍子宽度
 */
export const BEAT_WIDTH = 50;

/**
 * 行高度
 */
export const ROW_HEIGHT = 35;

/**
 * 行间隔
 */
export const ROW_SPACE = 45;

export const CANVAS_WIDTH = 2 * MARGIN_X + BEAT_WIDTH * BEAT_PER_ROW;

// ------ 颜色 ------

/**
 * 音符黑边
 */
export const NOTE_BORDER = "rgb(49,49,49)";

/**
 * 咚音符的颜色
 */
export const DON_COLOR = "rgb(255,66,66)";

/**
 * 咔音符的颜色
 */
export const KA_COLOR = "rgb(67,200,255)";

/**
 * 黄条颜色
 */
export const YELLOW_COLOR = "rgb(255,239,67)";

/**
 * 气球颜色
 */
export const BALLOON_COLOR = "rgb(255,191,67)";

/**
 * 亮色竖线
 */
export const LIGHT_LINE_COLOR = "rgb(191,191,191)";

/**
 * 暗色竖线
 */
export const DARK_LINE_COLOR = "rgb(159,159,159)";

/**
 * 谱面背景色
 */
export const BEATMAP_BG_COLOR = "rgb(204,204,204)";

/**
 * 小节背景色
 */
export const PART_BG_COLOR = "rgb(128,128,128)";

/**
 * gogotime背景色
 */
export const GOGOTIME_BG_COLOR = "rgb(255,192,192)";

// ------ 尺寸 ------

/**
 * 小音符的尺寸
 */
export const SMALL_NOTE_RADIUS = 10.67;

/**
 * 大音符的尺寸
 */
export const BIG_NOTE_RADIUS = 14.2;

// ------ 字体 ------
export const FONT_FAMILY = ' "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif';

/**
 * 歌曲名称字体
 */
export const SONG_NAME_FONT = `normal bold 20px ${FONT_FAMILY}`;

/**
 * 难度字体
 */
export const DIFFICULTY_FONT = `normal bold 18px ${FONT_FAMILY}`;

/**
 * 等级字体
 */
export const LEVEL_FONT = `normal bold 24px ${FONT_FAMILY}`;

/**
 * 标注小节，bpm和scroll等内容的字体
 */
export const MARK_FONT = `normal 11px ${FONT_FAMILY}`;
