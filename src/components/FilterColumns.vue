<template>
  <div class="filter-columns">
    <button
      class="filter-columns__button"
      title="Filter Columns"
      @click.stop="showColFilter = !showColFilter"
    >
      <font-awesome-icon :icon="['fa', 'bars']"></font-awesome-icon>
      <span class="filter-columns__label">Filter</span>
    </button>
    <div
      class="filter-columns__list"
      :class="{ 'filter-columns__filter': showColFilter }"
      @mouseleave="showColFilter = false"
    >
      <h1>Columns</h1>
      <ul>
        <li
          v-for="(column, index) in colsToShow"
          :class="{ 'filter-columns__hidden-column': !column.visible }"
          @click.prevent.stop="toggle(column.name)"
          :key="index"
        >
          {{ column.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "filter-columns-button",
  data() {
    return {
      showColFilter: false,
    };
  },
  computed: {
    colsToShow() {
      return this.$store.getters["grid/getColsToShow"];
    },
  },
  mounted() {
    window.addEventListener("click", this.hideFilter);
  },
  beforeDestroy() {
    window.removeEventListener("click", this.hideFilter);
  },
  methods: {
    toggle(columnName) {
      this.$store.dispatch("grid/toggleColumn", columnName);
    },
    hideFilter() {
      this.showColFilter = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-columns {
  position: relative;
  align-items: flex-end;

  &__button {
    background: transparent;
    border: transparent;
    color: #fff;
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 1rem;
    margin-right: 1.75rem;
    svg.fa-bars {
      transform: rotate(90deg);
      font-size: 1.25rem;
      margin-right: 0.25rem;
    }
  }

  &__list {
    position: absolute;
    background: #c7d9db;
    border: 1px solid white;
    border-radius: 0.5rem;
    right: 0;
    top: 2rem;
    z-index: 2;
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 300ms, opacity 300ms;
    overflow: hidden;
  }
  &__list h1 {
    display: block;
    font-size: 1rem;
    letter-spacing: 0.1em;
    color: #fff;
    margin: 0;
    padding: 0.5rem;
    white-space: nowrap;
    background: #1a7d85;
  }
  &__list ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
  }
  &__list ul li {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #1a7d85;
    font-size: 0.9em;
    &:hover {
      color: #fff;
      background: #2ac5d0;
      transition: color 0.8s ease, background-color 0.3s ease;
    }
    &:last-child {
      border: none;
    }
  }

  &__hidden-column {
    text-decoration: line-through;
    color: darkred;
  }

  &__filter {
    color: #364f54;
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 300ms;
  }
}

@media only screen and (max-width: 767px) {
  .filter-columns {
    &__button {
      margin-right: 0.5rem;
    }
    &__label {
      display: none;
    }
  }
}
</style>
