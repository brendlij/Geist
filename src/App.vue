<script setup lang="ts">
import GeistLogo from './components/app/GeistLogo.vue'
import ThemeSwitcher from './components/app/ThemeSwitcher.vue'
</script>

<template>
  <header
    class="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]"
  >
    <GeistLogo :size="48" color="var(--accent)" />

    <div class="font-semibold text-sm tracking-wide">Geist</div>

    <ThemeSwitcher />
  </header>
</template>

<style scoped></style>
