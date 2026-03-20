<template>
  <div class="loading-state">
    <div class="loading-spinner" />
    <p class="loading-message">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: 'Carregando...' },
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-message {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}
</style>
