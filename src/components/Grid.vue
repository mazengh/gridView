<template>
  <div class="grid-container">
    <table>
      <thead>
        <tr>
          <th :colspan="getColCount">
            <div class="controls">
              <div class="title">
                <font-awesome-icon :icon="['fa', 'table']"></font-awesome-icon>
                <h3>{{getTableName}}</h3>
              </div>
              <div class="rowFilterBtn" title="Sort &amp; Filter">
                <font-awesome-icon :icon="['fa', 'bars']" @click="toggleRowFilter"></font-awesome-icon>
              </div>
              <div class="colFilterBtn" title="Filter Columns">
                <font-awesome-icon :icon="['fa', 'bars']" @click="toggleColFilter"></font-awesome-icon>
                <div
                  class="colsToFilter"
                  v-bind:class="{ showCols: getShowColFilter }"
                  @mouseleave="closeColFilter"
                >
                  <h4>Filter Columns</h4>
                  <ul class>
                    <li
                      v-for="(head, index) in getColsToShow"
                      v-bind:class="{ hiddenCol: !head.visible}"
                      @click="toggleCol(head.name)"
                      :key="`${head.name}-${index}`"
                    >{{head.name}}</li>
                  </ul>
                </div>
              </div>
              <div class="exportBtn" title="Export Selections to CSV File">
                <a href="javascript:void(0)" download="export.csv">
                  <font-awesome-icon :icon="['fa', 'file-export']"></font-awesome-icon>
                </a>
              </div>
            </div>
          </th>
        </tr>
        <tr class="headers" v-bind:class="{headerFiltersShow: absoluteHeadersActive}">
          <th v-for="head in getHeaders" :key="`${head}-col}`">
            <div class="gridHead">
              <div class="colHeader" @click="sortCol(head)">
                {{head}}
                <i v-show="getSortCol === head">
                  <font-awesome-icon :icon="['fa', 'spinner']" spin v-if="isSorting"></font-awesome-icon>
                  <font-awesome-icon
                    :icon="['fa', 'sort-amount-up']"
                    class="asc"
                    v-else-if="sortDirection === 'ASC'"
                  ></font-awesome-icon>
                  <font-awesome-icon :icon="['fa', 'sort-amount-up']" v-else></font-awesome-icon>
                </i>
              </div>
              <div class="colFilter">
                <input
                  type="text"
                  title="Enter text or use logical operators =, >, >=, <, <=, !=, <>"
                  @mouseenter="addPlaceHolder($event, head)"
                  @mouseleave="removePlaceHolder($event)"
                  @input="setFilterExpr($event, head)"
                >
              </div>
            </div>
          </th>
          <th class="actions">
            <div class="gridHead">
              <div class="colHeader">Selections</div>
              <div class="colFilter">
                <input type="checkbox" v-model="totalSelected" @click="selectAll">
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody @click="tbodyClickHandler($event)">
        <tr v-for="row in getRows" :key="`row-${row['.key']}`">
          <td
            v-bind:data-column-name="head"
            v-for="head in getHeaders"
            :key="`${head}-${row['.key']}`"
            :id="`${head}-${row['.key']}`"
          >
            <p v-if="isEditable(head)">
              <button
                id="saveFieldBtn"
                title="Save"
                v-if="fieldBeingEdited === `editable-${row['.key']}-${head}`"
                @click="saveField($event)"
              >&#10004;</button>
              <textarea
                :id="`editable-${row['.key']}-${head}-textarea`"
                v-if="fieldBeingEdited === `editable-${row['.key']}-${head}`"
                class="editableCell"
              >{{row[head]}}</textarea>
              <span
                :id="`editable-${row['.key']}-${head}`"
                class="editable"
                v-bind:class="{hidden: fieldBeingEdited === `editable-${row['.key']}-${head}`}"
              >{{row[head]}}</span>
            </p>

            <span v-else>{{row[head] | gridFilter(head)}}</span>
          </td>
          <td data-column-name="Select">
            <input
              type="checkbox"
              v-bind:value="row['.key']"
              v-model="checkedCells"
              @change="toggleExportList"
            >
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td :colspan="getColCount">
            <ul class="pagination">
              <li>
                <a @click="previousPage">&laquo;</a>
              </li>
              <li v-for="page in getPages" :key="`page${page}`">
                <a @click="setPage(page)" v-bind:class="{ active: page===currentPage}">{{page}}</a>
              </li>
              <li>
                <a @click="nextPage">&raquo;</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td>
            <div class="paginationSummary">
              Showing
              <b>{{getPaginationSummary.firstRow}}-{{getPaginationSummary.lastRow}}</b>
              <span v-show="getPaginationSummary.totalRows > getPaginationSummary.lastRow">
                of
                <b>{{getPaginationSummary.totalRows}}</b>
              </span>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>


<script>
import { mapGetters, mapMutations, mapActions, mapState } from "vuex";
import { store } from "../store/store.js";
import { db } from "../firebaseConfig";

export default {
  props: { config: Object },
  data() {
    return {
      fieldBeingEdited: null,
      absoluteHeadersActive: false,
      checkedCells: [],
      totalSelected: false
    };
  },
  computed: {
    ...mapGetters([
      "getTableName",
      "getRows",
      "getHeaders",
      "getColCount",
      "getColsToShow",
      "getShowColFilter",
      "getSortCol",
      "getPaginationSummary",
      "getPages",
      "getSelections",
      "getAllIDs",
      "getRowCount"
    ]),
    ...mapState({
      sortDirection: state => state.grid.sortDirection,
      isSorting: state => state.grid.isSorting,
      currentPage: state => state.grid.currentPage,
      colsToShow: state => state.grid.colsToShow
    })
  },
  methods: {
    ...mapMutations([
      "toggleCol",
      "toggleColFilter",
      "hideColFilter",
      "setSorting",
      "setPage"
    ]),
    ...mapActions(["sortBy", "nextPage", "previousPage", "editField"]),
    closeColFilter(event) {
      event.stopPropagation();
      this.hideColFilter();
    },
    sortCol(col) {
      const dbTableRef = db.ref(this.config.tableName);
      this.sortBy({ ref: dbTableRef, col: col });
    },
    addPlaceHolder: function(event, head) {
      event.target.placeholder = `Filter ${head}`;
    },
    removePlaceHolder: function(event) {
      event.target.placeholder = "";
    },
    setFilterExpr(event, col) {
      this.$store.commit("setFilterExpr", {
        expr: event.target.value,
        colName: col
      });
    },
    tbodyClickHandler(event) {
      if (event.target.className === "editable") {
        this.fieldBeingEdited = event.target.id;
        setTimeout(() => {
          document.getElementById(`${this.fieldBeingEdited}-textarea`).focus();
        }, 500);
      }

      event.stopPropagation();
    },
    saveField(event) {
      const rowObject = this.fieldBeingEdited.split("-")[1];
      const colName = this.fieldBeingEdited.split("-")[2];

      const ref = `${this.config.tableName}/${rowObject}`;
      const cellData = document.getElementById(
        `${this.fieldBeingEdited}-textarea`
      ).value;

      const dbChildRef = db.ref(ref);
      this.editField({
        ref: dbChildRef,
        cell: { [colName]: cellData }
      });
      event.stopPropagation();
    },
    isEditable(colName) {
      const col = this.colsToShow.find(col => col.name === colName);
      return col.editable;
    },
    toggleRowFilter() {
      this.absoluteHeadersActive = !this.absoluteHeadersActive;
    },
    toggleExportList() {
      const exportLink = document.querySelector(".exportBtn a");

      // reset export link if there are no selections
      if (!this.checkedCells.length) {
        exportLink.href = "javascript:void(0);";
        return;
      }

      // get data for all checked rows
      let selections = this.getSelections(this.checkedCells);

      // add headers to csv content
      selections.unshift(this.getHeaders);

      // convert data to csv string with comma as a delimiter
      let csvContent = selections
        .map(e => {
          // create csv string for row while escaping text
          let escaped = e.reduce(function(prevVal, currVal, index) {
            return index == 0
              ? currVal
              : prevVal +
                  "," +
                  (isNaN(currVal) ? '"' + currVal + '"' : currVal);
          }, "");
          return escaped;
        })
        .join("\r\n");

      var encodedUri =
        "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);

      // set the export link to href to download the data of the selections
      exportLink.href = encodedUri;

      this.totalSelected = this.getRowCount === this.checkedCells.length;
    },
    selectAll() {
      // if total selected, deselect all
      if (this.totalSelected) {
        this.checkedCells = [];
      } else {
        // get the ids of all rows
        this.checkedCells = this.getAllIDs;
      }

      // set the export list
      this.toggleExportList();
    }
  },
  created() {
    const dbTableRef = db.ref(this.config.tableName);
    this.$store.commit("addConfig", this.config);
    this.$store.dispatch("setTableRef", dbTableRef);
  }
};
</script>


<style>
div.grid-container {
  width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

.controls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
}
.controls div h3 {
  margin: -4px 0 0 5px;
  padding: 0;
}

div.title {
  display: flex;
  flex-grow: 1;
  cursor: default;
}

/* File export CSS */
.exportBtn {
  cursor: pointer;
}

.exportBtn a {
  text-decoration: none;
  color: #fff;
}

/* Filter Rows CSS */
.rowFilterBtn {
  visibility: hidden;
  margin-right: 15px;
}

/* Filter Columns CSS */
.colHeader {
  cursor: pointer;
}
.colFilter {
  align-items: flex-end;
}
svg.fa-bars {
  cursor: pointer;
}
.colFilterBtn svg.fa-bars {
  transform: rotate(90deg);
}
div.colFilterBtn {
  margin-right: 20px;
}
div.colsToFilter {
  position: absolute;
  background: #c7d9db;
  border: 1px solid white;
  border-radius: 8px;
  right: 0;
  top: 30px;
  z-index: 2;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s linear 300ms, opacity 300ms;
  overflow: hidden;
}
div.colsToFilter h4 {
  display: block;
  color: #fff;
  margin: 0;
  padding: 10px;
  white-space: nowrap;
  background: #219da6;
}
div.colsToFilter ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
div.colsToFilter ul li {
  padding: 8px 8px;
  border-bottom: 1px solid #219da6;
  font-size: 0.9em;
}

li:hover {
  color: #fff;
  background: #2ac5d0;
  transition: color 0.8s ease, background-color 0.3s ease;
}

div.colsToFilter ul li:last-child {
  border: none;
}
div.showCols {
  color: #364f54;
  cursor: pointer;
  visibility: visible;
  opacity: 1;
  transition: visibility 0s linear 0s, opacity 300ms;
}
li.hiddenCol {
  text-decoration: line-through;
  color: red;
}

/* Pagination CSS */
div.paginationSummary {
  font-weight: normal;
  font-size: 0.9em;
  user-select: none;
  cursor: default;
  padding: 5px;
}
ul.pagination {
  position: relative;
  list-style-type: none;
  display: inline-block;
  padding: 10px 0 0 0;
  margin: 0;
}
ul.pagination li {
  position: relative;
  display: inline;
  user-select: none;
}
ul.pagination li a {
  position: relative;
  color: #364f54;
  float: left;
  padding: 5px 10px;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.5s;
  border: 1px solid #ddd;
}
ul.pagination li a.active {
  background-color: #364f54;
  color: white;
  font-weight: bold;
  border-radius: 5px;
}
ul.pagination li a:hover:not(.active) {
  background-color: #ddd;
  cursor: pointer;
}
.pagination li:first-child a {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}
.pagination li:last-child a {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}
ul.pagination li a {
  margin: 0 2px;
}

/* Sort Columns CSS */
svg.fa-sort-amount-up,
svg.fa-spinner {
  margin-left: 2px;
  color: #c7d9db;
}
svg.asc {
  /* flip the icon for Asc sort direction*/
  transform: scaleY(-1);
  filter: FlipV;
}

td {
  height: inherit;
}
p {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
p span.editable {
  justify-content: center;
}
span.hidden {
  visibility: hidden;
}
/* Editable field CSS */
#saveFieldBtn {
  font-size: 0.5em;
  font-weight: bold;
  position: absolute;
  right: 0;
  top: 2px;
  cursor: pointer;
  color: #364f54;
}
textarea.editableCell {
  position: absolute;
  background: transparent;
  width: 100%;
  height: calc(100% - 20px);
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  overflow: hidden;
  resize: none;
  z-index: 1;
  margin-left: -2px;
  margin-top: 0.35em;
  border: none;
}

textarea.editableCell:focus {
  border: none;
  outline: none;
}

/* Responsive Table CSS */
table {
  border: 1px solid #fff;
  border-spacing: 1px;
  border-collapse: collapse;
  background: #364f54;
  border-radius: 8px;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  overflow: hidden;
  width: calc(100% - 2px);
  margin: 0 auto;
}
table thead,
table tbody,
table tfoot,
table tr,
table td,
table th,
table div,
table tfoot tr td ul,
table li {
  position: relative;
}
table tbody {
  display: block;
  height: calc(
    98vh - 12em
  ); /* 98 of viewport height minus header and footer heights */
  overflow-y: scroll;
  overflow-x: hidden;
  background: #fff;
  scrollbar-width: thin;
}
table tbody::-webkit-scrollbar {
  background-color: rgb(214, 214, 214);
  width: 8px;
}
table tbody::-webkit-scrollbar-thumb {
  background-color: rgb(182, 182, 182);
}

table thead {
  display: block;
  width: calc(100%-1em);
}
thead tr,
tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}
thead tr {
  width: calc(100% - 0.5em);
  width: calc(vw - 0.5em);
}
table td,
table th {
  padding: 0 15px;
}
table thead tr:last-child th:last-child,
table tbody tr td:last-child {
  width: 80px;
}
table thead tr {
  height: 50px;
  background: #364f54;
}
table tbody tr {
  height: 50px;
}
table tbody tr:last-child {
  border: 0;
}
table td,
table th {
  text-align: left;
}
table th {
  color: #fff;
  text-transform: capitalize;
  white-space: nowrap;
}
table tbody tr:nth-child(even) {
  background-color: #e6eeef;
}
table tbody tr:nth-child(odd) {
  background-color: #fff;
}
tr.headers {
  position: relative;
  visibility: visible;
  opacity: 1;
  transition: visibility 0s linear 300s, opacity 300ms;
}

table tfoot {
  position: relative;
  width: 100%;
  background: #fff;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

/* rule for 1023px < width <= 1200px; */
@media only screen and (max-width: 1200px) {
  div.grid-container {
    width: 95%;
  }
}

/* rule for 767px < width <= 1023px; */
@media only screen and (max-width: 1023px) {
  table thead tr input[type="text"] {
    width: 115px;
  }
}

/* rule for 480px < width  <= 767px; */
@media only screen and (max-width: 767px) {
  tr.headers {
    position: absolute;
    z-index: 0;
    width: 100%;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 300s, opacity 300ms;
  }
  tr.headers th {
    width: 100%;
    background: #364f54;
    user-select: none;
  }
  tr.headerFiltersShow {
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 300ms;
    z-index: 1;
  }
  .rowFilterBtn {
    visibility: visible;
  }
  div.gridHead {
    width: 110%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 5px;
  }
  div.controls {
    align-items: center;
    height: 50px;
  }
  table tbody {
    height: calc(
      100vh - 132px
    ); /* 98 of viewport height minus header and footer heights */
  }
  table thead tr:nth-child(1) th {
    height: 60px;
  }
  div.colFilter {
    margin-right: calc(100vw - 290px);
  }
  div.colHeader {
    flex-grow: 1;
  }
  div.colFilter input {
    height: 10px;
  }
  table {
    display: block;
  }
  table thead,
  table tbody,
  table tfoot,
  table tr,
  table td,
  table th,
  table div,
  table tfoot tr td ul,
  table li {
    display: block;
  }
  table thead tr:nth-child(2) {
    display: block;
    height: auto;
    font-size: 0.9em;
  }
  table thead tr:nth-child(2) th {
    padding: 3px 15px;
  }
  table tbody tr {
    height: auto;
    padding: 10px 0;
  }
  table tbody tr td {
    padding-left: 36%;
    width: calc(63% - 20px);
    margin-bottom: 24px;
  }
  table tbody tr td:last-child {
    margin-bottom: 0;
  }
  table tbody tr td:before {
    font-size: 14px;
    color: #999999;
    line-height: 1.2;
    position: absolute;
    width: 35%;
    left: 10px;
    top: 0;
  }
  table tbody tr td:before {
    content: attr(data-column-name);
    text-transform: capitalize;
    user-select: none;
  }
  table thead tr:last-child th:last-child div.colFilter {
    margin-left: 125%;
  }

  textarea.editableCell {
    height: 100%;
    margin-top: 0;
  }

  #saveFieldBtn {
    right: -10px;
    top: -12px;
  }
  ul.pagination {
    padding: 5px 0 0 0;
  }
  ul.pagination li a {
    padding: 4px 5px;
    font-weight: bold;
    font-size: 0.9em;
  }
  div.colFilterBtn {
    margin-right: 15px;
  }
}
</style>