<template>
  <div class="page-header-section">
    <h1 class="page-header-title">{{ title }}</h1>
    <p v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.page-header-section {
  padding-top: 15px;
  margin-bottom: 4px;
}

.page-header-title {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  position: relative;
  padding-bottom: 10px;
}

.page-header-title::after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background: var(--primary-color);
  margin: 8px auto 0;
  border-radius: 2px;
}

.page-header-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: 4px;
}
</style>
