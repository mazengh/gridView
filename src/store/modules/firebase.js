import { firebaseAction } from "vuexfire";
import { db } from "../../firebaseConfig";

const state = {
  rows: [],
};

const actions = {
  setup: ({ state, commit }, config) => {
    for (const configProperty in config) {
      if (state.hasOwnProperty(configProperty)) {
        state[configProperty] = config[configProperty];
      }
    }

    if (!state.colsToShow.length) {
      state.colsToShow =
        state.rows.length > 0
          ? Object.keys(state.rows[0])
              .filter((col) => col !== ".key")
              .map(function(name) {
                return { name: name, visible: true, expr: "" };
              })
          : [];
    }

    commit("SET_COLUMN_ORDERING");
  },

  // get the table rows from firebase and initialize configuration on return
  setTableRef: firebaseAction(
    /* istanbul ignore next */ ({ bindFirebaseRef, commit, state, dispatch }, config) => {
      if (!config.tableName) {
        throw new Error("Invalid table name");
      }
      const { ref } = db.ref(config.tableName);
      bindFirebaseRef("rows", ref, {
        readyCallback() {
          // initialize once database returns data
          commit("grid/SET_ROWS", state.rows, { root: true });
          dispatch("grid/setup", config, { root: true });
        },
      });
    },
  ),
  // perform a database sort
  sortBy: firebaseAction(
    /* istanbul ignore next */ (
      { bindFirebaseRef, rootGetters, commit },
      { columnName, direction },
    ) => {
      commit("grid/SET_SORTING", { columnName, direction, isSorting: true }, { root: true });
      const { ref } = db.ref(rootGetters["grid/getTableName"]);
      bindFirebaseRef("rows", ref.orderByChild(columnName), {
        readyCallback() {
          commit("grid/SET_ROWS", state.rows, { root: true });
          commit("grid/SET_SORTING", { columnName, direction, isSorting: false }, { root: true });
        },
      });
    },
  ),
  // update field data
  editField: firebaseAction(
    /* istanbul ignore next */ ({ rootGetters, commit }, { row, columnName, cellContent }) => {
      const ref = `${rootGetters["grid/getTableName"]}/${row}`;
      const dbChildRef = db.ref(ref);
      const cell = { [columnName]: cellContent };
      dbChildRef.update(cell);
      commit("grid/SET_ROWS", state.rows, { root: true });
    },
  ),
};

export default {
  namespaced: true,
  state,
  actions,
};
