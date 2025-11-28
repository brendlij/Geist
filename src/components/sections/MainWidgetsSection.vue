<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, type Ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { Component } from 'vue'
import SwapyGrid from '@/components/app/SwapyGrid.vue'
import QuickNotesWidget from '@/components/widgets/QuickNotesWidget.vue'
import Todolist from '@/components/widgets/Todolist.vue'
import ClockWidget from '@/components/widgets/Clock.vue'
import VacuumWidget from '@/components/widgets/Vacuum.vue'
import { useLayoutStore } from '@/stores/layout'

const MAX_WIDGET_SLOTS = 12

const editMode = inject<Ref<boolean>>('editMode', ref(false))

const layoutStore = useLayoutStore()

// slots are now derived from the dynamic layout store (no empty dashed slots)

type WidgetId = 'quick-notes' | 'todo' | 'clock' | 'vacuum'

type WidgetConfig = {
  id: string
  title: string
  component: Component
  configurable?: boolean
  removable?: boolean
  borderless?: boolean
}
type BaseWidgetConfig = {
  title: string
  component: Component
  configurable?: boolean
  removable?: boolean
  borderless?: boolean
}

const baseWidgetRegistry: Record<WidgetId, BaseWidgetConfig> = {
  'quick-notes': {
    title: 'Quick Notes',
    component: QuickNotesWidget,
    removable: true,
  },
  todo: {
    title: 'To-Do List',
    component: Todolist,
    removable: true,
  },
  clock: {
    title: 'Clock',
    component: ClockWidget,
    removable: true,
  },
  vacuum: {
    title: 'Vacuum',
    component: VacuumWidget,
    removable: true,
    borderless: true,
  },
}

const mainGridKey = ref(0)
const showPicker = ref(false)
const pickerAreaRef = ref<HTMLElement | null>(null)
const availableWidgets = computed(() =>
  (Object.keys(baseWidgetRegistry) as WidgetId[]).map((id) => ({
    id,
    title: baseWidgetRegistry[id].title,
  })),
)

function getWidgetTypeFromInstance(instanceId: string | null): WidgetId | null {
  if (!instanceId) return null
  const [type] = instanceId.split('::')
  return type === 'quick-notes' || type === 'todo' || type === 'clock' || type === 'vacuum'
    ? (type as WidgetId)
    : null
}

const widgetRegistry = computed<Record<string, WidgetConfig>>(() => {
  const registry: Record<string, WidgetConfig> = {}
  layoutStore.layout.forEach(({ item }) => {
    if (!item) return
    const widgetType = getWidgetTypeFromInstance(item)
    if (!widgetType) return
    const baseConfig = baseWidgetRegistry[widgetType]
    registry[item] = {
      id: item,
      title: baseConfig.title,
      component: baseConfig.component,
      configurable: baseConfig.configurable,
      removable: baseConfig.removable,
      borderless: baseConfig.borderless,
    }
  })
  return registry
})

// Allow adding widgets until we hit the slot cap
const canAddWidget = computed(() => layoutStore.layout.length < MAX_WIDGET_SLOTS)

function refreshGrid() {
  mainGridKey.value += 1
}

function closePicker() {
  showPicker.value = false
}

function togglePicker() {
  if (!canAddWidget.value) return
  showPicker.value = !showPicker.value
}

function handleAddWidget(widgetId: WidgetId) {
  if (!canAddWidget.value) return
  layoutStore.addWidget(widgetId)
  refreshGrid()
  closePicker()
}

function handleDeleteWidget(slotId: string) {
  layoutStore.removeWidget(slotId)
  refreshGrid()
}

function handleClickOutside(event: MouseEvent) {
  if (!showPicker.value) return
  if (pickerAreaRef.value?.contains(event.target as Node)) return
  closePicker()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => editMode?.value,
  (value) => {
    if (!value) closePicker()
  },
)
</script>

<template>
  <div class="main-widgets-section" :class="{ 'edit-mode': editMode }" ref="pickerAreaRef">
    <div v-if="editMode" class="main-widgets-toolbar">
      <button
        v-if="editMode"
        class="add-service-button"
        :disabled="!canAddWidget"
        @click.stop="togglePicker"
      >
        <Icon icon="mdi:plus" width="20" height="20" />
        Add Widget
      </button>
      <transition name="fade-scale">
        <div v-if="showPicker" class="widget-picker" data-swapy-no-drag>
          <p class="picker-title">Select a widget</p>
          <div v-if="availableWidgets.length" class="picker-grid">
            <button
              v-for="widget in availableWidgets"
              :key="widget.id"
              class="picker-widget-button"
              @click="handleAddWidget(widget.id)"
            >
              {{ widget.title }}
            </button>
          </div>
          <p v-else class="picker-empty">All widgets are already in the grid.</p>
        </div>
      </transition>
    </div>

    <SwapyGrid
      :key="mainGridKey"
      class="main-widgets-grid"
      :style="{
        '--grid-columns': 4,
        '--grid-row-height': '180px',
        '--slot-border-radius': '1.25rem',
        '--widget-border-radius': '1.25rem',
        '--widget-padding': '0.75rem',
      }"
      :slots="layoutStore.slots"
      :widget-registry="widgetRegistry"
      :layout="layoutStore.layout"
      @update:layout="layoutStore.setLayout"
      @delete-widget="handleDeleteWidget"
    />
  </div>
</template>

<style scoped>
.main-widgets-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 16px;
}

.main-widgets-toolbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
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

.main-widgets-section.edit-mode :deep(.widget-content) {
  pointer-events: none;
  opacity: 0.55;
}

.widget-picker {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 20;
  min-width: 260px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  padding: 1rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.picker-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.picker-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.picker-widget-button {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 0.9rem;
  padding: 0.55rem 0.9rem;
  background-color: var(--surface-soft);
  color: var(--text);
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.picker-widget-button:hover {
  border-color: var(--accent);
  background-color: var(--accent-soft);
}

.picker-empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
