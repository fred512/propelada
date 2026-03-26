<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ targetTeam ? `Adicionar ao Time ${targetTeam}` : 'Lista de Espera' }}</h2>
        <div style="display:flex;gap:8px;align-items:center;">
          <button v-if="!targetTeam" class="icon-btn search-blue" style="width:36px;height:36px;" title="Buscar participante" @click="$emit('open-search')">
            <Search :size="16" />
          </button>
          <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
        </div>
      </div>
      <div class="waiting-list-body">
        <div v-if="waitingList.length === 0" class="empty-list">Ninguém na espera.</div>

        <!-- Modo seleção: aberto pelo "+" do time -->
        <template v-if="targetTeam">
          <div
            v-for="w in waitingList"
            :key="w.idJogadorLista"
            class="waiting-item"
            :class="{ 'ps-item-selected': selectedWaitingPlayers.has(w.idJogadorLista) }"
            style="cursor:pointer; border: 1px solid transparent;"
            @click="$emit('toggle-selection', w)"
          >
            <span>{{ w.Apelido || '?' }}</span>
            <div class="ps-checkbox" :class="{ 'ps-checked': selectedWaitingPlayers.has(w.idJogadorLista) }">
              <Check v-if="selectedWaitingPlayers.has(w.idJogadorLista)" :size="14" />
            </div>
          </div>
        </template>

        <!-- Modo normal: aberto pelo botão de lista de espera -->
        <template v-else>
          <div v-for="w in waitingList" :key="w.idJogadorLista" class="waiting-item">
            <span>{{ w.Apelido || '?' }}</span>
            <button class="btn-delete-waiting" @click="$emit('remove', w)" title="Remover da lista">
              <Trash2 :size="16" />
            </button>
          </div>
        </template>
      </div>

      <div v-if="targetTeam" class="ps-footer">
        <button
          class="ps-btn-add"
          :disabled="selectedWaitingPlayers.size === 0 || isAdding"
          @click="$emit('add-selected')"
        >
          {{ isAdding ? 'Adicionando...' : `Adicionar (${selectedWaitingPlayers.size})` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, Search, Check, Trash2 } from 'lucide-vue-next'

defineProps({
  modelValue: Boolean,
  waitingList: { type: Array, default: () => [] },
  targetTeam: { type: String, default: '' },
  selectedWaitingPlayers: { type: Map, default: () => new Map() },
  isAdding: { type: Boolean, default: false },
})

defineEmits(['close', 'open-search', 'toggle-selection', 'remove', 'add-selected'])
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

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: var(--bg-primary);
  color: var(--text-secondary);
}

.search-blue { color: #2196F3; }

.waiting-list-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.waiting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.btn-delete-waiting {
  background: none;
  border: none;
  color: #ef5350;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}

.btn-delete-waiting:hover { opacity: 1; }

.ps-item-selected { background: rgba(0,230,118,0.12); border-color: var(--primary-color) !important; }

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
