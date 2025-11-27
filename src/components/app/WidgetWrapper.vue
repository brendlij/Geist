<script setup lang="ts">
import { inject, type Ref } from 'vue'

defineOptions({
  name: 'WidgetWrapper',
})

interface Props {
  title?: string
  widgetId?: string
  slotId?: string
  configurable?: boolean
}

withDefaults(defineProps<Props>(), {
  configurable: false,
})

const emit = defineEmits<{
  (e: 'open-settings'): void
}>()

const editMode = inject<Ref<boolean>>('editMode')

function openSettings() {
  emit('open-settings')
}
</script>

<template>
  <div class="widget-wrapper" :class="{ 'edit-mode': editMode }">
    <!-- Drag Handle - only visible in edit mode -->
    <div
      v-if="editMode"
      class="widget-handle"
      data-swapy-handle
      :title="`Drag to move${title ? ': ' + title : ''}`"
    />

    <!-- Settings Button - only visible in edit mode for configurable widgets -->
    <button
      v-if="editMode && configurable"
      class="settings-button"
      data-swapy-no-drag
      @click.stop="openSettings"
      title="Widget Settings"
    >
      ⚙️
    </button>

    <!-- Widget Content -->
    <div class="widget-content" data-swapy-no-drag>
      <slot />
    </div>

    <!-- Settings Modal Slot -->
    <slot name="settings" />
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
  z-index: 2;
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

/* Settings button */
.settings-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.75rem;
  background-color: var(--accent);
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.settings-button:hover {
  background-color: var(--primary);
  transform: scale(1.1);
}

/* Content sits normally */
.widget-content {
  position: relative;
  z-index: 2;
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
