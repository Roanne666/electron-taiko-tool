<style scoped>
div {
  font-size: medium;
}
</style>

<template>
  <n-collapse :default-expanded-names="['1', '2', '3']">
    <n-collapse-item name="1">
      <template #header>
        <div style="font-weight: bold">关于本软件</div>
      </template>
      <div>本程序由Roanne（滑滑）制作，用于获取成绩、预览和编辑谱面等，使用和传播本程序时请遵守法律法规，请勿滥用</div>
      <div>Github仓库链接：<a href="https://github.com/Roanne666/taiko-tool" @click="(e) => e.preventDefault()">https://github.com/Roanne666/taiko-tool</a></div>
      <div>作者B站链接：<a href="https://space.bilibili.com/23383232" @click="(e) => e.preventDefault()">https://space.bilibili.com/23383232</a></div>
    </n-collapse-item>
    <n-collapse-item name="2">
      <template #header>
        <div style="font-weight: bold">基础说明</div>
      </template>
      <div>
        1.在各页面中，除
        <span style="color: red">【显示】</span>
        选项外，其余选项为交集筛选，其中类目为多选
      </div>
      <div>
        2.进入谱面预览前，可以通过
        <span style="color: red">【显示】</span>
        选项来选择想要显示的数据
      </div>
      <div>
        3.进入谱面预览后，点击页面下方
        <span style="color: red">播放按钮</span>
        即可开始预览谱面，通过
        <span style="color: red">拖动进度条</span>
        实现快速定位，点击播放器最右边的三个点可以调节播放速度（谱面编辑中操作同理）
      </div>
      <div>4.进入谱面编辑后，会自动读取已有的谱面信息。如果你需要创建一个新的谱面，需要在记事本等其他编辑器中编辑好模板后才能在本程序中使用。</div>
      <div>
        5.编辑谱面时请按照标准规则编写，一定要保留
        <span style="color: red">#START</span>
        和
        <span style="color: red">#END</span>
        ，否则可能会出现解析器错误等问题
      </div>
      <div>
        6.谱面编辑中，
        <span style="color: red">【实时预览】</span>
        关闭后，手动点击谱面图片才会刷新预览（可以在页面卡顿或需要频繁修改时关闭）
      </div>
    </n-collapse-item>
    <n-collapse-item name="3">
      <template #header>
        <div style="font-weight: bold">帮助</div>
      </template>
      <div>1.遇到无法读取歌曲信息时，请确保本程序文件夹在模拟器的根目录，模拟器歌曲文件夹为Songs，歌曲类目文件夹中包含了box.def，文件夹的结构示例如下：</div>
      <div>│── opentaiko</div>
      <div>     │── taiko-tool</div>
      <div>     │── Songs</div>
      <div>          │── 01 Pop</div>
      <div>              │── box.def</div>
      <div>              │── 群青</div>
      <div> </div>
      <div>2.如果你遇到了可复现的错误，请通过b站或github反馈问题</div>
    </n-collapse-item>
  </n-collapse>
</template>

<script setup lang="ts">
import { NCollapse, NCollapseItem } from "naive-ui";
</script>
