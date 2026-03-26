<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content summary-modal" @click.stop>

      <!-- Barra de abas fixa -->
      <div class="s-tab-bar">
        <button class="s-tb-btn" :class="{ active: tab === 'geral' }" @click="tab = 'geral'">Geral</button>
        <button class="s-tb-btn" :class="{ active: tab === 'primeiro' }" @click="tab = 'primeiro'">1ºTempo</button>
        <button class="s-tb-btn" :class="{ active: tab === 'segundo' }" @click="tab = 'segundo'">2ºTempo</button>
      </div>

      <!-- Área scrollável -->
      <div class="s-scroll-area">

        <!-- ABA GERAL -->
        <template v-if="tab === 'geral'">
          <div class="s-content-header">
            <span class="s-content-title">Resumo da Partida</span>
            <button class="close-btn" @click="$emit('close')"><X :size="20" /></button>
          </div>
          <div class="s-content-date">
            <CloudRain v-if="partida?.Chuva || partida?.chuva" :size="15" style="vertical-align:middle;margin-right:4px;" />
            {{ formatDate(partida?.Data) }}
          </div>
          <div class="s-content-placar">
            Placar :
            <span class="s-cp-num t1-color">{{ scoreTeam1 }}</span>
            <span class="s-cp-x">x</span>
            <span class="s-cp-num t2-color">{{ scoreTeam2 }}</span>
          </div>
          <div class="s-two-cols">
            <div class="s-team-card t1-bg">
              <p class="s-section-lbl">TIME 1</p>
              <div v-for="p in team1Players" :key="'g1_'+p.id" class="s-full-player">
                <span class="s-fp-name" :class="{'fp-sub': p.substituido}">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="p.entrou_no_intervalo" class="s-fp-entry-tag">ENT</span>
                  <span v-if="(p.Gol||0)>0" class="s-fp-stat">⚽ {{ p.Gol }}</span>
                  <span v-if="(p.GolContra||0)>0" class="s-fp-stat s-fp-stat-contra">GC {{ p.GolContra }}</span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                </div>
              </div>
            </div>
            <div class="s-team-card t2-bg">
              <p class="s-section-lbl">TIME 2</p>
              <div v-for="p in team2Players" :key="'g2_'+p.id" class="s-full-player">
                <span class="s-fp-name" :class="{'fp-sub': p.substituido}">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="p.entrou_no_intervalo" class="s-fp-entry-tag">ENT</span>
                  <span v-if="(p.Gol||0)>0" class="s-fp-stat">⚽ {{ p.Gol }}</span>
                  <span v-if="(p.GolContra||0)>0" class="s-fp-stat s-fp-stat-contra">GC {{ p.GolContra }}</span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ABA 1º TEMPO -->
        <template v-else-if="tab === 'primeiro'">
          <div class="s-content-header">
            <span class="s-content-title">Resumo 1º Tempo</span>
            <button class="close-btn" @click="$emit('close')"><X :size="20" /></button>
          </div>
          <div class="s-content-date">{{ formatDate(partida?.Data) }}</div>
          <div class="s-content-placar">
            Placar :
            <span class="s-cp-num t1-color">{{ score1T1 }}</span>
            <span class="s-cp-x">x</span>
            <span class="s-cp-num t2-color">{{ score1T2 }}</span>
          </div>
          <div class="s-two-cols">
            <div class="s-team-card t1-bg">
              <p class="s-section-lbl">TIME 1</p>
              <div v-for="p in team1Primeiro" :key="'1p1_'+p.id" class="s-full-player">
                <span class="s-fp-name">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="(p.GolPrimeiro||0)>0" class="s-fp-stat">⚽ {{ p.GolPrimeiro }}</span>
                  <span v-if="(p.GolContraPrimeiro||0)>0" class="s-fp-stat s-fp-stat-contra">GC {{ p.GolContraPrimeiro }}</span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                </div>
              </div>
            </div>
            <div class="s-team-card t2-bg">
              <p class="s-section-lbl">TIME 2</p>
              <div v-for="p in team2Primeiro" :key="'1p2_'+p.id" class="s-full-player">
                <span class="s-fp-name">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="(p.GolPrimeiro||0)>0" class="s-fp-stat">⚽ {{ p.GolPrimeiro }}</span>
                  <span v-if="(p.GolContraPrimeiro||0)>0" class="s-fp-stat s-fp-stat-contra">GC {{ p.GolContraPrimeiro }}</span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ABA 2º TEMPO -->
        <template v-else>
          <div class="s-content-header">
            <span class="s-content-title">Resumo 2º Tempo</span>
            <button class="close-btn" @click="$emit('close')"><X :size="20" /></button>
          </div>
          <div class="s-content-date">{{ formatDate(partida?.Data) }}</div>
          <div class="s-content-placar">
            Placar :
            <span class="s-cp-num t1-color">{{ score2T1 }}</span>
            <span class="s-cp-x">x</span>
            <span class="s-cp-num t2-color">{{ score2T2 }}</span>
          </div>
          <div class="s-two-cols">
            <div class="s-team-card t1-bg">
              <p class="s-section-lbl">TIME 1</p>
              <div v-for="p in team1Segundo" :key="'2p1_'+p.id" class="s-full-player">
                <span class="s-fp-name">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="(p.GolSegundo||0)>0" class="s-fp-stat">⚽ {{ p.GolSegundo }}</span>
                  <span v-if="(p.GolContraSegundo||0)>0" class="s-fp-stat s-fp-stat-contra">GC {{ p.GolContraSegundo }}</span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                </div>
              </div>
            </div>
            <div class="s-team-card t2-bg">
              <p class="s-section-lbl">TIME 2</p>
              <div v-for="p in team2Segundo" :key="'2p2_'+p.id" class="s-full-player">
                <span class="s-fp-name">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="(p.GolSegundo||0)>0" class="s-fp-stat">⚽ {{ p.GolSegundo }}</span>
                  <span v-if="(p.GolContraSegundo||0)>0" class="s-fp-stat s-fp-stat-contra">GC {{ p.GolContraSegundo }}</span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, CloudRain } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  partida: Object,
  team1Players: { type: Array, default: () => [] },
  team2Players: { type: Array, default: () => [] },
  team1Primeiro: { type: Array, default: () => [] },
  team2Primeiro: { type: Array, default: () => [] },
  team1Segundo:  { type: Array, default: () => [] },
  team2Segundo:  { type: Array, default: () => [] },
  scoreTeam1: { type: Number, default: 0 },
  scoreTeam2: { type: Number, default: 0 },
  score1T1: { type: Number, default: 0 },
  score1T2: { type: Number, default: 0 },
  score2T1: { type: Number, default: 0 },
  score2T2: { type: Number, default: 0 },
})

defineEmits(['close'])

const tab = ref('geral')

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

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.summary-modal {
  max-width: 480px;
  height: 90vh !important;
  max-height: 90vh !important;
  overflow: hidden !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

.s-tab-bar {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
  padding: 6px;
  background: var(--bg-primary);
  border-radius: 12px;
  margin: 8px 12px;
}

.s-tb-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.15s;
}

.s-tb-btn.active {
  background: var(--primary-color);
  color: var(--bg-secondary);
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
}

.s-scroll-area {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 12px;
}

.s-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.s-content-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--primary-color);
}

.s-content-date {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.s-content-placar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.s-cp-num {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
  min-width: 32px;
  text-align: center;
}

.s-cp-x {
  font-size: 1rem;
  color: var(--text-secondary);
  opacity: 0.4;
  font-weight: 900;
}

.t1-color { color: #2196F3; }
.t2-color { color: #FF8F00; }

.s-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.s-team-card {
  border-radius: 12px;
  padding: 10px;
  color: #1a1a2e;
}

.t1-bg { background: rgba(33,150,243,0.18); border: 1px solid rgba(56,189,248,0.35); }
.t2-bg { background: rgba(255,143,0,0.18); border: 1px solid rgba(251,146,60,0.35); }

.dark .t1-bg { background: rgba(56,189,248,0.08); border-color: rgba(56,189,248,0.2); }
.dark .t2-bg { background: rgba(251,146,60,0.08); border-color: rgba(251,146,60,0.2); }

.s-section-lbl {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  opacity: 0.7;
  margin: 6px 0 4px 0;
}

.s-full-player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  gap: 4px;
}

.s-fp-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fp-sub {
  text-decoration: line-through;
  opacity: 0.45;
}

.s-fp-events {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.s-fp-stat {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.s-fp-stat-contra {
  background: rgba(198, 40, 40, 0.15);
  color: #C62828;
  border-radius: 4px;
  padding: 1px 4px;
  font-weight: 800;
}

.s-fc-chip {
  display: inline-block;
  width: 9px;
  height: 13px;
  margin-left: 2px;
  border-radius: 2px;
}

.fc-yellow { background: #FFEB3B; }
.fc-blue   { background: #2196F3; }
.fc-red    { background: #F44336; }

.s-fp-entry-tag {
  font-size: 0.55rem;
  font-weight: 800;
  background: rgba(76,175,80,0.2);
  color: #388E3C;
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
