<script setup>
import { ref, watch } from 'vue'
import { X, Printer } from 'lucide-vue-next'
import Dialog from '@/components/ui/dialog/Dialog.vue'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])

const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado } = usePelada()

const isLoading = ref(false)
const dados = ref(null)

const fmtDate = (d) => d
  ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : ''

const carregarDados = async () => {
  if (!peladaAtual.value?.id) return
  isLoading.value = true
  dados.value = null

  try {
    const idPelada = peladaAtual.value.id
    const dataHoje = new Date().toISOString().split('T')[0]

    const { data: pelada } = await supabase
      .from('Pelada')
      .select('DataInicial, DataFinal')
      .eq('idPelada', idPelada)
      .maybeSingle()

    const dataIni = pelada?.DataInicial || `${new Date().getFullYear()}-01-01`
    const dataFim = pelada?.DataFinal || dataHoje

    const [
      { data: participantes },
      { data: partidas },
    ] = await Promise.all([
      supabase.from('Participantes')
        .select('TipoParticipante, Posicao')
        .eq('IdPelada', idPelada),

      supabase.from('Partida')
        .select('idPartida, chuva')
        .eq('IdPelada', idPelada)
        .gte('Data', dataIni)
        .lte('Data', dataFim),
    ])

    const totalParticipantes = (participantes || []).length
    const jogadores = (participantes || []).filter(p => p.TipoParticipante === 'Jogador')
    const totalJogadores = jogadores.length
    const goleiros = jogadores.filter(p => p.Posicao === 'Goleiro').length
    const totalPartidas = (partidas || []).length
    const partidasChuva = (partidas || []).filter(p => p.chuva).length

    const partidaIdsArray = (partidas || []).map(p => p.idPartida)

    let jp = []
    if (partidaIdsArray.length > 0) {
      const { data: jogadorPartida } = await supabase
        .from('JogadorPartida')
        .select('GolPrimeiro, GolSegundo, GolContraPrimeiro, GolContraSegundo, CartaoAmarelo, CartaoAzul, CartaoVermelho, Resultado, Time, idPartida')
        .eq('IdPelada', idPelada)
        .in('idPartida', partidaIdsArray)
      jp = jogadorPartida || []
    }

    // Gols
    const golsPrimeiro = jp.reduce((s, j) => s + (j.GolPrimeiro || 0) + (j.GolContraPrimeiro || 0), 0)
    const golsSegundo = jp.reduce((s, j) => s + (j.GolSegundo || 0) + (j.GolContraSegundo || 0), 0)
    const totalGols = golsPrimeiro + golsSegundo
    const fmt1 = (n) => totalPartidas > 0 ? (n / totalPartidas).toFixed(1) : '0.0'
    const mediaGols = fmt1(totalGols)
    const mediaPrimeiro = fmt1(golsPrimeiro)
    const mediaSegundo = fmt1(golsSegundo)

    // Cartões
    const cartaoAmarelo = jp.filter(j => j.CartaoAmarelo).length
    const cartaoAzul = jp.filter(j => j.CartaoAzul).length
    const cartaoVermelho = jp.filter(j => j.CartaoVermelho).length

    // Desempenho times — único resultado por partida+time
    const normalizeTime = (t) => {
      if (!t) return null
      const tl = t.toLowerCase()
      if (tl === '1' || tl === 'amarelo') return 'amarelo'
      if (tl === '2' || tl === 'azul') return 'azul'
      return null
    }

    const seenPartidaTime = new Map()
    for (const j of jp) {
      const team = normalizeTime(j.Time)
      if (!team || !j.idPartida || !j.Resultado) continue
      const key = `${j.idPartida}-${team}`
      if (!seenPartidaTime.has(key)) seenPartidaTime.set(key, { team, resultado: j.Resultado })
    }

    const results = [...seenPartidaTime.values()]
    const calcTeam = (team) => ({
      v: results.filter(r => r.team === team && r.resultado === 'Vitoria').length,
      e: results.filter(r => r.team === team && r.resultado === 'Empate').length,
      d: results.filter(r => r.team === team && r.resultado === 'Derrota').length,
    })

    dados.value = {
      dataIni, dataFim,
      totalParticipantes, totalJogadores, goleiros, linha: totalJogadores - goleiros,
      totalPartidas, partidasChuva,
      golsPrimeiro, golsSegundo, totalGols, mediaGols, mediaPrimeiro, mediaSegundo,
      cartaoAmarelo, cartaoAzul, cartaoVermelho,
      amarelo: calcTeam('amarelo'),
      azul: calcTeam('azul'),
    }
  } catch (err) {
    console.error('Erro ao carregar resumo:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.isOpen, (val) => { if (val) carregarDados() })

const handlePrint = () => {
  if (!dados.value) return
  const d = dados.value
  const logoUrl = window.location.origin + '/images/Propelada8.png'
  const pelada = nomeFormatado.value

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Resumo da Pelada - ${pelada}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1b5e20; padding: 28px 60px; max-width: 720px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #1b5e20; padding-bottom: 12px; margin-bottom: 20px; }
    .header img { height: 48px; display: block; margin: 0 auto 6px; }
    .header h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
    .header p { font-size: 14px; font-weight: 600; margin: 2px 0; }
    .periodo { font-size: 12px; color: #555; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; border-bottom: 2px solid #1b5e20; padding-bottom: 4px; margin-bottom: 10px; }
    .cards { display: flex; gap: 10px; flex-wrap: wrap; }
    .card { flex: 1; min-width: 70px; background: #f1f8e9; border-radius: 8px; padding: 10px; text-align: center; }
    .card-val { display: block; font-size: 26px; font-weight: 900; color: #1565c0; }
    .card-lbl { display: block; font-size: 10px; color: #2e7d32; font-weight: 700; margin-top: 2px; }
    .c-am { background: #fffbeb; } .c-am .card-val { color: #d97706; }
    .c-az { background: #eff6ff; } .c-az .card-val { color: #1565c0; }
    .c-vr { background: #fef2f2; } .c-vr .card-val { color: #dc2626; }
    .times { display: flex; gap: 12px; }
    .time-box { flex: 1; border-radius: 8px; padding: 12px; text-align: center; }
    .t-am { background: #fffbeb; } .t-am .time-name { color: #d97706; }
    .t-az { background: #eff6ff; } .t-az .time-name { color: #1565c0; }
    .time-name { font-size: 13px; font-weight: 800; margin-bottom: 8px; }
    .time-stats { display: flex; justify-content: center; gap: 20px; }
    .ts-val { display: block; font-size: 22px; font-weight: 900; }
    .ts-lbl { display: block; font-size: 10px; font-weight: 700; color: #555; }
    .win { color: #16a34a; } .draw { color: #6b7280; } .loss { color: #dc2626; }
    .footer { margin-top: 16px; font-size: 11px; color: #2e7d32; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="ProPelada" />
    <h1>Resumo da Pelada</h1>
    <p>${pelada}</p>
    <p class="periodo">Período: ${fmtDate(d.dataIni)} a ${fmtDate(d.dataFim)}</p>
  </div>
  <div class="section">
    <div class="section-title">Jogadores</div>
    <div class="cards">
      <div class="card"><span class="card-val">${d.totalParticipantes}</span><span class="card-lbl">Participantes</span></div>
      <div class="card"><span class="card-val">${d.totalJogadores}</span><span class="card-lbl">Jogadores</span></div>
      <div class="card"><span class="card-val">${d.goleiros}</span><span class="card-lbl">Goleiros</span></div>
      <div class="card"><span class="card-val">${d.linha}</span><span class="card-lbl">Linha</span></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Partidas &amp; Gols</div>
    <div class="cards" style="margin-bottom:8px">
      <div class="card"><span class="card-val">${d.totalPartidas}</span><span class="card-lbl">Partidas</span></div>
      <div class="card" style="background:#eff6ff"><span class="card-val" style="color:#3b82f6">${d.partidasChuva}</span><span class="card-lbl">c/ Chuva</span></div>
    </div>
    <div class="cards" style="margin-bottom:8px">
      <div class="card"><span class="card-val">${d.totalGols}</span><span class="card-lbl">Gols Geral</span></div>
      <div class="card"><span class="card-val">${d.golsPrimeiro}</span><span class="card-lbl">Gols 1º Tempo</span></div>
      <div class="card"><span class="card-val">${d.golsSegundo}</span><span class="card-lbl">Gols 2º Tempo</span></div>
    </div>
    <div class="cards">
      <div class="card" style="background:#f8f8f8"><span class="card-val" style="color:#666;font-size:20px">${d.mediaGols}</span><span class="card-lbl">Média Geral</span></div>
      <div class="card" style="background:#f8f8f8"><span class="card-val" style="color:#666;font-size:20px">${d.mediaPrimeiro}</span><span class="card-lbl">Média 1º Tempo</span></div>
      <div class="card" style="background:#f8f8f8"><span class="card-val" style="color:#666;font-size:20px">${d.mediaSegundo}</span><span class="card-lbl">Média 2º Tempo</span></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Cartões</div>
    <div class="cards">
      <div class="card c-am"><span class="card-val">${d.cartaoAmarelo}</span><span class="card-lbl">Amarelo</span></div>
      <div class="card c-az"><span class="card-val">${d.cartaoAzul}</span><span class="card-lbl">Azul</span></div>
      <div class="card c-vr"><span class="card-val">${d.cartaoVermelho}</span><span class="card-lbl">Vermelho</span></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Desempenho dos Times</div>
    <div class="times">
      <div class="time-box t-am">
        <div class="time-name">Time Amarelo</div>
        <div class="time-stats">
          <div><span class="ts-val win">${d.amarelo.v}</span><span class="ts-lbl">V</span></div>
          <div><span class="ts-val draw">${d.amarelo.e}</span><span class="ts-lbl">E</span></div>
          <div><span class="ts-val loss">${d.amarelo.d}</span><span class="ts-lbl">D</span></div>
        </div>
      </div>
      <div class="time-box t-az">
        <div class="time-name">Time Azul</div>
        <div class="time-stats">
          <div><span class="ts-val win">${d.azul.v}</span><span class="ts-lbl">V</span></div>
          <div><span class="ts-val draw">${d.azul.e}</span><span class="ts-lbl">E</span></div>
          <div><span class="ts-val loss">${d.azul.d}</span><span class="ts-lbl">D</span></div>
        </div>
      </div>
    </div>
  </div>
  <p class="footer">Gerado em: ${new Date().toLocaleDateString('pt-BR')} · ProPelada</p>
</body>
</html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 600)
}
</script>

<template>
  <Dialog
    :open="isOpen"
    @update:open="(val) => { if (!val) emit('close') }"
    class="max-w-[98vw] w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl !bg-[var(--bg-secondary)]"
  >
    <!-- Header -->
    <div class="rel-header">
      <h2 class="rel-title">Resumo da Pelada</h2>
      <div class="rel-header-actions">
        <button class="rel-btn-print" @click="handlePrint" title="Imprimir / Salvar PDF">
          <Printer :size="20" />
          <span>PDF</span>
        </button>
        <button class="rel-close-btn" @click="emit('close')"><X :size="20" /></button>
      </div>
    </div>

    <!-- Body -->
    <div class="rel-body">
      <div v-if="isLoading" class="rel-loading">Carregando dados...</div>
      <div v-else-if="!dados" class="rel-loading">Nenhum dado encontrado.</div>

      <div v-else class="res-content">
        <p class="res-periodo">
          Período: {{ fmtDate(dados.dataIni) }} a {{ fmtDate(dados.dataFim) }}
        </p>

        <!-- Jogadores -->
        <div class="res-section">
          <h3 class="res-section-title">Jogadores</h3>
          <div class="res-cards">
            <div class="res-card accent card-participantes">
              <span class="res-val">{{ dados.totalParticipantes }}</span>
              <span class="res-lbl">Participantes</span>
            </div>
            <div class="res-card">
              <span class="res-val">{{ dados.totalJogadores }}</span>
              <span class="res-lbl">Jogadores</span>
            </div>
            <div class="res-card">
              <span class="res-val">{{ dados.goleiros }}</span>
              <span class="res-lbl">Goleiros</span>
            </div>
            <div class="res-card">
              <span class="res-val">{{ dados.linha }}</span>
              <span class="res-lbl">Linha</span>
            </div>
          </div>
        </div>

        <!-- Partidas & Gols -->
        <div class="res-section">
          <h3 class="res-section-title">Partidas &amp; Gols</h3>
          <div class="res-cards">
            <div class="res-card accent">
              <span class="res-val">{{ dados.totalPartidas }}</span>
              <span class="res-lbl">Partidas</span>
            </div>
            <div class="res-card c-chuva">
              <span class="res-val">{{ dados.partidasChuva }}</span>
              <span class="res-lbl">c/ Chuva</span>
            </div>
          </div>
          <div class="res-cards">
            <div class="res-card">
              <span class="res-val">{{ dados.totalGols }}</span>
              <span class="res-lbl">Gols Geral</span>
            </div>
            <div class="res-card">
              <span class="res-val">{{ dados.golsPrimeiro }}</span>
              <span class="res-lbl">Gols 1º Tempo</span>
            </div>
            <div class="res-card">
              <span class="res-val">{{ dados.golsSegundo }}</span>
              <span class="res-lbl">Gols 2º Tempo</span>
            </div>
          </div>
          <div class="res-cards">
            <div class="res-card media-card">
              <span class="res-val media-val">{{ dados.mediaGols }}</span>
              <span class="res-lbl">Média Geral</span>
            </div>
            <div class="res-card media-card">
              <span class="res-val media-val">{{ dados.mediaPrimeiro }}</span>
              <span class="res-lbl">Média 1º Tempo</span>
            </div>
            <div class="res-card media-card">
              <span class="res-val media-val">{{ dados.mediaSegundo }}</span>
              <span class="res-lbl">Média 2º Tempo</span>
            </div>
          </div>
        </div>

        <!-- Cartões -->
        <div class="res-section">
          <h3 class="res-section-title">Cartões</h3>
          <div class="res-cards">
            <div class="res-card c-amarelo">
              <span class="res-val">{{ dados.cartaoAmarelo }}</span>
              <span class="res-lbl">Amarelo</span>
            </div>
            <div class="res-card c-azul">
              <span class="res-val">{{ dados.cartaoAzul }}</span>
              <span class="res-lbl">Azul</span>
            </div>
            <div class="res-card c-vermelho">
              <span class="res-val">{{ dados.cartaoVermelho }}</span>
              <span class="res-lbl">Vermelho</span>
            </div>
          </div>
        </div>

        <!-- Desempenho dos Times -->
        <div class="res-section">
          <h3 class="res-section-title">Desempenho dos Times</h3>
          <div class="res-times">
            <div class="res-time t-amarelo">
              <div class="time-name">Time Amarelo</div>
              <div class="time-stats">
                <div class="ts"><span class="ts-val win">{{ dados.amarelo.v }}</span><span class="ts-lbl">V</span></div>
                <div class="ts"><span class="ts-val draw">{{ dados.amarelo.e }}</span><span class="ts-lbl">E</span></div>
                <div class="ts"><span class="ts-val loss">{{ dados.amarelo.d }}</span><span class="ts-lbl">D</span></div>
              </div>
            </div>
            <div class="res-time t-azul">
              <div class="time-name">Time Azul</div>
              <div class="time-stats">
                <div class="ts"><span class="ts-val win">{{ dados.azul.v }}</span><span class="ts-lbl">V</span></div>
                <div class="ts"><span class="ts-val draw">{{ dados.azul.e }}</span><span class="ts-lbl">E</span></div>
                <div class="ts"><span class="ts-val loss">{{ dados.azul.d }}</span><span class="ts-lbl">D</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rel-footer">{{ nomeFormatado }}</div>
  </Dialog>
</template>

<style scoped>
.rel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-secondary);
}

.rel-title {
  color: var(--secondary-color);
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.rel-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rel-btn-print {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.rel-btn-print:hover { background: #388E3C; }

.rel-close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}
.rel-close-btn:hover { color: var(--text-primary); }

.rel-body {
  overflow-y: auto;
  max-height: calc(85vh - 120px);
}

.rel-loading {
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.rel-footer {
  padding: 10px 20px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.res-content {
  padding: 16px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.res-periodo {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: -8px;
}

.res-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.res-section-title {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 6px;
}

.res-cards {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.res-card {
  flex: 1;
  min-width: 68px;
  background: var(--bg-primary, rgba(255,255,255,0.04));
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.media-card {
  background: rgba(255,255,255,0.02);
}

.media-val {
  font-size: 1.4rem !important;
  color: var(--text-secondary) !important;
}

.card-participantes {
  padding: 10px 10px !important;
}

.res-card.c-chuva {
  border-color: rgba(147,197,253,0.3);
  background: rgba(147,197,253,0.06);
}
.res-card.c-chuva .res-val { color: #93C5FD; }

.res-val {
  font-size: 1.6rem;
  font-weight: 900;
  color: #42A5F5;
  line-height: 1;
}

.res-lbl {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: center;
}

.res-card.accent .res-val { color: #4CAF50; }

.res-card.c-amarelo { border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }
.res-card.c-amarelo .res-val { color: #F59E0B; }

.res-card.c-azul { border-color: rgba(66,165,245,0.3); background: rgba(66,165,245,0.06); }
.res-card.c-azul .res-val { color: #42A5F5; }

.res-card.c-vermelho { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.06); }
.res-card.c-vermelho .res-val { color: #EF4444; }

.res-times {
  display: flex;
  gap: 12px;
}

.res-time {
  flex: 1;
  border-radius: 12px;
  padding: 14px 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.t-amarelo { background: rgba(245,158,11,0.07); border-color: rgba(245,158,11,0.25); }
.t-azul    { background: rgba(66,165,245,0.07); border-color: rgba(66,165,245,0.25); }

.time-name { font-size: 0.82rem; font-weight: 800; }
.t-amarelo .time-name { color: #F59E0B; }
.t-azul .time-name    { color: #42A5F5; }

.time-stats {
  display: flex;
  gap: 20px;
}

.ts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.ts-val {
  font-size: 1.6rem;
  font-weight: 900;
  line-height: 1;
}

.ts-lbl {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.win  { color: #4CAF50; }
.draw { color: var(--text-secondary); }
.loss { color: #EF4444; }
</style>
