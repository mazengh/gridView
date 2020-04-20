import grid from "../../store/modules/grid.js";
import { cloneDeep } from "lodash";

// sample grid configuration for testing
const gridConfig = {
  tableName: "Groceries",
  colsToShow: [
    { name: "name", visible: true, expr: "", editable: false },
    { name: "description", visible: true, expr: "", editable: true },
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
  colOrder: ["id", "description", "name", "price", "upc"],
  pageSize: 10
};

// test grid store mutations
describe("grid/mutations", () => {
  // sample state for testing
  const state = {
    config: null,
    rows: [
      {
        id: "gr_0054",
        name: "Chunky",
        description: "Chocolate bar",
        brand: "Yummies",
        upc: "0223345",
        price: 2
      },
      {
        id: "gr_0672",
        name: "Magic Pop",
        description: "Sparkly Lolipop",
        brand: "Yummies",
        upc: "0227345",
        price: 0.75
      },
      {
        id: "gr_0069",
        name: "Dreamy Duck",
        description: "Cat Treat",
        brand: "Dreamies",
        upc: "0227945",
        price: 3
      }
    ],
    tableName: "",
    colOrder: [],
    colsToShow: [],
    showColFilter: false,
    sortCol: null,
    sortDirection: null,
    isSorting: false,
    pageSize: 10,
    pageOffset: 0,
    currentPage: 1,
    filteredRows: []
  };

  // test adding configuration to store
  test("addConfig sets state config variable", () => {
    expect(state.config).toBeNull();
    grid.mutations.addConfig(state, gridConfig);
    expect(state.config).toBeDefined();
  });

  // test initializing grid configuration
  test("setConfig sets state initial variables", () => {
    // test with default config
    const defaultConfig = cloneDeep(gridConfig);
    defaultConfig.colsToShow = null;
    defaultConfig.colOrder = null;
    grid.mutations.addConfig(state, defaultConfig);
    grid.mutations.setConfig(state);

    expect(grid.getters.getTableName(state)).toBe("Groceries");
    expect(grid.getters.getColsToShow(state).length).toBeGreaterThan(0);

    // test default config with no rows returned
    const dataRows = cloneDeep(state.rows);
    state.rows = [];
    grid.mutations.setConfig(state);
    expect(grid.getters.getColsToShow(state).length).toBe(0);
    expect(grid.getters.getRowCount(state)).toBe(0);
    state.rows = dataRows;

    // test column ordering if only part of the columns is supplied in config
    defaultConfig.colOrder = ["name", "price"];
    grid.mutations.addConfig(state, defaultConfig);
    grid.mutations.setConfig(state);

    expect(grid.getters.getTableName(state)).toBe("Groceries");
    expect(grid.getters.getColsToShow(state).length).toBeGreaterThan(0);

    // test with supplied config
    grid.mutations.addConfig(state, gridConfig);
    grid.mutations.setConfig(state);

    expect(grid.getters.getTableName(state)).toBe("Groceries");
    expect(grid.getters.getColsToShow(state).length).toBeGreaterThan(0);
  });

  // test set page to change pagination to a selected page
  test("setPage sets the current page number", () => {
    grid.mutations.setPage(state, 3);
    expect(state.pageOffset).toBe(20);
  });

  // test setting filter on a column
  test("setFilterExpr sets the filtering expression for a column", () => {
    grid.mutations.addConfig(state, gridConfig);
    grid.mutations.setConfig(state);
    grid.mutations.setFilterExpr(state, { expr: "ch", colName: "name" });
    expect(state.colsToShow.find(col => col.name === "name").expr).toBe("ch");
  });

  //test toggling columns
  test("toggleCol toggles the visible state of columns", () => {
    grid.mutations.addConfig(state, gridConfig);
    grid.mutations.setConfig(state);

    grid.mutations.toggleCol(state, "name"); //hide "name" column
    expect(grid.getters.getHeaders(state)).toEqual([
      "description",
      "price",
      "upc",
      "brand"
    ]);

    grid.mutations.toggleCol(state, "name"); // show "name" column
    expect(grid.getters.getHeaders(state)).toEqual([
      "description",
      "name",
      "price",
      "upc",
      "brand"
    ]);

    grid.mutations.toggleCol(state, "description"); // hide "description" column
    grid.mutations.toggleCol(state, "brand"); // hide "brand" column
    grid.mutations.toggleCol(state, "upc"); // hide "upc" column
    grid.mutations.toggleCol(state, "price"); // hide "price" column

    expect(grid.getters.getHeaders(state)).toEqual(["name"]);

    // toggling last column does not hide it
    grid.mutations.toggleCol(state, "name"); //hide "name" column
    expect(grid.getters.getHeaders(state)).toEqual(["name"]);
  });

  // test displaying the column filter
  test("toggleColFilter toggle the display to show column filter", () => {
    grid.mutations.toggleColFilter(state); // displays the column filter
    expect(state.showColFilter).toBeTruthy();
  });

  // test hiding the column filter
  test("hideColFilter sets the state of column filter to false", () => {
    grid.mutations.hideColFilter(state); // displays the column filter
    expect(state.showColFilter).toBeFalsy();
  });

  // test sorting columns
  test("setSorting set the sorting direction of a column", () => {
    grid.mutations.setSorting(state, { col: "price", isSorting: true });
    expect(grid.getters.getSortCol(state)).toBe("price");
    expect(state.sortDirection).toBe("ASC");
    grid.mutations.setSorting(state, { col: "price", isSorting: true });
    grid.mutations.setSorting(state, { col: "price", isSorting: false });
    expect(state.sortDirection).toBe("DESC");
    grid.mutations.setSorting(state, { col: "price", isSorting: true });
    expect(state.sortDirection).toBe("ASC");
    grid.mutations.setSorting(state, { col: "brand", isSorting: true });
    expect(state.sortDirection).toBe("ASC");
    grid.mutations.setSorting(state, { col: "brand", isSorting: true });
    grid.mutations.setSorting(state, { col: "brand", isSorting: false });
    expect(state.sortDirection).toBe("DESC");
    grid.mutations.setSorting(state, { col: "brand", isSorting: true });
    grid.mutations.setSorting(state, { col: "brand", isSorting: false });
    expect(state.sortDirection).toBe("ASC");
  });
});
