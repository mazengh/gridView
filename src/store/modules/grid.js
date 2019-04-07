import { firebaseAction } from "vuexfire";

const state = {
  config: null,
  rows: [],
  tableName: "",
  colOrder: [],
  colsToShow: [],
  showColFilter: false
};

const getters = {
  getColsToShow: state => state.colsToShow,
  getRows: state => state.rows,
  getHeaders: state => {
    // return visible columns only
    return state.colsToShow
      .filter(col => col.visible)
      .map(visibleCol => visibleCol.name);
  },
  getTableName: state => state.tableName,
  getColCount: state => state.colsToShow.length,
  getShowColFilter: state => state.showColFilter
};

const mutations = {
  addConfig(state, config) {
    state.config = config;
  },
  setConfig(state) {
    const config = state.config;
    state.tableName = config.tableName || state.tableName;
    state.colOrder = config.colOrder || state.colOrder;
    state.colsToShow = config.colsToShow
      ? [...config.colsToShow]
      : state.rows.length > 0
      ? Object.keys(state.rows[0])
          .filter(col => col !== ".key")
          .map(function(name) {
            return { name: name, visible: true };
          })
      : [];

    state.colsToShow.sort((a, b) => {
      if (
        state.colOrder.indexOf(a.name) === -1 &&
        state.colOrder.indexOf(b.name) === -1
      ) {
        return 0;
      }
      if (
        state.colOrder.indexOf(a.name) === -1 ||
        state.colOrder.indexOf(b.name) === -1
      ) {
        return state.colOrder.indexOf(a.name) === -1 ? 1 : -1;
      }
      if (state.colOrder.indexOf(a.name) < state.colOrder.indexOf(b.name)) {
        return -1;
      }
      if (state.colOrder.indexOf(a.name) > state.colOrder.indexOf(b.name)) {
        return 1;
      }
    });
  },
  toggleCol(state, colName) {
    // hide column only if we have more that one column visible
    const visibleColCount = state.colsToShow.filter(col => col.visible).length;
    const selectedCol = state.colsToShow.find(col => col.name === colName);

    if (visibleColCount > 1 || !selectedCol.visible) {
      selectedCol.visible = !selectedCol.visible;
    }
  },
  toggleColFilter(state) {
    state.showColFilter = !state.showColFilter;
  },
  hideColFilter(state) {
    state.showColFilter = false;
  }
};

const actions = {
  setTableRef: firebaseAction(({ bindFirebaseRef, commit, state }, { ref }) => {
    bindFirebaseRef("rows", ref, {
      readyCallback() {
        commit("setConfig");
      }
    });
  })
};

export default {
  state,
  mutations,
  getters,
  actions
};
