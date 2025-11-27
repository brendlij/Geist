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
import { useServicesLayoutStore } from '@/stores/servicesLayout'

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

// Services widget registry - all services use the same ServiceWidget component
type ServiceWidgetId =
  | 'service-1'
  | 'service-2'
  | 'service-3'
  | 'service-4'
  | 'service-5'
  | 'service-6'
  | 'service-7'
  | 'service-8'
  | 'service-9'
  | 'service-10'
  | 'service-11'
  | 'service-12'
type ServiceWidgetConfig = {
  id: ServiceWidgetId
  title: string
  component: Component
  configurable: boolean
}

const servicesWidgetRegistry: Record<ServiceWidgetId, ServiceWidgetConfig> = {
  'service-1': {
    id: 'service-1',
    title: 'Service 1',
    component: ServiceWidget,
    configurable: true,
  },
  'service-2': {
    id: 'service-2',
    title: 'Service 2',
    component: ServiceWidget,
    configurable: true,
  },
  'service-3': {
    id: 'service-3',
    title: 'Service 3',
    component: ServiceWidget,
    configurable: true,
  },
  'service-4': {
    id: 'service-4',
    title: 'Service 4',
    component: ServiceWidget,
    configurable: true,
  },
  'service-5': {
    id: 'service-5',
    title: 'Service 5',
    component: ServiceWidget,
    configurable: true,
  },
  'service-6': {
    id: 'service-6',
    title: 'Service 6',
    component: ServiceWidget,
    configurable: true,
  },
  'service-7': {
    id: 'service-7',
    title: 'Service 7',
    component: ServiceWidget,
    configurable: true,
  },
  'service-8': {
    id: 'service-8',
    title: 'Service 8',
    component: ServiceWidget,
    configurable: true,
  },
  'service-9': {
    id: 'service-9',
    title: 'Service 9',
    component: ServiceWidget,
    configurable: true,
  },
  'service-10': {
    id: 'service-10',
    title: 'Service 10',
    component: ServiceWidget,
    configurable: true,
  },
  'service-11': {
    id: 'service-11',
    title: 'Service 11',
    component: ServiceWidget,
    configurable: true,
  },
  'service-12': {
    id: 'service-12',
    title: 'Service 12',
    component: ServiceWidget,
    configurable: true,
  },
}

const layoutStore = useLayoutStore()
const servicesLayoutStore = useServicesLayoutStore()

// Main widgets grid - 6 slots
const slots = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }]

// Services grid - 12 smaller slots
const servicesSlots = [
  { id: 's1' },
  { id: 's2' },
  { id: 's3' },
  { id: 's4' },
  { id: 's5' },
  { id: 's6' },
  { id: 's7' },
  { id: 's8' },
  { id: 's9' },
  { id: 's10' },
  { id: 's11' },
  { id: 's12' },
]
</script>

<template>
  <!-- Main Widgets Grid -->
  <SwapyGrid
    :slots="slots"
    :widget-registry="widgetRegistry"
    :layout="layoutStore.layout"
    @update:layout="layoutStore.setLayout"
  />

  <!-- Services Grid -->
  <div class="services-section">
    <h2 class="section-title">Services</h2>
    <SwapyGrid
      :slots="servicesSlots"
      :widget-registry="servicesWidgetRegistry"
      :layout="servicesLayoutStore.layout"
      class="services-grid"
      @update:layout="servicesLayoutStore.setLayout"
    />
  </div>

  <button class="edit-mode-toggle" :class="{ active: editMode }" @click="toggleEditMode">
    <Icon v-if="editMode" icon="hugeicons:edit-off" />
    <Icon v-else icon="hugeicons:edit-02" />
  </button>
</template>

<style scoped>
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin-top: 2rem;
  padding: 1em;
  color: var(--text);
  background-color: var(--accent-soft);
  border: 1px solid var(--border);
  border-radius: 2em;
  margin-left: 16px;
}

.services-grid {
  --grid-columns: 8;
  --grid-row-height: 120px;
  --slot-border-radius: 1.25rem;
  --widget-border-radius: 1.25rem;
  --widget-padding: 0.75rem;
}

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
  background-color: var(--primary);
}

.edit-mode-toggle:hover {
  background-color: var(--accent-soft);
}

.card {
  background-color: var(--accent-soft);
}
</style>
