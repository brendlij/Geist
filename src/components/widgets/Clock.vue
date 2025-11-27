<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'ClockWidget',
})

const time = ref('00:00:00')
const date = ref('')
let intervalId: number | null = null

function updateTime() {
  const now = new Date()

  // Format time HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  time.value = `${hours}:${minutes}:${seconds}`

  // Format date
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
</script>

<template>
  <div class="clock">
    <div class="clock-time">{{ time }}</div>
    <div class="clock-date">{{ date }}</div>
  </div>
</template>

<style scoped>
.clock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  height: 100%;
  padding: var(--space-lg);
}

.clock-time {
  font-size: 3rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: var(--accent);
  letter-spacing: 0.1em;
  line-height: 1;
}

.clock-date {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
