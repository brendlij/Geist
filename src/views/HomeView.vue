<script setup lang="ts">
import type { Component } from 'vue'
import { onMounted, onUnmounted, provide, ref } from 'vue'
import { createSwapy, type Swapy } from 'swapy'
import QuickNotesWidget from '@/components/widgets/QuickNotesWidget.vue'
import Todolist from '@/components/widgets/Todolist.vue'
import Clock from '@/components/widgets/Clock.vue'
import WidgetWrapper from '@/components/app/WidgetWrapper.vue'
import { useLayoutStore } from '@/stores/layout'

// Edit mode state
const editMode = ref(false)
provide('editMode', editMode)

function toggleEditMode() {
  editMode.value = !editMode.value
  if (swapy.value) {
    swapy.value.enable(editMode.value)
  }
}

type WidgetId = 'quick-notes' | 'todo' | 'clock'
type WidgetConfig = {
  id: WidgetId
  title: string
  component?: Component
  fallback?: string
}

const widgetRegistry: Record<WidgetId, WidgetConfig> = {
  'quick-notes': {
    id: 'quick-notes',
    title: 'Quick Notes',
    component: QuickNotesWidget,
  },
  todo: {
    id: 'todo',
    title: 'To-Do List',
    component: Todolist,
  },
  clock: {
    id: 'clock',
    title: 'Clock',
    component: Clock,
  },
}

const layoutStore = useLayoutStore()

// Get initial layout once (not reactive) to prevent Vue from re-rendering after Swapy swaps
const initialLayout = layoutStore.layout
const initialSlotAssignments = new Map(
  initialLayout.map(({ slot, item }) => [slot, item as WidgetId]),
)

const getSlotContent = (slotId: string) => {
  const itemId = initialSlotAssignments.get(slotId)
  const widget = itemId ? widgetRegistry[itemId] : undefined
  return { slotId, itemId, widget }
}

const slotA = getSlotContent('a')
const slotB = getSlotContent('b')
const slotC = getSlotContent('c')
const slotD = getSlotContent('d')
const slotE = getSlotContent('e')
const slotF = getSlotContent('f')

const swapy = ref<Swapy | null>(null)
const container = ref<HTMLElement | null>()

onMounted(() => {
  if (container.value) {
    swapy.value = createSwapy(container.value, {
      swapMode: 'drop',
      animation: 'dynamic',
      enabled: editMode.value,
    })

    swapy.value.onSwap((event) => {
      layoutStore.setLayout(event.newSlotItemMap.asArray)
    })
  }
})

onUnmounted(() => {
  swapy.value?.destroy()
})
</script>

<template>
  <div class="container" :class="{ 'edit-mode': editMode }" ref="container">
    <div class="slot" data-swapy-slot="a">
      <div
        v-if="slotA.itemId"
        class="item"
        :class="`item-${slotA.itemId}`"
        :data-swapy-item="slotA.itemId"
      >
        <WidgetWrapper v-if="slotA.widget?.component" :title="slotA.widget.title">
          <component :is="slotA.widget.component" />
        </WidgetWrapper>
      </div>
    </div>
    <div class="slot" data-swapy-slot="b">
      <div
        v-if="slotB.itemId"
        class="item"
        :class="`item-${slotB.itemId}`"
        :data-swapy-item="slotB.itemId"
      >
        <WidgetWrapper v-if="slotB.widget?.component" :title="slotB.widget.title">
          <component :is="slotB.widget.component" />
        </WidgetWrapper>
      </div>
    </div>
    <div class="slot" data-swapy-slot="c">
      <div
        v-if="slotC.itemId"
        class="item"
        :class="`item-${slotC.itemId}`"
        :data-swapy-item="slotC.itemId"
      >
        <WidgetWrapper v-if="slotC.widget?.component" :title="slotC.widget.title">
          <component :is="slotC.widget.component" />
        </WidgetWrapper>
      </div>
    </div>
    <div class="slot" data-swapy-slot="d">
      <div
        v-if="slotD.itemId"
        class="item"
        :class="`item-${slotD.itemId}`"
        :data-swapy-item="slotD.itemId"
      >
        <WidgetWrapper v-if="slotD.widget?.component" :title="slotD.widget.title">
          <component :is="slotD.widget.component" />
        </WidgetWrapper>
      </div>
    </div>
    <div class="slot" data-swapy-slot="e">
      <div
        v-if="slotE.itemId"
        class="item"
        :class="`item-${slotE.itemId}`"
        :data-swapy-item="slotE.itemId"
      >
        <WidgetWrapper v-if="slotE.widget?.component" :title="slotE.widget.title">
          <component :is="slotE.widget.component" />
        </WidgetWrapper>
      </div>
    </div>
    <div class="slot" data-swapy-slot="f">
      <div
        v-if="slotF.itemId"
        class="item"
        :class="`item-${slotF.itemId}`"
        :data-swapy-item="slotF.itemId"
      >
        <WidgetWrapper v-if="slotF.widget?.component" :title="slotF.widget.title">
          <component :is="slotF.widget.component" />
        </WidgetWrapper>
      </div>
    </div>
  </div>

  <button class="edit-mode-toggle" :class="{ active: editMode }" @click="toggleEditMode">
    {{ editMode ? 'Done' : 'Edit Layout' }}
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
  padding: 0.75rem 1.5rem;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
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
