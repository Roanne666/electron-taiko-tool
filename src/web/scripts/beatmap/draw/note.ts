import { DrawNoteAction } from "../../utils/drawAction";

export function getNoteAction(x: number, y: number, color: string, radius: number, arcType: "left" | "right" | "full") {
  const angles: [number, number] = [0, 2 * Math.PI];
  if (arcType === "left") {
    angles[0] = Math.PI / 2;
    angles[1] = -Math.PI / 2;
  } else if (arcType === "right") {
    angles[0] = -Math.PI / 2;
    angles[1] = Math.PI / 2;
  }

  return new DrawNoteAction({ color, radius, x, y, angles });
}
