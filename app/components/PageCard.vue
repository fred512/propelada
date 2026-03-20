<template>
  <div class="page-card" :class="{ 'no-padding': noPadding, 'no-overflow': noOverflow }">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  noPadding: { type: Boolean, default: false },
  noOverflow: { type: Boolean, default: false },
})
</script>

<style scoped>
.page-card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.page-card.no-padding {
  padding: 0;
}

.page-card.no-overflow {
  overflow: visible;
}
</style>
