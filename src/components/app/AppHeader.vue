<script setup lang="ts">
import GeistLogo from './GeistLogo.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import SwapyGrid from './SwapyGrid.vue'
import HeaderClock from '@/components/headerWidgets/HeaderClock.vue'
import HeaderWeather from '@/components/headerWidgets/HeaderWeather.vue'
import { useHeaderLayoutStore } from '@/stores/headerLayout'

const headerLayoutStore = useHeaderLayoutStore()

// Header widget slots - 8 small slots
const headerSlots = [
  { id: 'h1' },
  { id: 'h2' },
  { id: 'h3' },
  { id: 'h4' },
  { id: 'h5' },
  { id: 'h6' },
  { id: 'h7' },
  { id: 'h8' },
]

// Header widget registry
const headerWidgetRegistry = {
  'header-clock': {
    id: 'header-clock',
    title: 'Clock',
    component: HeaderClock,
    configurable: true,
    removable: false,
  },
  'header-weather': {
    id: 'header-weather',
    title: 'Weather',
    component: HeaderWeather,
    configurable: true,
    removable: false,
  },
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <GeistLogo :size="48" color="var(--accent)" />
      <h1 class="app-title">Geist</h1>
    </div>

    <div class="header-center">
      <SwapyGrid
        :slots="headerSlots"
        :widget-registry="headerWidgetRegistry"
        :layout="headerLayoutStore.layout"
        :compact="true"
        class="header-grid"
        @update:layout="headerLayoutStore.setLayout"
      />
    </div>

    <ThemeSwitcher />
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-xl);
  border-bottom: 1px solid var(--border);
  background-color: var(--surface);
  box-shadow: var(--shadow-sm);
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.app-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text);
  margin: 0;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0; /* Allows flex item to shrink below content size */
}

.header-grid {
  --grid-columns: 8;
  --grid-row-height: 44px;
  --slot-border-radius: 0.75rem;
  --widget-border-radius: 0.75rem;
  --widget-padding: 0.25rem;
  --widget-border: none;
  width: 100%;
}

.header-grid :deep(.swapy-grid) {
  gap: 0.5rem;
  padding: 0;
  overflow: visible;
}

.header-grid :deep(.slot) {
  height: 44px;
  overflow: visible;
}

.header-grid :deep(.item) {
  overflow: visible;
}

/* Ensure dragging item appears above everything */
.header-grid :deep([data-swapy-dragging]) {
  z-index: 1000 !important;
}

.header-grid :deep(.widget-wrapper) {
  border: none;
  background: transparent;
  overflow: visible;
}

.header-grid :deep(.swapy-grid.edit-mode .slot) {
  border: 2px dashed var(--border);
}

@media (max-width: 768px) {
  .header-center {
    display: none;
  }
}

@media (max-width: 640px) {
  .app-header {
    padding: var(--space-md) var(--space-lg);
  }
}
</style>
