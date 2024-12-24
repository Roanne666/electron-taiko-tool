import { Bar, Change, Measure, Stat } from "../types";

export class Beatmap {
  public bars: Bar[];
  public changes: Change[];
  public rows: number[];
  public stats;
  public readonly realNotesCount: number;
  public readonly factor: number;

  constructor(beatmapData: string[], songBpm: number) {
    const { bars, changes } = this.parseBeatmapData(beatmapData, songBpm);
    this.bars = bars;
    this.changes = changes;
    this.realNotesCount = this.bars.reduce(
      (count, bar) => count + bar.reduce((noteCount, beat) => noteCount + beat.filter((n) => n > 0 && n < 5).length, 0),
      0
    );

    this.stats = this.getStats();
    this.rows = this.getRows();
    this.factor = this.getFactor();
  }

  private parseBeatmapData(beatmapData: string[], songBpm: number) {
    const bars: Bar[] = [];
    const changes: Change[] = [];

    changes.push({ noteIndex: 0, realNoteIndex: 0, bpm: songBpm, hs: 1 });

    // 数据变化
    let lastMeasure: Measure = [4, 4];

    let currentBar: number[] = [];

    let noteIndex = 0;
    let tempNoteIndex = 0;
    // 实际音符数（去除了0，长条和气球）
    let realNoteIndex = 0;

    let barDivision: { noteIndex: number; barNoteIndex: number }[] = [];

    for (let i = 0; i < beatmapData.length; i++) {
      const line = beatmapData[i].toLowerCase().trim();
      if (line.includes("#end")) break;

      if (line.includes("#")) {
        let change = changes.find((c) => c.noteIndex === tempNoteIndex);
        if (!change) {
          change = { noteIndex: tempNoteIndex, realNoteIndex };
          changes.push(change);
        }
        if (line.includes("#measure")) {
          const measureStrings = line.split(" ")[1].split("/");
          lastMeasure = [Number(measureStrings[0]), Number(measureStrings[1])];
          change.measure = lastMeasure;
        } else if (line.includes("#scroll")) change.hs = Number(line.split(" ")[1]);
        else if (line.includes("#bpmchange")) change.bpm = Number(line.split(" ")[1]);
        else if (line.includes("#delay")) change.delay = Number(line.split(" ")[1]);
        else if (line.includes("#gogostart")) change.gogotime = true;
        else if (line.includes("#gogoend")) change.gogotime = false;
        else if (line.includes("#barlineon")) change.barline = true;
        else if (line.includes("#barlineoff")) change.barline = false;
      } else if (line.includes(",")) {
        const lineNotes = line
          .split(",")[0]
          .split("")
          .map((s) => Number(s));
        currentBar.push(...lineNotes);

        const beats = this.sliceBarToBeats(currentBar, lastMeasure[0]);
        bars.push(beats);

        const finalBarLength = beats.reduce((l, b) => l + b.length, 0);
        const barScale = finalBarLength / currentBar.length;

        for (const d of barDivision) {
          const change = changes.find((c) => c.noteIndex === d.noteIndex);
          if (change) change.noteIndex += barScale * d.barNoteIndex;
        }

        realNoteIndex += lineNotes.filter((n) => n > 0 && n < 5).length;
        noteIndex += finalBarLength;
        tempNoteIndex = noteIndex;
        currentBar = [];
        barDivision = [];
      } else if (line.length > 0) {
        const lineNotes = line
          .split("//")[0]
          .split("")
          .map((s) => Number(s));
        currentBar.push(...lineNotes);
        tempNoteIndex += line.length;
        realNoteIndex += lineNotes.filter((n) => n > 0 && n < 5).length;
        barDivision.push({ noteIndex: tempNoteIndex, barNoteIndex: currentBar.length });
      }
    }

    return { bars, changes };
  }

  private sliceBarToBeats(notesArray: number[], measure: number) {
    const newNotesArray = [...notesArray];

    // 如果音符数少于两倍拍子数，则补全音符
    if (newNotesArray.length === 0) {
      notesArray.length = measure;
      notesArray.fill(0);
    } else if (newNotesArray.length < measure) {
      const beats = newNotesArray.map((v) => [v]);
      for (const beat of beats) {
        for (let i = 1; i < measure; i++) {
          beat.push(0);
        }
        newNotesArray.push(...beat);
      }
    }

    const notePerBeat = newNotesArray.length / measure;

    const beats: number[][] = [];
    let currentBeat: number[] = [];
    for (const note of newNotesArray) {
      currentBeat.push(note);
      if (currentBeat.length >= notePerBeat) {
        beats.push(currentBeat);
        currentBeat = [];
      }
    }

    if (currentBeat.length > 0) beats.push(currentBeat);

    return beats;
  }

  /**
   * 获取谱面行数
   * @returns
   */
  private getRows() {
    const rows: number[] = [];

    // 当前行的节拍数
    let rowBeatCount = 0;

    // 当前绘制的长条，small和big为黄条，ballon为气球
    let currentLong: "" | "small" | "big" | "balloon" = "";

    for (let i = 0; i < this.bars.length; i++) {
      const bar = this.bars[i];

      // 超过一行小节数且不是长条时换行
      const beatOverflow = rowBeatCount + bar.length > 16 && currentLong === "";
      if (beatOverflow) {
        rows.push(rowBeatCount);
        rowBeatCount = 0;
      }

      for (let j = 0; j < bar.length; j++) {
        const beat = bar[j];
        rowBeatCount += 1;

        if (rowBeatCount >= 16) {
          rows.push(rowBeatCount);
          rowBeatCount = 0;
        }

        // 绘制音符
        for (const note of beat) {
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
    }

    return rows;
  }

  /**
   * 获取谱面数据
   * @param beatmap
   * @returns
   */
  private getStats() {
    let lastBpm = this.changes[0].bpm;
    let lastHs = this.changes[0].hs;

    const bpmStats: Stat[] = [];
    const hsStats: Stat[] = [];
    const speedStats: Stat[] = [];

    let lastCount = 0;

    for (const c of this.changes) {
      const interval = c.realNoteIndex - lastCount;
      lastCount = c.realNoteIndex;
      const change = { ...c };

      const speed = lastBpm * lastHs;
      const speedStat = speedStats.find((s) => s.name === String(speed));
      if (speedStat) speedStat.value += interval;
      else speedStats.push({ name: String(speed), value: interval });

      if (change.bpm) lastBpm = change.bpm;
      const bpmStat = bpmStats.find((s) => s.name === String(lastBpm));
      if (bpmStat) bpmStat.value += interval;
      else bpmStats.push({ name: String(lastBpm), value: interval });

      if (change.hs) lastHs = change.hs;
      const hsStat = hsStats.find((s) => s.name === String(lastHs));
      if (hsStat) hsStat.value += interval;
      else hsStats.push({ name: String(lastHs), value: interval });
    }

    const lastInterval = this.realNotesCount - lastCount;

    const speed = lastBpm * lastHs;
    const speedStat = speedStats.find((s) => s.name === String(speed));
    if (speedStat) speedStat.value += lastInterval;
    else speedStats.push({ name: String(speed), value: lastInterval });

    const bpmStat = bpmStats.find((s) => s.name === String(lastBpm));
    if (bpmStat) bpmStat.value += lastInterval;
    else bpmStats.push({ name: String(lastBpm), value: lastInterval });

    const hsStat = hsStats.find((s) => s.name === String(lastHs));
    if (hsStat) hsStat.value += lastInterval;
    else hsStats.push({ name: String(lastHs), value: lastInterval });

    const noteStats = this.getNoteStats();
    return { bpmStats, hsStats, speedStats, noteStats };
  }

  private getNoteStats() {
    const noteStats: Stat[] = [
      { name: "散音", value: 0 },
      { name: "2连", value: 0 },
      { name: "3连", value: 0 },
      { name: "4连", value: 0 },
      { name: "5连", value: 0 },
      { name: "鱼蛋", value: 0 },
    ];

    const allNotes: number[] = [];
    for (const bar of this.bars) {
      for (const beat of bar) {
        allNotes.push(...beat);
      }
    }

    let comboCount = 0;
    for (const note of allNotes) {
      if (note === 0) {
        if (comboCount === 1) noteStats.find((s) => s.name === "散音").value += comboCount;
        if (comboCount === 2) noteStats.find((s) => s.name === "2连").value += comboCount;
        if (comboCount === 3) noteStats.find((s) => s.name === "3连").value += comboCount;
        if (comboCount === 4) noteStats.find((s) => s.name === "4连").value += comboCount;
        if (comboCount === 5) noteStats.find((s) => s.name === "5连").value += comboCount;
        if (comboCount > 5) noteStats.find((s) => s.name === "鱼蛋").value += comboCount;
        comboCount = 0;
      }
      if (note > 0 && note < 5) comboCount += 1;
    }

    return noteStats.filter((s) => s.value > 0);
  }

  public getChartOptions() {
    return {
      bpmOption: {
        title: {
          text: "BPM数据表",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "BPM：{b}<br>占比：{c}音符 ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "BPM数据",
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: this.stats.bpmStats,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
      hsOption: {
        title: {
          text: "HS数据表",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "HS：{b}<br>占比：{c}音符 ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "HS数据",
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: this.stats.hsStats,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
      speedOption: {
        title: {
          text: "速率数据表",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "速率：{b}<br>占比：{c}音符 ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "速率数据",
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: this.stats.speedStats,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
      noteOption: {
        title: {
          text: "音符数据表",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "类型：{b}<br>占比：{c}个 ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
        },
        series: [
          {
            name: "音符数据",
            type: "pie",
            radius: "55%",
            center: ["50%", "50%"],
            data: this.stats.noteStats,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
    };
  }

  getFactor(): number {
    // Step 1: 计算加权音符密度
    let weightedDensitySum = 0;

    // 遍历 speedStats 计算音符密度并累加音符数量
    this.stats.speedStats.forEach((stat) => {
      const speed = Number(stat.name);
      const notes = stat.value;

      // 计算每个速度下的音符密度
      const density = (notes * speed) / this.realNotesCount; // 音符密度：音符数 * 速度 / 总音符数

      // 累加音符密度的加权和
      weightedDensitySum += density;
    });

    // Step 2: 计算加权音符密度的平均值
    const speedFactor = weightedDensitySum / 40;

    // Step 2: 计算连击的难度系数
    let comboFactor = 0;
    for (const combo of this.stats.noteStats) {
      const noteCount = combo.value;

      // 根据不同combo类型设定不同的难度权重
      if (combo.name === "散音") {
        comboFactor += (noteCount * 1.0) / this.realNotesCount; // 散音
      } else if (combo.name === "二连") {
        comboFactor += (noteCount * 1.2) / this.realNotesCount; // 二连
      } else if (combo.name === "三连") {
        comboFactor += (noteCount * 1.4) / this.realNotesCount; // 三连
      } else if (combo.name === "四连") {
        comboFactor += (noteCount * 1.6) / this.realNotesCount; // 四连
      } else if (combo.name === "五连") {
        comboFactor += (noteCount * 1.8) / this.realNotesCount; // 五连
      } else if (combo.name === "鱼蛋") {
        comboFactor += (noteCount * 2.0) / this.realNotesCount; // 鱼蛋
      }
    }

    // Step 3: 计算最终定数
    let finalConstant = speedFactor + comboFactor;

    // Step 4: 标准化定数，确保定数在合理范围内（假设在0到10之间）
    finalConstant = Number(Math.max(0, Math.min(finalConstant, 10)).toFixed(1)); // 保证定数在0-10之间

    return finalConstant;
  }
}
