<script setup lang="ts">
import type { Component } from 'vue'
import { inject, onMounted, onUnmounted, ref, type Ref, watch } from 'vue'
import { createSwapy, type Swapy } from 'swapy'
import WidgetWrapper from '@/components/app/WidgetWrapper.vue'

const editMode = inject<Ref<boolean>>('editMode')

type WidgetId = string

type WidgetConfig = {
  id: WidgetId
  title: string
  component?: Component
  fallback?: string
}

type LayoutItem = {
  slot: string
  item: WidgetId | null
}

type SlotConfig = {
  id: string
  class?: string // z.B. "slot--2x1" für größere Slots
}

const props = defineProps<{
  slots: SlotConfig[]
  widgetRegistry: Record<WidgetId, WidgetConfig>
  layout: LayoutItem[] // initiales Layout für dieses Grid
}>()

const emit = defineEmits<{
  (e: 'update:layout', value: LayoutItem[]): void
}>()

const container = ref<HTMLElement | null>(null)
const swapy = ref<Swapy | null>(null)

// Layout nur einmal einlesen → Vue mischt sich nicht in Swapy rein
const initialAssignments = new Map<string, WidgetId | null>(
  props.layout.map(({ slot, item }) => [slot, item]),
)

function getSlotContent(slotId: string) {
  const itemId = initialAssignments.get(slotId) ?? null
  const widget = itemId ? props.widgetRegistry[itemId] : undefined
  return { slotId, itemId, widget }
}

onMounted(() => {
  if (!container.value) return

  swapy.value = createSwapy(container.value, {
    swapMode: 'drop',
    animation: 'dynamic',
    enabled: !!editMode?.value,
  })

  swapy.value.onSwap((event) => {
    const newLayout = event.newSlotItemMap.asArray as { slot: string; item: string }[]
    emit(
      'update:layout',
      newLayout.map(({ slot, item }) => ({ slot, item })),
    )
  })
})

onUnmounted(() => {
  swapy.value?.destroy()
})

// editMode reagiert auf Button im Parent
watch(
  () => editMode?.value,
  (val) => {
    if (!swapy.value || val === undefined) return
    if (val) swapy.value.enable(true)
    else swapy.value.enable(false)
  },
  { immediate: true },
)
</script>

<template>
  <div class="swapy-grid" :class="{ 'edit-mode': editMode }" ref="container">
    <div
      v-for="slot in slots"
      :key="slot.id"
      class="slot"
      :class="slot.class"
      :data-swapy-slot="slot.id"
    >
      <div
        v-if="getSlotContent(slot.id).itemId"
        class="item"
        :class="`item-${getSlotContent(slot.id).itemId}`"
        :data-swapy-item="getSlotContent(slot.id).itemId"
      >
        <WidgetWrapper
          v-if="getSlotContent(slot.id).widget?.component"
          :title="getSlotContent(slot.id).widget!.title"
        >
          <component :is="getSlotContent(slot.id).widget!.component" />
        </WidgetWrapper>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swapy-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  grid-auto-rows: 320px;
}

.slot {
  height: 100%;
  border: 2px dashed transparent;
  border-radius: 2em;
  transition: border-color 0.2s;
}

.swapy-grid.edit-mode .slot:not(:has(.item)) {
  border-color: var(--border);
}

.item {
  height: 100%;
}
</style>
