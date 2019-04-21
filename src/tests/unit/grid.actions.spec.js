import db from "../../../__mocks__/firebaseAppMock.js";
import { firebaseMutations, firebaseAction } from "vuexfire";
import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import grid from "../../store/modules/grid.js";

const localVue = createLocalVue();
localVue.use(Vuex);

// grid configuration for test
const gridConfig = {
  colsToShow: [
    { name: "description", visible: true, expr: "", editable: true },
    { name: "name", visible: true, expr: "", editable: false },
    { name: "id", visible: false, expr: "", editable: false },
    { name: "brand", visible: true, expr: "", editable: false },
    {
      name: "upc",
      visible: true,
      expr: "",
      editable: false,
      format: function(
        value,
        filterComparison = false,
        compareWithFilter = false
      ) {
        try {
          // do not compare data with filtered value if compareWithFilter is false
          if (filterComparison && !compareWithFilter) {
            return value;
          }
          if (value) {
            return `*** ${value} ***`;
          }
        } catch (e) {
          // return the default value if formatting fails
          return value;
        }
      }
    },
    { name: "price", visible: true, expr: "", editable: false }
  ],
  colOrder: ["id", "name", "description", "brand", "upc", "price"]
};

// test grid store actions
describe("grid/actions", () => {
  // initial state for test
  const state = {
    config: null,
    rows: [],
    tableName: "payments",
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

  grid.actions.sortBy = jest.fn();
  grid.actions.editField = jest.fn();
  let actions = grid.actions;
  let mutations;
  let getters;
  let store;

  // initialize test database from json file
  db.ref.data = require("./payments.json");
  const fakeRef = db.ref("payments");

  beforeEach(() => {
    fakeRef.set(require("./payments.json"));
    fakeRef.flush();

    store = new Vuex.Store({
      mutations: { ...firebaseMutations },
      modules: {
        grid: {
          state,
          actions: grid.actions,
          getters: grid.getters,
          mutations: grid.mutations
        }
      }
    });

    // add test grid configuration and simulate populating
    // rows from data base, then initialize configuration
    store.commit("addConfig", gridConfig);
    state.rows = Object.keys(fakeRef.data.payments).map(
      key => fakeRef.data.payments[key]
    );
    store.commit("setConfig");
  });

  // test getting rows and initializing configuration
  test("setTableRef queries row data from database and initilizes config", () => {
    store.commit("addConfig", gridConfig);

    const readyCallback = () => {
      state.rows = fakeRef.data;
      store.commit("setConfig");
    };

    store.dispatch("setTableRef", { ref: fakeRef, readyCallback });
    expect(state.config).toBeDefined();
  });

  // test switching pages with the previous and next buttons
  test("previousPage and nextPage actions which change the current page state", () => {
    expect(state.currentPage).toBe(1); // initial page is the first
    store.dispatch("previousPage");
    expect(state.currentPage).toBe(1); // going to a previous page from first page does not change current page
    store.dispatch("nextPage");
    expect(state.currentPage).toBe(2); // next page is page 2 if we are at page 1
    store.dispatch("nextPage");
    expect(state.currentPage).toBe(3); // next page is page 3 if we are at page 2
    store.dispatch("previousPage");
    expect(state.currentPage).toBe(2); // previous page is page 2 if we are at page 3

    // go to last page and check try nextPage
    const lastPage = grid.getters.getTotalPages(state);
    grid.mutations.setPage(state, lastPage);
    expect(state.currentPage).toBe(lastPage);
    store.dispatch("nextPage");
    expect(state.currentPage).toBe(lastPage);
  });
});
