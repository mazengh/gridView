<template>
  <div class="grid-container">
    <grid-header :table-name="getTableName">
      <filter-rows @toggle="toggleRowFilter" />
      <filter-columns />
      <export-CSV />
    </grid-header>
    <table>
      <thead>
        <tr class="headers" :class="{ headerFiltersShow: mobileHeadersActive }">
          <th v-for="head in getHeaders" :key="head">
            <column-header :name="head" />
          </th>
          <th class="actions">
            <selection-input
              v-if="getHeaders.length"
              id="selectAllCheckbox"
              label="Selections"
              :checked="allRowsChecked"
              @toggle="toggleAllRows"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <grid-row
          v-for="row in getRows"
          :row="row"
          :column-names="getHeaders"
          :key="`row-${row['.key']}`"
        />
      </tbody>
    </table>
    <pagination />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import GridHeader from "./GridHeader";
import FilterRows from "./FilterRows";
import FilterColumns from "./FilterColumns";
import ColumnHeader from "./ColumnHeader";
import ExportCSV from "./ExportCSV";
import Pagination from "./Pagination";
import SelectionInput from "./SelectionInput";
import GridRow from "./GridRow";

export default {
  components: {
    GridHeader,
    FilterRows,
    FilterColumns,
    ColumnHeader,
    ExportCSV,
    Pagination,
    SelectionInput,
    GridRow,
  },
  props: { config: Object },
  data() {
    return {
      mobileHeadersActive: false,
      exportLink: "javascript:void(0)",
    };
  },
  filters: {
    gridFilter: (data, col) => {
      if (col && col.format) {
        return col.format(data);
      } else {
        return data;
      }
    },
  },
  computed: {
    ...mapGetters("grid", ["getTableName", "getRows", "getHeaders"]),
    allRowsChecked() {
      return this.$store.getters["grid/allChecked"];
    },
  },
  methods: {
    toggleRowFilter() {
      this.mobileHeadersActive = !this.mobileHeadersActive;
    },
    toggleAllRows({ checked }) {
      this.$store.dispatch("grid/toggleAllRows", checked);
    },
  },
  created() {
    this.$store.dispatch("firebase/setTableRef", this.config);
  },
};
</script>

<style>
div.grid-container {
  border-radius: 8px;
  margin: 0 auto;
  padding: 0;
  overflow: hidden;
}

td {
  height: inherit;
}

table {
  border-spacing: 1px;
  border-collapse: collapse;
  background: #364f54;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  overflow: hidden;
  width: 100%;
  margin: 0;
  padding: 0;
}
table thead,
table tbody,
table tr,
table td,
table th,
table div,
table li {
  position: relative;
}
table tbody {
  display: block;
  height: calc(98vh - 12.5em); /* 98 of viewport height minus header and footer heights */
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
}
table td,
table th {
  padding: 0.4rem 1rem;
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
/* rule for 1023px < width <= 1200px; */
@media only screen and (max-width: 1200px) {
  div.grid-container {
    width: 95%;
  }
}

/* rule for 480px < width  <= 767px; */
@media only screen and (max-width: 767px) {
  table {
    min-width: 19rem;
  }
  tr.headers {
    position: absolute;
    display: flex;
    flex-wrap: wrap;
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
  table thead tr:last-child th:last-child,
  table tbody tr td:last-child {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    & div {
      flex-direction: row;
    }
  }
  tr.headerFiltersShow {
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 300ms;
    z-index: 1;
  }
  table tbody {
    /* 98 of viewport height minus header and footer heights */
    height: calc(100vh - 136px);
  }
  table thead tr:nth-child(1) th {
    height: 3.75rem;
  }
  table {
    display: block;
  }
  table thead,
  table tbody,
  table tr,
  table td,
  table th,
  table div,
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
    font-size: 0.875rem;
    color: #777777;
    line-height: 1.2;
    position: absolute;
    left: 0.5rem;
    content: attr(data-column-name);
    text-transform: capitalize;
    user-select: none;
  }
}
</style>
