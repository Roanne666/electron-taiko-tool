<style scoped>
.chart {
  width: 700px;
  height: 400px;
}
</style>

<template>
  <div style="margin-left: 50px">
    <div v-if="currentSong" style="font-size: 24px; margin-bottom: 30px; margin-top: -4px; user-select: none">{{ currentSong.name }}（{{ getDifficultyName() }}）谱面分析</div>
    <n-flex>
      <div ref="bpmChartRef" class="chart" />
      <div ref="hsChartRef" class="chart" />
      <div ref="speedChartRef" class="chart" />
      <div ref="noteChartRef" class="chart" />
    </n-flex>
  </div>
</template>

<script setup lang="ts">
import { NFlex } from "naive-ui";
import { use, init, EChartsType } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { ref, watch } from "vue";
import { DifficlutyType, Song } from "@server/types";
import { Beatmap } from "../scripts/beatmap";

const props = defineProps<{
  currentSong: Song | undefined;
  currentDifficulty: DifficlutyType;
  isAnalysis: boolean;
}>();

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent]);

const bpmChartRef = ref<HTMLDivElement>();
const hsChartRef = ref<HTMLDivElement>();
const speedChartRef = ref<HTMLDivElement>();
const noteChartRef = ref<HTMLDivElement>();
let bpmChart: EChartsType;
let hsChart: EChartsType;
let speedChart: EChartsType;
let noteChart: EChartsType;

watch(props, () => {
  if (props.isAnalysis) {
    if (!bpmChart) bpmChart = init(bpmChartRef.value);
    if (!hsChart) hsChart = init(hsChartRef.value);
    if (!speedChart) speedChart = init(speedChartRef.value);
    if (!noteChart) noteChart = init(noteChartRef.value);
    const { beatmapData } = props.currentSong.difficulties.find((d) => d.name === props.currentDifficulty);
    const beatmap = new Beatmap(beatmapData, props.currentSong.bpm);
    const { bpmOption, hsOption, speedOption, noteOption } = beatmap.getChartOptions();
    bpmChart.setOption(bpmOption);
    hsChart.setOption(hsOption);
    speedChart.setOption(speedOption);
    noteChart.setOption(noteOption);
  }
});

function getDifficultyName() {
  if (props.currentDifficulty === "easy") return "梅";
  if (props.currentDifficulty === "normal") return "竹";
  if (props.currentDifficulty === "hard") return "松";
  if (props.currentDifficulty === "oni") return "鬼";
  if (props.currentDifficulty === "extreme") return "里";
  return "";
}
</script>
