import { ref } from "vue";

export const hideSideBar = ref(false);
export const ratio = ref(document.body.clientWidth / window.screen.width);

window.addEventListener("resize", () => {
  ratio.value = document.body.clientWidth / window.screen.width;
});
