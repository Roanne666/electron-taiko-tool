<template>
  <n-flex vertical justify="center">
    <n-scrollbar style="max-height: 89vh">
      <n-flex justify="center">
        <canvas ref="canvasRef"></canvas>
      </n-flex>
      <n-back-top :right="props.backTopRight" :bottom="20" />
    </n-scrollbar>
    <n-flex justify="center">
      <audio
        ref="audioRef"
        controls
        oncontextmenu="return false"
        controlslist="nodownload"
        :style="{ width: ratio * 880 + 'px', height: '45px' }"
      />
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import {
  BEAT_WIDTH,
  DrawStrokeAction,
  MARGIN_X,
  MARGIN_Y,
  ROW_HEIGHT,
  ROW_SPACE,
  drawBeatmap,
  Beatmap,
} from "../scripts/beatmap";
import { ratio } from "../scripts/stores/global";
import type { DifficlutyType, Song } from "@server/types";
import { NFlex, NScrollbar, NBackTop } from "naive-ui";
import { ref, watch } from "vue";

const canvasRef = ref<HTMLCanvasElement>();
const audioRef = ref<HTMLAudioElement>();
const canvasHeight = ref(1200);

const sourceImage = new Image();
let imageUid = -1;

const props = defineProps<{
  currentSong: Song | undefined;
  currentDifficulty: DifficlutyType;
  backTopRight: number;
  showOptions: string[];
  updateCount?: number;
}>();

watch([props, ratio], () => {
  if (!audioRef.value) return;
  if (!canvasRef.value) return;
  const { currentSong, currentDifficulty, showOptions, updateCount } = props;

  if (currentSong) {
    if (!updateCount || updateCount === 0) {
      const { dir, wave } = currentSong;
      audioRef.value.src = dir + "\\" + wave;
    }

    const showBar = showOptions.includes("bar");
    const showBpm = showOptions.includes("bpm");
    const showHs = showOptions.includes("hs");
    const { beatmap, imageData } = drawBeatmap(canvasRef.value, currentSong, currentDifficulty, {
      showBar,
      showBpm,
      showHs,
    });

    sourceImage.src = imageData.data;
    imageUid = imageData.uid;
    sourceImage.onload = async () => {
      if (!canvasRef.value) return;
      const context = canvasRef.value.getContext("2d") as CanvasRenderingContext2D;

      nextFrame(() => {
        if (!audioRef.value) return false;
        if (imageUid !== imageData.uid) return false;
        if (audioRef.value.paused) return true;
        if (audioRef.value.currentTime + currentSong.offset <= 0) return true;

        const { x, y } = getCurrentPos(currentSong, beatmap);

        context.drawImage(sourceImage, 0, 0);
        new DrawStrokeAction({
          color: "red",
          lineWidth: 2,
          x1: x,
          y1: y - 15,
          x2: x,
          y2: y + +45,
        }).draw(context);

        return true;
      });
    };
    canvasHeight.value = (canvasRef.value.height + 1000) * ratio.value;
  } else {
    audioRef.value.pause();
    audioRef.value.currentTime = 0;
  }
});

function nextFrame(callback: () => boolean) {
  requestAnimationFrame(() => {
    if (callback()) nextFrame(callback);
  });
}

function getCurrentPos(song: Song, beatmap: Beatmap) {
  let x = MARGIN_X;
  let y = MARGIN_Y;

  if (!audioRef.value) return { x, y };

  let currentNoteIndex = 0;

  let currentRow = 0;
  let rowBeatCount = -1;

  // beat per second，每秒经过的节拍
  let bps = song.bpm / 60;

  // 与4/4拍相对的速度，例如4/16拍则为4倍速
  let speed = 1;

  // 当前的延迟
  let delay = 0;

  const firstChange = beatmap.changes[0];
  if (firstChange.bpm) bps = firstChange.bpm / 60;
  if (firstChange.measure) speed = firstChange.measure[1] / 4;
  if (firstChange.delay) delay = firstChange.delay;

  let time = audioRef.value.currentTime + song.offset - delay;
  for (const bar of beatmap.bars) {
    for (const beat of bar) {
      rowBeatCount += 1;
      if (rowBeatCount >= beatmap.rows[currentRow]) {
        rowBeatCount = 0;
        currentRow += 1;
      }

      for (let i = 0; i < beat.length; i++) {
        const noteCount = i / beat.length;

        currentNoteIndex += 1;
        const change = beatmap.changes.find((c) => c.noteIndex === currentNoteIndex);
        if (change) {
          if (change.bpm) bps = change.bpm / 60;
          if (change.measure) speed = change.measure[1] / 4;
          if (change.delay) delay = change.delay;
        }

        const noteTime = 1 / beat.length / bps / speed;
        if (time > noteTime) {
          time -= noteTime;
        } else {
          const restCount = time * bps * speed;
          const finalCount = noteCount + restCount;
          x = MARGIN_X + (rowBeatCount + finalCount) * BEAT_WIDTH;
          y = MARGIN_Y + currentRow * (ROW_SPACE + ROW_HEIGHT);
          time = 0;
          return { x, y };
        }
      }
    }
  }

  return { x, y };
}
</script>
