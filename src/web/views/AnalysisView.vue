<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(1080px);
  opacity: 0;
}

.back-songs {
  position: absolute;
  z-index: 99999;
  top: 0px;
}

.back-songs:hover {
  cursor: pointer;
}
</style>

<template>
  <transition v-show="!currentSong" @after-leave="isAnalysis = true" name="slide-fade">
    <n-flex vertical justify="center">
      <song-table :use-score="false" :columns="columns" />
    </n-flex>
  </transition>

  <transition v-show="isAnalysis" name="slide-fade">
    <chart-component :current-song="currentSong" :current-difficulty="currentDifficulty" :is-analysis="isAnalysis" />
  </transition>

  <transition v-show="isAnalysis" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, ref } from "vue";
import { NButton, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex } from "naive-ui";
import { basicColumns, createLevelSubCloumn } from "../scripts/stores/song";
import type { DifficlutyType, Song } from "@server/types";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import SongTable from "../components/SongTable.vue";
import ChartComponent from "../components/ChartComponent.vue";
import { Beatmap } from "../scripts/beatmap";

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

const isAnalysis = ref(false);

const columns: (DataTableColumn<Song> | DataTableColumnGroup<Song>)[] = [
  ...basicColumns,
  createDiffultyColumn("梅", "easy"),
  createDiffultyColumn("竹", "normal"),
  createDiffultyColumn("松", "hard"),
  createDiffultyColumn("鬼", "oni"),
  createDiffultyColumn("里", "extreme"),
];

function createDiffultyColumn(title: string, key: DifficlutyType): DataTableColumnGroup<Song> {
  return {
    title,
    key,
    align: "center",
    children: [
      createLevelSubCloumn(key),
      {
        title: "参考定数",
        key: "factor",
        align: "center",
        width: 50,
        render(row, rowIndex) {
          const info = row.difficulties.find((d) => d.name === key);
          if (info && (key === "oni" || key === "extreme")) {
            const beatmap = new Beatmap(info.beatmapData, row.bpm);
            return beatmap.factor;
          }
          return "-";
        },
      },
      {
        title: "操作",
        key: `${key}handle`,
        align: "center",
        width: 0,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          if (d && d.level !== 0) {
            return h(
              NButton,
              {
                onClick() {
                  currentSong.value = row;
                  currentDifficulty.value = key;
                },
              },
              () => "分析"
            );
          }
          return "";
        },
      },
    ],
  };
}

async function backToSongs() {
  isAnalysis.value = false;
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  currentSong.value = undefined;
}
</script>
