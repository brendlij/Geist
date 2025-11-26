// useTheme.ts
import { ref, computed, watchEffect } from 'vue'
import { getTheme, DEFAULT_THEME_ID, type ThemeId, type Theme } from './themes'

const STORAGE_KEY = 'geist.theme'

const currentId = ref<ThemeId>((localStorage.getItem(STORAGE_KEY) as ThemeId) || DEFAULT_THEME_ID)

const currentTheme = computed<Theme>(() => getTheme(currentId.value))

// CSS-Variablen anwenden
watchEffect(() => {
  const t = currentTheme.value
  const root = document.documentElement

  root.style.setProperty('--bg', t.background)
  root.style.setProperty('--surface', t.surface)
  root.style.setProperty('--surface-soft', t.surfaceSoft)
  root.style.setProperty('--text', t.text)
  root.style.setProperty('--text-muted', t.textMuted)
  root.style.setProperty('--accent', t.accent)
  root.style.setProperty('--accent-soft', t.accentSoft)
  root.style.setProperty('--border', t.border)

  localStorage.setItem(STORAGE_KEY, currentId.value)
})

export function useTheme() {
  const setTheme = (id: ThemeId) => {
    currentId.value = id
  }

  return {
    themeId: currentId,
    theme: currentTheme,
    setTheme,
  }
}
