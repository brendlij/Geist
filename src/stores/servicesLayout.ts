import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

type SlotItemMapArray = Array<{ slot: string; item: string | null }>

// 12 slots for services grid (smaller widgets)
const ALL_SLOTS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12']

// Each slot can have a service widget instance
const VALID_WIDGET_IDS = new Set([
  'service-1',
  'service-2',
  'service-3',
  'service-4',
  'service-5',
  'service-6',
  'service-7',
  'service-8',
  'service-9',
  'service-10',
  'service-11',
  'service-12',
])

const defaultLayout: SlotItemMapArray = [
  { slot: 's1', item: 'service-1' },
  { slot: 's2', item: 'service-2' },
  { slot: 's3', item: 'service-3' },
  { slot: 's4', item: 'service-4' },
  { slot: 's5', item: 'service-5' },
  { slot: 's6', item: 'service-6' },
  { slot: 's7', item: 'service-7' },
  { slot: 's8', item: 'service-8' },
  { slot: 's9', item: null },
  { slot: 's10', item: null },
  { slot: 's11', item: null },
  { slot: 's12', item: null },
]

const STORAGE_KEY = 'geist:services-layout'
const STORAGE_VERSION_KEY = 'geist:services-layout-version'
const CURRENT_VERSION = 1

function loadLayout(): SlotItemMapArray {
  try {
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

    return ALL_SLOTS.map((slot) => ({
      slot,
      item: parsedMap.has(slot) ? parsedMap.get(slot)! : null,
    }))
  } catch (error) {
    console.error('Failed to load services layout from storage', error)
    return [...defaultLayout]
  }
}

export const useServicesLayoutStore = defineStore('servicesLayout', () => {
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
        console.error('Failed to persist services layout', error)
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
