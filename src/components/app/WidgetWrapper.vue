<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { Icon } from '@iconify/vue'

defineOptions({
  name: 'WidgetWrapper',
})

interface Props {
  title?: string
  widgetId?: string
  slotId?: string
  configurable?: boolean
  removable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  configurable: false,
  removable: false,
})

const emit = defineEmits<{
  (e: 'open-settings'): void
  (e: 'delete', slotId: string): void
}>()

const editMode = inject<Ref<boolean>>('editMode')
const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function closeMenu() {
  showMenu.value = false
}

function openSettings() {
  closeMenu()
  emit('open-settings')
}

function handleDelete() {
  closeMenu()
  if (props.slotId) {
    emit('delete', props.slotId)
  }
}
</script>

<template>
  <div
    class="widget-wrapper"
    :class="{ 'edit-mode': editMode }"
    :data-swapy-handle="editMode ? '' : undefined"
    @click="closeMenu"
  >
    <!-- Menu Button - only visible in edit mode -->
    <div v-if="editMode && (configurable || removable)" class="menu-container" data-swapy-no-drag>
      <button class="menu-button" @click.stop="toggleMenu" title="Widget Options">
        <Icon icon="mdi:dots-vertical" class="menu-icon" />
      </button>

      <!-- Context Menu -->
      <div v-if="showMenu" class="context-menu">
        <button v-if="configurable" class="menu-item" @click.stop="openSettings">
          <Icon icon="mdi:cog" class="item-icon" />
          <span>Edit Widget</span>
        </button>
        <button v-if="removable && slotId" class="menu-item delete" @click.stop="handleDelete">
          <Icon icon="mdi:delete" class="item-icon" />
          <span>Delete Widget</span>
        </button>
      </div>
    </div>

    <!-- Widget Content -->
    <div class="widget-content" :class="{ disabled: editMode }" data-swapy-no-drag>
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
  border-radius: var(--widget-border-radius, 2em);
  padding: var(--widget-padding, 2em);
  overflow: visible;
}

/* Whole card is draggable in edit mode */
.widget-wrapper.edit-mode {
  cursor: grab;
}

.widget-wrapper.edit-mode:active {
  cursor: grabbing;
}

/* Menu container */
.menu-container {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 20;
}

.menu-button {
  width: 2rem; /* vorher 2.5rem */
  height: 2rem;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  font-size: 1.35rem; /* Icon-Größe! */
  line-height: 1;
  padding: 0; /* wichtig, sonst nochmal extra Luft */
}

.menu-icon {
  display: block;
  width: 1em;
  height: 1em;
}

.menu-button:hover {
  background-color: var(--primary);
  transform: scale(1.05);
}

/* Context menu dropdown */
.context-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 160px;
  background-color: var(--bg, var(--background, #ffffff));
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: transparent;
  color: var(--text);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s;
  text-align: left;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: var(--accent);
}

.menu-item.delete:hover {
  background-color: #fca5a5;
  color: #7f1d1d;
}

.item-icon {
  font-size: 1.25rem;
}

/* Content sits normally */
.widget-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Disable content in edit mode */
.widget-content.disabled {
  pointer-events: none;
  opacity: 0.6;
}

/* Ensure buttons and interactive elements work when not in edit mode */
.widget-content :deep(button),
.widget-content :deep(a),
.widget-content :deep(input),
.widget-content :deep(textarea),
.widget-content :deep(select) {
  pointer-events: auto;
}
</style>
