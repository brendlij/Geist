import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type LayoutItem = {
  slot: string
  item: string | null
}

const STORAGE_KEY = 'geist-header-layout'
const LAYOUT_VERSION = 2

export const useHeaderLayoutStore = defineStore('headerLayout', () => {
  // Default layout - 8 header slots
  const defaultLayout: LayoutItem[] = [
    { slot: 'h1', item: 'header-clock' },
    { slot: 'h2', item: 'header-weather' },
    { slot: 'h3', item: null },
    { slot: 'h4', item: null },
    { slot: 'h5', item: null },
    { slot: 'h6', item: null },
    { slot: 'h7', item: null },
    { slot: 'h8', item: null },
  ]

  function loadLayout(): LayoutItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.version === LAYOUT_VERSION && Array.isArray(parsed.layout)) {
          return parsed.layout
        }
      }
    } catch {
      // Ignore errors
    }
    return defaultLayout
  }

  const layout = ref<LayoutItem[]>(loadLayout())

  function setLayout(newLayout: LayoutItem[]) {
    layout.value = newLayout
  }

  // Persist to localStorage
  watch(
    layout,
    (val) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: LAYOUT_VERSION,
          layout: val,
        }),
      )
    },
    { deep: true },
  )

  return {
    layout,
    setLayout,
  }
})
