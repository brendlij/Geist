<script setup lang="ts">
defineOptions({
  name: 'WidgetWrapper',
})

interface Props {
  title?: string
}

defineProps<Props>()
</script>

<template>
  <div class="widget-wrapper">
    <!-- Drag Handle - invisible but provides grab cursor and drag feedback -->
    <div
      class="widget-handle"
      data-swapy-handle
      :title="`Drag to move${title ? ': ' + title : ''}`"
    />

    <!-- Widget Content -->
    <div class="widget-content" data-swapy-no-drag>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.widget-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 2em;
  padding: 2em;
  overflow: hidden;
}

/* Small drag handle on the left side */
.widget-handle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 32px;
  z-index: 10;
  cursor: grab;
  background-color: transparent;
  transition: background-color var(--transition-base);
  pointer-events: auto;
  padding-right: 32px;
}

.widget-handle:hover {
  background-color: var(--accent);
}

.widget-handle:active {
  cursor: grabbing;
  background-color: var(--accent);
}

/* Content sits normally */
.widget-content {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  padding-left: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Ensure buttons and interactive elements work */
.widget-content :deep(button),
.widget-content :deep(a),
.widget-content :deep(input),
.widget-content :deep(textarea),
.widget-content :deep(select) {
  pointer-events: auto;
}
</style>
