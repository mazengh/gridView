<template>
  <div class="column-header">
    <div class="column-header__field">
      <div class="column-header__icon" @click.prevent.stop="sort">
        <label :for="`header_${name}_id`">{{ name }}</label>
        <i>
          <font-awesome-icon :icon="columnIcon" :spin="spinning"></font-awesome-icon>
        </i>
        <i v-if="isEditable" title="Editable column data">
          <font-awesome-icon :icon="['fa', 'edit']"></font-awesome-icon>
        </i>
      </div>
    </div>

    <div class="column-header__filter">
      <input
        :id="`header_${name}_id`"
        type="text"
        title="Enter text or use logical operators =, >, >=, <, <=, !=, <>"
        :placeholder="inputPlaceholder"
        @mouseenter="inputPlaceholder = `Filter ${name}`"
        @mouseleave="inputPlaceholder = ''"
        v-model="columnFilterExpression"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "column-header",
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      inputPlaceholder: "",
      sortDirection: "",
    };
  },
  watch: {
    sortedColumnName(columnName) {
      if (this.name !== columnName) {
        this.sortDirection = "";
      }
    },
  },
  computed: {
    isSorting() {
      return this.$store.getters["grid/isSorting"];
    },
    sortedColumnName() {
      return this.$store.getters["grid/getSortCol"];
    },
    sortStatus() {
      return {
        SORTING: ["fa", "spinner"],
        ASC: ["fa", "sort-up"],
        DESC: ["fa", "sort-down"],
        DEFAULT: ["fa", "sort"],
      };
    },
    columnIcon() {
      const sortCriteria =
        this.isSorting && this.sortDirection ? "SORTING" : this.sortDirection || "DEFAULT";
      return this.sortStatus[sortCriteria];
    },
    spinning() {
      return this.isSorting && !!this.sortDirection;
    },
    columnFilterExpression: {
      get() {
        return this.$store.getters["grid/getColumnFilterExpression"](this.name);
      },
      set(expr) {
        this.$store.dispatch("grid/setFilterExpr", { columnName: this.name, expr });
      },
    },
    isEditable() {
      return this.$store.getters["grid/isEditable"](this.name);
    },
  },
  methods: {
    sort() {
      this.sortDirection = ["", "DESC"].includes(this.sortDirection) ? "ASC" : "DESC";
      this.$store.dispatch("firebase/sortBy", {
        columnName: this.name,
        direction: this.sortDirection,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.column-header {
  &__field {
    display: flex;
  }
  &__icon label {
    cursor: pointer;
  }
  &__icon {
    display: flex;
    align-items: center;
    cursor: pointer;

    & i {
      margin-left: 1rem;
    }
    & i + i {
      cursor: default;
      margin-left: 2rem;
    }
  }
  &__filter {
    width: 100%;
  }
}

/* rule for 767px < width <= 1023px; */
@media only screen and (max-width: 1023px) {
  .column-header {
    &__filter input[type="text"] {
      width: 115px;
    }
    i,
    i + i {
      margin-left: 0.5rem;
    }
  }
}
</style>
