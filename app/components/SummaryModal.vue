<template>
  <div v-if="modelValue" class="sm-overlay" @click="$emit('close')">
    <div class="sm-panel" @click.stop>

      <!-- Imagem de fundo do campo -->
      <div class="sm-bg-field" :style="{ backgroundImage: `url('/images/campo-futebol.png')` }" />
      <!-- Overlay escuro sobre a imagem -->
      <div class="sm-bg-overlay" />

      <!-- Glows laterais estilo Instagram -->
      <div class="sm-glow sm-glow-1" style="background: radial-gradient(ellipse at -20% 40%, rgba(247,119,55,0.30) 0%, transparent 65%)" />
      <div class="sm-glow sm-glow-2" style="background: radial-gradient(ellipse at 120% 40%, rgba(193,53,132,0.25) 0%, transparent 65%)" />

      <!-- TOPO: data + fechar -->
      <div class="sm-top">
        <span class="sm-date">
          <CloudRain v-if="partida?.Chuva || partida?.chuva" :size="12" style="display:inline;vertical-align:middle;margin-right:3px" />
          {{ formatDate(partida?.Data) }}
        </span>
        <button class="sm-close" @click="$emit('close')"><X :size="16" /></button>
      </div>

      <!-- PILL DE PLACAR -->
      <div class="sm-pill">
        <span class="sm-pill-team" :style="{ color: corTime1 }">{{ nomeTime1 }}</span>
        <div class="sm-pill-scores">
          <span class="sm-pill-num" :style="{ color: corTime1 }">{{ activeScore[0] }}</span>
          <span class="sm-pill-x">×</span>
          <span class="sm-pill-num" :style="{ color: corTime2 }">{{ activeScore[1] }}</span>
        </div>
        <span class="sm-pill-team" :style="{ color: corTime2 }">{{ nomeTime2 }}</span>
      </div>

      <!-- ABAS -->
      <div class="sm-tabs">
        <button v-for="(t, i) in tabs" :key="t.key"
          class="sm-tab" :class="{ active: tab === t.key }"
          @click="setTab(t.key, i)">{{ t.label }}</button>
        <div class="sm-tab-line" :style="{ transform: `translateX(${tabIndex * 100}%)` }" />
      </div>

      <!-- CABEÇALHOS DAS COLUNAS -->
      <div class="sm-col-heads">
        <div class="sm-col-head" :style="{ color: corTime1 }">{{ nomeTime1 }}</div>
        <div class="sm-col-head" :style="{ color: corTime2 }">{{ nomeTime2 }}</div>
      </div>

      <!-- LISTA DE JOGADORES -->
      <div class="sm-scroll">
        <Transition :name="tabDir" mode="out-in">
          <div :key="tab" class="sm-grid">

            <!-- TIME 1 -->
            <div class="sm-col">
              <template v-if="tab === 'geral'">
                <div v-for="(p, i) in team1Players" :key="'g1_'+p.id" class="sm-row" :style="{ '--ri': i }">
                  <button class="sm-avatar" @click.stop="$emit('open-profile', p)">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <span v-else>{{ p.Nome.charAt(0) }}</span>
                  </button>
                  <span class="sm-rname" :class="{ 'sm-sub': p.substituido }">{{ p.Nome }}</span>
                  <span class="sm-rdetail">
                    <span v-if="p.TipoParticipante==='Goleiro'" class="sm-gk">Goleiro</span>
                    <span v-if="(p.Gol||0)>0" class="sm-gols">({{ p.Gol }} {{ p.Gol===1?'gol':'gols' }})⚽</span>
                    <span v-if="(p.GolContra||0)>0" class="sm-gc">GC</span>
                    <span v-if="p.substituido" class="sm-saiu">SAIU</span>
                    <span v-else-if="p.entrou_no_intervalo" class="sm-ent">ENT</span>
                    <span v-if="p.CartaoAmarelo" class="sm-card sm-yl" />
                    <span v-if="p.CartaoAzul"    class="sm-card sm-bl" />
                    <span v-if="p.CartaoVermelho" class="sm-card sm-rd" />
                  </span>
                </div>
              </template>
              <template v-else-if="tab === 'primeiro'">
                <div v-for="(p, i) in team1Primeiro" :key="'1p1_'+p.id" class="sm-row" :style="{ '--ri': i }">
                  <button class="sm-avatar" @click.stop="$emit('open-profile', p)">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <span v-else>{{ p.Nome.charAt(0) }}</span>
                  </button>
                  <span class="sm-rname">{{ p.Nome }}</span>
                  <span class="sm-rdetail">
                    <span v-if="p.TipoParticipante==='Goleiro'" class="sm-gk">Goleiro</span>
                    <span v-if="(p.GolPrimeiro||0)>0" class="sm-gols">({{ p.GolPrimeiro }} {{ p.GolPrimeiro===1?'gol':'gols' }})⚽</span>
                    <span v-if="(p.GolContraPrimeiro||0)>0" class="sm-gc">GC</span>
                    <span v-if="p.CartaoAmarelo" class="sm-card sm-yl" />
                    <span v-if="p.CartaoAzul"    class="sm-card sm-bl" />
                    <span v-if="p.CartaoVermelho" class="sm-card sm-rd" />
                  </span>
                </div>
              </template>
              <template v-else>
                <div v-for="(p, i) in team1Segundo" :key="'2p1_'+p.id" class="sm-row" :style="{ '--ri': i }">
                  <button class="sm-avatar" @click.stop="$emit('open-profile', p)">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <span v-else>{{ p.Nome.charAt(0) }}</span>
                  </button>
                  <span class="sm-rname">{{ p.Nome }}</span>
                  <span class="sm-rdetail">
                    <span v-if="p.TipoParticipante==='Goleiro'" class="sm-gk">Goleiro</span>
                    <span v-if="(p.GolSegundo||0)>0" class="sm-gols">({{ p.GolSegundo }} {{ p.GolSegundo===1?'gol':'gols' }})⚽</span>
                    <span v-if="(p.GolContraSegundo||0)>0" class="sm-gc">GC</span>
                    <span v-if="p.CartaoAmarelo" class="sm-card sm-yl" />
                    <span v-if="p.CartaoAzul"    class="sm-card sm-bl" />
                    <span v-if="p.CartaoVermelho" class="sm-card sm-rd" />
                  </span>
                </div>
              </template>
            </div>

            <!-- TIME 2 -->
            <div class="sm-col">
              <template v-if="tab === 'geral'">
                <div v-for="(p, i) in team2Players" :key="'g2_'+p.id" class="sm-row sm-row-t2" :style="{ '--ri': i, color: corTime2 }">
                  <button class="sm-avatar" @click.stop="$emit('open-profile', p)">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <span v-else>{{ p.Nome.charAt(0) }}</span>
                  </button>
                  <span class="sm-rname" :class="{ 'sm-sub': p.substituido }">{{ p.Nome }}</span>
                  <span class="sm-rdetail">
                    <span v-if="p.TipoParticipante==='Goleiro'" class="sm-gk">Goleiro</span>
                    <span v-if="(p.Gol||0)>0" class="sm-gols">({{ p.Gol }} {{ p.Gol===1?'gol':'gols' }})⚽</span>
                    <span v-if="(p.GolContra||0)>0" class="sm-gc">GC</span>
                    <span v-if="p.substituido" class="sm-saiu">SAIU</span>
                    <span v-else-if="p.entrou_no_intervalo" class="sm-ent">ENT</span>
                    <span v-if="p.CartaoAmarelo" class="sm-card sm-yl" />
                    <span v-if="p.CartaoAzul"    class="sm-card sm-bl" />
                    <span v-if="p.CartaoVermelho" class="sm-card sm-rd" />
                  </span>
                </div>
              </template>
              <template v-else-if="tab === 'primeiro'">
                <div v-for="(p, i) in team2Primeiro" :key="'1p2_'+p.id" class="sm-row sm-row-t2" :style="{ '--ri': i, color: corTime2 }">
                  <button class="sm-avatar" @click.stop="$emit('open-profile', p)">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <span v-else>{{ p.Nome.charAt(0) }}</span>
                  </button>
                  <span class="sm-rname">{{ p.Nome }}</span>
                  <span class="sm-rdetail">
                    <span v-if="p.TipoParticipante==='Goleiro'" class="sm-gk">Goleiro</span>
                    <span v-if="(p.GolPrimeiro||0)>0" class="sm-gols">({{ p.GolPrimeiro }} {{ p.GolPrimeiro===1?'gol':'gols' }})⚽</span>
                    <span v-if="(p.GolContraPrimeiro||0)>0" class="sm-gc">GC</span>
                    <span v-if="p.CartaoAmarelo" class="sm-card sm-yl" />
                    <span v-if="p.CartaoAzul"    class="sm-card sm-bl" />
                    <span v-if="p.CartaoVermelho" class="sm-card sm-rd" />
                  </span>
                </div>
              </template>
              <template v-else>
                <div v-for="(p, i) in team2Segundo" :key="'2p2_'+p.id" class="sm-row sm-row-t2" :style="{ '--ri': i, color: corTime2 }">
                  <button class="sm-avatar" @click.stop="$emit('open-profile', p)">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <span v-else>{{ p.Nome.charAt(0) }}</span>
                  </button>
                  <span class="sm-rname">{{ p.Nome }}</span>
                  <span class="sm-rdetail">
                    <span v-if="p.TipoParticipante==='Goleiro'" class="sm-gk">Goleiro</span>
                    <span v-if="(p.GolSegundo||0)>0" class="sm-gols">({{ p.GolSegundo }} {{ p.GolSegundo===1?'gol':'gols' }})⚽</span>
                    <span v-if="(p.GolContraSegundo||0)>0" class="sm-gc">GC</span>
                    <span v-if="p.CartaoAmarelo" class="sm-card sm-yl" />
                    <span v-if="p.CartaoAzul"    class="sm-card sm-bl" />
                    <span v-if="p.CartaoVermelho" class="sm-card sm-rd" />
                  </span>
                </div>
              </template>
            </div>

          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>

<script setup>
import { X, CloudRain } from 'lucide-vue-next'

const props = defineProps({
  modelValue: Boolean,
  partida: Object,
  nomeTime1: { type: String, default: 'Azul' },
  nomeTime2: { type: String, default: 'Amarelo' },
  team1Players:  { type: Array, default: () => [] },
  team2Players:  { type: Array, default: () => [] },
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
defineEmits(['close', 'open-profile'])

// ── Cores ─────────────────────────────────────────
const { hexDaCor } = useTeamColors()

const hexAlpha = (hex, alpha) => {
  if (!hex) return `rgba(0,0,0,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const corTime1 = computed(() => hexDaCor(props.nomeTime1))
const corTime2 = computed(() => hexDaCor(props.nomeTime2))

const nomeTime1 = computed(() => `Time ${props.nomeTime1}`)
const nomeTime2 = computed(() => `Time ${props.nomeTime2}`)

// ── Tabs ──────────────────────────────────────────
const tabs = [
  { key: 'geral',    label: 'Geral' },
  { key: 'primeiro', label: '1ºTempo' },
  { key: 'segundo',  label: '2ºTempo' },
]
const tab      = ref('geral')
const tabIndex = ref(0)
const tabDir   = ref('tab-r')

const setTab = (key, idx) => {
  tabDir.value = idx > tabIndex.value ? 'tab-r' : 'tab-l'
  tabIndex.value = idx
  tab.value = key
}

const activeScore = computed(() => {
  if (tab.value === 'primeiro') return [props.score1T1, props.score1T2]
  if (tab.value === 'segundo')  return [props.score2T1, props.score2T2]
  return [props.scoreTeam1, props.scoreTeam2]
})

const periodLabel = computed(() => {
  if (tab.value === 'primeiro') return 'ESCALAÇÃO 1º TEMPO'
  if (tab.value === 'segundo')  return 'ESCALAÇÃO 2º TEMPO'
  return 'ESCALAÇÃO COMPLETA'
})

const formatDate = (d) => {
  if (!d) return '--/--/----'
  const [y, m, day] = d.split('T')[0].split('-')
  return `${day}/${m}/${y}`
}
</script>

<style scoped>
/* ── OVERLAY ──────────────────────────────────────── */
.sm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(6px);
  padding: 12px;
}

/* ── PANEL ────────────────────────────────────────── */
.sm-panel {
  position: relative;
  width: 100%; max-width: 460px;
  height: min(96vh, 900px);
  border-radius: 20px;
  display: flex; flex-direction: column;
  overflow: hidden;
  background: #1a0a00;
  border: 1px solid rgba(247,119,55,0.35);
  box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(247,119,55,0.15), inset 0 1px 0 rgba(247,119,55,0.1);
  animation: smIn .32s cubic-bezier(.34,1.56,.64,1);
}
.sm-bg-field {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  z-index: 0;
}
.sm-bg-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(180deg,
    rgba(30,10,0,0.82) 0%,
    rgba(20,8,0,0.70) 25%,
    rgba(25,10,0,0.75) 60%,
    rgba(35,12,0,0.88) 100%);
  z-index: 0;
}
@keyframes smIn {
  from { opacity: 0; transform: scale(.92) translateY(14px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Glows laterais */
.sm-glow {
  position: absolute; inset: 0; pointer-events: none; z-index: 1;
}

/* ── TOPO ─────────────────────────────────────────── */
.sm-top {
  position: relative; z-index: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px 0;
}
.sm-date {
  font-family: 'Outfit', sans-serif;
  font-size: .95rem; font-weight: 700;
  color: rgba(255,255,255,0.55);
  letter-spacing: .5px;
}
.sm-close {
  background: rgba(255,255,255,0.07); border: none; cursor: pointer;
  color: rgba(255,255,255,0.5);
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  transition: background .15s, color .15s;
}
.sm-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

/* ── PILL DE PLACAR ───────────────────────────────── */
.sm-pill {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 10px;
  margin: 12px 16px 0;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px;
  padding: 10px 16px;
}
.sm-pill-team {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: .85rem; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase;
  flex: 1;
}
.sm-pill-team:first-child { text-align: right; }
.sm-pill-team:last-child  { text-align: left; }
.sm-pill-scores {
  display: flex; align-items: center; gap: 6px;
  flex-shrink: 0;
}
.sm-pill-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.8rem; font-weight: 900;
  line-height: 1; font-variant-numeric: tabular-nums;
}
.sm-pill-x {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.4rem; font-weight: 900;
  color: rgba(255,255,255,0.25);
  line-height: 1;
}

/* ── ABAS ─────────────────────────────────────────── */
.sm-tabs {
  position: relative; z-index: 1;
  display: flex;
  margin: 10px 16px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.sm-tab {
  flex: 1;
  font-family: 'Outfit', sans-serif;
  font-size: .8rem; font-weight: 700;
  padding: 9px 0;
  border: none; background: none; cursor: pointer;
  color: rgba(255,255,255,0.35);
  transition: color .2s;
  position: relative; z-index: 1;
}
.sm-tab.active { color: rgba(255,255,255,0.9); }
.sm-tab-line {
  position: absolute; bottom: 0; left: 0;
  width: 33.333%; height: 2px;
  background: rgba(255,255,255,0.6);
  border-radius: 2px 2px 0 0;
  transition: transform .26s cubic-bezier(.4,0,.2,1);
}

/* ── TÍTULO DO PERÍODO ────────────────────────────── */
.sm-period {
  position: relative; z-index: 1;
  text-align: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; font-weight: 900;
  letter-spacing: 3px; text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  padding: 10px 0 0;
}

/* ── CABEÇALHOS DE COLUNAS ────────────────────────── */
.sm-col-heads {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: 1fr 1fr;
  padding: 6px 16px 4px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sm-col-head {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: .8rem; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase;
}
.sm-col-head:last-child { text-align: right; }

/* ── SCROLL ───────────────────────────────────────── */
.sm-scroll {
  position: relative; z-index: 1;
  flex: 1; min-height: 0;
  overflow-y: auto; overflow-x: hidden;
  padding: 4px 0 12px;
  opacity: 0.7;
}
.sm-scroll::-webkit-scrollbar { width: 3px; }
.sm-scroll::-webkit-scrollbar-track { background: transparent; }
.sm-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }

/* ── TAB TRANSITIONS ──────────────────────────────── */
.tab-r-enter-active, .tab-r-leave-active,
.tab-l-enter-active, .tab-l-leave-active {
  transition: opacity .16s ease, transform .16s ease;
}
.tab-r-enter-from { opacity: 0; transform: translateX(16px); }
.tab-r-leave-to   { opacity: 0; transform: translateX(-16px); }
.tab-l-enter-from { opacity: 0; transform: translateX(-16px); }
.tab-l-leave-to   { opacity: 0; transform: translateX(16px); }

/* ── GRID DE JOGADORES ────────────────────────────── */
.sm-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0 1px;
  background: rgba(255,255,255,0.05);
  margin: 0 16px;
  border-radius: 10px;
  overflow: hidden;
}
.sm-col {
  background: rgba(0,0,0,0.45);
  padding: 6px 10px;
  backdrop-filter: blur(4px);
}
.sm-col:last-child {
  border-left: 1px solid rgba(255,255,255,0.06);
}

/* ── LINHAS DE JOGADORES ──────────────────────────── */
.sm-row {
  display: flex; flex-direction: row; flex-wrap: wrap; align-items: center;
  gap: 3px;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  animation: rowIn .2s both;
  animation-delay: calc(var(--ri, 0) * 25ms);
}
.sm-row:last-child { border-bottom: none; }
@keyframes rowIn {
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
}

.sm-rname {
  font-family: 'Outfit', sans-serif;
  font-size: .8rem; font-weight: 600;
  color: rgba(255,255,255,0.95);
  line-height: 1.3;
}
.sm-row-t2 .sm-rname { color: inherit; }
.sm-sub { text-decoration: line-through; }

.sm-rdetail {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 3px;
}

.sm-gk {
  font-family: 'Outfit', sans-serif;
  font-size: .6rem; font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase; letter-spacing: .5px;
}
.sm-row-t2 .sm-gk { color: inherit; opacity: .65; }

.sm-gols {
  font-family: 'Outfit', sans-serif;
  font-size: .7rem; font-weight: 600;
  color: rgba(255,255,255,0.6);
}
.sm-row-t2 .sm-gols { color: inherit; opacity: .8; }

.sm-gc {
  font-family: 'Outfit', sans-serif;
  font-size: .58rem; font-weight: 800;
  background: rgba(239,68,68,.2); color: #fca5a5;
  padding: 1px 3px; border-radius: 3px;
}

.sm-ent {
  font-family: 'Outfit', sans-serif;
  font-size: .58rem; font-weight: 800;
  background: rgba(74,222,128,.15); color: #86efac;
  padding: 1px 3px; border-radius: 3px;
}

.sm-saiu {
  font-family: 'Outfit', sans-serif;
  font-size: .58rem; font-weight: 800;
  background: rgba(248,113,113,.15); color: #fca5a5;
  padding: 1px 3px; border-radius: 3px;
}

/* ── AVATAR ───────────────────────────────────────── */
.sm-avatar {
  width: 20px; height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255,255,255,0.15);
  border: none; cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
  transition: opacity .15s;
}
.sm-avatar:hover { opacity: 0.75; }
.sm-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sm-avatar > span {
  font-family: 'Outfit', sans-serif;
  font-size: .55rem; font-weight: 700;
  color: rgba(255,255,255,0.8);
}

.sm-card {
  display: inline-block; width: 6px; height: 9px;
  border-radius: 1px; flex-shrink: 0;
}
.sm-yl { background: #FACC15; }
.sm-bl { background: #60A5FA; }
.sm-rd { background: #F87171; }
</style>
