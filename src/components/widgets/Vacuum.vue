<script setup lang="ts">
defineOptions({
  name: 'VacuumWidget',
})
</script>

<template>
  <div class="vacuum-widget" aria-hidden="true"></div>
</template>

<style scoped>
.vacuum-widget {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: transparent;
}
</style>
