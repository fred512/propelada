<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content search-modal" @click.stop>
      <div class="modal-header">
        <h2 class="search-title">Selecione uma Partida</h2>
        <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
      </div>

      <div class="search-filters">
        <div class="date-filter-row">
          <input type="date" v-model="startDate" class="date-input-native" />
          <span class="filter-sep">até</span>
          <input type="date" v-model="endDate" class="date-input-native" />
          <button v-if="dateFilterActive" class="btn-clear-filter" @click="startDate = ''; endDate = ''">✕</button>
        </div>
      </div>

      <div class="matches-search-list">
        <div class="matches-search-scroll">
          <div
            v-for="m in filteredMatches"
            :key="m.idPartida"
            class="match-search-item"
            @click="$emit('select', m.idPartida)"
          >
            <span class="match-date">{{ formatDate(m.Data) }}</span>
            <Check v-if="m.idPartida == currentId" :size="20" class="selected-check" />
            <div v-else class="check-box"></div>
          </div>
        </div>
        <button
          v-if="!dateFilterActive && matches.length > 5"
          class="btn-load-more"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Mostrar últimas 5' : `Ver todas (${matches.length})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { X, Check } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  matches: { type: Array, default: () => [] },
  currentId: { type: [String, Number], default: null },
})

defineEmits(['close', 'select'])

const startDate = ref('')
const endDate = ref('')
const showAll = ref(false)

const dateFilterActive = computed(() => startDate.value || endDate.value)

const filteredMatches = computed(() => {
  if (!props.matches.length) return []
  let result = props.matches
  if (dateFilterActive.value) {
    result = result.filter(m => {
      if (!m.Data) return false
      const d = m.Data.split('T')[0]
      if (startDate.value && d < startDate.value) return false
      if (endDate.value && d > endDate.value) return false
      return true
    })
  } else if (!showAll.value) {
    result = result.slice(0, 5)
  }
  return result
})

const formatDate = (date) => {
  if (!date) return '--/--/----'
  const [year, month, day] = date.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
  border: 1px solid var(--border-color);
  animation: modalSpring 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dark .modal-content {
  background: rgba(9,15,28,0.94);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 24px 64px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@keyframes modalSpring {
  from { opacity: 0; transform: scale(0.92) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.search-modal { max-width: 400px; }

.search-title {
  color: #1C6A4E;
  font-size: 1.4rem;
  font-weight: 700;
}

.search-filters { margin-bottom: 20px; }

.date-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.date-input-native {
  flex: 1;
  min-width: 120px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 0.85rem;
  color-scheme: dark;
}

:root:not(.dark) .date-input-native { color-scheme: light; }

.filter-sep {
  color: var(--text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
}

.btn-clear-filter {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 0.85rem;
}

.matches-search-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.matches-search-scroll {
  max-height: 50vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border-color);
}

.match-search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: background 0.2s;
}

.match-search-item:hover { background: rgba(0,200,83,0.08); }

.match-date {
  font-size: 1.1rem;
  color: #1C6A4E;
  font-weight: 600;
}

.selected-check { color: #1C6A4E; }

.check-box {
  width: 20px;
  height: 20px;
  border: 2px solid #1C6A4E;
  border-radius: 4px;
}

.btn-load-more {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  border-top: 1px solid var(--border-color);
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
}
</style>
