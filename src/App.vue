<script setup lang="ts">
import { provide, ref } from 'vue'
import AppHeader from './components/app/AppHeader.vue'

const editMode = ref(false)
provide('editMode', editMode)
</script>

<template>
  <div class="app-container">
    <AppHeader />

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--bg);
  color: var(--text);
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
}

@media (max-width: 640px) {
  .app-main {
    padding: var(--space-md);
  }
}
</style>
