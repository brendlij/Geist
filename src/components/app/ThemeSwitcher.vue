<template>
  <div class="theme-switcher">
    <span class="theme-label">Theme</span>

    <select v-model="themeId" class="theme-select">
      <option v-for="t in themeList" :key="t.id" :value="t.id">
        {{ t.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { themeList } from '@/theme/themes'
import { useTheme } from '@/theme/useTheme'

const { themeId } = useTheme()
</script>

<style scoped>
.theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.theme-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.75rem;
}

.theme-select {
  background-color: var(--surface-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--text);
  cursor: pointer;
  transition: all var(--transition-base);
}

.theme-select:hover {
  border-color: var(--accent);
  background-color: var(--surface);
}

.theme-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.theme-select option {
  background-color: var(--surface);
  color: var(--text);
}
</style>
