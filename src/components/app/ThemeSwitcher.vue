<template>
  <div class="inline-flex items-center gap-2 text-xs">
    <span class="uppercase tracking-wide text-[var(--text-muted)]"> Theme </span>

    <select
      v-model="themeId"
      class="bg-[var(--surface-soft)] border border-[var(--border)] rounded-md px-2 py-1 text-xs outline-none"
    >
      <option v-for="t in themeList" :key="t.id" :value="t.id">
        {{ t.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { themeList } from '@/theme/themes'
import { useTheme } from '@/theme/useTheme'

const { themeId } = useTheme()
</script>
