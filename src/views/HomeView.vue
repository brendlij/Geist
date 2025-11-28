<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { Icon } from '@iconify/vue'
import MainWidgetsSection from '@/components/sections/MainWidgetsSection.vue'
import ServicesSection from '@/components/sections/ServicesSection.vue'
import { useSectionsLayoutStore, type SectionLayoutItem } from '@/stores/sectionsLayout'
import { useSectionTitlesStore } from '@/stores/sectionTitles'

const editMode = inject<Ref<boolean>>('editMode', ref(false))

function toggleEditMode() {
  editMode.value = !editMode.value
}

const sectionsLayoutStore = useSectionsLayoutStore()
const sectionTitlesStore = useSectionTitlesStore()

const sectionWidgetRegistry = {
  'main-widgets': {
    id: 'main-widgets',
    title: 'Main Widgets',
    component: MainWidgetsSection,
  },
  'services-grid': {
    id: 'services-grid',
    title: 'Services',
    component: ServicesSection,
  },
}

type SectionId = keyof typeof sectionWidgetRegistry

const requiredSections: SectionId[] = ['main-widgets', 'services-grid']

function ensureRequiredSectionsPresent() {
  const layoutCopy = sectionsLayoutStore.layout.map((entry) => ({
    ...entry,
  })) as SectionLayoutItem[]
  let changed = false

  requiredSections.forEach((sectionId) => {
    const alreadyPresent = layoutCopy.some((entry) => entry.item === sectionId)
    if (alreadyPresent) return

    const emptyEntry = layoutCopy.find((entry) => entry.item === null)
    if (emptyEntry) {
      emptyEntry.item = sectionId
      changed = true
      return
    }

    layoutCopy.push({ slot: `section-${layoutCopy.length + 1}`, item: sectionId })
    changed = true
  })
  if (changed) {
    sectionsLayoutStore.setLayout(layoutCopy)
  }
}

ensureRequiredSectionsPresent()
const orderedSections = computed(
  () =>
    sectionsLayoutStore.layout
      .map((entry) => {
        if (!entry.item) return null
        if (entry.disabled) return null
        const config = sectionWidgetRegistry[entry.item as SectionId]
        if (!config) return null
        return {
          slot: entry.slot,
          sectionId: entry.item as SectionId,
          config,
        }
      })
      .filter(Boolean) as Array<{
      slot: string
      sectionId: SectionId
      config: (typeof sectionWidgetRegistry)[SectionId]
    }>,
)

const hiddenSections = computed(() =>
  sectionsLayoutStore.layout
    .filter((entry) => entry.item && entry.disabled)
    .map((entry) => ({ slot: entry.slot, sectionId: entry.item! })),
)

function findSectionIndex(sectionId: SectionId) {
  return sectionsLayoutStore.layout.findIndex((entry) => entry.item === sectionId)
}

function findNeighborIndex(startIndex: number, direction: 'up' | 'down') {
  if (direction === 'up') {
    for (let i = startIndex - 1; i >= 0; i--) {
      if (sectionsLayoutStore.layout[i]?.item) return i
    }
  } else {
    for (let i = startIndex + 1; i < sectionsLayoutStore.layout.length; i++) {
      if (sectionsLayoutStore.layout[i]?.item) return i
    }
  }
  return -1
}

function canMoveSection(sectionId: SectionId, direction: 'up' | 'down') {
  const currentIndex = findSectionIndex(sectionId)
  if (currentIndex === -1) return false
  const neighborIndex = findNeighborIndex(currentIndex, direction)
  return neighborIndex !== -1
}

function moveSection(sectionId: SectionId, direction: 'up' | 'down') {
  const currentIndex = findSectionIndex(sectionId)
  if (currentIndex === -1) return
  const neighborIndex = findNeighborIndex(currentIndex, direction)
  if (neighborIndex === -1) return

  const newLayout = sectionsLayoutStore.layout.map((entry) => ({ ...entry })) as SectionLayoutItem[]
  const [movedEntry] = newLayout.splice(currentIndex, 1)
  if (!movedEntry) return

  if (direction === 'down') {
    const adjustedNeighbor = neighborIndex > currentIndex ? neighborIndex - 1 : neighborIndex
    newLayout.splice(Math.min(adjustedNeighbor + 1, newLayout.length), 0, movedEntry)
  } else {
    newLayout.splice(Math.max(Math.min(neighborIndex, newLayout.length), 0), 0, movedEntry)
  }
  sectionsLayoutStore.setLayout(newLayout)
}

function toggleSectionDisabled(slot: string) {
  const entry = sectionsLayoutStore.layout.find((e) => e.slot === slot)
  if (!entry) return
  sectionsLayoutStore.setDisabled(slot, !Boolean(entry.disabled))
}

function updateSectionTitle(sectionId: SectionId, value: string) {
  sectionTitlesStore.setTitle(sectionId, value)
}

function handleTitleInput(sectionId: SectionId, event: Event) {
  const target = event.target as HTMLInputElement | null
  if (!target) return
  updateSectionTitle(sectionId, target.value)
}

function getSectionTitle(sectionId: string | SectionId) {
  // safe lookup for registry titles when indexing with dynamic strings
  const key = sectionId as string
  const registry = sectionWidgetRegistry as Record<string, { title: string }>
  const entry = registry[key]
  return entry?.title ?? key
}
</script>

<template>
  <TransitionGroup name="section-stack" tag="div" class="sections-stack">
    <div
      v-for="section in orderedSections"
      :key="section.slot"
      class="section-card"
      :class="{ 'edit-mode': editMode }"
    >
      <div class="section-header" :class="{ 'edit-mode': editMode }">
        <div class="section-heading">
          <template v-if="editMode">
            <input
              class="section-title-input"
              type="text"
              :value="sectionTitlesStore.titles[section.sectionId]"
              :placeholder="section.config.title"
              @input="handleTitleInput(section.sectionId, $event)"
            />
          </template>
          <template v-else>
            <h2 class="section-display-title">
              {{ sectionTitlesStore.titles[section.sectionId] }}
            </h2>
          </template>
        </div>
        <div v-if="editMode" class="section-controls">
          <span class="section-type-pill">{{ section.config.title }}</span>
          <button
            class="control-button"
            :disabled="!canMoveSection(section.sectionId, 'up')"
            @click="moveSection(section.sectionId, 'up')"
            aria-label="Move section up"
          >
            <Icon icon="mdi:chevron-up" width="18" height="18" />
          </button>
          <button
            class="control-button"
            :disabled="!canMoveSection(section.sectionId, 'down')"
            @click="moveSection(section.sectionId, 'down')"
            aria-label="Move section down"
          >
            <Icon icon="mdi:chevron-down" width="18" height="18" />
          </button>
          <button
            class="control-button"
            title="Hide section"
            @click="toggleSectionDisabled(section.slot)"
          >
            <Icon icon="mdi:eye-off" width="16" height="16" />
          </button>
        </div>
      </div>
      <component :is="section.config.component" class="section-content" />
    </div>
  </TransitionGroup>

  <Transition name="hidden-panel" appear>
    <div v-if="editMode && hiddenSections.length" class="hidden-sections">
      <h3 class="hidden-title">Hidden Sections</h3>
      <TransitionGroup name="hidden-stack" tag="div" class="hidden-list">
        <div v-for="hs in hiddenSections" :key="hs.slot" class="hidden-item">
          <span class="hidden-name">{{ getSectionTitle(hs.sectionId) }}</span>
          <button
            class="control-button"
            title="Restore section"
            aria-label="Restore section"
            @click="toggleSectionDisabled(hs.slot)"
          >
            <Icon icon="mdi:eye" width="16" height="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Transition>

  <button class="edit-mode-toggle" :class="{ active: editMode }" @click="toggleEditMode">
    <Icon v-if="editMode" icon="hugeicons:edit-off" />
    <Icon v-else icon="hugeicons:edit-02" />
  </button>
</template>

<style scoped>
.sections-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.section-stack-enter-active,
.section-stack-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.section-stack-enter-from,
.section-stack-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.section-stack-move,
.hidden-stack-move {
  transition: transform 0.25s ease;
}

.hidden-panel-enter-active,
.hidden-panel-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.hidden-panel-enter-from,
.hidden-panel-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.hidden-stack-enter-active,
.hidden-stack-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.hidden-stack-enter-from,
.hidden-stack-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.hidden-sections {
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px dashed var(--muted);
  border-radius: 6px;
}
.hidden-title {
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
  color: var(--accent);
}
.hidden-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.hidden-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--surface);
  padding: 1rem;
  border-radius: 2em;
  transition:
    transform 0.25s ease,
    background-color 0.2s ease;
}
.hidden-name {
  flex: 1 1 auto;
}

.section-card {
  position: relative;
  border-radius: 1.5rem;
  border: 1px solid transparent;
  transition:
    border-color 0.2s ease,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.section-card.edit-mode {
  border-color: var(--border);
  padding-top: 0.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.75rem 0.5rem;
  margin-left: 10px;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-display-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text);
}

.section-title-input {
  border: 1px solid var(--border);
  border-radius: 0.85rem;
  padding: 0.4rem 0.8rem;
  font-size: 1rem;
  color: var(--text);
  background: var(--surface);
}

.section-title-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
}

.section-type-pill {
  align-self: flex-start;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--text);
}

.section-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--text);
}

.control-button {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.control-button :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
  color: currentColor;
  flex-shrink: 0;
}

.control-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-button:not(:disabled):hover {
  background: var(--accent);
}

.section-content {
  display: block;
}

.edit-mode-toggle {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  padding: 0;
  background-color: var(--accent);
  color: var(--text);
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 500;
  transition:
    transform 0.15s ease,
    background-color 0.2s;
  z-index: 100;
  background-color: var(--primary);
}

.edit-mode-toggle:hover {
  background-color: var(--accent-soft);
}
</style>
