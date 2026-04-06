<script setup>
import { ref, computed } from 'vue'
import { X, Printer } from 'lucide-vue-next'
import { calcularPontuacao } from '~/composables/usePlayerProfile'
import Dialog from '@/components/ui/dialog/Dialog.vue'

const props = defineProps({
  isOpen: Boolean,
})
const emit = defineEmits(['close'])

const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado } = usePelada()

const isLoading = ref(false)
const jogadores = ref([])

const jogadoresComPontuacao = computed(() =>
  jogadores.value
    .filter(j => j.pontuacao > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao)
)

const dataAtual = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
)

const carregarDados = async () => {
  if (!peladaAtual.value?.id) return

  isLoading.value = true
  jogadores.value = []

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

    // Buscar dados globais em paralelo
    const [
      { data: participantes },
      { data: criterios },
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

    const criteriosComId = { ...(criterios || {}), IdPelada: idPelada }

    // Para cada jogador, buscar dados com as mesmas queries do usePlayerProfile (evita mismatch de tipo)
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

        if (!profile || !criterios) return null

        const pontuacaoBase = calcularPontuacao(jogadas, esperas, criteriosComId, dataIni, dataFim)

        const jogadasIds = new Set(
          (jogadas || [])
            .filter(j => j.partida?.Data >= dataIni && j.partida?.Data <= dataFim)
            .map(j => j.partida?.idPartida)
        )
        const esperasIds = new Set(
          (esperas || [])
            .filter(e => e.partida?.Data >= dataIni && e.partida?.Data <= dataFim && e.partida?.IdPelada == idPelada)
            .map(e => e.partida?.idPartida)
        )
        const faltas = (todasPartidas || []).filter(pt => !jogadasIds.has(pt.idPartida) && !esperasIds.has(pt.idPartida)).length
        const faltasAbonadas = Math.min(faltas, 2)

        return {
          ...profile,
          pontuacao: pontuacaoBase + faltasAbonadas * 2,
          abono_faltas: faltasAbonadas,
          qtd_participacoes: jogadasIds.size,
          qtd_esperas: esperasIds.size,
        }
      })
    )

    jogadores.value = resultado.filter(Boolean)
  } catch (err) {
    console.error('Erro ao carregar relatório:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.isOpen, (val) => {
  if (val) carregarDados()
})

const handlePrint = () => {
  const pelada = nomeFormatado.value
  const data = dataAtual.value
  const logoUrl = window.location.origin + '/images/Propelada8.png'

  const rows = jogadoresComPontuacao.value.map((j, i) => `
    <tr class="${i % 2 !== 0 ? 'stripe' : ''}">
      <td>${i + 1}º</td>
      <td class="col-jogador">${j.apelido_jogador || j.nome_jogador}</td>
      <td>${j.numero_de_gols}</td>
      <td>${j.numero_de_gols_contra}</td>
      <td>${j.total_cartao_amarelo}</td>
      <td>${j.total_cartao_azul}</td>
      <td>${j.total_cartao_vermelho}</td>
      <td>${j.qtd_participacoes}</td>
      <td>${j.qtd_ausencias}</td>
      <td>${j.qtd_partidas_chuva}</td>
      <td>${j.qtd_esperas || 0}</td>
      <td>${j.vitorias}</td>
      <td>${j.empates}</td>
      <td>${j.derrotas}</td>
      <td class="pts">${j.pontuacao}</td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Pontuação - ${pelada}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1b5e20; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #1b5e20; padding-bottom: 12px; margin-bottom: 16px; }
    .header img { height: 40px; margin-bottom: 6px; display: block; margin-left: auto; margin-right: auto; }
    .header h1 { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .header p { font-size: 12px; font-weight: 600; margin: 2px 0; }
    .header .data { font-size: 10px; color: #2e7d32; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background-color: #1b5e20; color: #fff; padding: 6px 4px; text-align: center; font-weight: 700; font-size: 10px; }
    th.col-jogador, td.col-jogador { text-align: left; padding-left: 6px; min-width: 110px; }
    td { padding: 5px 4px; border-bottom: 1px solid #c8e6c9; text-align: center; }
    tr.stripe td { background-color: #f5f5f5; }
    td.pts { font-weight: 800; font-size: 12px; }
    .footer { margin-top: 10px; font-size: 9px; color: #2e7d32; text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="ProPelada" />
    <h1>Relatório de Pontuação</h1>
    <p>${pelada}</p>
    <p class="data">Gerado em: ${data}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th class="col-jogador">Jogador</th>
        <th>Gols</th><th>GC</th>
        <th>Amr</th><th>Azul</th><th>Verm</th>
        <th>P</th><th>F</th><th>Chuva</th><th>Esp</th>
        <th>V</th><th>E</th><th>D</th>
        <th>Pts</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="footer">${jogadoresComPontuacao.value.length} jogadores com pontuação</p>
</body>
</html>`

  const w = window.open('', '_blank', 'width=1000,height=750')
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
    class="max-w-[95vw] w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl !bg-[var(--bg-secondary)]"
  >
    <!-- Header fixo -->
    <div class="rel-header">
      <h2 class="rel-title">Relatório de Pontuação</h2>
      <div class="rel-header-actions">
        <button class="rel-btn-print" @click="handlePrint" title="Imprimir / Salvar PDF">
          <Printer :size="20" />
          <span>PDF</span>
        </button>
        <button class="rel-close-btn" @click="emit('close')"><X :size="20" /></button>
      </div>
    </div>

    <!-- Corpo scrollável -->
    <div class="rel-body">
      <div v-if="isLoading" class="rel-loading">Carregando dados...</div>

      <div v-else-if="jogadoresComPontuacao.length === 0" class="rel-empty">
        Nenhum jogador com pontuação encontrado.
      </div>

      <div v-else class="rel-table-wrapper">
        <table class="rel-table">
          <thead>
            <tr>
              <th class="col-rank">#</th>
              <th class="col-jogador">Jogador</th>
              <th class="col-gols" title="Gols / Gols Contra">Gols</th>
              <th class="col-cartoes" title="Amarelo / Azul / Vermelho">Cartões</th>
              <th class="col-presencas" title="Presenças / Faltas / Chuva / Espera">Presenças</th>
              <th class="col-resultados" title="Vitórias / Empates / Derrotas">Result.</th>
              <th class="col-pontuacao">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(j, i) in jogadoresComPontuacao"
              :key="i"
              :class="{ 'stripe-row': i % 2 !== 0 }"
            >
              <td class="col-rank text-center">
                <span class="rank-badge" :class="i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''">
                  {{ i + 1 }}º
                </span>
              </td>
              <td class="col-jogador">{{ j.apelido_jogador || j.nome_jogador }}</td>
              <td class="col-gols text-center">
                <span class="stat-green">{{ j.numero_de_gols }}</span>
                <span class="sep">/</span>
                <span class="stat-red">{{ j.numero_de_gols_contra }}</span>
              </td>
              <td class="col-cartoes text-center">
                <span class="cartao yellow" title="Amarelo">{{ j.total_cartao_amarelo }}</span>
                <span class="cartao blue" title="Azul">{{ j.total_cartao_azul }}</span>
                <span class="cartao red" title="Vermelho">{{ j.total_cartao_vermelho }}</span>
              </td>
              <td class="col-presencas text-center">
                <span class="stat-blue" title="Presenças">{{ j.qtd_participacoes }}</span>
                <span class="sep">/</span>
                <span class="stat-red" title="Faltas">{{ j.qtd_ausencias }}</span>
                <span class="sep">/</span>
                <span class="stat-lightblue" title="Chuva">{{ j.qtd_partidas_chuva }}</span>
                <template v-if="j.qtd_esperas">
                  <span class="sep">/</span>
                  <span class="stat-purple" title="Espera">{{ j.qtd_esperas }}</span>
                </template>
              </td>
              <td class="col-resultados text-center">
                <span class="stat-gold" title="Vitórias">{{ j.vitorias }}</span>
                <span class="sep">/</span>
                <span class="stat-gray" title="Empates">{{ j.empates }}</span>
                <span class="sep">/</span>
                <span class="stat-red" title="Derrotas">{{ j.derrotas }}</span>
              </td>
              <td class="col-pontuacao text-center">
                <span class="pts-value">{{ j.pontuacao }}</span>
                <span v-if="j.abono_faltas" class="abono-badge" title="Abono de faltas">+{{ j.abono_faltas * 2 }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rel-footer">
      {{ jogadoresComPontuacao.length }} jogadores · {{ nomeFormatado }}
    </div>

  </Dialog>
</template>

<style scoped>
/* ---- Modal shell ---- */
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
  font-size: 1.4rem;
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

/* ---- Tabela ---- */
.rel-table-wrapper {
  overflow-x: auto;
}

.rel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.rel-table thead th {
  background-color: #00897B;
  color: #fff;
  padding: 10px 8px;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
  border-bottom: 2px solid var(--border-color);
}

.rel-table thead th.col-jogador { text-align: left; padding-left: 12px; }

.rel-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.rel-table tbody tr:hover { background: rgba(76,175,80,0.08); }
.stripe-row { background: rgba(255,255,255,0.025); }

.rel-table td {
  padding: 10px 8px;
  vertical-align: middle;
}

.text-center { text-align: center; }

.col-rank { width: 40px; }
.col-jogador { text-align: left; padding-left: 12px; font-weight: 600; color: var(--secondary-color); min-width: 120px; }
.col-gols { min-width: 60px; }
.col-cartoes { min-width: 80px; }
.col-presencas { min-width: 90px; }
.col-resultados { min-width: 80px; }
.col-pontuacao { min-width: 60px; }

/* rank badges */
.rank-badge { font-size: 0.75rem; font-weight: 700; padding: 2px 5px; border-radius: 6px; color: var(--text-secondary); }
.rank-badge.gold   { background: linear-gradient(135deg,#f59e0b,#fbbf24); color: #451a00; }
.rank-badge.silver { background: linear-gradient(135deg,#9ca3af,#d1d5db); color: #1f2937; }
.rank-badge.bronze { background: linear-gradient(135deg,#b45309,#d97706); color: #fff; }

/* stat colors */
.stat-green    { color: #4CAF50; font-weight: 700; }
.stat-red      { color: #F44336; font-weight: 700; }
.stat-blue     { color: #42A5F5; font-weight: 700; }
.stat-lightblue{ color: #81D4FA; font-weight: 700; }
.stat-purple   { color: #CE93D8; font-weight: 700; }
.stat-gold     { color: #FFD54F; font-weight: 700; }
.stat-gray     { color: #90A4AE; font-weight: 700; }
.sep           { color: var(--text-secondary); margin: 0 2px; font-size: 0.75rem; }

/* cartões */
.cartao { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 16px; border-radius: 3px; font-size: 0.75rem; font-weight: 800; margin: 0 2px; }
.cartao.yellow { background: #FFEB3B; color: #333; }
.cartao.blue   { background: #2196F3; color: #fff; }
.cartao.red    { background: #F44336; color: #fff; }

/* pontuação */
.pts-value    { font-size: 1.1rem; font-weight: 800; color: #42A5F5; }
.abono-badge  { font-size: 0.65rem; color: #4CAF50; margin-left: 3px; font-weight: 700; }

</style>
