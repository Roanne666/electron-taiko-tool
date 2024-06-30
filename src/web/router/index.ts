import { createRouter, createWebHistory } from "vue-router";
import GuideView from "../views/GuideView.vue";
import PreviewView from "../views/PreviewView.vue";
import EditView from "../views/EditView.vue";
import ScoreView from "../views/ScoreView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "guide",
      component: GuideView,
    },
    {
      path: "/score",
      name: "score",
      component: ScoreView,
    },

    {
      path: "/preview",
      name: "preview",
      component: PreviewView,
    },
    {
      path: "/edit",
      name: "edit",
      component: EditView,
    },
  ],
});

export default router;
