import Vue from "vue";
import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { cloneDeep } from "lodash";
import grid from "../../store/modules/grid.js";
import Grid from "../../../src/components/Grid.vue";
import db from "../../../__mocks__/firebaseAppMock.js";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTable,
  faBars,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faFileExport
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faTable,
  faBars,
  faSortAmountDown,
  faSortAmountUp,
  faSpinner,
  faFileExport
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

const gridConfig = {
  tableName: "payments",
  colsToShow: [
    { name: "description", visible: true, expr: "", editable: true },
    { name: "name", visible: true, expr: "", editable: false },
    { name: "id", visible: true, expr: "", editable: false },
    {
      name: "date",
      visible: true,
      expr: "",
      editable: false,
      format: function(
        value,
        filterComparison = false,
        compareWithFilter = true
      ) {
        try {
          if (filterComparison && !compareWithFilter) {
            return value;
          }
          if (value) {
            const dateObject = new Date(Date.parse(value)).toLocaleString();
            return dateObject;
          }
        } catch (e) {
          // return the default value if formatting fails
          return value;
        }
      }
    },
    {
      name: "amount",
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
            return `$${(value / 1).toFixed(2)}`;
          }
        } catch (e) {
          // return the default value if formatting fails
          return value;
        }
      }
    }
  ],
  colOrder: ["id", "name", "description", "date", "amount"],
  pageSize: 10
};

const fakeRef = db.ref;
fakeRef.data = require("./payments.json");

// Here are some Jasmine 2.0 tests, though you can
// use any test runner / assertion library combo you prefer
describe("Grid", () => {
  let wrapper, state, getters, mutations, actions, store;

  actions = grid.actions;
  mutations = grid.mutations;
  getters = grid.getters;

  beforeEach(() => {
    state = cloneDeep(grid.state);

    actions.setTableRef = jest.fn(() => {
      Object.keys(fakeRef.data[gridConfig.tableName]).forEach((key, index) => {
        state.rows[index] = { ".key": index, ...fakeRef.data.payments[key] };
      });
      mutations.setConfig(state);
    });

    actions.editField = jest.fn();

    store = new Vuex.Store({
      modules: {
        grid: {
          state,
          actions,
          getters,
          mutations
        }
      }
    });

    wrapper = mount(Grid, {
      store,
      propsData: {
        config: cloneDeep(gridConfig)
      }
    });
  });

  // Inspect the raw component options
  it("has a created hook", () => {
    expect(typeof Grid.created).toBe("function");
  });

  // checks default grid data
  it("checks default data", () => {
    expect(typeof Grid.data).toBe("function");
    const defaultData = Grid.data();
    expect(defaultData.fieldBeingEdited).toBe(null);
    expect(defaultData.absoluteHeadersActive).toBe(false);
    expect(defaultData.checkedCells).toEqual([]);
    expect(defaultData.totalSelected).toBe(false);
  });

  // Inspect the component instance on mount
  it("sets the Configuration prop when Grid is created", () => {
    expect(wrapper.props().config).toBeDefined();
    expect(wrapper.props().config.tableName).toBe("payments");
  });

  // Sort a column
  it("sorts column", () => {
    const button = wrapper.find("div.colHeader");
    expect(button.exists()).toBe(true);

    button.trigger("click", "id");
    expect(state.sortCol).toBe(button.text());

    // initial sort direction is always ascending
    expect(state.sortDirection).toBe("ASC");

    // clicking sort link again sets sort direction to descending
    button.trigger("click", "id");
    expect(state.sortDirection).toBe("DESC");
  });

  // toggles column filtering
  it("toggle columns", () => {
    const button = wrapper.find("div.colFilterBtn");
    expect(button.exists()).toBe(true);
    const buttonIcon = button.find("svg");
    expect(buttonIcon.exists()).toBe(true);

    // if column filter icon is clicked, we display the show column filter Div
    const colsToFilter = wrapper.find("div.colsToFilter");
    expect(colsToFilter.classes("showCols")).toBe(false);
    buttonIcon.trigger("click");
    expect(state.showColFilter).toBe(true);
    expect(colsToFilter.classes("showCols")).toBe(true);

    const headers = getters.getHeaders(state);

    // hide first column
    mutations.toggleCol(state, headers[0]);
    expect(getters.getHeaders(state).includes(headers[0])).toBeFalsy();

    // show first column
    mutations.toggleCol(state, headers[0]);
    expect(getters.getHeaders(state).includes(headers[0])).toBeTruthy();

    // try to hide all columns; last column will not be hidden as
    // we must have at least one visible column
    headers.forEach(head => {
      mutations.toggleCol(state, head);
    });
    expect(getters.getHeaders(state).length).toBe(1);

    // close(hide) column filter div on mouse leave
    colsToFilter.trigger("mouseleave");
    expect(colsToFilter.classes("showCols")).toBe(false);
  });

  // check column input field filtering
  it("checks placeholder visual placement on mouse events and tests input filtering", () => {
    const headers = getters.getHeaders(state);
    const colFilter = wrapper.find("div.colFilter");
    const colFilterInput = colFilter.find("input");

    // trigger mouseover on a column filter input field
    colFilterInput.trigger("mouseenter", headers[0]);
    expect(colFilterInput.attributes("placeholder")).toBe(
      `Filter ${headers[0]}`
    );

    // trigger mouseleave on a column filter input field
    colFilterInput.trigger("mouseleave", headers[0]);
    expect(colFilterInput.attributes("placeholder")).toBe("");

    // change input filter value
    colFilterInput.element.value = "3471";
    //colFilterInput.trigger("input", { event: event, col: headers[0] });
    colFilterInput.trigger("input", headers[0]);
    const currentCol = state.colsToShow.find(col => col.name === headers[0]);
    expect(currentCol.expr).toBe("3471");

    // will return one row as the set filter of "3471" returns only 1 row
    expect(getters.getRows(state).length).toBe(1);
  });

  // check table body click handler and editable field
  it("checks a click on the table body and tests editable field", () => {
    const gridContainer = wrapper.find("div.grid-container");
    const tableBody = gridContainer.find("tbody");
    expect(tableBody.isVisible()).toBe(true);

    // if element clicked is not editable fieldBeingEdited is not set
    tableBody.trigger("click");
    expect(wrapper.vm.fieldBeingEdited).toEqual(null);

    const editableField = wrapper.find("span.editable");
    expect(editableField.is("span.editable")).toBe(true);

    // if element clicked is editable fieldBeingEdited is set
    // and textarea is displayed
    editableField.trigger("click");
    expect(wrapper.vm.fieldBeingEdited).toEqual(
      expect.stringContaining("editable-")
    );

    const textAreaRef = `${wrapper.vm.fieldBeingEdited}-textarea`;
    const textArea = wrapper.find("textarea#" + textAreaRef);
    expect(textArea.is("textarea#" + textAreaRef)).toBe(true);

    // if saveFieldBtn is clicked, we save field data
    const saveFieldBtn = wrapper.find("button.saveFieldBtn");
    expect(saveFieldBtn.is("button.saveFieldBtn")).toBe(true);
    saveFieldBtn.trigger("click");
    expect(actions.editField).toHaveBeenCalled();
  });

  // Toggle Row Filter
  // row filter is hidden in responsive mode
  it("toggles row filters", () => {
    const rowFilterDiv = wrapper.find("div.rowFilterBtn");
    expect(rowFilterDiv.exists()).toBe(true);

    const rowFilterBtn = rowFilterDiv.find("svg");
    expect(rowFilterBtn.exists()).toBe(true);

    // initially filter is hidden
    const filterRow = wrapper.find("tr.headers");
    expect(filterRow.classes("headerFiltersShow")).toBe(false);

    // filter is displayed when row filter button is clicked
    rowFilterBtn.trigger("click");
    expect(filterRow.classes("headerFiltersShow")).toBe(true);

    // filter is hidden when row filter is clicked again
    rowFilterBtn.trigger("click");
    expect(filterRow.classes("headerFiltersShow")).toBe(false);
  });

  // Check box selection and export selections to CSV
  it("checks selections and exporting to csv link", () => {
    let exportLink = wrapper.find("div.exportBtn a");
    expect(exportLink.exists()).toBe(true);

    // initial export link href
    expect(exportLink.attributes("href")).toBe("javascript:void(0)");
    const checkboxAry = wrapper.findAll("input[type='checkbox']");
    checkboxAry.at(1).setChecked();
    expect(exportLink.attributes("href")).not.toBe("javascript:void(0)");

    // uncheck first checkbox
    // link must be reset since no checkboxes are checked
    checkboxAry.at(1).setChecked(false);
    expect(exportLink.attributes("href")).toBe("javascript:void(0)");

    // check select all checkbox
    checkboxAry.at(0).trigger("click");
    expect(wrapper.vm.totalSelected).toBeTruthy();

    // uncheck select all checkbox
    checkboxAry.at(0).trigger("click");
    expect(wrapper.vm.totalSelected).toBeFalsy();
  });
});
