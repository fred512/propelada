<template>
  <div class="section-title">
    <component :is="icon" v-if="icon" :size="20" />
    <h2>{{ title }}</h2>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  title: { type: String, required: true },
})
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--primary-color);
}

.section-title h2 {
  font-size: 1rem;
  font-weight: 700;
}
</style>
