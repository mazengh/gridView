<template>
  <div class="grid-container">
    <table>
      <thead>
        <tr>
          <th :colspan="getColCount">
            <div class="controls">
              <div>
                <font-awesome-icon :icon="['fa', 'table']"></font-awesome-icon>
              </div>
              <div>
                <h3>Payments</h3>
              </div>
              <div class="colFilter">
                <font-awesome-icon :icon="['fa', 'bars']" @click="toggleColFilter1"></font-awesome-icon>
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
            </div>
          </th>
        </tr>
        <tr>
          <th v-for="head in getHeaders">{{head}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in getRows" :key="row['.key']">
          <td v-bind:data-column-name="head" v-for="head in getHeaders">{{row[head]}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import { mapGetters, mapMutations } from "vuex";
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
      "getShowColFilter"
    ])
  },
  methods: {
    ...mapMutations(["toggleCol", "toggleColFilter", "hideColFilter"]),
    showCol(head) {
      if (this.config.colsToShow.length > 0) {
        return this.config.colsToShow.includes(head);
      } else {
        return true;
      }
    },
    toggleColFilter1(event) {
      event.preventDefault();
      this.toggleColFilter();
    },
    closeColFilter(event) {
      event.stopPropagation();
      this.hideColFilter();
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
}
.controls div h3 {
  margin: -2px 0 0 5px;
  padding: 0px;
}
.colFilter {
  margin-left: auto;
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
  padding-left: 8px;
}
table thead tr {
  height: 60px;
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
  table {
    display: block;
  }
  table > *,
  table tr,
  table td,
  table th {
    display: block;
  }
  table thead {
    display: none;
  }
  table tbody tr {
    height: auto;
    padding: 37px 0;
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