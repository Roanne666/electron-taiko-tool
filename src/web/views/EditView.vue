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

.line-display {
  position: absolute;
  left: 80px;
}
</style>

<template>
  <transition v-show="!currentSong" @after-leave="isEdit = true" name="slide-fade">
    <n-flex vertical justify="center">
      <song-table :use-score="false" :columns="columns"></song-table>
    </n-flex>
  </transition>

  <n-popover trigger="manual" :show="showPopover" :show-arrow="false" :x="mouseX" :y="mouseY">
    <span>小节数：{{ currentBar }}</span>
  </n-popover>

  <transition v-show="isEdit" name="slide-fade">
    <n-flex justify="center" style="margin-left: 20px">
      <n-flex vertical :style="{ width: 520 * ratio, marginRight: '10px' }">
        <n-input
          type="textarea"
          placeholder="请输入谱面内容"
          :resizable="false"
          v-model:value="beatmapInput"
          @input="updateBeatmap('input')"
          @blur="updateBeatmap('blur')"
          @click="handleClick"
          style="height: 89vh"
          spellcheck="false"
        />

        <n-flex style="margin-top: 10px" justify="center">
          <n-checkbox-group v-model:value="showOptions" style="margin-right: -10px">
            <n-space item-style="display: flex;">
              <n-checkbox value="bar" label="小节数" style="margin-right: -5px" />
              <n-checkbox value="bpm" label="bpm" style="margin-right: -5px" />
              <n-checkbox value="hs" label="hs" />
            </n-space>
          </n-checkbox-group>
          <n-divider vertical style="height: 100%" />
          <span>实时预览：</span>
          <n-switch v-model:value="autoParse" />
          <n-divider vertical style="height: 100%" />
          <n-button :disabled="isUpdating" @click="saveSong" style="margin-top: -5px">保存谱面</n-button>
        </n-flex>
      </n-flex>

      <preview-canvas
        :current-song="currentSong"
        :current-difficulty="currentDifficulty"
        :back-top-right="50"
        :updateCount="updateCount"
        :showOptions="showOptions"
      ></preview-canvas>
    </n-flex>
  </transition>

  <transition v-show="isEdit" name="slide-fade">
    <n-icon class="back-songs" @click="backToSongs" size="30">
      <back-icon></back-icon>
    </n-icon>
  </transition>
</template>

<script setup lang="ts">
import { Transition, h, onMounted, ref } from "vue";
import {
  NButton,
  NIcon,
  type DataTableColumn,
  type DataTableColumnGroup,
  NFlex,
  NInput,
  NSwitch,
  NDivider,
  useMessage,
  NCheckbox,
  NCheckboxGroup,
  NSpace,
  NPopover,
} from "naive-ui";
import { basicColumns, createLevelSubCloumn } from "../scripts/stores/song";
import type { DifficlutyType, DifficultyInfo, Song } from "@server/types";
import { ArrowBackCircleOutline as BackIcon } from "@vicons/ionicons5";
import SongTable from "../components/SongTable.vue";
import { hideSideBar, ratio } from "../scripts/stores/global";
import PreviewCanvas from "../components/PreviewCanvas.vue";
import { ElectronAPIs } from "../../api";

const currentSong = ref<Song>();
const currentDifficulty = ref<DifficlutyType>("oni");
const updateCount = ref(0);
const showOptions = ref<string[]>(["bar", "bpm", "hs"]);
const isEdit = ref(false);

const beatmapInput = ref("");
const currentBar = ref(0);
const autoParse = ref(true);
const isUpdating = ref(false);

onMounted(() => {
  const editElement = document.querySelector("textarea");
  const lineSpan = document.querySelector(".line-display");
  if (editElement) {
    editElement.onclick = (e) => {
      mouseX.value = e.offsetY;
      mouseY.value = e.offsetY;
      if (lineSpan) lineSpan.setAttribute("style", `top:${e.offsetY - 10}px;`);
      let bar = 1;
      let end = editElement.selectionEnd;
      const lines = beatmapInput.value.split("\n");
      for (const line of lines) {
        end -= line.length;
        if (end <= 0) {
          currentBar.value = bar;
          return;
        }
        if (line.includes(",")) bar += 1;
      }
    };
  }
});

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
        width: 110,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          if (d?.level === undefined) return "";
          return h(
            NButton,
            {
              onClick() {
                currentSong.value = row;
                currentDifficulty.value = key;
                beatmapInput.value = d.beatmapData.join("\n");
                hideSideBar.value = true;
              },
            },
            () => "编辑"
          );
        },
      },
    ],
  };
}

async function backToSongs() {
  isEdit.value = false;
  hideSideBar.value = false;
  await new Promise((resolve) => setTimeout(() => resolve(true), 250));
  currentSong.value = undefined;
  updateCount.value = 0;
  currentBar.value = 0;
}

async function updateBeatmap(type: "blur" | "input") {
  if (!currentSong.value) return;
  if (type === "input" && !autoParse.value) return;
  if (type === "blur" && autoParse.value) return;
  const d = currentSong.value.difficulties.find((d) => d.name === currentDifficulty.value) as DifficultyInfo;
  d.beatmapData = beatmapInput.value.split("\n");
  updateCount.value += 1;
}

const message = useMessage();
async function saveSong() {
  if ("electronAPI" in window) {
    const apis = window.electronAPI as ElectronAPIs;
    const status = await apis.modifySong(JSON.stringify(currentSong.value));
    if (status) {
      message.success("保存成功");
    } else {
      message.success("保存失败，请手动保存");
    }
  }
}

// 小节数提示
const showPopover = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);
const refresh = ref(false);
async function handleClick(e: MouseEvent) {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;

  if (showPopover.value) refresh.value = true;
  showPopover.value = true;
  await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
  if (refresh.value) {
    refresh.value = false;
  } else {
    showPopover.value = false;
  }
}
</script>
