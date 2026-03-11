<template>
  <button @click="toggleTheme" class="theme-toggle" :title="`Mudar para modo ${isDark ? 'claro' : 'escuro'}`">
    <Sun v-if="isDark" :size="20" />
    <Moon v-else :size="20" />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
const colorMode = (() => {
  try {
    return useColorMode()
  } catch (e) {
    return { value: 'dark', preference: 'dark' }
  }
})()

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<style scoped>
.theme-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.theme-toggle:hover {
  background: var(--primary-color);
  color: white;
}
</style>
