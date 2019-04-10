<template>
  <div id="app">
    <mg-grid :config="gridConfig"></mg-grid>
  </div>
</template>

<script>
import Grid from "./components/Grid.vue";

export default {
  data: function() {
    return {
      gridConfig: {
        tableName: "payments",
        colsToShow: [
          { name: "description", visible: true, expr: "", editable: true },
          { name: "name", visible: true, expr: "", editable: false },
          { name: "id", visible: true, expr: "", editable: false },
          { name: "date", visible: true, expr: "", editable: false },
          { name: "amount", visible: true, expr: "", editable: false }
        ],
        colOrder: ["id", "name", "description", "date", "amount"],
        pageSize: 10
      }
    };
  },
  components: {
    mgGrid: Grid
  }
};
</script>

<style>
html,
body {
  background-color: #219da6;
  color: #111;
  font-family: "Lato", "Arial", sans-serif;
  font-weight: 300;
  font-size: 16px;
  text-rendering: optimizeLegibility;
}

/* rule for 1023px < width <= 1200px; */
@media only screen and (max-width: 1200px) {
}

/* rule for 767px < width <= 1023px; */
@media only screen and (max-width: 1023px) {
  body {
    font-size: 15px;
  }
}

/* rule for 480px < width  <= 767px; */
@media only screen and (max-width: 767px) {
  body {
    font-size: 14px;
  }
}

/* rule for width <= 480px; */
@media only screen and (max-width: 480px) {
}
</style>
