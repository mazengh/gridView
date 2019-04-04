<template>
  <div class="grid-container">
    <table>
      <thead>
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
    ...mapGetters(["getRows", "getHeaders"]),
    orderCols() {
      const orderAry = ["id", "name", "description", "date", "amount"];
      return orderAry;
    }
  },
  methods: {
    showCol(head) {
      if (this.config.colsToShow.length > 0) {
        return this.config.colsToShow.includes(head);
      } else {
        return true;
      }
    }
  },
  beforeCreate() {},
  created() {
    this.$store.commit("setConfig", this.config);
    const dbTableRef = db.ref(this.config.tableName);
    this.$store.dispatch("setTableRef", dbTableRef);
  }
};
</script>


<style>
div.grid-container {
  width: 1200px;
  margin: auto;
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