<template>
  <div id="app">
    <grid :config="gridConfig"></grid>
  </div>
</template>

<script>
import Grid from "./components/Grid.vue";
import gridConfig from "./conf/gridConfig";

export default {
  computed: {
    gridConfig() {
      return gridConfig;
    },
  },
  components: {
    Grid,
  },
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

/* tailwind's screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
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
</style>
