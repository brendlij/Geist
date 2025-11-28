<script setup lang="ts">
import { inject, ref, type Ref, onMounted, onUnmounted } from 'vue'
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
  compact?: boolean // For header widgets - split drag/menu areas
  interactiveInEditMode?: boolean // Allow interacting with content while edit mode is active
  useSectionHandle?: boolean // Show dedicated section drag handle instead of dragging entire card
  borderless?: boolean // Hide wrapper border/background (for vacuum widgets)
}

const props = withDefaults(defineProps<Props>(), {
  configurable: false,
  removable: false,
  compact: false,
  interactiveInEditMode: false,
  useSectionHandle: false,
  borderless: false,
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

// Close menu when clicking outside
const menuAreaRef = ref<HTMLElement | null>(null)

function handleClickOutside(event: MouseEvent) {
  if (showMenu.value && menuAreaRef.value && !menuAreaRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    class="widget-wrapper"
    :class="{
      'edit-mode': editMode,
      'compact-mode': compact,
      'section-mode': useSectionHandle,
      borderless: borderless,
    }"
    :data-swapy-handle="editMode && !compact && !useSectionHandle ? '' : undefined"
  >
    <div v-if="useSectionHandle && editMode" class="section-handle" data-swapy-handle>
      <Icon icon="mdi:drag" class="handle-icon" />
      <span class="handle-label">{{ title ?? 'Section' }}</span>
      <span class="handle-hint">Drag section</span>
    </div>
    <!-- Compact mode: split layout for header widgets -->
    <template v-if="compact && editMode">
      <!-- Left half: drag area -->
      <div class="compact-drag-area" data-swapy-handle>
        <Icon icon="mdi:drag" class="drag-icon" />
      </div>
      <!-- Right half: menu area -->
      <div
        v-if="configurable || removable"
        ref="menuAreaRef"
        class="compact-menu-area"
        data-swapy-no-drag
      >
        <button
          type="button"
          class="compact-menu-button"
          @mousedown.stop.prevent
          @click.stop.prevent="toggleMenu"
        >
          <Icon icon="mdi:dots-vertical" class="menu-icon" />
        </button>
        <!-- Context Menu -->
        <div v-if="showMenu" class="context-menu compact-context-menu" @click.stop>
          <button v-if="configurable" class="menu-item" @click.stop="openSettings">
            <Icon icon="mdi:cog" class="item-icon" />
            <span>Edit</span>
          </button>
          <button v-if="removable && slotId" class="menu-item delete" @click.stop="handleDelete">
            <Icon icon="mdi:delete" class="item-icon" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Standard mode: menu button in corner -->
    <template v-else>
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
    </template>

    <!-- Widget Content -->
    <div
      class="widget-content"
      :class="{ disabled: editMode && !props.interactiveInEditMode }"
      data-swapy-no-drag
    >
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

.widget-wrapper.borderless {
  border: none;
  padding: 0;
  background: transparent;
}

/* Whole card is draggable in edit mode */
.widget-wrapper.edit-mode {
  cursor: grab;
}

.widget-wrapper.edit-mode:active {
  cursor: grabbing;
}

.widget-wrapper.section-mode.edit-mode {
  border: 2px dashed var(--accent);
  box-shadow: 0 0 0 2px var(--accent-soft);
}

.section-handle {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  cursor: grab;
  box-shadow: var(--shadow-sm, 0 4px 12px rgba(0, 0, 0, 0.15));
}

.handle-icon {
  opacity: 0.8;
  font-size: 1.25rem;
}

.section-handle:active {
  cursor: grabbing;
}

.handle-hint {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.7;
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

/* Compact mode for header widgets */
.widget-wrapper.compact-mode.edit-mode {
  cursor: default;
}

.compact-drag-area {
  position: absolute;
  left: 0;
  top: 0;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border-radius: var(--widget-border-radius, 0.75rem) 0 0 var(--widget-border-radius, 0.75rem);
  background: transparent;
  transition: background-color 0.2s;
  z-index: 10;
}

.compact-drag-area:hover {
  background: rgba(255, 255, 255, 0.1);
}

.compact-drag-area:active {
  cursor: grabbing;
}

.compact-drag-area .drag-icon {
  font-size: 1.25rem;
  color: var(--text);
  opacity: 0.5;
}

.compact-drag-area:hover .drag-icon {
  opacity: 0.8;
}

.compact-menu-area {
  position: absolute;
  right: 0;
  top: 0;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 0 var(--widget-border-radius, 0.75rem) var(--widget-border-radius, 0.75rem) 0;
  background: transparent;
  transition: background-color 0.2s;
  z-index: 20;
  pointer-events: auto;
}

.compact-menu-area:hover {
  background: rgba(255, 255, 255, 0.1);
}

.compact-menu-button {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  pointer-events: auto;
}

.compact-menu-area .menu-icon {
  font-size: 1.25rem;
  color: var(--text);
  opacity: 0.5;
}

.compact-menu-area:hover .menu-icon {
  opacity: 0.8;
}

.compact-context-menu {
  position: absolute;
  top: 100%;
  right: 0;
  left: auto;
  min-width: 120px;
  z-index: 100;
}
</style>
