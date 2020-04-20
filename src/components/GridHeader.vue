<template>
  <div class="grid-header">
    <div class="grid-header__title">
      <font-awesome-icon :icon="['fa', 'table']"></font-awesome-icon>
      <span :title="tableName + ' Table'">{{ tableName }}</span>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "grid-header",
  props: {
    tableName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.grid-header {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background: #364f54;
  color: #fff;
  padding: 0.75rem;

  &__title {
    display: flex;
    flex-grow: 1;
    font-size: 1.25rem;
    align-items: center;

    svg.fa-table {
      font-size: 1.25rem;
      margin-right: 0.25rem;
    }
    & span {
      text-transform: capitalize;
    }
  }

  /* Filter Rows CSS */
  .rowFilterBtn {
    visibility: hidden;
    margin-right: 15px;
  }
}

@media only screen and (max-width: 767px) {
  .grid-header {
    &__title {
    }

    div:first-of-type:not(&_title) {
      margin-left: auto;
    }
  }
}
</style>
