<template>
  <div class="empty-state">
    <component :is="icon" v-if="icon" :size="48" class="empty-icon" />
    <p class="empty-message">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: [Object, Function], default: null },
  message: { type: String, required: true },
})
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-message {
  color: var(--text-secondary);
  font-size: 0.95rem;
  max-width: 320px;
  line-height: 1.5;
}
</style>
