import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type SectionLayoutItem = {
  slot: string
  item: string | null
}

const SECTION_SLOTS = ['section-1', 'section-2', 'section-3'] as const
const VALID_SECTION_IDS = ['main-widgets', 'services-grid'] as const

const STORAGE_KEY = 'geist:sections-layout'
const STORAGE_VERSION_KEY = 'geist:sections-layout-version'
const CURRENT_VERSION = 1

const defaultLayout: SectionLayoutItem[] = [
  { slot: 'section-1', item: 'main-widgets' },
  { slot: 'section-2', item: 'services-grid' },
  { slot: 'section-3', item: null },
]

function loadLayout(): SectionLayoutItem[] {
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    if (storedVersion !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      return [...defaultLayout]
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...defaultLayout]

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [...defaultLayout]

    const parsedMap = new Map<string, string | null>()
    const usedSections = new Set<string>()

    parsed.forEach((entry) => {
      if (!entry || typeof entry.slot !== 'string') return
      if (!SECTION_SLOTS.includes(entry.slot)) return

      if (entry.item === null) {
        parsedMap.set(entry.slot, null)
        return
      }

      if (
        typeof entry.item === 'string' &&
        VALID_SECTION_IDS.includes(entry.item as (typeof VALID_SECTION_IDS)[number]) &&
        !usedSections.has(entry.item)
      ) {
        parsedMap.set(entry.slot, entry.item)
        usedSections.add(entry.item)
      }
    })

    return SECTION_SLOTS.map((slot) => ({
      slot,
      item: parsedMap.has(slot) ? parsedMap.get(slot)! : null,
    }))
  } catch (error) {
    console.error('Failed to load sections layout from storage', error)
    return [...defaultLayout]
  }
}

export const useSectionsLayoutStore = defineStore('sectionsLayout', () => {
  const layout = ref<SectionLayoutItem[]>(loadLayout())

  function setLayout(newLayout: SectionLayoutItem[]) {
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
        console.error('Failed to persist sections layout', error)
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
