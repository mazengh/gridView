import grid from "../../store/modules/grid.js";

// sample grid configuration for testing
const gridConfig = {
  tableName: "Groceries",
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
      format: function(value, filterComparison, compareWithFilter) {
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
  colOrder: ["id", "name", "description", "brand", "upc", "price"],
  pageSize: 10
};

// test grid store getter functions
describe("grid/getters", () => {
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
    sortDirection: "ASC",
    isSorting: false,
    pageSize: 10,
    pageOffset: 0,
    currentPage: 1,
    filteredRows: []
  };

  // add configuration and initialize it for testing
  grid.mutations.addConfig(state, gridConfig);
  grid.mutations.setConfig(state);

  // test that we get the colums specified in the config regardless of visibility
  // which means the data will be available for displaying
  test("getColsToShow returns the array of columns to be displayed", () => {
    const colsToShow = [
      { name: "description", visible: true, expr: "", editable: true },
      { name: "name", visible: true, expr: "", editable: false },
      { name: "id", visible: false, expr: "", editable: false },
      { name: "brand", visible: true, expr: "", editable: false },
      { name: "upc", visible: true, expr: "", editable: false },
      { name: "price", visible: true, expr: "", editable: false }
    ];
    expect(
      grid.getters
        .getColsToShow(state)
        .map(col => {
          return col.name;
        })
        .sort()
    ).toEqual(
      colsToShow
        .map(col => {
          return col.name;
        })
        .sort()
    );
  });

  // test getting the table name
  test("getTableName returns the table name", () => {
    expect(grid.getters.getTableName(state)).toBe("Groceries");
  });

  // test that we get columns names that are visible only
  test("getHeaders returns the table column header names that are set to visible", () => {
    expect(grid.getters.getHeaders(state)).toEqual(
      expect.arrayContaining(["name", "description", "brand", "upc", "price"])
    );

    expect(grid.getters.getHeaders(state)).not.toContain(["id"]);
  });

  // test that we get the total column count regardless of visibility of columns
  test("getColCount returns the number of columns available for the user", () => {
    expect(grid.getters.getColCount(state)).toBe(6);
  });

  // column filtering is not displayed initially
  test("getShowColFilter returns false initially", () => {
    expect(grid.getters.getShowColFilter(state)).toBeFalsy();
  });

  grid.mutations.setSorting(state, { col: "price", isSorting: true });

  // get the column the use requests for sorting
  test("getSortCol returns the column name we are sorting on", () => {
    expect(grid.getters.getSortCol(state)).toBe("price");
  });

  // get the total number of rows returned from DB
  test("getRowCount returns the total number of rows", () => {
    expect(grid.getters.getRowCount(state)).toBe(3);
  });

  // get the rows based on visibility and filters
  test("getRows returns row data for visible columns", () => {
    expect(grid.getters.getRows(state)).toEqual(state.rows);
    state.colsToShow[3].expr = "Yu"; //set the brand search filter
    expect(grid.getters.getRows(state)).toHaveLength(2);
    state.colsToShow[3].expr = "Yuk"; //set the brand search filter
    expect(grid.getters.getRows(state)).toHaveLength(0);
    state.colsToShow[3].expr = ""; //remove brand search filter
    expect(grid.getters.getRows(state)).toHaveLength(3);
    state.colsToShow[4].expr = "=0227345"; //set the ups filter equal to exact value
    expect(grid.getters.getRows(state)).toHaveLength(1); //make sure we are comparing the data without it's format
    state.colsToShow[4].expr = ""; //remove ups search filter
    state.colsToShow[5].expr = ">2"; //set the price filter to be > 2
    expect(grid.getters.getRows(state)).toHaveLength(1);
    state.colsToShow[5].expr = "0.7"; //set the price filter to be 0.7
    expect(grid.getters.getRows(state)).toHaveLength(1);
    state.colsToShow[5].expr = "<="; //set the price filter to be a comparison operator
    expect(grid.getters.getRows(state)).toHaveLength(3);
    state.colsToShow[5].expr = "=0.75"; //set the price filter equal to exact value
    expect(grid.getters.getRows(state)).toHaveLength(1);
    state.colsToShow[5].expr = ">=1"; //set the price filter greater than or equal
    expect(grid.getters.getRows(state)).toHaveLength(2);
    state.colsToShow[5].expr = "<=1"; //set the price filter less than or equal
    expect(grid.getters.getRows(state)).toHaveLength(1);
    state.colsToShow[5].expr = "<3"; //set the price filter less than
    expect(grid.getters.getRows(state)).toHaveLength(2);
    state.colsToShow[5].expr = "!=2"; //set the price filter not equal
    expect(grid.getters.getRows(state)).toHaveLength(2);
    state.colsToShow[5].expr = "<>3"; //set the price filter not equal
    expect(grid.getters.getRows(state)).toHaveLength(2);
    state.colsToShow[5].expr = ""; //remove price search filter
    expect(grid.getters.getRows(state)).toHaveLength(3);
  });

  // pagination summary is an object that specifies
  // the starting row, ending row and total rows
  test("getPaginationSummary returns an object with the required structure", () => {
    const summary = {
      firstRow: state.pageOffset + 1,
      lastRow: 3,
      totalRows: state.filteredRows.length
    };
    expect(grid.getters.getPaginationSummary(state)).toEqual({
      firstRow: 1,
      lastRow: 3,
      totalRows: 3
    });

    state.pageSize = 1;
    expect(grid.getters.getPaginationSummary(state)).toEqual({
      firstRow: 1,
      lastRow: 1,
      totalRows: 3
    });

    state.pageSize = 10;
  });

  // total pages changes based on the page size
  test("getTotalPages returns the total pages based on page size", () => {
    expect(grid.getters.getTotalPages(state)).toBe(1);
    state.filteredRows = [];
    state.pageSize = 1;
    expect(grid.getters.getTotalPages(state)).toBe(3);
    state.pageSize = 10;
  });

  // get an array of page numbers ex [1,2,3,4] if we have 4 pages
  test("getPages returns an array of page numbers", () => {
    expect(grid.getters.getPages(state)).toEqual([1]);
  });

  // get row data for visible columns based on selections
  test("getSelections returns an array of row data for selected rows", () => {
    const selectionIDs = ["0", "2"];
    const expectedSelections = [
      ["Chunky", "Chocolate bar", "Yummies", "0223345", 2],
      ["Dreamy Duck", "Cat Treat", "Dreamies", "0227945", 3]
    ];
    expect(grid.getters.getSelections(state)(selectionIDs)).toEqual(
      expectedSelections
    );
  });

  // get the ids for all rows
  test("getAllIDs returns an array row ids", () => {
    expect(grid.getters.getAllIDs(state)).toEqual(["0", "1", "2"]);
  });
});
