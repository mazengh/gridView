<template>
  <div class="export-csv" title="Export Selections to CSV File">
    <a
      class="export-csv__link"
      :class="{ 'export-csv__link--disabled': disabled }"
      :title="title"
      :href="exportLink"
      :aria-disabled="disabled"
      aria-label="export"
      download="export.csv"
    >
      <font-awesome-icon :icon="['fa', 'file-export']"></font-awesome-icon>
      <span class="export-csv__label">Export</span>
    </a>
  </div>
</template>

<script>
export default {
  name: "export-csv",
  computed: {
    selections() {
      const headers = this.$store.getters["grid/getHeaders"];
      const selectedRowData = this.$store.getters["grid/getSelectedRowsData"];
      const selected = [headers, ...selectedRowData];
      return selected && selected.length >= 2 ? selected : [];
    },
    disabled() {
      return this.exportLink === "javascript:void(0)";
    },
    title() {
      return this.disabled ? "No selection(s) made" : "Export selections to CSV file";
    },
    exportLink() {
      // reset export link if there are no selections
      if (!this.selections.length) {
        return "javascript:void(0)";
      }

      // convert data to csv string with comma as a delimiter
      let csvContent = this.selections
        .map((e) => {
          // create csv string for row while escaping text
          let escaped = e.reduce(function(prevVal, currVal, index) {
            return index == 0
              ? currVal
              : prevVal + "," + (isNaN(currVal) ? '"' + currVal + '"' : currVal);
          }, "");
          return escaped;
        })
        .join("\r\n");

      return "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    },
  },
};
</script>

<style lang="scss" scoped>
.export-csv {
  margin-right: 0.5rem;

  &__link {
    font-weight: normal;
    text-decoration: none;
    color: #fff;
    background-color: inherit;
    border: none;
    cursor: pointer;

    svg.fa-file-export {
      font-size: 1.25rem;
    }

    &--disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }
  }
}
@media only screen and (max-width: 767px) {
  .export-csv {
    &__label {
      display: none;
    }
  }
}
</style>
