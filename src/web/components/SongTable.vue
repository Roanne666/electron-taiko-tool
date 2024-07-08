<template>
  <div>
    <n-checkbox-group v-model:value="genreSelect">
      <n-space item-style="display: flex;">
        <span style="margin-right: -2px">类目：</span>
        <n-checkbox v-for="g of genres" :value="g" :label="g" />
      </n-space>
    </n-checkbox-group>
  </div>
  <div>
    <n-radio-group v-model:value="difficultySelect" name="radiogroup">
      <n-space>
        <span>难度：</span>
        <n-radio value="all"> 全部 </n-radio>
        <n-radio value="easy"> 梅 </n-radio>
        <n-radio value="normal"> 竹 </n-radio>
        <n-radio value="hard"> 松 </n-radio>
        <n-radio value="oni"> 鬼 </n-radio>
        <n-radio value="extreme"> 里 </n-radio>
      </n-space>
    </n-radio-group>
  </div>
  <div>
    <n-radio-group v-model:value="levelSelect" name="radiogroup">
      <n-space>
        <span>等级：</span>
        <n-radio v-for="l of levels" :key="`${l}`" :value="l">
          {{ l === 0 ? "全部" : l }}
        </n-radio>
      </n-space>
    </n-radio-group>
  </div>
  <div v-if="props.useScore">
    <n-radio-group v-model:value="scoreSelcet" name="radiogroup">
      <n-space>
        <span>分数：</span>
        <n-radio v-for="(value, key) of scores" :key="key" :value="key"> {{ key }} </n-radio>
      </n-space>
    </n-radio-group>
  </div>

  <n-data-table
    :columns="props.columns"
    :data="showSongs"
    :pagination="{
      pageSize: 10,
    }"
    :single-line="false"
    style="padding-right: 30px"
  >
    <template #empty><span style="user-select: none; color: gray"> 没有乐曲了咚~ </span></template>
  </n-data-table>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import {
  NCheckboxGroup,
  NSpace,
  NCheckbox,
  NRadioGroup,
  NRadio,
  NDataTable,
  type DataTableColumn,
  type DataTableColumnGroup,
} from "naive-ui";
import {
  allSongs,
  genres,
  levels,
  scores,
  type DifficultyTypes,
  type LevelTypes,
  type ScoreTypes,
} from "../scripts/stores/song";
import type { Song } from "@server/types";

const props = defineProps<{
  useScore: boolean;
  columns: (DataTableColumn<Song> | DataTableColumnGroup<Song>)[];
}>();

const genreSelect = ref(genres);
const difficultySelect = ref<DifficultyTypes>("all");
const levelSelect = ref<LevelTypes>(0);
const scoreSelcet = ref<ScoreTypes>("全部");

const showSongs = reactive<Song[]>([]);

const emit = defineEmits<{ changeOptions: [options: string[]] }>();

onMounted(() => {
  showSongs.length = 0;
  showSongs.push(...allSongs);
});

watch([genreSelect, difficultySelect, levelSelect, scoreSelcet], () => {
  const filterSongs = allSongs.filter((s) => {
    let isMatch = false;

    if (difficultySelect.value === "all") {
      let levelMatch = levelSelect.value === 0;
      if (!levelMatch) {
        levelMatch = s.difficulties.find((d) => d.level === levelSelect.value) ? true : false;
      }

      let scoreMatch = scoreSelcet.value === "全部";
      if (!scoreMatch) {
        scoreMatch = s.difficulties.find(
          (d) => d.score >= scores[scoreSelcet.value][0] && d.score < scores[scoreSelcet.value][1]
        )
          ? true
          : false;
      }

      isMatch = levelMatch && scoreMatch;
    } else {
      const d = s.difficulties.find((d) => d.name === difficultySelect.value);
      if (d) {
        const levelMatch = levelSelect.value === 0 || d.level === levelSelect.value;
        let scoreMatch = scoreSelcet.value === "全部";
        if (!scoreMatch) {
          const overMin = d.score >= scores[scoreSelcet.value][0];
          const lowerMax = d.score < scores[scoreSelcet.value][1];
          scoreMatch = overMin && lowerMax;
        }
        isMatch = levelMatch && scoreMatch;
      }
    }

    return genreSelect.value.includes(s.genre) && isMatch;
  });

  showSongs.length = 0;
  showSongs.push(...filterSongs);
});
</script>
