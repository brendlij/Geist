<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useWidgetSettingsStore, type HeaderClockSettings } from '@/stores/widgetSettings'

defineOptions({
  name: 'HeaderClockWidget',
})

interface Props {
  slotId?: string
}

const props = defineProps<Props>()
const settingsStore = useWidgetSettingsStore()
const showSettings = ref(false)

// Default settings
const defaults: HeaderClockSettings = {
  showSeconds: false,
  showDate: true,
  use24Hour: true,
}

// Get saved settings or use defaults
const settings = computed(() => {
  if (!props.slotId) return defaults
  const saved = settingsStore.getSettings(props.slotId, 'headerClock')
  return saved ?? defaults
})

// Form state for editing
const formData = ref<HeaderClockSettings>({ ...defaults })

function openSettings() {
  formData.value = { ...settings.value }
  showSettings.value = true
}

function saveSettings() {
  if (props.slotId) {
    settingsStore.setSettings(props.slotId, 'headerClock', { ...formData.value })
  }
  showSettings.value = false
}

function closeSettings() {
  showSettings.value = false
}

const time = ref('00:00')
const date = ref('')
let intervalId: number | null = null

function updateTime() {
  const now = new Date()
  let hours: string | number = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  if (!settings.value.use24Hour) {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    time.value = settings.value.showSeconds
      ? `${hours}:${minutes}:${seconds} ${ampm}`
      : `${hours}:${minutes} ${ampm}`
  } else {
    hours = String(hours).padStart(2, '0')
    time.value = settings.value.showSeconds
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }
  date.value = now.toLocaleDateString('en-US', options)
}

onMounted(() => {
  updateTime()
  intervalId = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Expose openSettings so parent can call it
defineExpose({ openSettings })
</script>

<template>
  <div class="header-clock">
    <span class="clock-time">{{ time }}</span>
    <span v-if="settings.showDate" class="clock-date">{{ date }}</span>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="closeSettings">
        <div class="modal">
          <div class="modal-header">
            <h3>Clock Settings</h3>
            <button class="close-button" @click="closeSettings">
              <Icon icon="mdi:close" width="24" height="24" />
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="formData.showSeconds" />
                <span>Show Seconds</span>
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="formData.showDate" />
                <span>Show Date</span>
              </label>
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="formData.use24Hour" />
                <span>24 Hour Format</span>
              </label>
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
.header-clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  height: 100%;
  width: 100%;
}

.clock-time {
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: var(--accent);
  letter-spacing: 0.05em;
  line-height: 1.2;
}

.clock-date {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  line-height: 1;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background-color: var(--surface, var(--background));
  border: 1px solid var(--border);
  border-radius: 1rem;
  width: 90%;
  max-width: 350px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text);
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: 0.375rem;
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
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text);
}

.checkbox-group input[type='checkbox'] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--accent);
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
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
