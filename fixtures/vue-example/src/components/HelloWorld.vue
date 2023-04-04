<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCounterStore } from '~/stores/counter'

const counterStore = useCounterStore()
const { count, doubleCount } = storeToRefs(counterStore)

defineProps<{ msg: string }>()

</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button
      type="button"
      @click="counterStore.increment"
    >
      count is {{ count }}
      <br>
      double count is {{ doubleCount }}
    </button>
  </div>
</template>

<style scoped></style>
