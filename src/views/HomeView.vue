<script setup lang="ts">
import type { Component } from 'vue'
import { inject, ref, computed, type Ref } from 'vue'
import { Icon } from '@iconify/vue'
import SwapyGrid from '@/components/app/SwapyGrid.vue'
import QuickNotesWidget from '@/components/widgets/QuickNotesWidget.vue'
import Todolist from '@/components/widgets/Todolist.vue'
import ServiceWidget from '@/components/widgets/Service.vue'
import { useLayoutStore } from '@/stores/layout'
import { useServicesLayoutStore } from '@/stores/servicesLayout'

const editMode = inject<Ref<boolean>>('editMode', ref(false))

function toggleEditMode() {
  editMode.value = !editMode.value
}

type WidgetId = 'quick-notes' | 'todo' | 'service'
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
  service: { id: 'service', title: 'Service', component: ServiceWidget, configurable: true },
}

const layoutStore = useLayoutStore()
const servicesLayoutStore = useServicesLayoutStore()

// Main widgets grid - 6 slots
const slots = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }]

// Dynamic services widget registry - generates entries based on layout
type ServiceWidgetConfig = {
  id: string
  title: string
  component: Component
  configurable: boolean
  removable: boolean
}

// Create a registry entry for any service ID
function getServiceWidgetConfig(serviceId: string): ServiceWidgetConfig {
  return {
    id: serviceId,
    title: serviceId.replace('service-', 'Service '),
    component: ServiceWidget,
    configurable: true,
    removable: true,
  }
}

// Build dynamic registry from current layout
const servicesWidgetRegistry = computed(() => {
  const registry: Record<string, ServiceWidgetConfig> = {}
  servicesLayoutStore.layout.forEach((item) => {
    if (item.item) {
      registry[item.item] = getServiceWidgetConfig(item.item)
    }
  })
  // Also add some extra IDs for newly added services
  for (let i = 1; i <= 24; i++) {
    const id = `service-${i}`
    if (!registry[id]) {
      registry[id] = getServiceWidgetConfig(id)
    }
  }
  return registry
})

// Handle service deletion
function handleDeleteService(slotId: string) {
  servicesLayoutStore.removeService(slotId)
  servicesGridKey.value++
}

// Handle adding a new service
function handleAddService() {
  servicesLayoutStore.addService()
  servicesGridKey.value++
}

// Key to force re-render of services grid when adding/removing
const servicesGridKey = ref(0)
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
    <div class="services-header">
      <h2 class="section-title">Services</h2>
      <button v-if="editMode" class="add-service-button" @click="handleAddService">
        <Icon icon="mdi:plus" width="20" height="20" />
        Add Service
      </button>
    </div>
    <SwapyGrid
      :key="servicesGridKey"
      :slots="servicesLayoutStore.slots"
      :widget-registry="servicesWidgetRegistry"
      :layout="servicesLayoutStore.layout"
      class="services-grid"
      @update:layout="servicesLayoutStore.setLayout"
      @delete-widget="handleDeleteService"
    />
  </div>

  <button class="edit-mode-toggle" :class="{ active: editMode }" @click="toggleEditMode">
    <Icon v-if="editMode" icon="hugeicons:edit-off" />
    <Icon v-else icon="hugeicons:edit-02" />
  </button>
</template>

<style scoped>
.services-section {
  margin-top: 1rem;
}

.services-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  margin: 0;
  color: var(--text);
  opacity: 0.9;
  background-color: var(--accent-soft);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
}

.add-service-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: var(--text);
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.add-service-button:hover {
  background-color: var(--accent);
  transform: scale(1.05);
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
