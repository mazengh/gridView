<template>
  <div class="pagination">
    <ul class="pagination__list">
      <li>
        <button @click="goToPreviousPage">&laquo;</button>
      </li>
      <li v-for="page in pageCount" :key="page">
        <button @click="goToPage(page)" :class="{ active: page === currentPage }">
          {{ page }}
        </button>
      </li>
      <li>
        <button @click="goToNextPage">&raquo;</button>
      </li>
    </ul>

    <div class="pagination__summary">
      Showing
      <b>{{ firstRow }}-{{ lastRow }}</b>
      <span v-show="totalRows > lastRow">
        of
        <b>{{ totalRows }}</b>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: "pagination",
  data() {
    return {
      pageNum: 1,
    };
  },
  computed: {
    currentPage() {
      return this.$store.getters["grid/getCurrentPage"];
    },
    pageSize() {
      return this.$store.getters["grid/getPageSize"];
    },
    totalRows() {
      return this.$store.getters["grid/getFilteredRowCount"];
    },
    pageCount() {
      return Math.ceil(this.totalRows / this.pageSize);
    },
    pageOffset() {
      return (this.currentPage - 1) * this.pageSize;
    },
    firstRow() {
      return this.pageOffset + 1;
    },
    lastRow() {
      if (this.totalRows < this.currentPage * this.pageSize) {
        return this.totalRows;
      }
      return this.currentPage * this.pageSize;
    },
  },
  methods: {
    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      }
    },
    goToNextPage() {
      if (this.currentPage < this.pageCount) {
        this.goToPage(this.currentPage + 1);
      }
    },
    goToPage(pageNumber) {
      this.$store.dispatch("grid/setPage", pageNumber);
    },
  },
};
</script>

<style lang="scss" scoped>
.pagination {
  background-color: #fff;
  padding: 0.75rem;
  &__list {
    position: relative;
    list-style-type: none;
    display: inline-block;
    padding: 10px 0 0 0;
    margin: 0;

    & li {
      position: relative;
      display: inline;
      user-select: none;
    }

    & li button {
      position: relative;
      color: #364f54;
      float: left;
      padding: 5px 10px;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.5s;
      border: 1px solid #ddd;
      margin: 0 2px;
      background-color: #fff;
      cursor: pointer;
    }

    & li button:focus {
      outline: 0;
    }

    & li button.active {
      background-color: #364f54;
      color: white;
      font-weight: bold;
      border-radius: 5px;
    }

    & li button:hover:not(.active) {
      background-color: #ddd;
      cursor: pointer;
    }

    & li:first-child button {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    & li:last-child button {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }

  &__summary {
    font-weight: normal;
    font-size: 0.9em;
    user-select: none;
    cursor: default;
    padding: 5px;
  }
}

@media only screen and (max-width: 767px) {
  .pagination {
    &__list {
      padding: 5px 0 0 0;

      li button {
        padding: 4px 5px;
        font-weight: bold;
        font-size: 0.9em;
      }
    }
  }
}
</style>
