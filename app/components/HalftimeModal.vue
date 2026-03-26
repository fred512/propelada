<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal-content ht-modal" @click.stop>
      <div class="ht-header">
        <span class="ht-title">Intervalo</span>
        <button class="close-btn" @click="$emit('close')"><X :size="22" /></button>
      </div>
      <p class="ht-subtitle">Marque quem sai e adicione substitutos antes de iniciar o 2º Tempo.</p>

      <!-- Contadores -->
      <div class="ht-counts">
        <span class="ht-count" :class="{ 'ht-count-ok': team1SecondHalfCount === 9, 'ht-count-warn': team1SecondHalfCount !== 9 }">
          Time 1: {{ team1SecondHalfCount }}/9
        </span>
        <span class="ht-count" :class="{ 'ht-count-ok': team2SecondHalfCount === 9, 'ht-count-warn': team2SecondHalfCount !== 9 }">
          Time 2: {{ team2SecondHalfCount }}/9
        </span>
      </div>

      <!-- Times -->
      <div class="ht-two-cols">
        <!-- Time 1 -->
        <div class="ht-team t1-bg">
          <div class="ht-team-header">
            <span class="ht-team-label">TIME 1</span>
            <button class="ht-add-btn" @click="$emit('add-player', '1')"><Plus :size="14" /> Espera</button>
          </div>
          <div v-for="p in team1Players" :key="'ht1_'+p.id" class="ht-player" :class="{ 'ht-player-out': p.substituido }">
            <span class="ht-player-name">{{ p.Nome }}</span>
            <span v-if="p.entrou_no_intervalo" class="ht-entry-tag">ENTROU</span>
            <button class="ht-leave-btn" :class="{ 'ht-leave-active': p.substituido }" @click="$emit('toggle-sub', p)">
              {{ p.substituido ? 'Volta' : 'Sai' }}
            </button>
          </div>
        </div>

        <!-- Time 2 -->
        <div class="ht-team t2-bg">
          <div class="ht-team-header">
            <span class="ht-team-label">TIME 2</span>
            <button class="ht-add-btn" @click="$emit('add-player', '2')"><Plus :size="14" /> Espera</button>
          </div>
          <div v-for="p in team2Players" :key="'ht2_'+p.id" class="ht-player" :class="{ 'ht-player-out': p.substituido }">
            <span class="ht-player-name">{{ p.Nome }}</span>
            <span v-if="p.entrou_no_intervalo" class="ht-entry-tag">ENTROU</span>
            <button class="ht-leave-btn" :class="{ 'ht-leave-active': p.substituido }" @click="$emit('toggle-sub', p)">
              {{ p.substituido ? 'Volta' : 'Sai' }}
            </button>
          </div>
        </div>
      </div>

      <button class="ht-start-btn" @click="$emit('start-second-half')">
        Iniciar 2º Tempo
      </button>
    </div>
  </div>
</template>

<script setup>
import { X, Plus } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  team1Players: { type: Array, default: () => [] },
  team2Players: { type: Array, default: () => [] },
})

defineEmits(['close', 'start-second-half', 'toggle-sub', 'add-player'])

const team1SecondHalfCount = computed(() => props.team1Players.filter(p => !p.substituido).length)
const team2SecondHalfCount = computed(() => props.team2Players.filter(p => !p.substituido).length)
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

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.ht-modal {
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px !important;
}

.ht-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ht-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-color);
}

.ht-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: -4px 0 0;
}

.ht-counts {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.ht-count {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 5px 14px;
  border-radius: 20px;
}

.ht-count-ok  { background: rgba(76,175,80,0.18); color: #388E3C; }
.ht-count-warn { background: rgba(255,152,0,0.18); color: #E65100; }

.ht-two-cols {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.ht-team {
  border-radius: 12px;
  padding: 10px;
  flex: 0 0 calc(50% - 5px);
  min-width: 155px;
  scroll-snap-align: start;
}

.ht-team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ht-team-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.ht-add-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
}

.ht-player {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.ht-player-out .ht-player-name {
  text-decoration: line-through;
  opacity: 0.45;
}

.ht-player-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ht-entry-tag {
  font-size: 0.5rem;
  font-weight: 800;
  background: rgba(76,175,80,0.2);
  color: #388E3C;
  padding: 1px 3px;
  border-radius: 3px;
  flex-shrink: 0;
  letter-spacing: -0.2px;
}

.ht-leave-btn {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.ht-leave-active {
  background: rgba(96,125,139,0.25);
  border-color: #607D8B;
  color: #607D8B;
}

.ht-start-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: filter 0.15s;
}

.ht-start-btn:hover { filter: brightness(1.1); }

.ht-two-cols::-webkit-scrollbar { height: 4px; }
.ht-two-cols::-webkit-scrollbar-track { background: transparent; }
.ht-two-cols::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 4px; }

.t1-bg { background: rgba(33,150,243,0.18); border: 1px solid rgba(56,189,248,0.35); }
.t2-bg { background: rgba(255,143,0,0.18); border: 1px solid rgba(251,146,60,0.35); }

.dark .t1-bg { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); }
.dark .t2-bg { background: rgba(251,146,60,0.08); border-color: rgba(251,146,60,0.2); }
</style>
