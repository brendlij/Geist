import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export interface ServiceSettings {
  name: string
  url: string
  icon: string
  description: string
}

export interface HeaderClockSettings {
  showSeconds: boolean
  showDate: boolean
  use24Hour: boolean
}

export interface HeaderWeatherSettings {
  city: string
  units: 'metric' | 'imperial'
  apiKey: string
}

export type WidgetSettings = {
  service?: ServiceSettings
  headerClock?: HeaderClockSettings
  headerWeather?: HeaderWeatherSettings
  // Add more widget types here as needed
}

type AllWidgetSettings = Record<string, WidgetSettings>

const STORAGE_KEY = 'geist:widget-settings'

function loadSettings(): AllWidgetSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export const useWidgetSettingsStore = defineStore('widgetSettings', () => {
  const settings = ref<AllWidgetSettings>(loadSettings())

  function getSettings<T extends keyof WidgetSettings>(
    slotId: string,
    widgetType: T,
  ): WidgetSettings[T] | undefined {
    return settings.value[slotId]?.[widgetType]
  }

  function setSettings<T extends keyof WidgetSettings>(
    slotId: string,
    widgetType: T,
    value: WidgetSettings[T],
  ) {
    if (!settings.value[slotId]) {
      settings.value[slotId] = {}
    }
    settings.value[slotId][widgetType] = value
    // Force save immediately
    saveToStorage()
  }

  function clearSettings(slotId: string) {
    delete settings.value[slotId]
    saveToStorage()
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to persist widget settings', error)
    }
  }

  // Also keep the watch for any other mutations
  watch(
    settings,
    () => {
      saveToStorage()
    },
    { deep: true },
  )

  return {
    settings,
    getSettings,
    setSettings,
    clearSettings,
  }
})
