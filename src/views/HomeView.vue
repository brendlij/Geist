<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import DashboardGrid from '@/components/grid/DashboardGrid.vue'
import CardWrapper from '@/components/grid/CardWrapper.vue'

type GridWidget = {
  id: number
  title: string
  col: number
  row: number
  colSpan: number
  rowSpan: number
}

const gridColumns = ref(12)
const gridGap = ref(16)
const rowHeight = ref(80)

const widgets = ref<GridWidget[]>([
  { id: 1, title: '🎨 Beautiful Themes', col: 1, row: 1, colSpan: 6, rowSpan: 2 },
  { id: 2, title: '⚡ Fast & Responsive', col: 7, row: 1, colSpan: 6, rowSpan: 2 },
  { id: 3, title: '📦 Pocketbase Ready', col: 1, row: 3, colSpan: 6, rowSpan: 2 },
  { id: 4, title: '🎯 Simple Structure', col: 7, row: 3, colSpan: 6, rowSpan: 2 },
  { id: 5, title: '🧩 Simple Structures', col: 7, row: 5, colSpan: 6, rowSpan: 2 },
])

function rectsOverlap(a: GridWidget, b: GridWidget) {
  const aRight = a.col + a.colSpan
  const bRight = b.col + b.colSpan
  const aBottom = a.row + a.rowSpan
  const bBottom = b.row + b.rowSpan

  return !(aRight <= b.col || bRight <= a.col || aBottom <= b.row || bBottom <= a.row)
}

// Karten nach oben “fallen lassen”
function applyGravity(items: GridWidget[]) {
  const sorted = [...items].sort((a, b) => a.row - b.row || a.col - b.col)

  for (const w of sorted) {
    let newRow = 1

    while (newRow < w.row) {
      const test: GridWidget = { ...w, row: newRow }
      const collision = sorted.some((o) => o.id !== w.id && rectsOverlap(test, o))

      if (collision) {
        newRow++
      } else {
        w.row = newRow
        break
      }
    }
  }
}

// Alle Overlaps auflösen: immer den unteren nach unten schieben,
// bis kein Paar mehr überlappt.
function resolveAllCollisions(items: GridWidget[]) {
  let changed = true

  while (changed) {
    changed = false

    for (let i = 0; i < items.length; i++) {
      const a = items[i]
      if (!a) continue

      for (let j = 0; j < items.length; j++) {
        if (i === j) continue

        const b = items[j]
        if (!b) continue

        if (!rectsOverlap(a, b)) continue

        // den oberen & unteren bestimmen
        let upper: GridWidget = a
        let lower: GridWidget = b

        if (b.row < a.row || (b.row === a.row && b.col < a.col)) {
          upper = b
          lower = a
        }

        const newRow = upper.row + upper.rowSpan

        if (lower.row < newRow) {
          lower.row = newRow
          changed = true
        }
      }
    }
  }
}

const dragIndex = ref<number | null>(null)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)

function onDragStart(index: number, offsetX: number, offsetY: number) {
  dragIndex.value = index
  dragOffsetX.value = offsetX
  dragOffsetY.value = offsetY
}

function onGridDrop(col: number, row: number) {
  if (dragIndex.value === null) return

  const updated = [...widgets.value]
  const draggedCard = updated[dragIndex.value]
  if (!draggedCard) return

  const targetRect: GridWidget = {
    ...draggedCard,
    col,
    row,
  }

  const targetIndex = updated.findIndex(
    (w, idx) => idx !== dragIndex.value && rectsOverlap(targetRect, w),
  )

  if (targetIndex !== -1) {
    const other = updated[targetIndex]
    if (!other) return

    const tmpCol = other.col
    const tmpRow = other.row

    other.col = draggedCard.col
    other.row = draggedCard.row

    draggedCard.col = tmpCol
    draggedCard.row = tmpRow
  } else {
    draggedCard.col = col
    draggedCard.row = row
  }

  applyGravity(updated)

  widgets.value = updated
  dragIndex.value = null
}

// ---------- Resize-Logik ----------

const resizingIndex = ref<number | null>(null)
const resizeStartY = ref(0)
const resizeStartRowSpan = ref(0)

const resizeStartX = ref(0)
const resizeStartColSpan = ref(0)

function onResizeStart(index: number, clientX: number, clientY: number) {
  resizingIndex.value = index
  resizeStartX.value = clientX
  resizeStartY.value = clientY

  const w = widgets.value[index]
  if (!w) return

  resizeStartRowSpan.value = w.rowSpan
  resizeStartColSpan.value = w.colSpan

  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e: MouseEvent) {
  if (resizingIndex.value === null) return

  const idx = resizingIndex.value
  const updated = [...widgets.value]
  const widget = updated[idx]
  if (!widget) return

  // ========= vertikal (rowSpan) =========
  const deltaY = e.clientY - resizeStartY.value
  const stepY = rowHeight.value + gridGap.value

  let newRowSpan = resizeStartRowSpan.value + Math.round(deltaY / stepY)
  if (newRowSpan < 1) newRowSpan = 1

  widget.rowSpan = newRowSpan

  // ========= horizontal (colSpan) =========
  const gridEl = document.querySelector('.dashboard-grid') as HTMLElement | null
  if (gridEl) {
    const rect = gridEl.getBoundingClientRect()

    const totalGapWidth = (gridColumns.value - 1) * gridGap.value
    const colWidth = (rect.width - totalGapWidth) / gridColumns.value
    const stepX = colWidth + gridGap.value

    const deltaX = e.clientX - resizeStartX.value
    let newColSpan = resizeStartColSpan.value + Math.round(deltaX / stepX)

    if (newColSpan < 1) newColSpan = 1

    // nicht rechts aus dem Grid rauswachsen
    const maxSpan = gridColumns.value - widget.col + 1
    if (newColSpan > maxSpan) newColSpan = maxSpan

    widget.colSpan = newColSpan
  }

  // Kollisionen global fixen
  resolveAllCollisions(updated)
  widgets.value = updated
}

function onResizeEnd() {
  if (resizingIndex.value !== null) {
    const updated = [...widgets.value]

    // Erst alle Kollisionen sauber nach unten schieben
    resolveAllCollisions(updated)
    // Dann alles wieder so weit wie möglich nach oben "fallen" lassen
    applyGravity(updated)

    widgets.value = updated
  }

  resizingIndex.value = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
})

// MaxRow für Grid-Höhe
const maxRow = computed(() => {
  return Math.max(...widgets.value.map((w) => w.row + w.rowSpan - 1), 1)
})
</script>

<template>
  <div class="home-view">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <div class="settings-panel">
        <div class="setting">
          <label>Columns:</label>
          <input v-model.number="gridColumns" type="range" min="4" max="24" />
          <span>{{ gridColumns }}</span>
        </div>
        <div class="setting">
          <label>Gap (px):</label>
          <input v-model.number="gridGap" type="range" min="0" max="48" />
          <span>{{ gridGap }}</span>
        </div>
        <div class="setting">
          <label>Row Height (px):</label>
          <input v-model.number="rowHeight" type="range" min="40" max="200" />
          <span>{{ rowHeight }}</span>
        </div>
      </div>
    </div>

    <DashboardGrid
      :columns="gridColumns"
      :gap="gridGap"
      :row-height="rowHeight"
      :max-row="maxRow"
      :dragged-card-col-span="dragIndex !== null ? widgets[dragIndex!]?.colSpan || 6 : 6"
      :dragged-card-row-span="dragIndex !== null ? widgets[dragIndex!]?.rowSpan || 2 : 2"
      :drag-offset-x="dragOffsetX"
      :drag-offset-y="dragOffsetY"
      @grid-drop="onGridDrop"
    >
      <CardWrapper
        v-for="(widget, index) in widgets"
        :key="widget.id"
        :id="widget.id"
        :col="widget.col"
        :row="widget.row"
        :col-span="widget.colSpan"
        :row-span="widget.rowSpan"
        :is-dragging="dragIndex === index"
        :index="index"
        @drag-start="onDragStart"
        @resize-start="onResizeStart"
      >
        {{ widget.title }}
      </CardWrapper>
    </DashboardGrid>
  </div>
</template>

<style scoped>
.home-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  overflow-y: auto;
  overflow-x: hidden;
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background-color: var(--surface);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.dashboard-header h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  color: var(--text);
}

.settings-panel {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.setting {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.setting label {
  font-weight: 500;
  color: var(--text);
  min-width: 100px;
  font-size: var(--font-size-sm);
}

.setting input[type='range'] {
  width: 120px;
  cursor: pointer;
  accent-color: var(--accent);
  background-color: transparent;
}

.setting span {
  color: var(--accent);
  font-weight: 600;
  min-width: 30px;
  text-align: right;
  font-size: var(--font-size-sm);
}

@media (max-width: 768px) {
  .settings-panel {
    flex-direction: column;
  }

  .setting {
    flex-direction: column;
    gap: var(--space-xs);
  }

  .setting label {
    min-width: auto;
  }
}
</style>
