<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content participant-search-modal" @click.stop>
      <div class="modal-header">
        <h2 class="search-title">Adicionar à Lista</h2>
        <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
      </div>

      <div class="ps-search-row">
        <input
          v-model="query"
          type="text"
          placeholder="Nome ou apelido..."
          class="ps-input"
          @input="$emit('search', query)"
        />
      </div>

      <div class="ps-list">
        <div v-if="isSearching" class="ps-loading">Buscando...</div>
        <div v-else-if="results.length === 0" class="ps-empty">
          Nenhum participante encontrado
        </div>
        <div
          v-for="p in results"
          :key="p.IdParticipante"
          class="ps-item"
          :class="{ 'ps-item-selected': selected.has(p.IdParticipante) }"
          @click="$emit('toggle', p)"
        >
          <div class="ps-info">
            <span class="ps-name">{{ p.Apelido || p.apelido || p.Nome || p.nome }}</span>
            <span class="ps-type">{{ p.TipoParticipante }}</span>
          </div>
          <div class="ps-checkbox" :class="{ 'ps-checked': selected.has(p.IdParticipante) }">
            <Check v-if="selected.has(p.IdParticipante)" :size="14" />
          </div>
        </div>
      </div>

      <div class="ps-footer">
        <button
          class="ps-btn-add"
          :disabled="selected.size === 0 || isAdding"
          @click="$emit('add-selected')"
        >
          {{ isAdding ? 'Adicionando...' : `Adicionar (${selected.size})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Check } from 'lucide-vue-next'

defineProps({
  modelValue: Boolean,
  results: { type: Array, default: () => [] },
  selected: { type: Map, default: () => new Map() },
  isSearching: { type: Boolean, default: false },
  isAdding: { type: Boolean, default: false },
})

defineEmits(['close', 'search', 'toggle', 'add-selected'])

const query = ref('')
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

.participant-search-modal {
  max-width: 380px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.search-title {
  color: #1C6A4E;
  font-size: 1.4rem;
  font-weight: 700;
}

.ps-search-row {
  margin-bottom: 12px;
}

.ps-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.ps-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
}

.ps-loading, .ps-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.ps-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.ps-item:hover { background: rgba(0,230,118,0.08); }
.ps-item-selected { background: rgba(0,230,118,0.12); border-color: var(--primary-color); }

.ps-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.ps-type {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.ps-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.ps-checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #1A1C1E;
}

.ps-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.ps-btn-add {
  width: 100%;
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

.ps-btn-add:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
