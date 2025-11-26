// themes.ts

export type ThemeId = 'geist-dark' | 'geist-light' | 'midnight' | 'sage' | 'graphite' | 'coffee'

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
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    background: '#0f1419',
    surface: '#1a1f2e',
    surfaceSoft: '#252d3d',
    text: '#e8eef5',
    textMuted: '#9ca3af',
    accent: '#60a5fa',
    accentSoft: 'rgba(96, 165, 250, 0.15)',
    border: '#364152',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    background: '#f5faf7',
    surface: '#ffffff',
    surfaceSoft: '#f0f5f2',
    text: '#1a3a32',
    textMuted: '#6b8b83',
    accent: '#6ba88a',
    accentSoft: 'rgba(107, 168, 138, 0.15)',
    border: '#d4e4dc',
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    background: '#1a1a1f',
    surface: '#2d2d33',
    surfaceSoft: '#3a3a41',
    text: '#e5e5ea',
    textMuted: '#a0a0a6',
    accent: '#64b5f6',
    accentSoft: 'rgba(100, 181, 246, 0.15)',
    border: '#4a4a51',
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    background: '#1a1511',
    surface: '#2d2419',
    surfaceSoft: '#3d3428',
    text: '#e8dcc8',
    textMuted: '#a89878',
    accent: '#d4a574',
    accentSoft: 'rgba(212, 165, 116, 0.15)',
    border: '#4a4038',
  },
}

export const DEFAULT_THEME_ID: ThemeId = 'geist-dark'

export function getTheme(id: ThemeId | undefined | null): Theme {
  return (id && themes[id]) || themes[DEFAULT_THEME_ID]
}

export const themeList: Theme[] = Object.values(themes)
