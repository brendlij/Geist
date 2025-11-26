<script setup lang="ts">
import GeistLogo from './GeistLogo.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <GeistLogo :size="48" color="var(--accent)" />
      <h1 class="app-title">Geist</h1>
    </div>

    <ThemeSwitcher />
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--border);
  background-color: var(--surface);
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.app-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text);
  margin: 0;
}

@media (max-width: 640px) {
  .app-header {
    padding: var(--space-md) var(--space-lg);
  }
}
</style>
