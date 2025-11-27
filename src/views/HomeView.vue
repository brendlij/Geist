<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createSwapy, type Swapy } from 'swapy'
import QuickNotesWidget from '@/components/widgets/QuickNotesWidget.vue'
import Todolist from '@/components/widgets/Todolist.vue'
import Clock from '@/components/widgets/Clock.vue'
import WidgetWrapper from '@/components/app/WidgetWrapper.vue'

const swapy = ref<Swapy | null>(null)
const container = ref<HTMLElement | null>()

onMounted(() => {
  if (container.value) {
    swapy.value = createSwapy(container.value, {
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    })

    // swapy.value.enable(false)
    // swapy.value.destroy()
    // console.log(swapy.value.slotItemMap())

    swapy.value.onBeforeSwap((event) => {
      console.log('beforeSwap', event)
      // This is for dynamically enabling and disabling swapping.
      // Return true to allow swapping, and return false to prevent swapping.
      return true
    })

    swapy.value.onSwapStart((event) => {
      console.log('start', event)
    })

    swapy.value.onSwap((event) => {
      console.log('swap', event)
    })

    swapy.value.onSwapEnd((event) => {
      console.log('end', event)
    })
  }
})

onUnmounted(() => {
  swapy.value?.destroy()
})
</script>

<template>
  <div class="container" ref="container">
    <div class="slot top" data-swapy-slot="a">
      <div class="item item-a" data-swapy-item="a">
        <WidgetWrapper title="My Widget">
          <QuickNotesWidget />
        </WidgetWrapper>
      </div>
    </div>
    <div class="middle">
      <div class="slot middle-left" data-swapy-slot="b">
        <div class="item item-b" data-swapy-item="b">
          <WidgetWrapper title="To-Do List">
            <Todolist />
          </WidgetWrapper>
        </div>
      </div>
      <div class="slot middle-right" data-swapy-slot="c">
        <div class="item item-c" data-swapy-item="c">
          <WidgetWrapper title="Clock">
            <Clock />
          </WidgetWrapper>
        </div>
      </div>
    </div>
    <div class="slot bottom" data-swapy-slot="d">
      <div class="item item-d" data-swapy-item="d">
        <div>D</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
}

.middle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.slot {
  min-height: 300px;
}

.item {
  width: 100%;
  height: 100%;
}

.card {
  background-color: var(--accent-soft);
}
</style>
