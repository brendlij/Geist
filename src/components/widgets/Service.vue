<script setup lang="ts">
import { computed, ref, inject, type Ref, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
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
  icon: 'mdi:link',
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
  // Re-check status after saving new URL
  checkStatus()
}

function closeSettings() {
  showSettings.value = false
}

// Check if icon is a URL (image)
const isImageIcon = computed(() => {
  const icon = settings.value.icon
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')
})

// Check if icon is an Iconify icon (contains : like mdi:home, hugeicons:link)
const isIconifyIcon = computed(() => {
  const icon = settings.value.icon
  return icon.includes(':') && !isImageIcon.value
})

// Status indicator for ping checks
const status = ref<'online' | 'offline' | 'unknown'>('unknown')
let pingInterval: ReturnType<typeof setInterval> | null = null

// Check if service is reachable
async function checkStatus() {
  const url = settings.value.url
  if (!url || url === 'http://localhost') {
    status.value = 'unknown'
    return
  }

  try {
    // Use a HEAD request with no-cors mode to check reachability
    // This won't give us response details but will tell us if the server responds
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors', // Allows cross-origin requests without CORS headers
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // With no-cors mode, we get an opaque response (type: 'opaque')
    // If we get here without error, the server is reachable
    void response // Suppress unused variable warning
    status.value = 'online'
  } catch {
    // Network error, timeout, or server unreachable
    status.value = 'offline'
  }
}

// Start periodic status checks
function startStatusChecks() {
  // Initial check
  checkStatus()

  // Check every 2 minutes
  pingInterval = setInterval(checkStatus, 120000)
}

// Stop status checks
function stopStatusChecks() {
  if (pingInterval) {
    clearInterval(pingInterval)
    pingInterval = null
  }
}

// Watch for URL changes
watch(
  () => settings.value.url,
  () => {
    status.value = 'unknown'
    checkStatus()
  },
)

onMounted(() => {
  startStatusChecks()
})

onUnmounted(() => {
  stopStatusChecks()
})

function openService() {
  if (editMode?.value) return // Don't open in edit mode
  // Re-check status when clicking on the service
  checkStatus()
  window.open(settings.value.url, '_blank', 'noopener,noreferrer')
}

// Expose openSettings so parent can call it
defineExpose({ openSettings })
</script>

<template>
  <div class="service-widget">
    <div class="service" @click="openService">
      <div class="service-icon-wrapper">
        <div class="service-icon">
          <Icon v-if="isIconifyIcon" :icon="settings.icon" width="28" height="28" />
          <img
            v-else-if="isImageIcon"
            :src="settings.icon"
            :alt="settings.name"
            class="icon-image"
          />
          <span v-else class="emoji-icon">{{ settings.icon }}</span>
        </div>
        <span
          class="status-badge"
          :class="status"
          :title="status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Unknown'"
        />
      </div>
      <div class="service-name">{{ settings.name }}</div>
    </div>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="closeSettings">
        <div class="modal">
          <div class="modal-header">
            <h3>Service Settings</h3>
            <button class="close-button" @click="closeSettings">
              <Icon icon="mdi:close" width="24" height="24" />
            </button>
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
              <label for="service-icon">Icon</label>
              <input
                id="service-icon"
                v-model="formData.icon"
                type="text"
                placeholder="mdi:home, hugeicons:link, 🔗, or URL"
              />
              <small class="form-hint">Iconify (mdi:icon), emoji, or image URL</small>
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
  width: 100%;
}

.service {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s;
}

.service:hover {
  transform: scale(1.05);
}

.service:hover .service-icon {
  background-color: var(--accent);
}

.service-icon-wrapper {
  position: relative;
}

.service-icon {
  font-size: 2rem;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-soft);
  border-radius: 1rem;
  flex-shrink: 0;
  overflow: hidden;
  transition: background-color 0.2s;
}

.status-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--background);
  transition: background-color 0.2s;
}

.status-badge.online {
  background-color: #86efac; /* pastel green */
}

.status-badge.offline {
  background-color: #fca5a5; /* pastel red */
}

.status-badge.unknown {
  background-color: #d1d5db; /* pastel gray */
}

.icon-image {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.emoji-icon {
  font-size: 1.75rem;
}

.service-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 0.25rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-button:hover {
  color: var(--text);
  background-color: var(--accent-soft);
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

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
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
  background-color: var(--accent);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>
