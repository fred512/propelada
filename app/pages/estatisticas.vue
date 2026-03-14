<template>
  <div class="stats-container">
    <div class="page-title-section">
      <h1 class="page-title">Dashboard da Pelada</h1>
      <button class="btn-sync" @click="loadAll" :disabled="isLoading" title="Sincronizar">
        <RefreshCw :size="18" :class="{ 'spinning': isLoading }" />
      </button>
    </div>

    <!-- Filtro de Período -->
    <div class="filter-card card">
      <div class="filter-row">
        <div class="filter-field">
          <label>Início</label>
          <input v-model="dataInicial" type="date" />
        </div>
        <div class="filter-field">
          <label>Fim</label>
          <input v-model="dataFinal" type="date" />
        </div>
        <button class="btn-apply" @click="loadAll">Aplicar</button>
      </div>
    </div>

    <div v-if="!peladaAtual.id" class="empty-state">
      <Trophy :size="48" />
      <p>Selecione uma pelada para ver as estatísticas.</p>
    </div>

    <div v-else-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando estatísticas...</p>
    </div>

    <div v-else class="charts-grid">

      <!-- Gols -->
      <div class="chart-card card" v-if="charts.gols.labels.length">
        <h3 class="chart-title">⚽ Gols</h3>
        <Bar :data="charts.gols" :options="chartOptions" />
      </div>

      <!-- Presenças -->
      <div class="chart-card card" v-if="charts.presencas.labels.length">
        <h3 class="chart-title">📅 Presenças</h3>
        <Bar :data="charts.presencas" :options="chartOptions" />
      </div>

      <!-- Vitórias -->
      <div class="chart-card card" v-if="charts.vitorias.labels.length">
        <h3 class="chart-title">🏆 Vitórias</h3>
        <Bar :data="charts.vitorias" :options="chartOptions" />
      </div>

      <!-- Derrotas -->
      <div class="chart-card card" v-if="charts.derrotas.labels.length">
        <h3 class="chart-title">❌ Derrotas</h3>
        <Bar :data="charts.derrotas" :options="chartOptions" />
      </div>

      <!-- Empates -->
      <div class="chart-card card" v-if="charts.empates.labels.length">
        <h3 class="chart-title">🤝 Empates</h3>
        <Bar :data="charts.empates" :options="chartOptions" />
      </div>

      <!-- Cartão Amarelo -->
      <div class="chart-card card" v-if="charts.amarelos.labels.length">
        <h3 class="chart-title">🟨 Cartão Amarelo</h3>
        <Bar :data="charts.amarelos" :options="chartOptions" />
      </div>

      <!-- Cartão Azul -->
      <div class="chart-card card" v-if="charts.azuis.labels.length">
        <h3 class="chart-title">🟦 Cartão Azul</h3>
        <Bar :data="charts.azuis" :options="chartOptions" />
      </div>

      <!-- Cartão Vermelho -->
      <div class="chart-card card" v-if="charts.vermelhos.labels.length">
        <h3 class="chart-title">🟥 Cartão Vermelho</h3>
        <Bar :data="charts.vermelhos" :options="chartOptions" />
      </div>

      <div v-if="!hasAnyData && !isLoading" class="empty-state">
        <Trophy :size="48" />
        <p>Nenhuma estatística encontrada para o período selecionado.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { RefreshCw, Trophy } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const { peladaAtual } = usePelada()

const isLoading = ref(false)
const dataInicial = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
const dataFinal = ref(new Date().toISOString().split('T')[0])

const emptyChart = () => ({ labels: [], datasets: [] })

const charts = ref({
  gols:      emptyChart(),
  presencas: emptyChart(),
  vitorias:  emptyChart(),
  derrotas:  emptyChart(),
  empates:   emptyChart(),
  amarelos:  emptyChart(),
  azuis:     emptyChart(),
  vermelhos: emptyChart(),
})

const colorMode = useColorMode()

const chartOptions = computed(() => {
  const isDark = colorMode.value === 'dark'
  const tickColor = isDark ? '#E5E7EB' : '#374151'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: {
      padding: { right: 32, left: 4, top: 4, bottom: 4 },
    },
    clip: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: tickColor, font: { size: 11 }, padding: 8 },
        grid: { display: false },
      },
    },
  }
})

const COLORS = {
  gols:      'rgba(76, 175, 80, 0.8)',
  presencas: 'rgba(33, 150, 243, 0.8)',
  vitorias:  'rgba(0, 200, 83, 0.8)',
  derrotas:  'rgba(244, 67, 54, 0.8)',
  empates:   'rgba(255, 193, 7, 0.8)',
  amarelos:  'rgba(255, 193, 7, 0.9)',
  azuis:     'rgba(33, 150, 243, 0.9)',
  vermelhos: 'rgba(244, 67, 54, 0.9)',
}

function buildChart(rows, labelField, valueField, color) {
  if (!rows || rows.length === 0) return emptyChart()
  const top10 = rows.slice(0, 10)
  return {
    labels: top10.map(r => r[labelField] || r.apelido || r.nome || r.jogador || '?'),
    datasets: [{
      data: top10.map(r => r[valueField] || 0),
      backgroundColor: color,
      borderRadius: 4,
    }]
  }
}

const hasAnyData = computed(() =>
  Object.values(charts.value).some(c => c.labels.length > 0)
)

async function loadAll() {
  if (!peladaAtual.value.id) return

  isLoading.value = true
  const id = peladaAtual.value.id

  try {
    const views = [
      { key: 'gols',      view: 'view_ranking_gols',           idCol: 'id_pelada', label: 'apelido_jogador', value: 'total_gols' },
      { key: 'presencas', view: 'view_ranking_presencas',       idCol: 'id_pelada', label: 'apelido_jogador', value: 'total_participacoes' },
      { key: 'vitorias',  view: 'view_ranking_vitorias',        idCol: 'idPelada',  label: 'apelido_jogador', value: 'total_vitorias' },
      { key: 'derrotas',  view: 'view_ranking_derrotas',        idCol: 'idPelada',  label: 'apelido_jogador', value: 'total_derrotas' },
      { key: 'empates',   view: 'view_ranking_empates',         idCol: 'idPelada',  label: 'apelido_jogador', value: 'total_empates' },
      { key: 'amarelos',  view: 'view_ranking_cartaoamarelo',   idCol: 'idPelada',  label: 'apelido_jogador', value: 'total_cartao_amarelo' },
      { key: 'azuis',     view: 'view_ranking_cartaoazul',      idCol: 'idPelada',  label: 'apelido_jogador', value: 'total_cartao_azul' },
      { key: 'vermelhos', view: 'view_ranking_cartaovermelho',  idCol: 'idPelada',  label: 'apelido_jogador', value: 'total_cartao_vermelho' },
    ]

    const results = await Promise.all(
      views.map(v =>
        supabase
          .from(v.view)
          .select('*')
          .eq(v.idCol, id)
          .order(v.value, { ascending: false })
          .limit(10)
      )
    )

    views.forEach((v, i) => {
      const { data, error } = results[i]
      if (!error && data) {
        charts.value[v.key] = buildChart(data, v.label, v.value, COLORS[v.key])
      }
    })

  } catch (e) {
    console.error('Erro ao carregar estatísticas:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!peladaAtual.value.id) return

  const { data: pelada } = await supabase
    .from('Pelada')
    .select('DataInicial, DataFinal')
    .eq('idPelada', peladaAtual.value.id)
    .maybeSingle()

  if (pelada?.DataInicial) dataInicial.value = pelada.DataInicial.split('T')[0]
  if (pelada?.DataFinal) dataFinal.value = pelada.DataFinal.split('T')[0]

  await loadAll()
})

watch(() => peladaAtual.value.id, (newId) => {
  if (newId) loadAll()
})
</script>

<style scoped>
.stats-container {
  padding: 16px;
  color: var(--text-primary);
}

.page-title-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-top: 15px;
}

.page-title {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 8px;
  margin: 0;
}

.btn-sync {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--primary-color);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sync:hover { border-color: var(--primary-color); }
.btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.card {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.filter-card { padding: 16px; }

.filter-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 130px;
}

.filter-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-color);
}

.filter-field input {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.btn-apply {
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .charts-grid { grid-template-columns: 1fr 1fr; }
}

.chart-card { padding: 16px; }

.chart-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 12px 0;
}

.chart-card :deep(canvas) {
  height: 200px !important;
  max-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 16px;
  color: var(--text-secondary);
  text-align: center;
  grid-column: 1 / -1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
