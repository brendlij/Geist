import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'

type SlotItemMapArray = Array<{ slot: string; item: string | null }>

// Maximum slots for services grid
const MAX_SLOTS = 24

const DEFAULT_SERVICE_COUNT = 3

function createDefaultLayout(): SlotItemMapArray {
  return Array.from({ length: DEFAULT_SERVICE_COUNT }, (_, index) => ({
    slot: `s${index + 1}`,
    item: `service-${index + 1}`,
  }))
}

function compactLayout(entries: SlotItemMapArray): SlotItemMapArray {
  return entries.filter((entry) => entry.item !== null)
}

const STORAGE_KEY = 'geist:services-layout'
const STORAGE_VERSION_KEY = 'geist:services-layout-version'
const CURRENT_VERSION = 2 // Bumped version for new dynamic system

function normalizeLayout(entries: unknown): SlotItemMapArray {
  if (!Array.isArray(entries)) return createDefaultLayout()

  const normalized: SlotItemMapArray = []
  const seenSlots = new Set<string>()
  const seenItems = new Set<string>()

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const slot = String((entry as { slot?: string }).slot ?? '')
    const item = (entry as { item?: string | null }).item ?? null

    if (!slot || seenSlots.has(slot)) continue
    if (item !== null) {
      if (typeof item !== 'string' || seenItems.has(item)) continue
      normalized.push({ slot, item })
      seenSlots.add(slot)
      seenItems.add(item)
    }
  }

  return normalized.length > 0 ? normalized : createDefaultLayout()
}

function loadLayout(): SlotItemMapArray {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      return createDefaultLayout()
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createDefaultLayout()
    }

    const parsed = JSON.parse(raw) as unknown
    return normalizeLayout(parsed)
  } catch (error) {
    console.error('Failed to load services layout from storage', error)
    return createDefaultLayout()
  }
}

export const useServicesLayoutStore = defineStore('servicesLayout', () => {
  const layout = ref<SlotItemMapArray>(compactLayout(loadLayout()))

  // Computed slots based on current layout
  const slots = computed(() => layout.value.map((l) => ({ id: l.slot })))

  // Get the next available service ID
  function getNextServiceId(): string {
    const usedIds = new Set(layout.value.map((l) => l.item).filter(Boolean))
    let i = 1
    while (usedIds.has(`service-${i}`)) {
      i++
    }
    return `service-${i}`
  }

  // Get the next available slot ID
  function getNextSlotId(): string {
    const usedSlots = new Set(layout.value.map((l) => l.slot))
    let i = 1
    while (usedSlots.has(`s${i}`)) {
      i++
    }
    return `s${i}`
  }

  function setLayout(newLayout: SlotItemMapArray) {
    layout.value = compactLayout([...newLayout])
  }

  // Add a new service (always creates a new slot)
  function addService(): string | null {
    if (layout.value.length >= MAX_SLOTS) {
      return null
    }

    const slotId = getNextSlotId()
    const serviceId = getNextServiceId()
    layout.value.push({ slot: slotId, item: serviceId })
    return serviceId
  }

  // Remove a service by removing its slot entry entirely
  function removeService(slotId: string) {
    const index = layout.value.findIndex((l) => l.slot === slotId)
    if (index !== -1) {
      layout.value.splice(index, 1)
    }
  }

  // Remove any empty slots to keep grid tight
  function cleanupEmptySlots() {
    layout.value = compactLayout(layout.value)
  }

  function resetLayout() {
    layout.value = createDefaultLayout()
  }

  watch(
    layout,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch (error) {
        console.error('Failed to persist services layout', error)
      }
    },
    { deep: true },
  )

  return {
    layout,
    slots,
    setLayout,
    addService,
    removeService,
    cleanupEmptySlots,
    resetLayout,
  }
})
