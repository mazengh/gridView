import { firebaseAction } from "vuexfire";

const state = {
  config: null,
  rows: [],
  tableName: "",
  colOrder: [],
  colsToShow: [],
  showColFilter: false,
  sortCol: "null",
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

    // if there are no filters set, use all rows and do not apply filtering
    if (columnsWithFilter.length <= 0 || state.filteredRows.length === 0) {
      state.filteredRows = state.rows;
    } else {
      // apply filters for columns with filters
      state.filteredRows = state.rows.filter(row => {
        for (var col of columnsWithFilter) {
          // =, >, >=, <, <=, !=, <>
          // search for logical comparison operator in string
          const comparisonOperator = col.expr.match("^(<[=>]?|=|>=?|!=)");

          // do not start filtering while user is inputing comparison operator
          if (comparisonOperator && comparisonOperator[0] === col.expr) {
            return true;
          }

          // if column specifies a format, get the requested
          // format for filter comparision, otherwise use the
          // raw data for the comparision
          let cellData = col.format
            ? col.format(row[col.name], true)
            : row[col.name];

          // perform logical comparisons
          if (comparisonOperator) {
            switch (comparisonOperator[0]) {
              case "=":
                return cellData == col.expr.substr(1);
              case ">":
                return cellData > col.expr.substr(1);
              case ">=":
                return cellData >= col.expr.substr(2);
              case "<":
                return cellData < col.expr.substr(1);
              case "<=":
                return cellData <= col.expr.substr(2);
              case "!=":
              case "<>":
                return cellData != col.expr.substr(2);
            }
          }

          // if type of cellData is not a string, convert it to string to use in regex
          if (!isNaN(cellData)) {
            cellData = cellData.toString();
          }

          const regexpr = new RegExp(col.expr, "gi");

          if (!cellData.match(regexpr)) {
            return false;
          }
        }
        return true;
      });
    }

    // return the rows based on the page size
    return state.filteredRows.slice(
      state.pageOffset,
      state.pageSize * state.currentPage
    );
  },
  // return visible columns only
  getHeaders: state => {
    return state.colsToShow
      .filter(col => col.visible)
      .map(visibleCol => visibleCol.name);
  },
  getTableName: state => state.tableName.charAt(0).toUpperCase() + state.tableName.slice(1).toLowerCase(),
  getColCount: state => state.colsToShow.length,
  getRowCount: state => state.rows.length,
  getShowColFilter: state => state.showColFilter,
  getSortCol: state => state.sortCol,
  // return a pagination summary object
  // that has the first row, last row, and total rows
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
  // return the total pages based on number of rows
  // to be displayed and page size
  // total pages changes based on the page size
  getTotalPages: state => {
    if (state.filteredRows.length) {
      return Math.ceil(state.filteredRows.length / state.pageSize);
    } else {
      return Math.ceil(state.rows.length / state.pageSize);
    }
  },
  // return array of page numbers. ex: [1,2,3,4,5,6,7,8,9,10]
  getPages: state => {
    return Array.from(
      { length: getters.getTotalPages(state) },
      (j, k) => k + 1
    );
  },
  // get row data for visible columns based on selections
  getSelections: state => selectedKeys => {
    // get displayed headers
    const headers = getters.getHeaders(state);

    // get row data for selected rows
    const selected = selectedKeys.map(key => state.rows[key]);

    // filter row data to return visible columns only
    const selectVisible = selected.map(selectedRow => {
      return headers.map(visibleCol => selectedRow[visibleCol]);
    });

    return selectVisible;
  },
  // returns IDs for all rows
  getAllIDs: state => Object.keys(state.rows)
};

const mutations = {
  // add supplied configuration for grid
  addConfig(state, config) {
    state.config = config;
  },
  // set the filtering expression for a column
  setFilterExpr(state, { expr, colName }) {
    const filteredCol = state.colsToShow.find(col => col.name === colName);
    filteredCol.expr = expr;
  },
  // change the page displayed
  setPage(state, pageNum) {
    state.currentPage = pageNum;
    state.pageOffset = (pageNum - 1) * state.pageSize;
  },
  // initialize state based on configuration
  // after initial data is retrieved
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

    // sort the columns based on the column ordering in the config
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
      } else {
        // state.colOrder.indexOf(a.name) > state.colOrder.indexOf(b.name))
        return 1;
      }
    });
  },
  // show/hide column on grid
  toggleCol(state, colName) {
    const visibleColCount = state.colsToShow.filter(col => col.visible).length;
    const selectedCol = state.colsToShow.find(col => col.name === colName);

    // hide column only if we have more that one column visible
    if (visibleColCount > 1 || !selectedCol.visible) {
      selectedCol.visible = !selectedCol.visible;
    }
  },
  // toggle the display state of column filtering
  toggleColFilter(state) {
    state.showColFilter = !state.showColFilter;
  },
  // hide the column filtering
  hideColFilter(state) {
    state.showColFilter = false;
  },
  // set the sorting direction for a column
  // also handle firebase descending sort
  setSorting(state, { col, isSorting }) {
    state.isSorting = isSorting;

    if (isSorting) {
      if (state.sortCol === col) {
        switch (state.sortDirection) {
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
  // get the table rows from firebase and initialize configuration on return
  setTableRef: firebaseAction(
    /* istanbul ignore next */ ({ bindFirebaseRef, commit }, { ref }) => {
      bindFirebaseRef("rows", ref, {
        readyCallback() {
          // initialize once database returns data
          commit("setConfig");
        }
      });
    }
  ),
  // perform a database sort
  sortBy: firebaseAction(
    /* istanbul ignore next */ ({ bindFirebaseRef, commit }, { ref, col }) => {
      commit("setSorting", { col: col, isSorting: true });
      bindFirebaseRef("rows", ref.orderByChild(col), {
        readyCallback() {
          commit("setSorting", { col: col, isSorting: false });
        }
      });
    }
  ),
  // update field data
  editField: firebaseAction(
    /* istanbul ignore next */ ({}, { ref, cell }) => {
      ref.update(cell);
    }
  ),
  // move pagination to the next page
  nextPage: ({ state, commit }) => {
    if (state.currentPage < getters.getTotalPages(state)) {
      commit("setPage", state.currentPage + 1);
    }
  },
  // move pagination to the previous page
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
