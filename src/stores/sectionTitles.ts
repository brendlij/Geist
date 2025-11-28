import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type SectionId = 'main-widgets' | 'services-grid'

type SectionTitleState = Record<SectionId, string>

const DEFAULT_TITLES: SectionTitleState = {
  'main-widgets': 'Main Widgets',
  'services-grid': 'Services',
}

const STORAGE_KEY = 'geist:section-titles'
const STORAGE_VERSION_KEY = 'geist:section-titles-version'
const CURRENT_VERSION = 1

function loadTitles(): SectionTitleState {
  try {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    if (savedVersion !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      return { ...DEFAULT_TITLES }
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_TITLES }

    const parsed = JSON.parse(raw) as Partial<SectionTitleState>
    return {
      'main-widgets': parsed['main-widgets']?.trim() || DEFAULT_TITLES['main-widgets'],
      'services-grid': parsed['services-grid']?.trim() || DEFAULT_TITLES['services-grid'],
    }
  } catch (error) {
    console.error('Failed to load section titles from storage', error)
    return { ...DEFAULT_TITLES }
  }
}

export const useSectionTitlesStore = defineStore('sectionTitles', () => {
  const titles = ref<SectionTitleState>(loadTitles())

  function setTitle(sectionId: SectionId, title: string) {
    titles.value[sectionId] = title.trim() || DEFAULT_TITLES[sectionId]
  }

  function resetTitle(sectionId: SectionId) {
    titles.value[sectionId] = DEFAULT_TITLES[sectionId]
  }

  watch(
    titles,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch (error) {
        console.error('Failed to persist section titles', error)
      }
    },
    { deep: true },
  )

  return {
    titles,
    setTitle,
    resetTitle,
    defaultTitles: DEFAULT_TITLES,
  }
})
