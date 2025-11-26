<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: number
  col: number
  row: number
  colSpan: number
  rowSpan: number
  isDragging: boolean
  index: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  dragStart: [index: number, offsetX: number, offsetY: number]
  resizeStart: [index: number, clientX: number, clientY: number]
}>()

const cardStyle = computed(() => ({
  gridColumn: `${props.col} / span ${props.colSpan}`,
  gridRow: `${props.row} / span ${props.rowSpan}`,
}))

function handleDragStart(e: DragEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  const offsetX = e.clientX - rect.left
  const offsetY = e.clientY - rect.top

  if (e.dataTransfer) {
    const img = new Image()
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4='
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  emit('dragStart', props.index, offsetX, offsetY)
}

function handleResizeMouseDown(e: MouseEvent) {
  emit('resizeStart', props.index, e.clientX, e.clientY)
}
</script>

<template>
  <div
    class="card-wrapper"
    :style="cardStyle"
    :data-dragging="isDragging ? 'true' : 'false'"
    draggable="true"
    @dragstart="handleDragStart"
  >
    <div class="card-inner">
      <slot />
    </div>
    <div class="resize-handle" @mousedown.stop.prevent="handleResizeMouseDown" />
  </div>
</template>

<style scoped>
.card-wrapper {
  position: relative;
  background-color: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease,
    opacity 0.1s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-inner {
  padding: var(--space-lg);
  height: 100%;
  overflow: hidden;
}

.card-wrapper:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-wrapper[data-dragging='true'] {
  opacity: 0.5;
}

/* Resize-Handle unten rechts */
.resize-handle {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid var(--border-strong, var(--border));
  background: linear-gradient(135deg, var(--accent-soft), var(--surface));
  cursor: ns-resize;
  box-shadow: var(--shadow-xs);
}
</style>
