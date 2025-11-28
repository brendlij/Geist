<script setup lang="ts">
import type { Component } from 'vue'
import { computed, inject, ref, type Ref } from 'vue'
import { Icon } from '@iconify/vue'
import SwapyGrid from '@/components/app/SwapyGrid.vue'
import ServiceWidget from '@/components/widgets/Service.vue'
import { useServicesLayoutStore } from '@/stores/servicesLayout'

const editMode = inject<Ref<boolean>>('editMode', ref(false))

const servicesLayoutStore = useServicesLayoutStore()

const servicesGridKey = ref(0)

type ServiceWidgetConfig = {
  id: string
  title: string
  component: Component
  configurable: boolean
  removable: boolean
}

function getServiceWidgetConfig(serviceId: string): ServiceWidgetConfig {
  return {
    id: serviceId,
    title: serviceId.replace('service-', 'Service '),
    component: ServiceWidget,
    configurable: true,
    removable: true,
  }
}

const servicesWidgetRegistry = computed(() => {
  const registry: Record<string, ServiceWidgetConfig> = {}

  servicesLayoutStore.layout.forEach((item) => {
    if (item.item) {
      registry[item.item] = getServiceWidgetConfig(item.item)
    }
  })

  for (let i = 1; i <= 24; i++) {
    const id = `service-${i}`
    if (!registry[id]) {
      registry[id] = getServiceWidgetConfig(id)
    }
  }

  return registry
})

function handleDeleteService(slotId: string) {
  servicesLayoutStore.removeService(slotId)
  servicesLayoutStore.cleanupEmptySlots()
  servicesGridKey.value += 1
}

function handleAddService() {
  servicesLayoutStore.addService()
  servicesGridKey.value += 1
}
</script>

<template>
  <div class="services-section">
    <div class="services-header">
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
</style>
