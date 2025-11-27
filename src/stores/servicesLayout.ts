import { ref, watch, computed } from 'vue'
import { defineStore } from 'pinia'

type SlotItemMapArray = Array<{ slot: string; item: string | null }>

// Maximum slots for services grid
const MAX_SLOTS = 24

// Generate slot IDs dynamically
function generateSlots(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `s${i + 1}`)
}

const STORAGE_KEY = 'geist:services-layout'
const STORAGE_VERSION_KEY = 'geist:services-layout-version'
const CURRENT_VERSION = 2 // Bumped version for new dynamic system

function loadLayout(): SlotItemMapArray {
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY)
    if (version !== String(CURRENT_VERSION)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION))
      // Return default with 8 services
      return generateSlots(12).map((slot, i) => ({
        slot,
        item: i < 8 ? `service-${i + 1}` : null,
      }))
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return generateSlots(12).map((slot, i) => ({
        slot,
        item: i < 8 ? `service-${i + 1}` : null,
      }))
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return generateSlots(12).map((slot, i) => ({
        slot,
        item: i < 8 ? `service-${i + 1}` : null,
      }))
    }

    return parsed as SlotItemMapArray
  } catch (error) {
    console.error('Failed to load services layout from storage', error)
    return generateSlots(12).map((slot, i) => ({
      slot,
      item: i < 8 ? `service-${i + 1}` : null,
    }))
  }
}

export const useServicesLayoutStore = defineStore('servicesLayout', () => {
  const layout = ref<SlotItemMapArray>(loadLayout())

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
    layout.value = [...newLayout]
  }

  // Add a new service to the first empty slot, or create a new slot
  function addService(): string | null {
    // First, try to find an empty slot
    const emptySlotIndex = layout.value.findIndex((l) => l.item === null)
    const emptySlot = layout.value[emptySlotIndex]

    if (emptySlotIndex !== -1 && emptySlot) {
      const serviceId = getNextServiceId()
      emptySlot.item = serviceId
      return serviceId
    }

    // If no empty slots and we haven't reached max, add a new slot
    if (layout.value.length < MAX_SLOTS) {
      const slotId = getNextSlotId()
      const serviceId = getNextServiceId()
      layout.value.push({ slot: slotId, item: serviceId })
      return serviceId
    }

    return null // Max slots reached
  }

  // Remove a service from a slot (just clears the slot, doesn't remove it)
  function removeService(slotId: string) {
    const slot = layout.value.find((l) => l.slot === slotId)
    if (slot) {
      slot.item = null
    }
  }

  // Remove empty slots from the end (cleanup)
  function cleanupEmptySlots() {
    // Remove trailing empty slots, but keep at least the slots with items
    let lastSlot = layout.value[layout.value.length - 1]
    while (layout.value.length > 4 && lastSlot && lastSlot.item === null) {
      layout.value.pop()
      lastSlot = layout.value[layout.value.length - 1]
    }
  }

  function resetLayout() {
    layout.value = generateSlots(12).map((slot, i) => ({
      slot,
      item: i < 8 ? `service-${i + 1}` : null,
    }))
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
