import { firebaseAction } from "vuexfire";

const state = {
  config: null,
  rows: [],
  tableName: "",
  colOrder: [],
  colsToShow: [],
  showColFilter: false,
  sortCol: null,
  sortDirection: "ASC",
  isSorting: false,
  pageSize: 10,
  pageOffset: 0,
  currentPage: 1,
  filteredRows: []
};

const getters = {
  getColsToShow: state => state.colsToShow,
  getRows: state => {
    const columnsWithFilter = state.colsToShow.filter(col => col.expr);

    if (columnsWithFilter.length <= 0) {
      state.filteredRows = state.rows;
    } else {
      state.filteredRows = state.rows.filter(row => {
        for (var col of columnsWithFilter) {
          // =, >, >=, <, <=, !=, <>
          // search for logical comparison operator in string
          const comparisonOperator = col.expr.match("^(<[=>]?|=|>=?|!=)");
          if (comparisonOperator) {
            switch (comparisonOperator[0]) {
              case "=":
                return row[col.name] == col.expr.substr(1);
              case ">":
                return row[col.name] > col.expr.substr(1);
              case ">=":
                return row[col.name] >= col.expr.substr(2);
              case "<":
                return row[col.name] < col.expr.substr(1);
              case "<=":
                return row[col.name] <= col.expr.substr(2);
              case "!=":
              case "<>":
                return row[col.name] != col.expr.substr(2);
            }
          }

          const regexpr = new RegExp(col.expr, "gi");
          const cellData = isNaN(row[col.name])
            ? row[col.name]
            : row[col.name].toString();
          if (!cellData.match(regexpr)) {
            return false;
          }
        }
        return true;
      });
    }

    return state.filteredRows.slice(
      state.pageOffset,
      state.pageSize * state.currentPage
    );
  },
  getHeaders: state => {
    // return visible columns only
    return state.colsToShow
      .filter(col => col.visible)
      .map(visibleCol => visibleCol.name);
  },
  getTableName: state => state.tableName,
  getColCount: state => state.colsToShow.length,
  getShowColFilter: state => state.showColFilter,
  getSortCol: state => state.sortCol,
  getPaginationSummary: state => {
    let lastRow;
    if (state.filteredRows.length < state.currentPage * state.pageSize) {
      lastRow = state.filteredRows.length;
    } else {
      lastRow = state.currentPage * state.pageSize;
    }

    return {
      firstRow: state.pageOffset + 1,
      lastRow: lastRow,
      totalRows: state.filteredRows.length
    };
  },
  getTotalPages: state => Math.ceil(state.filteredRows.length / state.pageSize),
  getPages: state => {
    // return array of page numbers. ex: [1,2,3,4,5,6,7,8,9,10]
    return Array.from(
      { length: getters.getTotalPages(state) },
      (j, k) => k + 1
    );
  }
};

const mutations = {
  addConfig(state, config) {
    state.config = config;
  },
  setFilterExpr(state, { expr, colName }) {
    const filteredCol = state.colsToShow.find(col => col.name === colName);
    filteredCol.expr = expr;
  },
  setPage(state, pageNum) {
    state.currentPage = pageNum;
    state.pageOffset = (pageNum - 1) * state.pageSize;
  },
  setConfig(state) {
    const config = state.config;
    state.tableName = config.tableName || state.tableName;
    state.pageSize = config.pageSize || state.pageSize;
    state.colOrder = config.colOrder || state.colOrder;
    state.colsToShow = config.colsToShow
      ? [...config.colsToShow]
      : state.rows.length > 0
      ? Object.keys(state.rows[0])
          .filter(col => col !== ".key")
          .map(function(name) {
            return { name: name, visible: true, expr: "" };
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
  },
  setSorting(state, { col, isSorting }) {
    state.isSorting = isSorting;

    if (isSorting) {
      if (state.sortCol === col) {
        switch (state.sortDirection) {
          case null:
          case "DESC":
            state.sortDirection = "ASC";
            break;
          case "ASC":
            state.sortDirection = "DESC";
        }
      } else {
        state.sortDirection = "ASC";
      }

      state.sortCol = col;
    } else {
      // handle DESC sort when sort is ready
      if (state.sortDirection === "DESC") {
        state.rows.sort((a, b) => {
          if (a[col] > b[col]) {
            return -1;
          }
          if (a[col] < b[col]) {
            return 1;
          }
          return 0;
        });
      }
    }
  }
};

const actions = {
  setTableRef: firebaseAction(({ bindFirebaseRef, commit }, { ref }) => {
    bindFirebaseRef("rows", ref, {
      readyCallback() {
        commit("setConfig");
      }
    });
  }),
  sortBy: firebaseAction(({ bindFirebaseRef, commit }, { ref, col }) => {
    commit("setSorting", { col: col, isSorting: true });
    bindFirebaseRef("rows", ref.orderByChild(col), {
      readyCallback() {
        commit("setSorting", { col: col, isSorting: false });
      }
    });
  }),
  nextPage: ({ state, commit }) => {
    if (state.currentPage < getters.getTotalPages(state)) {
      commit("setPage", state.currentPage + 1);
    }
  },
  previousPage: ({ state, commit }) => {
    if (state.currentPage > 1) {
      commit("setPage", state.currentPage - 1);
    }
  }
};

export default {
  state,
  mutations,
  getters,
  actions
};
