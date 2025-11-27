<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useWidgetSettingsStore } from '@/stores/widgetSettings'

defineOptions({
  name: 'HeaderWeatherWidget',
})

interface HeaderWeatherSettings {
  city: string
  units: 'metric' | 'imperial'
  apiKey: string
}

interface Props {
  slotId?: string
}

const props = defineProps<Props>()
const settingsStore = useWidgetSettingsStore()
const showSettings = ref(false)

// Default settings
const defaults: HeaderWeatherSettings = {
  city: 'Vienna',
  units: 'metric',
  apiKey: '',
}

// Get saved settings or use defaults
const settings = computed(() => {
  if (!props.slotId) return defaults
  const saved = settingsStore.getSettings(props.slotId, 'headerWeather')
  return saved ?? defaults
})

// Form state for editing
const formData = ref<HeaderWeatherSettings>({ ...defaults })

// Weather data
const temperature = ref<number | null>(null)
const weatherIcon = ref('mdi:weather-cloudy')
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')

// OpenWeatherMap icon code to mdi icon mapping
function getWeatherIcon(iconCode: string): string {
  const iconMap: Record<string, string> = {
    '01d': 'mdi:weather-sunny',
    '01n': 'mdi:weather-night',
    '02d': 'mdi:weather-partly-cloudy',
    '02n': 'mdi:weather-night-partly-cloudy',
    '03d': 'mdi:weather-cloudy',
    '03n': 'mdi:weather-cloudy',
    '04d': 'mdi:weather-cloudy',
    '04n': 'mdi:weather-cloudy',
    '09d': 'mdi:weather-pouring',
    '09n': 'mdi:weather-pouring',
    '10d': 'mdi:weather-rainy',
    '10n': 'mdi:weather-rainy',
    '11d': 'mdi:weather-lightning',
    '11n': 'mdi:weather-lightning',
    '13d': 'mdi:weather-snowy',
    '13n': 'mdi:weather-snowy',
    '50d': 'mdi:weather-fog',
    '50n': 'mdi:weather-fog',
  }
  return iconMap[iconCode] || 'mdi:weather-cloudy'
}

async function fetchWeather() {
  if (!settings.value.apiKey) {
    error.value = true
    errorMessage.value = 'No API key'
    loading.value = false
    return
  }

  loading.value = true
  error.value = false
  errorMessage.value = ''

  try {
    // First, geocode the city using OpenWeatherMap Geocoding API
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(settings.value.city)}&limit=1&appid=${settings.value.apiKey}`,
    )

    if (!geoResponse.ok) {
      throw new Error('Geocoding failed')
    }

    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      throw new Error('City not found')
    }

    const { lat, lon } = geoData[0]

    // Then fetch weather using OpenWeatherMap API
    const unit = settings.value.units === 'metric' ? 'metric' : 'imperial'
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${settings.value.apiKey}`,
    )

    if (!weatherResponse.ok) {
      throw new Error('Weather fetch failed')
    }

    const weatherData = await weatherResponse.json()

    temperature.value = Math.round(weatherData.main.temp)
    weatherIcon.value = getWeatherIcon(weatherData.weather[0].icon)
  } catch (e) {
    error.value = true
    errorMessage.value = e instanceof Error ? e.message : 'Error'
    console.error('Weather fetch error:', e)
  } finally {
    loading.value = false
  }
}

let intervalId: number | null = null

onMounted(() => {
  fetchWeather()
  // Refresh every 10 minutes
  intervalId = window.setInterval(fetchWeather, 10 * 60 * 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Refetch when settings change
watch(
  () => settings.value,
  () => {
    fetchWeather()
  },
  { deep: true },
)

function openSettings() {
  formData.value = { ...settings.value }
  showSettings.value = true
}

function saveSettings() {
  if (props.slotId) {
    settingsStore.setSettings(props.slotId, 'headerWeather', { ...formData.value })
  }
  showSettings.value = false
}

function closeSettings() {
  showSettings.value = false
}

const unitSymbol = computed(() => (settings.value.units === 'metric' ? '°C' : '°F'))

// Expose openSettings so parent can call it
defineExpose({ openSettings })
</script>

<template>
  <div class="header-weather">
    <template v-if="loading">
      <Icon icon="mdi:loading" class="weather-icon spinning" />
    </template>
    <template v-else-if="error">
      <Icon icon="mdi:weather-cloudy-alert" class="weather-icon error" />
      <span v-if="!settings.apiKey" class="weather-temp error-text">API</span>
    </template>
    <template v-else>
      <Icon :icon="weatherIcon" class="weather-icon" />
      <span class="weather-temp">{{ temperature }}{{ unitSymbol }}</span>
    </template>

    <!-- Settings Modal -->
    <Teleport to="body">
      <div v-if="showSettings" class="modal-overlay" @click.self="closeSettings">
        <div class="modal">
          <div class="modal-header">
            <h3>Weather Settings</h3>
            <button class="close-button" @click="closeSettings">
              <Icon icon="mdi:close" width="24" height="24" />
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="apiKey">OpenWeatherMap API Key</label>
              <input
                id="apiKey"
                type="password"
                v-model="formData.apiKey"
                placeholder="Enter your API key"
                class="form-input"
              />
              <small class="form-hint">
                Get a free key at
                <a href="https://openweathermap.org/api" target="_blank">openweathermap.org</a>
              </small>
            </div>
            <div class="form-group">
              <label for="city">City</label>
              <input
                id="city"
                type="text"
                v-model="formData.city"
                placeholder="Enter city name"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="units">Units</label>
              <select id="units" v-model="formData.units" class="form-input">
                <option value="metric">Celsius (°C)</option>
                <option value="imperial">Fahrenheit (°F)</option>
              </select>
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
.header-weather {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  height: 100%;
  width: 100%;
}

.weather-icon {
  font-size: 1.25rem;
  color: var(--accent);
}

.weather-icon.spinning {
  animation: spin 1s linear infinite;
}

.weather-icon.error {
  color: var(--text-muted);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.weather-temp {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
}

.error-text {
  font-size: 0.65rem;
  color: var(--text-muted);
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

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-hint {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.form-hint a {
  color: var(--accent);
  text-decoration: none;
}

.form-hint a:hover {
  text-decoration: underline;
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
