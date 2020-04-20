<template>
  <td
    class="editable-textfield"
    :class="{ 'editable-textfield--edited': modified }"
    :data-column-name="columnName"
    @input="onInput"
  >
    <div
      ref="content"
      class="editable-textfield__content"
      contenteditable="true"
      spellcheck="false"
      v-text="content"
    ></div>
    <div
      class="editable-textfield__actions"
      :class="{ 'editable-textfield__actions--visible': modified }"
    >
      <button @click.stop.prevent="save">
        <font-awesome-icon :icon="['fa', 'save']"></font-awesome-icon>
        <span>Save</span>
      </button>
      <button @click.stop.prevent="reset">
        <font-awesome-icon :icon="['fa', 'history']"></font-awesome-icon>
        <span>Cancel</span>
      </button>
    </div>
  </td>
</template>

<script>
export default {
  name: "editable-textfield",
  props: {
    content: {
      type: String,
      default: "",
    },
    columnName: {
      type: String,
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      cellContent: this.content,
    };
  },
  computed: {
    modified() {
      return this.cellContent !== this.content;
    },
  },
  methods: {
    onInput(e) {
      this.cellContent = e.target.innerText;
    },
    reset() {
      this.cellContent = this.content;
      this.$refs.content.innerText = this.content;
    },
    save() {
      const payload = {
        columnName: this.columnName,
        row: this.row,
        cellContent: this.cellContent,
      };
      this.$store.dispatch("firebase/editField", payload);
    },
  },
};
</script>

<style lang="scss" scoped>
.editable-textfield {
  position: relative;
  transition: background-color 1.3s;
  &--edited {
    background-color: #fff0f5;
  }

  &__content {
    position: relative;
  }

  &__actions {
    position: absolute;
    background: #364f54;
    color: #fff;
    margin-top: 0.25rem;
    padding: 0.25rem;
    display: none;
  }

  &__actions--visible {
    display: block;
    z-index: 10;
  }
}
</style>
