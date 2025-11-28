<script setup lang="ts">
import { computed, ref, inject, type Ref, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useWidgetSettingsStore, type ServiceSettings } from '@/stores/widgetSettings'
import { resolveServiceIcon, DEFAULT_SERVICE_ICON } from '@/utils/serviceIcons'

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
const savingSettings = ref(false)

type AutoIconStatus = 'idle' | 'loading' | 'success' | 'error'
const autoIconStatus = ref<AutoIconStatus>('idle')
const autoIconError = ref<string | null>(null)
const iconManuallyEdited = ref(false)

// Default values
const defaults: ServiceSettings = {
  name: 'My Service',
  url: 'http://localhost',
  icon: DEFAULT_SERVICE_ICON,
  description: 'Click to open',
}

// Get saved settings or use defaults
const settings = computed(() => {
  if (!props.slotId) return { ...defaults }
  const saved = settingsStore.getSettings(props.slotId, 'service')
  return { ...defaults, ...(saved ?? {}) }
})

// Form state for editing
const formData = ref<ServiceSettings>({ ...defaults })

function openSettings() {
  formData.value = { ...settings.value }
  showSettings.value = true
  resetIconSessionState()
}

async function saveSettings() {
  if (savingSettings.value) return
  savingSettings.value = true
  try {
    if (props.slotId) {
      // auto detect before saving (no Button nötig)
      await autoDetectIcon()
      settingsStore.setSettings(props.slotId, 'service', { ...formData.value })
    }
    showSettings.value = false
    checkStatus()
  } finally {
    savingSettings.value = false
  }
}

function closeSettings() {
  showSettings.value = false
  autoIconStatus.value = 'idle'
  autoIconError.value = null
}

// Check if icon is a URL (image)
const isImageIcon = computed(() => {
  const icon = settings.value.icon
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')
})

// Check if icon is an Iconify icon
const isIconifyIcon = computed(() => {
  const icon = settings.value.icon
  return icon.includes(':') && !isImageIcon.value
})

const previewIconValue = computed(() => formData.value.icon?.trim() || DEFAULT_SERVICE_ICON)
const previewIsImageIcon = computed(() => {
  const icon = previewIconValue.value
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')
})
const previewIsIconifyIcon = computed(() => {
  const icon = previewIconValue.value
  return icon.includes(':') && !previewIsImageIcon.value
})
const canAutoDetect = computed(() => {
  const url = formData.value.url?.trim()
  const name = formData.value.name?.trim()
  return Boolean((url && url !== defaults.url) || name)
})

const status = ref<'online' | 'offline' | 'unknown'>('unknown')
let pingInterval: ReturnType<typeof setInterval> | null = null

async function checkStatus() {
  const url = settings.value.url
  if (!url || url === 'http://localhost') {
    status.value = 'unknown'
    return
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    void response
    status.value = 'online'
  } catch {
    status.value = 'offline'
  }
}

function startStatusChecks() {
  checkStatus()
  pingInterval = setInterval(checkStatus, 120000)
}

function stopStatusChecks() {
  if (pingInterval) {
    clearInterval(pingInterval)
    pingInterval = null
  }
}

watch(
  () => settings.value.url,
  () => {
    status.value = 'unknown'
    checkStatus()
  },
)

watch(
  () => formData.value.url,
  (newUrl, oldUrl) => {
    if (newUrl === oldUrl) return
    autoIconStatus.value = 'idle'
    autoIconError.value = null
  },
)

watch(
  () => formData.value.name,
  (newName, oldName) => {
    if (newName === oldName) return
    autoIconStatus.value = 'idle'
    autoIconError.value = null
  },
)

// NEW: Debounced Auto-Detection bei Änderungen an Name/URL
let autoIconDebounce: number | null = null

watch(
  () => [formData.value.url, formData.value.name],
  () => {
    if (!canAutoDetect.value || iconManuallyEdited.value) return

    if (autoIconDebounce !== null) {
      window.clearTimeout(autoIconDebounce)
    }

    autoIconDebounce = window.setTimeout(() => {
      void autoDetectIcon()
    }, 600)
  },
)

onMounted(() => {
  startStatusChecks()
})

onUnmounted(() => {
  stopStatusChecks()
})

function openService() {
  if (editMode?.value) return
  checkStatus()
  window.open(settings.value.url, '_blank', 'noopener,noreferrer')
}

function markIconManuallyEdited() {
  iconManuallyEdited.value = true
  autoIconStatus.value = 'idle'
  autoIconError.value = null
}

function resetIconSessionState() {
  iconManuallyEdited.value = !isLikelyAutoIconSource(formData.value.icon)
  autoIconStatus.value = 'idle'
  autoIconError.value = null
}

function isLikelyAutoIconSource(icon?: string) {
  if (!icon) return false
  if (icon === DEFAULT_SERVICE_ICON) return true
  return icon.includes('cdn.jsdelivr.net/gh/selfhst/icons') || icon.endsWith('/favicon.ico')
}

async function autoDetectIcon() {
  const url = formData.value.url?.trim()
  const name = formData.value.name?.trim()

  if ((!url || url === defaults.url) && !name) {
    return
  }
  if (iconManuallyEdited.value) {
    return
  }

  autoIconStatus.value = 'loading'
  autoIconError.value = null

  try {
    const previousIcon = formData.value.icon
    const resolvedIcon = await resolveServiceIcon(url, name)
    formData.value.icon = resolvedIcon
    iconManuallyEdited.value = false

    if (resolvedIcon === DEFAULT_SERVICE_ICON) {
      autoIconStatus.value = 'error'
      autoIconError.value = '[autoDetectIcon] No icon found. Using fallback.'
    } else if (resolvedIcon !== previousIcon) {
      autoIconStatus.value = 'success'
      autoIconError.value = null
    } else {
      autoIconStatus.value = 'idle'
      autoIconError.value = null
    }
  } catch (err) {
    console.error('[autoDetectIcon] Failed to resolve icon:', err)
    formData.value.icon = DEFAULT_SERVICE_ICON
    iconManuallyEdited.value = false
    autoIconStatus.value = 'error'
    autoIconError.value =
      err instanceof Error ? `[autoDetectIcon] ${err.message}` : '[autoDetectIcon] Unknown error'
  }
}

// Expose openSettings so parent can call it
defineExpose({ openSettings })
</script>

<template>
  <div class="service-widget">
    <div class="service" :class="{ 'edit-mode': editMode }" @click="openService">
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
              <div class="icon-preview" aria-live="polite" aria-atomic="true">
                <span class="icon-preview-label">Preview</span>
                <div class="icon-preview-box">
                  <Icon
                    v-if="previewIsIconifyIcon"
                    :icon="previewIconValue"
                    width="28"
                    height="28"
                  />
                  <img
                    v-else-if="previewIsImageIcon"
                    :src="previewIconValue"
                    :alt="formData.name"
                    class="icon-image"
                  />
                  <span v-else class="emoji-icon">{{ previewIconValue }}</span>
                </div>
              </div>
              <div class="icon-input-row">
                <input
                  id="service-icon"
                  v-model="formData.icon"
                  type="text"
                  placeholder="mdi:home, hugeicons:link, 🔗, or URL"
                  @input="markIconManuallyEdited"
                />
              </div>

              <small v-if="autoIconError" class="form-hint error">
                {{ autoIconError }}
              </small>
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
            <button class="btn btn-primary" :disabled="savingSettings" @click="saveSettings">
              {{ savingSettings ? 'Saving...' : 'Save' }}
            </button>
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
  position: relative;
}

.service {
  position: relative;
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

.service.edit-mode {
  opacity: 0.7;
  pointer-events: none;
}

.service:not(.edit-mode):hover {
  transform: scale(1.05);
}

.service:not(.edit-mode):hover .service-icon {
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

.icon-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.icon-preview-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.icon-preview-box {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background-color: var(--accent-soft);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
}

.icon-input-row {
  display: flex;
  gap: 0.5rem;
}

.icon-input-row input {
  flex: 1 1 auto;
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

.form-hint.success {
  color: var(--accent);
}

.form-hint.error {
  color: #f87171;
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
