import Vue from "vue";
import filterRows from "../../lib/filterRows";

const state = {
  rows: [],
  tableName: "",
  colOrder: [],
  colsToShow: [],
  sortCol: "",
  isSorting: false,
  pageSize: 10,
  currentPage: 1,
  filteredRows: [],
  checkedRows: [],
};

const getters = {
  getColsToShow: (state) => state.colsToShow,
  getRows: (state) => {
    const columnsWithFilter = state.colsToShow.filter((col) => col.expr);
    state.filteredRows = filterRows(state.rows, columnsWithFilter);
    const pageOffset = (state.currentPage - 1) * state.pageSize;
    return state.filteredRows.slice(pageOffset, state.pageSize * state.currentPage);
  },
  getHeaders: (state) => {
    return state.colsToShow.filter((col) => col.visible).map((visibleCol) => visibleCol.name);
  },
  getTableName: (state) => state.tableName,
  getColCount: (state) => state.colsToShow.length,
  getSortCol: (state) => state.sortCol,
  getPageSize: (state) => state.pageSize,
  getCurrentPage: (state) => state.currentPage,
  getFilteredRowCount: (state) => state.filteredRows.length,
  getSelectedRowsData: (state, getters) => {
    const headers = getters.getHeaders;
    const selected = state.checkedRows.map((key) => state.rows[key]);
    const selectVisible = selected.map((selectedRow) => {
      return headers.map((visibleCol) => selectedRow[visibleCol]);
    });
    return selectVisible;
  },
  getColumnByName: (state) => (columnName) => {
    return state.colsToShow.find((col) => col.name === columnName);
  },
  getColumnFilterExpression: (state, getters) => (columnName) => {
    const columnObject = getters.getColumnByName(columnName);
    return columnObject.expr;
  },
  getAllIDs: (state) => Object.keys(state.rows),
  getCheckedRows: (state) => state.checkedRows,
  getFormatter: (state, getters) => (colName) => {
    const col = getters.getColumnByName(colName);
    return col && col.format ? col.format : undefined;
  },
  isEditable: (state, getters) => (colName) => {
    const col = getters.getColumnByName(colName);
    return col ? col.editable : false;
  },
  isChecked: (state) => (rowKey) => {
    return state.checkedRows.includes(rowKey);
  },
  allChecked: (state) => {
    return state.checkedRows.length === state.rows.length;
  },
  isSorting: (state) => state.isSorting,
};

const mutations = {
  SET_ROWS(state, rows) {
    state.rows = rows;
  },
  SET_FILTER_EXPRESSION(state, { columnObject, expr }) {
    columnObject.expr = expr;
  },
  SET_CHECKED_CELLS(state, checkedRows) {
    state.checkedRows = checkedRows;
  },
  CHECK_ROW(state, key) {
    Vue.set(state.checkedRows, state.checkedRows.length, key);
  },
  UNCHECK_ROW(state, key) {
    const keyIndex = state.checkedRows.indexOf(key);
    Vue.delete(state.checkedRows, keyIndex);
  },
  CHECK_ALL_ROWS(state) {
    state.checkedRows = Object.keys(state.rows);
  },
  UNCHECK_ALL_ROWS(state) {
    state.checkedRows = [];
  },
  SET_PAGE(state, pageNum) {
    state.currentPage = pageNum;
  },
  SET_COLUMN_ORDERING(state) {
    state.colsToShow.sort((a, b) => {
      if (state.colOrder.indexOf(a.name) === -1 && state.colOrder.indexOf(b.name) === -1) {
        return 0;
      }
      if (state.colOrder.indexOf(a.name) === -1 || state.colOrder.indexOf(b.name) === -1) {
        return state.colOrder.indexOf(a.name) === -1 ? 1 : -1;
      }
      if (state.colOrder.indexOf(a.name) < state.colOrder.indexOf(b.name)) {
        return -1;
      } else {
        return 1;
      }
    });
  },
  TOGGLE_COLUMN(state, columnObject) {
    columnObject.visible = !columnObject.visible;
  },

  // set the sorting direction for a column
  // also handle firebase descending sort
  SET_SORTING(state, { columnName, direction, isSorting }) {
    state.isSorting = isSorting;

    if (isSorting) {
      state.sortCol = columnName;
    } else {
      if (direction === "DESC") {
        state.rows.sort((a, b) => {
          if (a[columnName] > b[columnName]) {
            return -1;
          }
          if (a[columnName] < b[columnName]) {
            return 1;
          }
          return 0;
        });
      }
    }
  },
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
  // move pagination to the next page
  setPage: ({ commit }, pageNumber) => {
    commit("SET_PAGE", pageNumber);
  },
  setCheckedRows: ({ commit }, checkedRows) => {
    commit("SET_CHECKED_CELLS", checkedRows);
  },
  toggleRow: ({ commit }, { checked, value }) => {
    if (checked) {
      commit("CHECK_ROW", value);
    } else {
      commit("UNCHECK_ROW", value);
    }
  },
  toggleAllRows: ({ commit }, checked) => {
    if (checked) {
      commit("CHECK_ALL_ROWS");
    } else {
      commit("UNCHECK_ALL_ROWS");
    }
  },
  toggleColumn({ commit, getters }, columnName) {
    const visibleColumnCount = getters.getHeaders.length;
    const columnObject = getters.getColumnByName(columnName);

    // hide column only if we have more that one column visible
    if (columnObject && (visibleColumnCount > 1 || !columnObject.visible)) {
      commit("TOGGLE_COLUMN", columnObject);
    }
  },
  setFilterExpr({ commit, getters }, { expr, columnName }) {
    const columnObject = getters.getColumnByName(columnName);
    if (columnObject) {
      commit("SET_FILTER_EXPRESSION", { columnObject, expr });
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions,
};
