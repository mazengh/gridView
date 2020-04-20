<template>
  <div class="selection-input">
    <label :for="id" :class="!showLabel && 'sr-only'">{{ label }}</label>
    <input :id="id" type="checkbox" :checked="checked" @input="onInput" />
  </div>
</template>

<script>
export default {
  name: "selection-input",
  props: {
    id: {
      type: String,
      required: true,
    },
    value: {
      type: [Boolean, String],
      default: "",
    },
    checked: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    showLabel: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    onInput() {
      // console.log(event, event, event.target.value, checked);
      this.$emit("toggle", { checked: !this.checked, value: this.value });
    },
  },
};
</script>

<style lang="scss" scoped>
.selection-input {
  display: flex;
  flex-direction: column;
  align-items: center;

  label {
    cursor: pointer;
  }
}
</style>
