import Vue from "vue";
import Vuex from "vuex";

import grid from "./modules/grid";
import firebase from "./modules/firebase";
import { firebaseMutations } from "vuexfire";

Vue.use(Vuex);

export const store = new Vuex.Store({
  mutations: { ...firebaseMutations },
  modules: {
    grid,
    firebase,
  },
});
