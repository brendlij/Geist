<script setup lang="ts">
import { computed, ref, inject, type Ref } from 'vue'
import { useWidgetSettingsStore, type ServiceSettings } from '@/stores/widgetSettings'

defineOptions({
  name: 'ServiceWidget',
})

interface Props {
  slotId?: string
}

const props = defineProps<Props>()

const settingsStore = useWidgetSettingsStore()
const editMode = inject<Ref<boolean>>('editMode')
const showSettings = ref(false)

// Default values
const defaults: ServiceSettings = {
  name: 'My Service',
  url: 'http://localhost',
  icon: '🔗',
  description: 'Click to open',
}

// Get saved settings or use defaults
const settings = computed(() => {
  if (!props.slotId) return defaults
  const saved = settingsStore.getSettings(props.slotId, 'service')
  return saved ?? defaults
})

// Form state for editing
const formData = ref<ServiceSettings>({ ...defaults })

function openSettings() {
  formData.value = { ...settings.value }
  showSettings.value = true
}

function saveSettings() {
  if (props.slotId) {
    settingsStore.setSettings(props.slotId, 'service', { ...formData.value })
  }
  showSettings.value = false
}

function closeSettings() {
  showSettings.value = false
}

// Check if icon is a URL (image) or emoji/text
const isImageIcon = computed(() => {
  const icon = settings.value.icon
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')
})

function openService() {
  if (editMode?.value) return // Don't open in edit mode
  window.open(settings.value.url, '_blank', 'noopener,noreferrer')
}

// Expose openSettings so parent can call it
defineExpose({ openSettings })
</script>

<template>
  <div class="service-widget">
    <div class="service" @click="openService">
      <div class="service-icon">
        <img v-if="isImageIcon" :src="settings.icon" :alt="settings.name" class="icon-image" />
        <span v-else>{{ settings.icon }}</span>
      </div>
      <div class="service-info">
        <div class="service-name">{{ settings.name }}</div>
        <div v-if="settings.description" class="service-description">
          {{ settings.description }}
        </div>
        <div class="service-url">{{ settings.url }}</div>
      </div>
    </div>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="closeSettings">
        <div class="modal">
          <div class="modal-header">
            <h3>Service Settings</h3>
            <button class="close-button" @click="closeSettings">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="service-name">Name</label>
              <input
                id="service-name"
                v-model="formData.name"
                type="text"
                placeholder="Service Name"
              />
            </div>
            <div class="form-group">
              <label for="service-url">URL</label>
              <input id="service-url" v-model="formData.url" type="url" placeholder="http://..." />
            </div>
            <div class="form-group">
              <label for="service-icon">Icon (emoji or image URL)</label>
              <input
                id="service-icon"
                v-model="formData.icon"
                type="text"
                placeholder="🔗 or https://..."
              />
            </div>
            <div class="form-group">
              <label for="service-description">Description</label>
              <input
                id="service-description"
                v-model="formData.description"
                type="text"
                placeholder="Short description"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeSettings">Cancel</button>
            <button class="btn btn-primary" @click="saveSettings">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.service-widget {
  height: 100%;
}

.service {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: 1rem;
  background-color: var(--accent-soft);
  cursor: pointer;
  transition: all 0.2s;
}

.service:hover {
  background-color: var(--accent);
  transform: translateY(-2px);
}

.service-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background);
  border-radius: 0.75rem;
  flex-shrink: 0;
  overflow: hidden;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.service-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.service-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-description {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-url {
  font-size: var(--font-size-xs);
  color: var(--accent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--background);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  line-height: 1;
}

.close-button:hover {
  color: var(--text);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background-color: var(--accent-soft);
  color: var(--text);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
}

.btn {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: var(--accent-soft);
  color: var(--text);
}

.btn-secondary:hover {
  background-color: var(--accent);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>
