import Vue from "vue";
import { store } from "./store/store.js";
import App from "./App.vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faTable, faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faTable, faBars);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

new Vue({
  el: "#app",
  store,
  render: h => h(App)
});
