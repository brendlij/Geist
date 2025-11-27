import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

type SlotItemMapArray = Array<{ slot: string; item: string | null }>

const defaultLayout: SlotItemMapArray = [
  { slot: 'a', item: 'quick-notes' },
  { slot: 'b', item: 'todo' },
  { slot: 'c', item: 'clock' },
  { slot: 'd', item: 'service' },
  { slot: 'e', item: null },
  { slot: 'f', item: null },
]

const VALID_WIDGET_IDS = new Set(['quick-notes', 'todo', 'clock', 'service'])
const ALL_SLOTS = ['a', 'b', 'c', 'd', 'e', 'f']

const STORAGE_KEY = 'geist:widget-layout'
const STORAGE_VERSION_KEY = 'geist:widget-layout-version'
const CURRENT_VERSION = 3 // Increment this when layout structure changes

function loadLayout(): SlotItemMapArray {
  try {
    // Check version - if outdated, reset to default
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      return [...defaultLayout]
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...defaultLayout]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return [...defaultLayout]
    const valid = parsed.every(
      (entry) =>
        entry &&
        typeof entry.slot === 'string' &&
        (entry.item === null || typeof entry.item === 'string'),
    )
    if (!valid) return [...defaultLayout]

    const parsedMap = new Map<string, string | null>()
    const usedWidgets = new Set<string>()

    // First pass: collect valid slot-item mappings, ensuring each widget only appears once
    parsed.forEach((entry) => {
      if (ALL_SLOTS.includes(entry.slot)) {
        if (entry.item === null) {
          parsedMap.set(entry.slot, null)
        } else if (VALID_WIDGET_IDS.has(entry.item) && !usedWidgets.has(entry.item)) {
          parsedMap.set(entry.slot, entry.item)
          usedWidgets.add(entry.item)
        }
      }
    })

    // Build layout for all slots, ensuring no duplicates
    return ALL_SLOTS.map((slot) => ({
      slot,
      item: parsedMap.has(slot) ? parsedMap.get(slot)! : null,
    }))
  } catch (error) {
    console.error('Failed to load widget layout from storage', error)
    return [...defaultLayout]
  }
}

export const useLayoutStore = defineStore('layout', () => {
  const layout = ref<SlotItemMapArray>(loadLayout())

  function setLayout(newLayout: SlotItemMapArray) {
    layout.value = [...newLayout]
  }

  function resetLayout() {
    layout.value = [...defaultLayout]
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
    setLayout,
    resetLayout,
  }
})
