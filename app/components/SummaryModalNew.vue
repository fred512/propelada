<template>
  <div v-if="modelValue" class="sm-overlay" @click="$emit('close')">
    <div class="sm-panel" @click.stop>

      <!-- Botão fechar -->
      <button class="sm-close" @click="$emit('close')"><X :size="18" /></button>

      <!-- PILL DE PLACAR -->
      <div class="sm-scoreboard">
        <span class="sm-sb-team" :style="{ color: corTime1 }">{{ nomeTime1 }}</span>
        <div class="sm-sb-score">
          <span class="sm-sb-num" :style="{ color: corTime1 }">{{ activeScore[0] }}</span>
          <span class="sm-sb-x">×</span>
          <span class="sm-sb-num" :style="{ color: corTime2 }">{{ activeScore[1] }}</span>
        </div>
        <span class="sm-sb-team" :style="{ color: corTime2 }">{{ nomeTime2 }}</span>
      </div>

      <!-- DATA -->
      <div class="sm-date">
        <CloudRain v-if="partida?.Chuva || partida?.chuva" :size="14" style="display:inline;vertical-align:middle;margin-right:4px" />
        {{ formatDate(partida?.Data) }}
      </div>

      <!-- ABAS -->
      <div class="sm-tabs">
        <button v-for="(t, i) in tabs" :key="t.key"
          class="sm-tab" :class="{ active: tab === t.key }"
          @click="setTab(t.key, i)">{{ t.label }}</button>
        <div class="sm-tab-line" :style="{ transform: `translateX(${tabIndex * 100}%)` }" />
      </div>

      <!-- LISTA DE JOGADORES -->
      <div class="sm-scroll">
        <Transition :name="tabDir" mode="out-in">
          <div :key="tab" class="sm-teams">

            <!-- TIME 1 -->
            <div class="sm-team">
              <div class="sm-team-header" :style="{ color: corTime1 }">
                <div class="sm-team-dot" :style="{ background: corTime1 }"></div>
                {{ nomeTime1 }}
              </div>
              <template v-if="tab === 'geral'">
                <div v-for="p in team1Players" :key="'g1_'+p.id" class="sm-player">
                  <div class="sm-player-avatar">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <div v-else class="sm-player-placeholder">{{ p.Nome.charAt(0) }}</div>
                  </div>
                  <div class="sm-player-info">
                    <span class="sm-player-name" :class="{ 'sm-sub': p.substituido }">{{ p.Nome }}</span>
                    <div class="sm-player-badges">
                      <span v-if="p.TipoParticipante==='Goleiro'" class="badge sm-gk">Goleiro</span>
                      <span v-if="(p.Gol||0)>0" class="badge sm-goal">⚽ {{ p.Gol }} {{ p.Gol===1?'gol':'gols' }}</span>
                      <span v-if="(p.GolContra||0)>0" class="badge sm-gc">GC</span>
                      <span v-if="p.substituido" class="badge sm-saiu">SAIU</span>
                      <span v-else-if="p.entrou_no_intervalo" class="badge sm-ent">ENT</span>
                      <span v-if="p.CartaoAmarelo" class="badge sm-card sm-yl" />
                      <span v-if="p.CartaoAzul"    class="badge sm-card sm-bl" />
                      <span v-if="p.CartaoVermelho" class="badge sm-card sm-rd" />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="tab === 'primeiro'">
                <div v-for="p in team1Primeiro" :key="'1p1_'+p.id" class="sm-player">
                  <div class="sm-player-avatar">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <div v-else class="sm-player-placeholder">{{ p.Nome.charAt(0) }}</div>
                  </div>
                  <div class="sm-player-info">
                    <span class="sm-player-name">{{ p.Nome }}</span>
                    <div class="sm-player-badges">
                      <span v-if="p.TipoParticipante==='Goleiro'" class="badge sm-gk">Goleiro</span>
                      <span v-if="(p.GolPrimeiro||0)>0" class="badge sm-goal">⚽ {{ p.GolPrimeiro }} {{ p.GolPrimeiro===1?'gol':'gols' }}</span>
                      <span v-if="(p.GolContraPrimeiro||0)>0" class="badge sm-gc">GC</span>
                      <span v-if="p.CartaoAmarelo" class="badge sm-card sm-yl" />
                      <span v-if="p.CartaoAzul"    class="badge sm-card sm-bl" />
                      <span v-if="p.CartaoVermelho" class="badge sm-card sm-rd" />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="p in team1Segundo" :key="'2p1_'+p.id" class="sm-player">
                  <div class="sm-player-avatar">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <div v-else class="sm-player-placeholder">{{ p.Nome.charAt(0) }}</div>
                  </div>
                  <div class="sm-player-info">
                    <span class="sm-player-name">{{ p.Nome }}</span>
                    <div class="sm-player-badges">
                      <span v-if="p.TipoParticipante==='Goleiro'" class="badge sm-gk">Goleiro</span>
                      <span v-if="(p.GolSegundo||0)>0" class="badge sm-goal">⚽ {{ p.GolSegundo }} {{ p.GolSegundo===1?'gol':'gols' }}</span>
                      <span v-if="(p.GolContraSegundo||0)>0" class="badge sm-gc">GC</span>
                      <span v-if="p.CartaoAmarelo" class="badge sm-card sm-yl" />
                      <span v-if="p.CartaoAzul"    class="badge sm-card sm-bl" />
                      <span v-if="p.CartaoVermelho" class="badge sm-card sm-rd" />
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- TIME 2 -->
            <div class="sm-team">
              <div class="sm-team-header" :style="{ color: corTime2 }">
                <div class="sm-team-dot" :style="{ background: corTime2 }"></div>
                {{ nomeTime2 }}
              </div>
              <template v-if="tab === 'geral'">
                <div v-for="p in team2Players" :key="'g2_'+p.id" class="sm-player">
                  <div class="sm-player-avatar">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <div v-else class="sm-player-placeholder">{{ p.Nome.charAt(0) }}</div>
                  </div>
                  <div class="sm-player-info">
                    <span class="sm-player-name" :class="{ 'sm-sub': p.substituido }">{{ p.Nome }}</span>
                    <div class="sm-player-badges">
                      <span v-if="p.TipoParticipante==='Goleiro'" class="badge sm-gk">Goleiro</span>
                      <span v-if="(p.Gol||0)>0" class="badge sm-goal">⚽ {{ p.Gol }} {{ p.Gol===1?'gol':'gols' }}</span>
                      <span v-if="(p.GolContra||0)>0" class="badge sm-gc">GC</span>
                      <span v-if="p.substituido" class="badge sm-saiu">SAIU</span>
                      <span v-else-if="p.entrou_no_intervalo" class="badge sm-ent">ENT</span>
                      <span v-if="p.CartaoAmarelo" class="badge sm-card sm-yl" />
                      <span v-if="p.CartaoAzul"    class="badge sm-card sm-bl" />
                      <span v-if="p.CartaoVermelho" class="badge sm-card sm-rd" />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="tab === 'primeiro'">
                <div v-for="p in team2Primeiro" :key="'1p2_'+p.id" class="sm-player">
                  <div class="sm-player-avatar">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <div v-else class="sm-player-placeholder">{{ p.Nome.charAt(0) }}</div>
                  </div>
                  <div class="sm-player-info">
                    <span class="sm-player-name">{{ p.Nome }}</span>
                    <div class="sm-player-badges">
                      <span v-if="p.TipoParticipante==='Goleiro'" class="badge sm-gk">Goleiro</span>
                      <span v-if="(p.GolPrimeiro||0)>0" class="badge sm-goal">⚽ {{ p.GolPrimeiro }} {{ p.GolPrimeiro===1?'gol':'gols' }}</span>
                      <span v-if="(p.GolContraPrimeiro||0)>0" class="badge sm-gc">GC</span>
                      <span v-if="p.CartaoAmarelo" class="badge sm-card sm-yl" />
                      <span v-if="p.CartaoAzul"    class="badge sm-card sm-bl" />
                      <span v-if="p.CartaoVermelho" class="badge sm-card sm-rd" />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="p in team2Segundo" :key="'2p2_'+p.id" class="sm-player">
                  <div class="sm-player-avatar">
                    <img v-if="p.foto_url" :src="p.foto_url" :alt="p.Nome" />
                    <div v-else class="sm-player-placeholder">{{ p.Nome.charAt(0) }}</div>
                  </div>
                  <div class="sm-player-info">
                    <span class="sm-player-name">{{ p.Nome }}</span>
                    <div class="sm-player-badges">
                      <span v-if="p.TipoParticipante==='Goleiro'" class="badge sm-gk">Goleiro</span>
                      <span v-if="(p.GolSegundo||0)>0" class="badge sm-goal">⚽ {{ p.GolSegundo }} {{ p.GolSegundo===1?'gol':'gols' }}</span>
                      <span v-if="(p.GolContraSegundo||0)>0" class="badge sm-gc">GC</span>
                      <span v-if="p.CartaoAmarelo" class="badge sm-card sm-yl" />
                      <span v-if="p.CartaoAzul"    class="badge sm-card sm-bl" />
                      <span v-if="p.CartaoVermelho" class="badge sm-card sm-rd" />
                    </div>
                  </div>
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
import { ref, computed } from 'vue'
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
defineEmits(['close'])

// ── Cores ─────────────────────────────────────────
const { hexDaCor } = useTeamColors()

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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='sky' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%230a1628'/%3E%3Cstop offset='40%25' stop-color='%230d2847'/%3E%3Cstop offset='100%25' stop-color='%231a3a5c'/%3E%3C/linearGradient%3E%3ClinearGradient id='grass' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%231a5c2a'/%3E%3Cstop offset='100%25' stop-color='%230d3d1a'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23sky)' width='800' height='600'/%3E%3Ccircle cx='150' cy='30' r='8' fill='%23ffffcc' opacity='0.6'/%3E%3Ccircle cx='650' cy='30' r='8' fill='%23ffffcc' opacity='0.6'/%3E%3Ccircle cx='300' cy='20' r='6' fill='%23ffffcc' opacity='0.5'/%3E%3Ccircle cx='500' cy='20' r='6' fill='%23ffffcc' opacity='0.5'/%3E%3Cellipse cx='150' cy='30' rx='100' ry='80' fill='%23ffffcc' opacity='0.03'/%3E%3Cellipse cx='650' cy='30' rx='100' ry='80' fill='%23ffffcc' opacity='0.03'/%3E%3Cpath d='M0,100 L250,200 L250,400 L0,450Z' fill='%231a2a4a'/%3E%3Cpath d='M0,120 L220,210 L220,380 L0,430Z' fill='%23223355'/%3E%3Cpath d='M0,140 L190,220 L190,360 L0,410Z' fill='%232a3c66'/%3E%3Ccircle cx='50' cy='150' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='80' cy='160' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='120' cy='170' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='160' cy='180' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='40' cy='180' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='100' cy='190' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='140' cy='200' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='180' cy='210' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='60' cy='210' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='90' cy='220' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='130' cy='230' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='170' cy='240' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='30' cy='240' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='70' cy='250' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='110' cy='260' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='150' cy='270' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='190' cy='280' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='20' cy='270' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='50' cy='280' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='80' cy='290' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='120' cy='300' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='160' cy='310' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='200' cy='320' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='40' cy='310' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='100' cy='330' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='140' cy='340' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='180' cy='350' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='30' cy='340' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='70' cy='350' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='110' cy='360' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='150' cy='370' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='60' cy='380' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='90' cy='390' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='130' cy='400' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='170' cy='410' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='210' cy='420' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Cpath d='M800,100 L550,200 L550,400 L800,450Z' fill='%231a2a4a'/%3E%3Cpath d='M800,120 L580,210 L580,380 L800,430Z' fill='%23223355'/%3E%3Cpath d='M800,140 L610,220 L610,360 L800,410Z' fill='%232a3c66'/%3E%3Ccircle cx='750' cy='150' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='720' cy='160' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='680' cy='170' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='640' cy='180' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='760' cy='180' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='700' cy='190' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='660' cy='200' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='620' cy='210' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='740' cy='210' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='710' cy='220' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='670' cy='230' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='630' cy='240' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='770' cy='240' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='730' cy='250' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='690' cy='260' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='650' cy='270' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='610' cy='280' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='780' cy='270' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='750' cy='280' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='720' cy='290' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='680' cy='300' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='640' cy='310' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='600' cy='320' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='760' cy='310' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='700' cy='330' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='660' cy='340' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='620' cy='350' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='770' cy='340' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='730' cy='350' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='690' cy='360' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='650' cy='370' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='740' cy='380' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Ccircle cx='710' cy='390' r='2' fill='%23ffffff' opacity='0.3'/%3E%3Ccircle cx='670' cy='400' r='2' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='630' cy='410' r='2' fill='%23ffffff' opacity='0.2'/%3E%3Ccircle cx='590' cy='420' r='2' fill='%23ffffff' opacity='0.25'/%3E%3Cpath d='M200,400 L600,400 L700,550 L100,550Z' fill='url(%23grass)'/%3E%3Cline x1='400' y1='400' x2='400' y2='550' stroke='%23ffffff' opacity='0.15' stroke-width='1'/%3E%3Cellipse cx='400' cy='475' rx='30' ry='20' fill='none' stroke='%23ffffff' opacity='0.12' stroke-width='1'/%3E%3Ccircle cx='400' cy='475' r='3' fill='%23ffffff' opacity='0.2'/%3E%3Cpath d='M340,400 L460,400 L480,440 L320,440Z' fill='none' stroke='%23ffffff' opacity='0.1' stroke-width='1'/%3E%3Cpath d='M360,550 L440,550 L420,510 L380,510Z' fill='none' stroke='%23ffffff' opacity='0.1' stroke-width='1'/%3E%3Cellipse cx='100' cy='80' rx='3' ry='15' fill='%23ff6633' opacity='0.3'/%3E%3Cellipse cx='200' cy='90' rx='2' ry='12' fill='%23ff6633' opacity='0.25'/%3E%3Cellipse cx='700' cy='85' rx='3' ry='14' fill='%23ff6633' opacity='0.3'/%3E%3Cellipse cx='600' cy='95' rx='2' ry='11' fill='%23ff6633' opacity='0.25'/%3E%3C/svg%3E");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
  padding: 12px;
}
.sm-overlay::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 0;
}

/* ── PANEL ────────────────────────────────────────── */
.sm-panel {
  position: relative;
  z-index: 1;
  width: 100%; max-width: 480px;
  height: min(92vh, 720px);
  border-radius: 20px;
  display: flex; flex-direction: column;
  overflow: hidden;
  background: rgba(10,22,40,0.75);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08);
  animation: smIn .32s cubic-bezier(.34,1.56,.64,1);
}
@keyframes smIn {
  from { opacity: 0; transform: scale(.92) translateY(14px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── CLOSE ────────────────────────────────────────── */
.sm-close {
  position: absolute; top: 12px; right: 12px; z-index: 10;
  background: rgba(255,255,255,0.08); border: none; cursor: pointer;
  color: rgba(255,255,255,0.6);
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px;
  transition: background .15s, color .15s;
}
.sm-close:hover { background: rgba(255,255,255,0.16); color: #fff; }

/* ── SCOREBOARD ───────────────────────────────────── */
.sm-scoreboard {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 12px;
  padding: 20px 16px 8px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sm-sb-team {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: .85rem; font-weight: 800;
  letter-spacing: 1.5px; text-transform: uppercase;
  flex: 1;
}
.sm-sb-team:first-child { text-align: right; }
.sm-sb-team:last-child  { text-align: left; }
.sm-sb-score {
  display: flex; align-items: center; gap: 6px;
  flex-shrink: 0;
}
.sm-sb-num {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.6rem; font-weight: 900;
  line-height: 1; font-variant-numeric: tabular-nums;
}
.sm-sb-x {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem; font-weight: 900;
  color: rgba(255,255,255,0.25);
  line-height: 1;
}

/* ── DATA ─────────────────────────────────────────── */
.sm-date {
  position: relative; z-index: 1;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: .85rem; font-weight: 600;
  color: rgba(255,255,255,0.45);
  padding: 8px 0 4px;
}

/* ── ABAS ─────────────────────────────────────────── */
.sm-tabs {
  position: relative; z-index: 1;
  display: flex;
  margin: 0 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sm-tab {
  flex: 1;
  font-family: 'Outfit', sans-serif;
  font-size: .78rem; font-weight: 700;
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

/* ── SCROLL ───────────────────────────────────────── */
.sm-scroll {
  position: relative; z-index: 1;
  flex: 1; min-height: 0;
  overflow-y: auto; overflow-x: hidden;
  padding: 8px 0 12px;
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

/* ── TEAMS ────────────────────────────────────────── */
.sm-teams {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0 1px;
  padding: 0 16px;
}
.sm-team {
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  padding: 8px 6px;
}
.sm-team:last-child {
  border-left: 1px solid rgba(255,255,255,0.06);
}
.sm-team-header {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: .75rem; font-weight: 800;
  letter-spacing: 2px; text-transform: uppercase;
  padding: 4px 4px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 4px;
}
.sm-team-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0;
}

/* ── JOGADOR ──────────────────────────────────────── */
.sm-player {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  animation: rowIn .2s both;
  animation-delay: calc(var(--ri, 0) * 20ms);
}
.sm-player:last-child { border-bottom: none; }
@keyframes rowIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.sm-player-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  overflow: hidden; flex-shrink: 0;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
}
.sm-player-avatar img {
  width: 100%; height: 100%; object-fit: cover;
}
.sm-player-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: .8rem; font-weight: 700;
  color: rgba(255,255,255,0.5);
}

.sm-player-info {
  flex: 1; min-width: 0;
}
.sm-player-name {
  font-family: 'Outfit', sans-serif;
  font-size: .78rem; font-weight: 600;
  color: rgba(255,255,255,0.85);
  line-height: 1.2;
  display: block;
}
.sm-sub { text-decoration: line-through; opacity: 0.7; }

.sm-player-badges {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 3px; margin-top: 2px;
}

.badge {
  font-family: 'Outfit', sans-serif;
  font-size: .55rem; font-weight: 800;
  padding: 1px 4px; border-radius: 3px;
  text-transform: uppercase; letter-spacing: .3px;
}

.sm-gk {
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4);
}

.sm-goal {
  background: rgba(74,222,128,.15); color: #86efac;
}

.sm-gc {
  background: rgba(239,68,68,.2); color: #fca5a5;
}

.sm-ent {
  background: rgba(74,222,128,.15); color: #86efac;
}

.sm-saiu {
  background: rgba(248,113,113,.15); color: #fca5a5;
}

.sm-card {
  display: inline-block; width: 6px; height: 9px;
  border-radius: 1px; flex-shrink: 0;
  padding: 0;
}
.sm-yl { background: #FACC15; }
.sm-bl { background: #60A5FA; }
.sm-rd { background: #F87171; }

/* ── RESPONSIVO ───────────────────────────────────── */
@media (max-width: 400px) {
  .sm-panel { max-width: 100%; border-radius: 16px; }
  .sm-sb-num { font-size: 2rem; }
  .sm-player-avatar { width: 28px; height: 28px; }
}
</style>
