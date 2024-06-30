import { createApp } from "vue";
import App from "./web/App.vue";
import router from "./web/router";

const app = createApp(App);

app.use(router);

app.mount("#app");
