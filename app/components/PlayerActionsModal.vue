<template>
  <div v-if="modelValue && selectedPlayer" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content actions-modal" @click.stop>
      <div class="modal-header">
        <div>
          <h2 class="actions-player-name">{{ selectedPlayer.Nome }}</h2>
          <p class="actions-player-sub">Ocorrências da Partida</p>
        </div>
        <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
      </div>

      <div v-if="actionError" class="action-error-msg">
        ⚠️ {{ actionError }}
      </div>

      <div v-if="selectedPlayer.Substituido === true" class="sub-warning">
        <RefreshCw :size="16" />
        Jogador substituído — ações bloqueadas
      </div>

      <!-- Gols Pro -->
      <div class="action-row" :class="{ 'row-disabled': selectedPlayer.Substituido === true }">
        <span class="action-label">
          <SoccerBall class="action-icon goal-green" />
          Gols
        </span>
        <div class="counter-group">
          <button class="counter-btn minus" :disabled="selectedPlayer.Substituido === true" @click="$emit('update-stat', 'goal', -1)"><Minus :size="16" /></button>
          <span class="counter-val">{{ selectedPlayer.Gol || 0 }}</span>
          <button class="counter-btn plus"  :disabled="selectedPlayer.Substituido === true" @click="$emit('update-stat', 'goal', 1)"><Plus :size="16" /></button>
        </div>
      </div>

      <!-- Gols Contra -->
      <div class="action-row" :class="{ 'row-disabled': selectedPlayer.Substituido === true }">
        <span class="action-label">
          <SoccerBall class="action-icon goal-red" />
          Gol Contra
        </span>
        <div class="counter-group">
          <button class="counter-btn minus" :disabled="selectedPlayer.Substituido === true" @click="$emit('update-stat', 'goalContra', -1)"><Minus :size="16" /></button>
          <span class="counter-val">{{ selectedPlayer.GolContra || 0 }}</span>
          <button class="counter-btn plus"  :disabled="selectedPlayer.Substituido === true" @click="$emit('update-stat', 'goalContra', 1)"><Plus :size="16" /></button>
        </div>
      </div>

      <!-- Cartões -->
      <div class="action-row" :class="{ 'row-disabled': selectedPlayer.Substituido === true }">
        <span class="action-label">Cartões</span>
        <div class="cards-group">
          <button
            class="card-toggle"
            :class="{ 'card-active-yellow': selectedPlayer.CartaoAmarelo }"
            :disabled="selectedPlayer.Substituido === true"
            @click="$emit('update-stat', 'CartaoAmarelo', !selectedPlayer.CartaoAmarelo)"
          >
            <span class="card-rect yellow-rect" />
          </button>
          <button
            class="card-toggle"
            :class="{ 'card-active-blue': selectedPlayer.CartaoAzul }"
            :disabled="selectedPlayer.Substituido === true"
            @click="$emit('update-stat', 'CartaoAzul', !selectedPlayer.CartaoAzul)"
          >
            <span class="card-rect blue-rect" />
          </button>
          <button
            class="card-toggle"
            :class="{ 'card-active-red': selectedPlayer.CartaoVermelho }"
            :disabled="selectedPlayer.Substituido === true"
            @click="$emit('update-stat', 'CartaoVermelho', !selectedPlayer.CartaoVermelho)"
          >
            <span class="card-rect red-rect" />
          </button>
        </div>
      </div>

      <!-- Substituído -->
      <div class="action-row">
        <span class="action-label"><RefreshCw :size="18" /> Substituído</span>
        <div class="sub-period-group">
          <button
            class="sub-period-btn"
            :class="{ active: !selectedPlayer.Substituido }"
            @click="$emit('set-substitution', null)"
          >Não</button>
          <button
            class="sub-period-btn"
            :class="{ active: selectedPlayer.Substituido && selectedPlayer.TempSub === 1 }"
            @click="$emit('set-substitution', 1)"
          >1º Tempo</button>
          <button
            class="sub-period-btn sub-period-btn--2"
            :class="{ active: selectedPlayer.Substituido && selectedPlayer.TempSub === 2 }"
            @click="$emit('set-substitution', 2)"
          >Intervalo</button>
        </div>
      </div>

      <!-- Trocar Time -->
      <div class="action-row">
        <span class="action-label">Time</span>
        <button class="btn-switch-team" @click="$emit('switch-team')">
          Mover para {{ selectedPlayer.Time === '1' ? 'Time 2 (Amarelo)' : 'Time 1 (Azul)' }}
        </button>
      </div>

      <!-- Remover -->
      <div class="action-row-danger">
        <button class="btn-remove-player" @click="$emit('remove')">
          🗑️ Remover da Partida
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X, RefreshCw, Minus, Plus } from 'lucide-vue-next'
import SoccerBall from '~/components/SoccerBall.vue'

defineProps({
  modelValue: Boolean,
  selectedPlayer: { type: Object, default: null },
  actionError: { type: String, default: '' },
})

defineEmits(['close', 'update-stat', 'set-substitution', 'switch-team', 'remove'])
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

.actions-modal { max-width: 380px; }

.actions-player-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.actions-player-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 2px 0 0 0;
}

.action-error-msg {
  background: rgba(244, 67, 54, 0.12);
  border: 1px solid #F44336;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.82rem;
  color: #F44336;
  margin-bottom: 4px;
}

.sub-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid #F9A825;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #F9A825;
  margin-bottom: 4px;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-color);
}

.action-row-danger {
  padding-top: 16px;
  display: flex;
  justify-content: center;
}

.action-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.row-disabled {
  opacity: 0.35;
  pointer-events: none;
}

.action-icon {
  width: 1.4rem;
  height: 1.4rem;
  vertical-align: middle;
}

.goal-green { color: #4CAF50; }
.goal-red   { color: #F44336; }

.counter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  color: white;
}

.counter-btn.minus { background: #C62828; }
.counter-btn.plus  { background: #2E7D32; }

.counter-val {
  font-size: 1.5rem;
  font-weight: 800;
  min-width: 32px;
  text-align: center;
  color: var(--text-primary);
}

.cards-group {
  display: flex;
  gap: 10px;
}

.card-toggle {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  opacity: 0.35;
}

.card-toggle:disabled { cursor: not-allowed; }
.card-active-yellow { opacity: 1; border-color: #FFEB3B; box-shadow: 0 0 8px rgba(255,235,59,0.5); }
.card-active-blue   { opacity: 1; border-color: #2196F3; box-shadow: 0 0 8px rgba(33,150,243,0.5); }
.card-active-red    { opacity: 1; border-color: #F44336; box-shadow: 0 0 8px rgba(244,67,54,0.5); }

.card-rect {
  display: block;
  width: 18px;
  height: 26px;
  border-radius: 3px;
}

.yellow-rect { background: #FFEB3B; }
.blue-rect   { background: #2196F3; }
.red-rect    { background: #F44336; }

.sub-period-group {
  display: flex;
  gap: 6px;
}

.sub-period-btn {
  padding: 7px 12px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.sub-period-btn.active {
  background: #455A64;
  border-color: #607D8B;
  color: white;
}

.sub-period-btn--2.active {
  background: #37474F;
  border-color: #546E7A;
}

.btn-switch-team {
  background: #1565C0;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}

.btn-switch-team:hover { filter: brightness(1.15); }

.btn-remove-player {
  background: #C62828;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 28px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  width: 100%;
  transition: filter 0.15s;
}

.btn-remove-player:hover { filter: brightness(1.15); }
</style>
