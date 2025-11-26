<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  columns?: number
  gap?: number
  rowHeight?: number
  maxRow?: number
  draggedCardColSpan?: number
  draggedCardRowSpan?: number
  dragOffsetX?: number
  dragOffsetY?: number
}

const props = withDefaults(defineProps<Props>(), {
  columns: 12,
  gap: 16,
  rowHeight: 80,
  maxRow: 1,
  draggedCardColSpan: 6,
  draggedCardRowSpan: 2,
  dragOffsetX: 0,
  dragOffsetY: 0,
})

const emit = defineEmits<{
  gridDrop: [col: number, row: number]
}>()

const gridRef = ref<HTMLElement | null>(null)
const hoverCol = ref(1)
const hoverRow = ref(1)
const isDraggingOver = ref(false)

const gridStyle = computed(() => {
  const totalHeight = props.maxRow * props.rowHeight + (props.maxRow - 1) * props.gap

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    gridAutoRows: `${props.rowHeight}px`,
    gap: `${props.gap}px`,
    height: `${totalHeight}px`,
  } as Record<string, string | number>
})

const ghostBoxStyle = computed(() => ({
  gridColumn: `${hoverCol.value} / span ${props.draggedCardColSpan}`,
  gridRow: `${hoverRow.value} / span ${props.draggedCardRowSpan}`,
  pointerEvents: 'none' as const,
}))

function calculateGridPosition(e: DragEvent) {
  const el = gridRef.value
  if (!el) return { col: 1, row: 1 }

  const rect = el.getBoundingClientRect()

  const x = e.clientX - rect.left + el.scrollLeft
  const y = e.clientY - rect.top + el.scrollTop

  const xTopLeft = x - (props.dragOffsetX ?? 0)
  const yTopLeft = y - (props.dragOffsetY ?? 0)

  const totalGapWidth = (props.columns - 1) * props.gap
  const colWidth = (rect.width - totalGapWidth) / props.columns
  const stepX = colWidth + props.gap
  const stepY = props.rowHeight + props.gap

  let col = Math.floor(xTopLeft / stepX) + 1
  let row = Math.floor(yTopLeft / stepY) + 1

  col = Math.max(1, Math.min(col, props.columns))
  row = Math.max(1, Math.min(row, props.maxRow))

  return { col, row }
}

function handleGridDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'

  const pos = calculateGridPosition(e)
  isDraggingOver.value = true
  hoverCol.value = pos.col
  hoverRow.value = pos.row
}

function handleGridDrop(e: DragEvent) {
  e.preventDefault()
  const pos = calculateGridPosition(e)
  isDraggingOver.value = false
  emit('gridDrop', pos.col, pos.row)
}

function handleGridDragEnter(e: DragEvent) {
  const pos = calculateGridPosition(e)
  isDraggingOver.value = true
  hoverCol.value = pos.col
  hoverRow.value = pos.row
}

function handleGridDragLeave() {
  isDraggingOver.value = false
}
</script>

<template>
  <div
    ref="gridRef"
    class="dashboard-grid"
    :style="gridStyle"
    @dragover="handleGridDragOver"
    @drop="handleGridDrop"
    @dragenter="handleGridDragEnter"
    @dragleave="handleGridDragLeave"
  >
    <div v-if="isDraggingOver" class="ghost-box" :style="ghostBoxStyle" />
    <slot />
  </div>
</template>

<style scoped>
.dashboard-grid {
  width: 100%;
  padding: 0;
  border-radius: 0;
  border: none;
  overflow: visible;
}

.ghost-box {
  background-color: var(--accent-soft);
  border: 2px dashed var(--accent);
  border-radius: var(--radius-lg);
  opacity: 0.7;
  pointer-events: none;
}
</style>
