import { firebaseAction } from "vuexfire";

const state = {
  rows: [],
  tableName: "",
  colOrder: [],
  colsToShow: []
};

const getters = {
  getRows: state => state.rows,
  getHeaders: state => {
    if (state.rows.length > 0) {
      if (state.colOrder) {
        return state.colOrder.filter(col => state.colsToShow.includes(col));
      }
      return Object.keys(state.rows[0]).filter(col => col !== ".key");
    }
  },
  getTableName: state => state.tableName
};

const mutations = {
  setConfig(state, config) {
    state.tableName = config.tableName || "";
    state.colOrder = config.colOrder || [];
    state.colsToShow =
      config.colsToShow ||
      Object.keys(state.rows[0]).filter(col => col !== ".key");
  }
};

const actions = {
  setTableRef: firebaseAction(({ bindFirebaseRef, state }, { ref }) => {
    bindFirebaseRef("rows", ref);
  })
};

export default {
  state,
  mutations,
  getters,
  actions
};
