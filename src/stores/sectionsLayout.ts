import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type SectionLayoutItem = {
  slot: string
  item: string | null
  disabled?: boolean
}

const SECTION_SLOTS = ['section-1', 'section-2', 'section-3'] as const
const VALID_SECTION_IDS = ['main-widgets', 'services-grid'] as const

const STORAGE_KEY = 'geist:sections-layout'
const STORAGE_VERSION_KEY = 'geist:sections-layout-version'
const CURRENT_VERSION = 1

const defaultLayout: SectionLayoutItem[] = [
  { slot: 'section-1', item: 'main-widgets', disabled: false },
  { slot: 'section-2', item: 'services-grid', disabled: false },
  { slot: 'section-3', item: null, disabled: false },
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

      const item = entry.item === null ? null : typeof entry.item === 'string' ? entry.item : null

      if (item === null) {
        parsedMap.set(entry.slot, null)
        return
      }

      if (
        typeof item === 'string' &&
        VALID_SECTION_IDS.includes(item as (typeof VALID_SECTION_IDS)[number]) &&
        !usedSections.has(item)
      ) {
        parsedMap.set(entry.slot, item)
        usedSections.add(item)
      }
    })

    // Rebuild with possible disabled flags from parsed; if not provided, default to false
    return SECTION_SLOTS.map((slot) => {
      const source = (parsed as Array<Record<string, unknown>>).find(
        (e) => e && e.slot === slot,
      ) as Record<string, unknown> | undefined
      return {
        slot,
        item: parsedMap.has(slot) ? parsedMap.get(slot)! : null,
        disabled: source ? Boolean(source.disabled) : false,
      }
    })
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

  function setDisabled(slot: string, value: boolean) {
    const idx = layout.value.findIndex((l) => l.slot === slot)
    if (idx === -1) return
    const copy = [...layout.value]
    const existing = copy[idx]
    if (!existing) return
    copy[idx] = { slot: existing.slot!, item: existing.item ?? null, disabled: value }
    layout.value = copy
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
    setDisabled,
  }
})
