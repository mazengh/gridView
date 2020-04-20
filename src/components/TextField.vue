<template functional>
  <td :data-column-name="props.columnName">
    <span>
      {{ props.content }}
    </span>
  </td>
</template>

<script>
export default {
  name: "text-field",
};
</script>

<style></style>
