// themes.ts

export type ThemeId = 'geist-dark' | 'geist-light'

export interface Theme {
  id: ThemeId
  name: string
  // nur das, was du wirklich brauchst
  background: string
  surface: string
  surfaceSoft: string
  text: string
  textMuted: string
  accent: string
  accentSoft: string
  border: string
}

export const themes: Record<ThemeId, Theme> = {
  'geist-dark': {
    id: 'geist-dark',
    name: 'Geist Dark',
    background: '#1a1a1a',
    surface: '#262626',
    surfaceSoft: '#333333',
    text: '#f5f5f5',
    textMuted: '#b3b3b3',
    accent: '#b19cd9',
    accentSoft: 'rgba(177, 156, 217, 0.15)',
    border: '#404040',
  },
  'geist-light': {
    id: 'geist-light',
    name: 'Geist Light',
    background: '#fafafa',
    surface: '#ffffff',
    surfaceSoft: '#f0f0f0',
    text: '#2a2a2a',
    textMuted: '#888888',
    accent: '#c8b6db',
    accentSoft: 'rgba(200, 182, 219, 0.15)',
    border: '#e8e8e8',
  },
}

export const DEFAULT_THEME_ID: ThemeId = 'geist-dark'

export function getTheme(id: ThemeId | undefined | null): Theme {
  return (id && themes[id]) || themes[DEFAULT_THEME_ID]
}

export const themeList: Theme[] = Object.values(themes)
