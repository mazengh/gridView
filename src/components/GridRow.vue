<template>
  <tr>
    <grid-cell
      v-for="colName in columnNames"
      :row-key="row['.key']"
      :content="row[colName]"
      :col-name="colName"
      :key="colName"
    />
    <td data-column-name="Select">
      <selection-input
        :id="'id_' + row['.key']"
        label="Select row"
        :show-label="false"
        :value="row['.key']"
        :checked="isChecked"
        @toggle="onToggle"
      />
    </td>
  </tr>
</template>

<script>
import GridCell from "./GridCell";
import SelectionInput from "./SelectionInput";

export default {
  name: "grid-row",
  components: { GridCell, SelectionInput },
  props: {
    row: {
      type: Object,
      default: {},
    },
    columnNames: {
      type: Array,
      required: true,
    },
  },
  computed: {
    isChecked() {
      return this.$store.getters["grid/isChecked"](this.row[".key"]);
    },
  },
  methods: {
    onToggle({ checked, value }) {
      this.$store.dispatch("grid/toggleRow", { checked, value });
    },
  },
};
</script>

<style></style>
