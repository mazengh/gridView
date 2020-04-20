<template>
  <component
    :is="field"
    :content="formattedContent"
    :row="rowKey"
    :column-name="colName"
  ></component>
</template>

<script>
import TextField from "./TextField";
import EditableTextField from "./EditableTextField";

export default {
  name: "grid-cell",
  components: { TextField, EditableTextField },
  props: {
    content: {
      type: [Number, String, Date],
      default: "",
    },
    rowKey: {
      type: String,
      required: true,
    },
    colName: {
      type: String,
      required: true,
    },
  },
  computed: {
    isEditable() {
      return this.$store.getters["grid/isEditable"](this.colName);
    },
    field() {
      return this.isEditable ? "editable-text-field" : "text-field";
    },
    formatter() {
      return this.$store.getters["grid/getFormatter"](this.colName);
    },
    formattedContent() {
      if (this.formatter) {
        return this.formatter(this.content);
      }
      return this.content;
    },
  },
};
</script>

<style></style>
