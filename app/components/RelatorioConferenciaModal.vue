<script setup>
import { ref, computed } from 'vue'
import { X, Printer } from 'lucide-vue-next'
import { calcularPontuacao } from '~/composables/usePlayerProfile'
import Dialog from '@/components/ui/dialog/Dialog.vue'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])

const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado } = usePelada()

const isLoading = ref(false)
const jogadores = ref([])
const criterios = ref(null)

const jogadoresOrdenados = computed(() =>
  [...jogadores.value].sort((a, b) => b.pontuacao - a.pontuacao)
)

const dataAtual = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
)

// Helpers para pontos parciais
const pts = (count, rate) => count * (rate || 0)

const carregarDados = async () => {
  if (!peladaAtual.value?.id) return
  isLoading.value = true
  jogadores.value = []
  criterios.value = null

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
      { data: crit },
      { data: todasPartidas },
    ] = await Promise.all([
      supabase.from('view_ranking_geral_jogadores')
        .select('IdParticipante')
        .eq('IdPelada', idPelada),

      supabase.from('Pontuacao')
        .select('*')
        .eq('IdPelada', idPelada)
        .maybeSingle(),

      supabase.from('Partida')
        .select('idPartida')
        .eq('IdPelada', idPelada)
        .gte('Data', dataIni)
        .lte('Data', dataFim),
    ])

    if (!participantes?.length) return
    criterios.value = crit

    const criteriosComId = { ...(crit || {}), IdPelada: idPelada }

    const resultado = await Promise.all(
      participantes.map(async p => {
        const idJogador = p.IdParticipante

        const [{ data: profile }, { data: jogadas }, { data: esperas }] = await Promise.all([
          supabase.rpc('fn_perfil_jogador', {
            p_idjogador: idJogador,
            p_datainicial: dataIni,
            p_datafinal: dataFim,
          }).maybeSingle(),

          supabase.from('JogadorPartida')
            .select('Resultado, CartaoAmarelo, CartaoAzul, CartaoVermelho, partida:idPartida(idPartida, Data, chuva)')
            .eq('IdParticipante', idJogador)
            .eq('IdPelada', idPelada),

          supabase.from('ListaEspera')
            .select('partida:IdPartida(idPartida, Data, chuva, IdPelada)')
            .eq('idParticipante', idJogador),
        ])

        if (!profile || !crit) return null

        const jogadasAno = (jogadas || []).filter(j => j.partida?.Data >= dataIni && j.partida?.Data <= dataFim)
        const esperasAno = (esperas || []).filter(e =>
          e.partida?.Data >= dataIni && e.partida?.Data <= dataFim && e.partida?.IdPelada == idPelada
        )

        const qtd_presenca = jogadasAno.length
        const qtd_assistido = esperasAno.length
        const qtd_chuva_jogado = jogadasAno.filter(j => j.partida?.chuva).length
        const qtd_chuva_assistido = esperasAno.filter(e => e.partida?.chuva).length

        const jogadasIds = new Set(jogadasAno.map(j => j.partida?.idPartida))
        const esperasIds = new Set(esperasAno.map(e => e.partida?.idPartida))
        const faltas = (todasPartidas || []).filter(pt => !jogadasIds.has(pt.idPartida) && !esperasIds.has(pt.idPartida)).length
        const abono_faltas = Math.min(faltas, 2)

        const pontuacaoBase = calcularPontuacao(jogadas, esperas, criteriosComId, dataIni, dataFim)
        const pontuacao = pontuacaoBase + abono_faltas * 4

        return {
          nome: profile.apelido_jogador || profile.nome_jogador,
          qtd_presenca,
          qtd_falta: faltas,
          qtd_assistido,
          abono_faltas,
          qtd_chuva_jogado,
          qtd_chuva_assistido,
          pontuacao,
        }
      })
    )

    jogadores.value = resultado.filter(Boolean).filter(j => j.pontuacao > 0)
  } catch (err) {
    console.error('Erro ao carregar conferência:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.isOpen, (val) => { if (val) carregarDados() })

const c = computed(() => criterios.value || {})

const handlePrint = () => {
  const pelada = nomeFormatado.value
  const data = dataAtual.value
  const logoUrl = window.location.origin + '/images/Propelada8.png'
  const cr = c.value

  const rows = jogadoresOrdenados.value.map((j, i) => `
    <tr class="${i % 2 !== 0 ? 'stripe' : ''}">
      <td>${i + 1}º</td>
      <td class="col-jogador">${j.nome}</td>
      <td>${j.qtd_presenca}</td>
      <td class="sub">${pts(j.qtd_presenca, cr.PartidasJogadas)}</td>
      <td>${j.qtd_falta}</td>
      <td>${j.qtd_assistido}</td>
      <td class="sub">${pts(j.qtd_assistido, cr.PartidasAssistida)}</td>
      <td>${j.abono_faltas}</td>
      <td class="sub">${j.abono_faltas * 4}</td>
      <td>${j.qtd_chuva_jogado}</td>
      <td class="sub">${pts(j.qtd_chuva_jogado, cr.JogadasChuva)}</td>
      <td>${j.qtd_chuva_assistido}</td>
      <td class="sub">${pts(j.qtd_chuva_assistido, cr.AssistidasChuva)}</td>
      <td class="pts">${j.pontuacao}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Conferência de Pontuação - ${pelada}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1b5e20; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #1b5e20; padding-bottom: 12px; margin-bottom: 16px; }
    .header img { height: 40px; margin-bottom: 6px; display: block; margin-left: auto; margin-right: auto; }
    .header h1 { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .header p { font-size: 12px; font-weight: 600; margin: 2px 0; }
    .header .data { font-size: 10px; color: #2e7d32; }
    table { width: 100%; border-collapse: collapse; }
    thead tr:first-child th { background-color: #1b5e20; color: #fff; padding: 6px 4px; text-align: center; font-weight: 700; font-size: 9px; }
    thead tr:last-child th { background-color: #2e7d32; color: #fff; padding: 4px; text-align: center; font-size: 8px; font-weight: 600; font-style: italic; }
    th.col-jogador, td.col-jogador { text-align: left; padding-left: 6px; min-width: 110px; }
    td { padding: 5px 4px; border-bottom: 1px solid #c8e6c9; text-align: center; }
    td.sub { color: #1565c0; font-weight: 700; background: rgba(33,150,243,0.06); }
    tr.stripe td { background-color: #f5f5f5; }
    tr.stripe td.sub { background: rgba(33,150,243,0.12); }
    td.pts { font-weight: 800; font-size: 12px; color: #1565c0; }
    .footer { margin-top: 10px; font-size: 9px; color: #2e7d32; text-align: right; }
    .group-header { text-align: center; font-size: 8px; font-weight: 800; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="ProPelada" />
    <h1>Conferência de Pontuação</h1>
    <p>${pelada}</p>
    <p class="data">Gerado em: ${data}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th rowspan="2">#</th>
        <th rowspan="2" class="col-jogador">Jogador</th>
        <th colspan="2">Presença (×${cr.PartidasJogadas || 0})</th>
        <th rowspan="2">Falta</th>
        <th colspan="2">Assistido (×${cr.PartidasAssistida || 0})</th>
        <th colspan="2">Abono (×4)</th>
        <th colspan="2">Chuva Jog. (×${cr.JogadasChuva || 0})</th>
        <th colspan="2">Chuva Ass. (×${cr.AssistidasChuva || 0})</th>
        <th rowspan="2">Pts</th>
      </tr>
      <tr>
        <th>Qtd</th><th>Pts</th>
        <th>Qtd</th><th>Pts</th>
        <th>Qtd</th><th>Pts</th>
        <th>Qtd</th><th>Pts</th>
        <th>Qtd</th><th>Pts</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">${jogadoresOrdenados.value.length} jogadores</p>
</body>
</html>`

  const w = window.open('', '_blank', 'width=1100,height=750')
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
      <h2 class="rel-title">Conferência de Pontuação</h2>
      <div class="rel-header-actions">
        <button class="rel-btn-print" @click="handlePrint" title="Imprimir / Salvar PDF">
          <Printer :size="20" />
          <span>PDF</span>
        </button>
        <button class="rel-close-btn" @click="emit('close')"><X :size="20" /></button>
      </div>
    </div>

    <!-- Critérios resumo -->
    <div v-if="criterios" class="rel-criterios">
      <span class="crit-badge">Presença ×{{ c.PartidasJogadas }}</span>
      <span class="crit-badge">Assistido ×{{ c.PartidasAssistida }}</span>
      <span class="crit-badge">Abono ×4</span>
      <span class="crit-badge rain">Chuva Jog. ×{{ c.JogadasChuva }}</span>
      <span class="crit-badge rain">Chuva Ass. ×{{ c.AssistidasChuva }}</span>
    </div>

    <!-- Corpo -->
    <div class="rel-body">
      <div v-if="isLoading" class="rel-loading">Carregando dados...</div>
      <div v-else-if="jogadoresOrdenados.length === 0" class="rel-empty">Nenhum jogador encontrado.</div>

      <div v-else class="rel-table-wrapper">
        <table class="rel-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-rank">#</th>
              <th rowspan="2" class="col-jogador">Jogador</th>
              <th colspan="2" class="group-hdr">Presença ×{{ c.PartidasJogadas }}</th>
              <th rowspan="2" class="col-sm">Falta</th>
              <th colspan="2" class="group-hdr">Assistido ×{{ c.PartidasAssistida }}</th>
              <th colspan="2" class="group-hdr">Abono ×4</th>
              <th colspan="2" class="group-hdr rain-hdr">Chuva Jog. ×{{ c.JogadasChuva }}</th>
              <th colspan="2" class="group-hdr rain-hdr">Chuva Ass. ×{{ c.AssistidasChuva }}</th>
              <th rowspan="2" class="col-pts">Pts</th>
            </tr>
            <tr>
              <th class="sub-hdr">Qtd</th><th class="sub-hdr pts-hdr">Pts</th>
              <th class="sub-hdr">Qtd</th><th class="sub-hdr pts-hdr">Pts</th>
              <th class="sub-hdr">Qtd</th><th class="sub-hdr pts-hdr">Pts</th>
              <th class="sub-hdr">Qtd</th><th class="sub-hdr pts-hdr">Pts</th>
              <th class="sub-hdr">Qtd</th><th class="sub-hdr pts-hdr">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(j, i) in jogadoresOrdenados"
              :key="i"
              :class="{ 'stripe-row': i % 2 !== 0 }"
            >
              <td class="col-rank text-center">
                <span class="rank-badge" :class="i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''">
                  {{ i + 1 }}º
                </span>
              </td>
              <td class="col-jogador">{{ j.nome }}</td>

              <!-- Presença -->
              <td class="text-center">{{ j.qtd_presenca }}</td>
              <td class="text-center pts-sub">{{ pts(j.qtd_presenca, c.PartidasJogadas) }}</td>

              <!-- Falta -->
              <td class="text-center falta-val">{{ j.qtd_falta }}</td>

              <!-- Assistido -->
              <td class="text-center">{{ j.qtd_assistido }}</td>
              <td class="text-center pts-sub">{{ pts(j.qtd_assistido, c.PartidasAssistida) }}</td>

              <!-- Abono -->
              <td class="text-center">{{ j.abono_faltas }}</td>
              <td class="text-center pts-sub">{{ j.abono_faltas * 4 }}</td>

              <!-- Chuva Jogado -->
              <td class="text-center">{{ j.qtd_chuva_jogado }}</td>
              <td class="text-center pts-sub">{{ pts(j.qtd_chuva_jogado, c.JogadasChuva) }}</td>

              <!-- Chuva Assistido -->
              <td class="text-center">{{ j.qtd_chuva_assistido }}</td>
              <td class="text-center pts-sub">{{ pts(j.qtd_chuva_assistido, c.AssistidasChuva) }}</td>

              <!-- Total -->
              <td class="col-pts text-center">
                <span class="pts-value">{{ j.pontuacao }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rel-footer">
      {{ jogadoresOrdenados.length }} jogadores · {{ nomeFormatado }}
    </div>
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

.rel-criterios {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0,0,0,0.15);
}

.crit-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  background: rgba(76,175,80,0.15);
  color: #4CAF50;
  border: 1px solid rgba(76,175,80,0.3);
}
.crit-badge.rain {
  background: rgba(33,150,243,0.15);
  color: #42A5F5;
  border-color: rgba(33,150,243,0.3);
}

.rel-body {
  overflow-y: auto;
  max-height: calc(85vh - 160px);
}

.rel-loading, .rel-empty {
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

.rel-table-wrapper { overflow-x: auto; }

.rel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.rel-table thead th {
  background-color: #00695C;
  color: #fff;
  padding: 7px 6px;
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
  border-bottom: 2px solid var(--border-color);
  border-right: 1px solid rgba(255,255,255,0.1);
}
.rel-table thead th.col-jogador { text-align: left; padding-left: 12px; }

.group-hdr { background-color: #00897B !important; }
.rain-hdr  { background-color: #0277BD !important; }

.sub-hdr {
  background-color: rgba(0,0,0,0.25) !important;
  font-size: 0.6rem !important;
  font-style: italic;
  font-weight: 600 !important;
}
.pts-hdr { background-color: rgba(33,150,243,0.3) !important; }

.rel-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.rel-table tbody tr:hover { background: rgba(76,175,80,0.08); }
.stripe-row { background: rgba(255,255,255,0.025); }

.rel-table td {
  padding: 8px 6px;
  vertical-align: middle;
  border-right: 1px solid rgba(255,255,255,0.04);
}

.text-center { text-align: center; }

.col-rank   { width: 36px; }
.col-jogador { text-align: left; padding-left: 12px !important; font-weight: 600; color: var(--secondary-color); min-width: 120px; }
.col-sm     { min-width: 44px; }
.col-pts    { min-width: 52px; }

.rank-badge { font-size: 0.72rem; font-weight: 700; padding: 2px 5px; border-radius: 6px; color: var(--text-secondary); }
.rank-badge.gold   { background: linear-gradient(135deg,#f59e0b,#fbbf24); color: #451a00; }
.rank-badge.silver { background: linear-gradient(135deg,#9ca3af,#d1d5db); color: #1f2937; }
.rank-badge.bronze { background: linear-gradient(135deg,#b45309,#d97706); color: #fff; }

.pts-sub  { color: #42A5F5; font-weight: 700; background: rgba(33,150,243,0.08); }
.falta-val { color: #F44336; font-weight: 700; }
.pts-value { font-size: 1.1rem; font-weight: 800; color: #42A5F5; }
</style>
