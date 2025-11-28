import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'

type SlotItemMapArray = Array<{ slot: string; item: string | null }>

const STORAGE_KEY = 'geist:widget-layout'
const STORAGE_VERSION_KEY = 'geist:widget-layout-version'
const CURRENT_VERSION = 5

const LEGACY_WIDGET_IDS = new Set(['quick-notes', 'todo', 'clock', 'vacuum'])

function createWidgetInstanceId(widgetType: string, seed?: string) {
  const randomPart = seed ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  return `${widgetType}::${randomPart}`
}

// Default dynamic layout: only the actual widgets (no empty dashed slots)
function createDefaultLayout(): SlotItemMapArray {
  return [
    { slot: 'w1', item: createWidgetInstanceId('quick-notes', 'w1') },
    { slot: 'w2', item: createWidgetInstanceId('todo', 'w2') },
    { slot: 'w3', item: createWidgetInstanceId('clock', 'w3') },
  ]
}

function compactLayout(entries: SlotItemMapArray): SlotItemMapArray {
  return entries.filter((entry) => entry.item !== null)
}

function normalizeLayout(entries: unknown): SlotItemMapArray {
  if (!Array.isArray(entries)) return createDefaultLayout()
  const normalized: SlotItemMapArray = []
  const seenSlots = new Set<string>()
  const seenItems = new Set<string>()

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const slot = String((entry as { slot?: string }).slot ?? '')
    const item = (entry as { item?: string | null }).item ?? null
    if (!slot || seenSlots.has(slot)) continue
    if (item !== null) {
      if (typeof item !== 'string') continue
      const normalizedItem = item.includes('::')
        ? item
        : LEGACY_WIDGET_IDS.has(item)
          ? createWidgetInstanceId(item, slot)
          : null
      if (!normalizedItem || seenItems.has(normalizedItem)) continue
      normalized.push({ slot, item: normalizedItem })
      seenSlots.add(slot)
      seenItems.add(normalizedItem)
    }
  }

  return normalized.length > 0 ? normalized : createDefaultLayout()
}

function loadLayout(): SlotItemMapArray {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      return createDefaultLayout()
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultLayout()
    const parsed = JSON.parse(raw) as unknown
    return normalizeLayout(parsed)
  } catch (error) {
    console.error('Failed to load widget layout from storage', error)
    return createDefaultLayout()
  }
}

export const useLayoutStore = defineStore('layout', () => {
  const layout = ref<SlotItemMapArray>(compactLayout(loadLayout()))

  const slots = computed(() => layout.value.map((l) => ({ id: l.slot })))

  function getNextSlotId(): string {
    const used = new Set(layout.value.map((l) => l.slot))
    let i = 1
    while (used.has(`w${i}`)) i++
    return `w${i}`
  }

  function addWidget(widgetType: string) {
    const slotId = getNextSlotId()
    const instanceId = createWidgetInstanceId(widgetType)
    layout.value.push({ slot: slotId, item: instanceId })
    return instanceId
  }

  function removeWidget(slotId: string) {
    const idx = layout.value.findIndex((l) => l.slot === slotId)
    if (idx !== -1) layout.value.splice(idx, 1)
  }

  function setLayout(newLayout: SlotItemMapArray) {
    layout.value = compactLayout([...newLayout])
  }

  function resetLayout() {
    layout.value = createDefaultLayout()
  }

  watch(
    layout,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch (error) {
        console.error('Failed to persist widget layout', error)
      }
    },
    { deep: true },
  )

  return {
    layout,
    slots,
    setLayout,
    addWidget,
    removeWidget,
    resetLayout,
  }
})
