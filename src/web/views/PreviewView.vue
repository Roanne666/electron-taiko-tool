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
  <transition v-show="!currentSong" @after-leave="nextAction === 'preview' ? (isPreview = true) : (isAnalysis = true)" name="slide-fade">
    <n-flex vertical justify="center">
      <n-checkbox-group v-model:value="showOptions">
        <n-space item-style="display: flex;">
          <span style="margin-right: -2px">显示：</span>
          <n-checkbox value="bar" label="小节数" />
          <n-checkbox value="bpm" label="bpm" />
          <n-checkbox value="hs" label="hs" />
        </n-space>
      </n-checkbox-group>
      <song-table :use-score="false" :columns="columns" />
    </n-flex>
  </transition>

  <transition v-show="isPreview" name="slide-fade">
    <preview-canvas :current-song="currentSong" :current-difficulty="currentDifficulty" :backTopRight="100" :showOptions="showOptions"></preview-canvas>
  </transition>

  <transition v-show="isAnalysis" name="slide-fade">
    <chart-component :current-song="currentSong" :current-difficulty="currentDifficulty" :is-analysis="isAnalysis" />
  </transition>

  <transition v-show="isPreview || isAnalysis" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, ref } from "vue";
import { NButton, NIcon, type DataTableColumn, type DataTableColumnGroup, NFlex, NCheckbox, NCheckboxGroup, NSpace } from "naive-ui";
import { basicColumns, createLevelSubCloumn } from "../scripts/stores/song";
import type { DifficlutyType, Song } from "@server/types";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import SongTable from "../components/SongTable.vue";
import PreviewCanvas from "../components/PreviewCanvas.vue";
import ChartComponent from "../components/ChartComponent.vue";

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");

const showOptions = ref<("bar" | "bpm" | "hs")[]>(["bar", "bpm", "hs"]);
const nextAction = ref<"preview" | "analysis">("preview");
const isPreview = ref(false);
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
        title: "操作",
        key: `${key}handle`,
        align: "center",
        width: 140,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          if (d && d.level !== 0) {
            return h(NSpace, [
              h(
                NButton,
                {
                  onClick() {
                    currentSong.value = row;
                    currentDifficulty.value = key;
                    nextAction.value = "preview";
                  },
                },
                () => "预览"
              ),
              h(
                NButton,
                {
                  onClick() {
                    currentSong.value = row;
                    currentDifficulty.value = key;
                    nextAction.value = "analysis";
                  },
                },
                () => "分析"
              ),
            ]);
          }
          return "";
        },
      },
    ],
  };
}

async function backToSongs() {
  isPreview.value = false;
  isAnalysis.value = false;
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  currentSong.value = undefined;
}
</script>
