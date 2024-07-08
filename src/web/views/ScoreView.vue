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
  <n-flex vertical justify="center">
    <song-table :use-score="true" :columns="columns"></song-table>
  </n-flex>
</template>

<script setup lang="ts">
import { type DataTableColumn, type DataTableColumnGroup, NFlex } from "naive-ui";
import { basicColumns, createLevelSubCloumn } from "../scripts/stores/song";
import type { DifficlutyType, Song } from "@server/types";
import SongTable from "../components/SongTable.vue";

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
        title: "分数",
        key: `${key}score`,
        align: "center",
        width: 100,
        render(row, rowIndex) {
          const d = row.difficulties.find((d) => d.name === key);
          return d ? d.score : "";
        },
      },
    ],
  };
}
</script>
