<script setup lang="ts">
import type { Component } from 'vue'
import { provide, ref } from 'vue'
import { Icon } from '@iconify/vue'
import SwapyGrid from '@/components/app/SwapyGrid.vue'
import QuickNotesWidget from '@/components/widgets/QuickNotesWidget.vue'
import Todolist from '@/components/widgets/Todolist.vue'
import Clock from '@/components/widgets/Clock.vue'
import ServiceWidget from '@/components/widgets/Service.vue'
import { useLayoutStore } from '@/stores/layout'

const editMode = ref(false)
provide('editMode', editMode)

function toggleEditMode() {
  editMode.value = !editMode.value
}

type WidgetId = 'quick-notes' | 'todo' | 'clock' | 'service'
type WidgetConfig = {
  id: WidgetId
  title: string
  component?: Component
  fallback?: string
  configurable?: boolean
}

const widgetRegistry: Record<WidgetId, WidgetConfig> = {
  'quick-notes': { id: 'quick-notes', title: 'Quick Notes', component: QuickNotesWidget },
  todo: { id: 'todo', title: 'To-Do List', component: Todolist },
  clock: { id: 'clock', title: 'Clock', component: Clock },
  service: { id: 'service', title: 'Service', component: ServiceWidget, configurable: true },
}

const layoutStore = useLayoutStore()

// aktuell nur ein Grid → direkt layoutStore.layout benutzen
const slots = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }]
</script>

<template>
  <SwapyGrid
    :slots="slots"
    :widget-registry="widgetRegistry"
    :layout="layoutStore.layout"
    @update:layout="layoutStore.setLayout"
  />

  <button class="edit-mode-toggle" :class="{ active: editMode }" @click="toggleEditMode">
    <Icon v-if="editMode" icon="hugeicons:edit-off" />
    <Icon v-else icon="hugeicons:edit-02" />
  </button>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 1.5rem;
}

.slot {
  min-height: 300px;
  border: 2px dashed transparent;
  border-radius: 2em;
  transition: border-color 0.2s;
}

/* Only show dashed border for empty slots in edit mode */
.container.edit-mode .slot:not(:has(.item)) {
  border-color: var(--border);
}

.item {
  height: 100%;
}

.edit-mode-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  padding: 0;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 500;
  transition:
    transform 0.15s ease,
    background-color 0.2s;
  z-index: 100;
}

.edit-mode-toggle:hover {
  background-color: var(--accent-soft);
}

.edit-mode-toggle.active {
  background-color: var(--primary);
}

.card {
  background-color: var(--accent-soft);
}
</style>
