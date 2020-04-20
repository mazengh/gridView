<template>
  <button class="filter-rows" title="Sort &amp; Filter Rows">
    <font-awesome-icon :icon="['fa', 'bars']" @click="toggleRowFilter"></font-awesome-icon>
  </button>
</template>

<script>
export default {
  name: "filter-rows",
  methods: {
    toggleRowFilter() {
      this.$emit("toggle");
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-rows {
  visibility: hidden;
}

@media only screen and (max-width: 767px) {
  .filter-rows {
    background: transparent;
    border: none;
    color: #fff;
    visibility: visible;
    cursor: pointer;
    svg.fa-bars {
      font-size: 1.25rem;
      margin-right: 0.25rem;
    }
  }
}
</style>
