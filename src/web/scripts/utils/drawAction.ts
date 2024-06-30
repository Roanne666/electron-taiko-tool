import { NOTE_BORDER } from "../beatmap/const";
import { ratio } from "../stores/global";

export abstract class DrawAction {
  public abstract draw(context: CanvasRenderingContext2D): void;
}

export class DrawRectAction extends DrawAction {
  public readonly color: string;
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;

  constructor(options: { color: string; x: number; y: number; width: number; height: number }) {
    super();
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.fillStyle = this.color;
    context.fillRect(this.x * ratio.value, this.y * ratio.value, this.width * ratio.value, this.height * ratio.value);
    context.restore();
  }
}

export class DrawStrokeAction extends DrawAction {
  public readonly color: string;
  public readonly x1: number;
  public readonly y1: number;
  public readonly x2: number;
  public readonly y2: number;
  public readonly lineWidth: number;

  constructor(options: { color: string; x1: number; y1: number; x2: number; y2: number; lineWidth: number }) {
    super();
    this.color = options.color;
    this.x1 = options.x1;
    this.y1 = options.y1;
    this.x2 = options.x2;
    this.y2 = options.y2;
    this.lineWidth = options.lineWidth;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.lineWidth = this.lineWidth * ratio.value;
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(this.x1 * ratio.value, this.y1 * ratio.value);
    context.lineTo(this.x2 * ratio.value, this.y2 * ratio.value);
    context.closePath();
    context.stroke();
    context.restore();
  }
}

export class DrawTextAction extends DrawAction {
  public readonly font: string;
  public readonly color: string;
  public readonly text: string;
  public readonly x: number;
  public readonly y: number;

  constructor(options: { font: string; color: string; text: string; x: number; y: number }) {
    super();
    this.font = options.font;
    this.color = options.color;
    this.text = options.text;
    this.x = options.x;
    this.y = options.y;
  }

  public draw(context: CanvasRenderingContext2D) {
    const fontSize = Number(this.font.match(/\d+/)[0]);
    context.save();
    context.font = this.font.replace(String(fontSize), String(fontSize * ratio.value));
    context.fillStyle = this.color;
    context.fillText(this.text, this.x * ratio.value, this.y * ratio.value);
    context.restore();
  }
}

export class DrawNoteAction extends DrawAction {
  public readonly color: string;
  public readonly x: number;
  public readonly y: number;
  public readonly radius: number;
  public readonly angles: [number, number];

  constructor(options: { color: string; x: number; y: number; radius: number; angles: [number, number] }) {
    super();
    this.color = options.color;
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
    this.angles = options.angles;
  }

  public draw(context: CanvasRenderingContext2D) {
    const { x, y, color, radius, angles } = this;
    const realX = x * ratio.value;
    const realY = y * ratio.value;
    const realRadius = radius * ratio.value;

    // 最外层黑边
    context.save();
    context.beginPath();
    context.fillStyle = NOTE_BORDER;
    context.arc(realX, realY, realRadius, ...angles);
    context.fill();
    context.closePath();

    // 白边
    context.beginPath();
    context.fillStyle = "white";
    context.arc(realX, realY, realRadius * 0.9, ...angles);
    context.stroke();
    context.fill();
    context.closePath();

    // 音符
    context.beginPath();
    context.fillStyle = color;
    context.arc(realX, realY, realRadius * 0.75, ...angles);
    context.fill();
    context.closePath();
    context.restore();
  }
}
