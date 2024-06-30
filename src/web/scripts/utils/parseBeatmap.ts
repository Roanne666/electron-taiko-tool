import type { Beatmap, Measure, Change } from "../types";

export function parseBeatmap(lines: string[]) {
  const beatmap: Beatmap = {
    changes: {},
    beats: [],
  };

  let totalBeatCount = 0;

  // 数据变化
  let lastMeasure: Measure = [4, 4];

  let currentBar: number[] = [];
  let barDivision: { noteCount: number; change: Change }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (line.includes("#end")) return beatmap;

    if (line.includes("#")) {
      if (line.includes("#measure")) {
        const measureStrings = line.split(" ")[1].split("/");
        lastMeasure = [Number(measureStrings[0]), Number(measureStrings[1])];
        setChange(beatmap.changes, totalBeatCount, "measure", lastMeasure);
      } else if (line.includes("#scroll")) {
        const hs = Number(line.split(" ")[1]);
        if (barDivision.length > 0) {
          barDivision[barDivision.length - 1].change.hs = hs;
        } else {
          setChange(beatmap.changes, totalBeatCount, "hs", hs);
        }
      } else if (line.includes("#bpmchange")) {
        const bpm = Number(line.split(" ")[1]);
        if (barDivision.length > 0) {
          barDivision[barDivision.length - 1].change.bpm = bpm;
        } else {
          setChange(beatmap.changes, totalBeatCount, "bpm", bpm);
        }
      } else if (line.includes("#delay")) {
        const delay = Number(line.split(" ")[1]);
        if (barDivision.length > 0) {
          barDivision[barDivision.length - 1].change.delay = delay;
        } else {
          setChange(beatmap.changes, totalBeatCount, "delay", delay);
        }
      } else if (line.includes("#gogostart")) setChange(beatmap.changes, totalBeatCount, "gogotime", true);
      else if (line.includes("#gogoend")) setChange(beatmap.changes, totalBeatCount, "gogotime", false);
      else if (line.includes("#barlineon")) setChange(beatmap.changes, totalBeatCount, "barline", true);
      else if (line.includes("#barlineoff")) setChange(beatmap.changes, totalBeatCount, "barline", false);
    } else if (line.includes(",")) {
      currentBar.push(
        ...line
          .split(",")[0]
          .split("")
          .map((s) => Number(s))
      );

      // 在小节中间改变数据
      if (barDivision.length > 0) {
        for (const d of barDivision) {
          const change = d.change;
          const changeIndex = totalBeatCount + (d.noteCount / currentBar.length) * lastMeasure[0];
          if (change.hs) setChange(beatmap.changes, changeIndex, "hs", change.hs);
          if (change.bpm) setChange(beatmap.changes, changeIndex, "bpm", change.bpm);
          if (change.delay) setChange(beatmap.changes, changeIndex, "delay", change.delay);
        }
      }

      const beats = sliceBarToBeats(currentBar, lastMeasure[0]);
      beatmap.beats.push(...beats);

      currentBar = [];
      barDivision = [];

      totalBeatCount += lastMeasure[0];
    } else if (line.length > 0) {
      currentBar.push(
        ...line
          .split("//")[0]
          .split("")
          .map((s) => Number(s))
      );
      barDivision.push({ noteCount: currentBar.length, change: {} });
    }
  }

  return beatmap;
}

function sliceBarToBeats(notes: number[], measure: number) {
  // 如果音符数少于拍子数，则补全音符
  if (notes.length === 0) {
    for (let i = 0; i < measure; i++) {
      notes.push(0);
    }
  } else if (notes.length < measure) {
    const beats = notes.map((v) => [v]);
    notes.length = 0;
    for (const beat of beats) {
      for (let i = 1; i < measure; i++) {
        beat.push(0);
      }
      notes.push(...beat);
    }
  }

  const notePerBeat = notes.length / measure;

  const beats: number[][] = [];
  let currentBeat: number[] = [];
  for (const note of notes) {
    currentBeat.push(note);
    if (currentBeat.length >= notePerBeat) {
      beats.push(currentBeat);
      currentBeat = [];
    }
  }
  if (currentBeat.length > 0) beats.push(currentBeat);

  return beats;
}

function setChange(changes: { [beatIndex: number]: Change }, index: number, key: keyof Change, value: any) {
  if (changes[index]) {
    changes[index][key] = value;
  } else {
    changes[index] = {
      [key]: value,
    };
  }
}
