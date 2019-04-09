<template>
  <div class="grid-container">
    <table>
      <thead>
        <tr>
          <th :colspan="getColCount">
            <div class="controls">
              <div class="title">
                <font-awesome-icon :icon="['fa', 'table']"></font-awesome-icon>
                <h3>Payments</h3>
              </div>
              <div class="colFilter">
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
              <div class="paginationSummary">
                Showing
                <b>{{getPaginationSummary.startRow}}-{{getPaginationSummary.endRow}}</b> of
                <b>{{getPaginationSummary.totalRows}}</b>
              </div>
            </div>
          </th>
        </tr>
        <tr>
          <th v-for="head in getHeaders">
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
                  @mouseenter="addPlaceHolder($event, head)"
                  @mouseleave="removePlaceHolder($event)"
                >
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in getRows" :key="row['.key']">
          <td v-bind:data-column-name="head" v-for="head in getHeaders">{{row[head]}}</td>
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
      orderedCols: []
    };
  },
  computed: {
    ...mapGetters([
      "getRows",
      "getHeaders",
      "getColCount",
      "getColsToShow",
      "getShowColFilter",
      "getSortCol",
      "getPaginationSummary",
      "getPages"
    ]),
    ...mapState({
      sortDirection: state => state.grid.sortDirection,
      isSorting: state => state.grid.isSorting,
      currentPage: state => state.grid.currentPage
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
    ...mapActions(["sortBy", "nextPage", "previousPage"]),
    showCol(head) {
      if (this.config.colsToShow.length > 0) {
        return this.config.colsToShow.includes(head);
      } else {
        return true;
      }
    },
    closeColFilter(event) {
      event.stopPropagation();
      this.hideColFilter();
    },
    sortCol(col) {
      const dbTableRef = db.ref(this.config.tableName);
      this.$store.dispatch("sortBy", { ref: dbTableRef, col: col });
    },
    addPlaceHolder: function(event, head) {
      event.target.placeholder = `Search or filter ${head}`;
    },
    removePlaceHolder: function(event) {
      event.target.placeholder = "";
    }
  },
  beforeCreate() {},
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
  margin: auto;
}

.controls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
}
.controls div h3 {
  margin: -4px 0 0 5px;
  padding: 0px;
}

.title {
  display: flex;
  flex-grow: 1;
}

/* Filter Columns CSS */
.colFilter {
  align-items: flex-end;
  margin-right: 30px;
}
.paginationSummary {
  font-weight: normal;
  font-size: 0.9em;
  margin-right: 10px;
}
svg.fa-bars {
  transform: rotate(90deg);
  cursor: pointer;
}
div.colsToFilter {
  position: absolute;
  background: #c7d9db;
  border: 1px solid white;
  border-radius: 8px;
  right: 0px;
  top: 30px;
  z-index: 1;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0s linear 300ms, opacity 300ms;
  overflow: hidden;
}
div.colsToFilter h4 {
  display: block;
  color: #fff;
  margin: 0px;
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
ul.pagination {
  list-style-type: none;
  display: inline-block;
  padding: 10px 0;
  margin: 0;
}

ul.pagination li {
  display: inline;
  user-select: none;
}

ul.pagination li a {
  color: #364f54;
  float: left;
  padding: 5px 10px;
  text-decoration: none;
}

ul.pagination li a.active {
  background-color: #364f54;
  color: white;
  font-weight: bold;
}

ul.pagination li a:hover:not(.active) {
  background-color: #ddd;
  cursor: pointer;
}

ul.pagination li a {
  border-radius: 5px;
}

ul.pagination li a.active {
  border-radius: 5px;
}

ul.pagination li a {
  transition: background-color 0.5s;
}

ul.pagination li a {
  border: 1px solid #ddd;
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

/* Responsive Table CSS */
table {
  border: 1px solid white;
  border-spacing: 1;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  margin: 0 auto;
  position: relative;
}
table * {
  position: relative;
}
table td,
table th {
  padding: 0 15px;
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
  cursor: pointer;
}

tbody tr:nth-child(even) {
  background-color: #e6eeef;
}

/* rule for 1023px < width <= 1200px; */
@media only screen and (max-width: 1200px) {
  div.grid-container {
    width: 95%;
  }
}

/* rule for 767px < width <= 1023px; */
@media only screen and (max-width: 1023px) {
}

/* rule for 480px < width  <= 767px; */
@media only screen and (max-width: 767px) {
  div.gridHead {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
  }
  div.colHead {
  }
  div.colFilter {
  }
  div.controls {
    align-items: center;
    height: 50px;
  }
  table thead tr:nth-child(1) th {
    height: 60px;
  }
  div.colFilter input {
    height: 10px;
  }
  table {
    display: block;
  }
  table > *,
  table tr,
  table td,
  table th {
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
    padding-left: 40% !important;
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
  }
}

/* rule for width <= 480px; */
@media only screen and (max-width: 480px) {
}
</style>