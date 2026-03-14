<template>
  <div class="ranking-container">
    <header class="ranking-header">
      <div class="header-main">
        <Printer class="print-icon" @click="handlePrint" />
        <h2 class="ranking-title">Ranking ProPelada</h2>
      </div>
    </header>

    <!-- Modal de Perfil -->
    <PlayerProfileModal 
      :is-open="isProfileModalOpen"
      :profile="selectedProfile"
      :is-loading="isProfileLoading"
      @close="isProfileModalOpen = false"
    />

    <div class="table-card card">
      <div class="table-wrapper">
        <table class="ranking-table">
          <thead>
            <tr>
              <th class="col-jogador">Jogador</th>
              <th class="col-stat text-center">%A</th>
              <th class="col-stat text-center">J</th>
              <th class="col-stat text-center">P</th>
              <th class="col-stat text-center">V</th>
              <th class="col-stat text-center">D</th>
              <th class="col-stat text-center">E</th>
              <th class="col-stat text-center">GP</th>
              <th class="col-stat text-center">GC</th>
              <th class="col-stat text-center">SG</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="10" class="loading-cell">Carregando dados do ranking...</td>
            </tr>
            <tr v-else-if="rankingData.length === 0" class="empty-row">
              <td colspan="10">Nenhum dado encontrado para esta pelada.</td>
            </tr>
            <tr v-else v-for="(row, index) in paginatedData" :key="index" :class="{ 'stripe-row': index % 2 !== 0 }">
              <td class="col-jogador">
                <div class="jogador-cell">
                  <span class="jogador-name">{{ row.jogador }}</span>
                  <UserCircle 
                    :size="20" 
                    class="perfil-icon-btn" 
                    @click.stop="openProfile(row.IdParticipante)" 
                  />
                </div>
              </td>
              <td class="col-stat text-center font-bold">
                {{ formatPercent(row['%A']) }}
              </td>
              <td class="col-stat text-center highlighted">{{ row.j }}</td>
              <td class="col-stat text-center">{{ row.p }}</td>
              <td class="col-stat text-center">{{ row.v }}</td>
              <td class="col-stat text-center">{{ row.d }}</td>
              <td class="col-stat text-center">{{ row.e }}</td>
              <td class="col-stat text-center">{{ row.gp }}</td>
              <td class="col-stat text-center">{{ row.gc }}</td>
              <td class="col-stat text-center">{{ row.sg }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div class="pagination-bar">
        <div class="items-per-page">
          <span>linhas por página:</span>
          <select v-model="itemsPerPage">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="pagination-info">
          {{ rangeStart }}-{{ rangeEnd }} de {{ rankingData.length }}
        </div>
        <div class="pagination-controls">
          <ChevronLeft :size="20" @click="prevPage" :class="{ disabled: currentPage === 1 }" />
          <ChevronRight :size="20" @click="nextPage" :class="{ disabled: currentPage === totalPages }" />
        </div>
      </div>
    </div>

    <!-- Filtro Inferior -->
    <div class="filter-section card">
      <div class="filter-select-wrapper">
        <select class="filter-select">
          <option>{{ nomeFormatado || 'Selecione uma única Pelada' }}</option>
        </select>
        <div class="filter-icon-wrapper">
          <Filter :size="20" />
        </div>
      </div>
    </div>

    <!-- Seção apenas para impressão: tabela completa sem paginação -->
    <div class="print-only">
      <div class="print-header">
        <img src="/images/Propelada8.png" alt="ProPelada" class="print-logo" />
        <h1>Ranking ProPelada</h1>
        <p>{{ nomeFormatado }}</p>
        <p class="print-date">Gerado em: {{ dataAtual }}</p>
      </div>
      <table class="ranking-table print-table">
        <thead>
          <tr>
            <th class="col-jogador">Jogador</th>
            <th>%A</th><th>J</th><th>P</th><th>V</th>
            <th>D</th><th>E</th><th>GP</th><th>GC</th><th>SG</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rankingData" :key="i" :class="{ 'stripe-row': i % 2 !== 0 }">
            <td class="col-jogador">{{ row.jogador }}</td>
            <td class="text-center font-bold">{{ formatPercent(row['%A']) }}</td>
            <td class="text-center highlighted">{{ row.j }}</td>
            <td class="text-center">{{ row.p }}</td>
            <td class="text-center">{{ row.v }}</td>
            <td class="text-center">{{ row.d }}</td>
            <td class="text-center">{{ row.e }}</td>
            <td class="text-center">{{ row.gp }}</td>
            <td class="text-center">{{ row.gc }}</td>
            <td class="text-center">{{ row.sg }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Printer, UserCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-vue-next'
import PlayerProfileModal from '~/components/PlayerProfileModal.vue'

const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado } = usePelada()

// Estado
const rankingData = ref([])
const isLoading = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)

// Estado do Modal de Perfil
const isProfileModalOpen = ref(false)
const isProfileLoading = ref(false)
const selectedProfile = ref(null)

// Computed
const totalPages = computed(() => Math.ceil(rankingData.value.length / itemsPerPage.value))
const rangeStart = computed(() => ((currentPage.value - 1) * itemsPerPage.value) + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, rankingData.value.length))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return rankingData.value.slice(start, end)
})

// Funções
const fetchRanking = async () => {
  if (!peladaAtual.value.id) return
  
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('view_ranking_geral_jogadores')
      .select('*')
      .eq('IdPelada', peladaAtual.value.id)
      .order('p', { ascending: false })
      .order('sg', { ascending: false })
      .order('gp', { ascending: false })

    if (error) {
      console.error('Erro ao buscar ranking:', error)
      rankingData.value = []
    } else {
      rankingData.value = data || []
    }
  } catch (err) {
    console.error('Falha na comunicação:', err)
  } finally {
    isLoading.value = false
  }
}

const openProfile = async (idJogador) => {
  if (!idJogador) return

  isProfileLoading.value = true
  isProfileModalOpen.value = true
  selectedProfile.value = null

  try {
    const today = new Date()
    const anoAtual = today.getFullYear()
    const dataIni = `${anoAtual}-01-01`
    const dataHoje = today.toISOString().split('T')[0]
    const idPelada = peladaAtual.value.id

    const [{ data: profile }, { data: criterios }, { data: jogadas }, { data: esperas }] = await Promise.all([
      supabase.rpc('fn_perfil_jogador', {
        p_idjogador: idJogador,
        p_datainicial: dataIni,
        p_datafinal: dataHoje
      }).maybeSingle(),

      supabase.from('Pontuacao').select('*').eq('IdPelada', idPelada).maybeSingle(),

      supabase.from('JogadorPartida')
        .select('Resultado, CartaoAmarelo, CartaoAzul, CartaoVermelho, partida:idPartida(Data, chuva)')
        .eq('IdParticipante', idJogador)
        .eq('IdPelada', idPelada),

      supabase.from('ListaEspera')
        .select('partida:IdPartida(Data, chuva, IdPelada)')
        .eq('idParticipante', idJogador)
    ])

    if (profile && criterios) {
      const jogadasAno = (jogadas || []).filter(j => {
        const d = j.partida?.Data
        return d && d >= dataIni && d <= dataHoje
      })
      const esperasAno = (esperas || []).filter(e => {
        const d = e.partida?.Data
        return d && d >= dataIni && d <= dataHoje && e.partida?.IdPelada == idPelada
      })

      const c = criterios
      const pontuacaoCalculada =
        jogadasAno.length * (c.PartidasJogadas || 0) +
        esperasAno.length * (c.PartidasAssistida || 0) +
        jogadasAno.filter(j => j.partida?.chuva).length * (c.JogadasChuva || 0) +
        esperasAno.filter(e => e.partida?.chuva).length * (c.AssistidasChuva || 0) +
        jogadasAno.filter(j => j.Resultado === 'Vitoria').length * (c.Vitorias || 0) +
        jogadasAno.filter(j => j.Resultado === 'Empate').length * (c.Empates || 0) +
        jogadasAno.filter(j => j.Resultado === 'Derrota').length * (c.Derrotas || 0) +
        jogadasAno.filter(j => j.CartaoAmarelo).length * (c.Amarelo || 0) +
        jogadasAno.filter(j => j.CartaoAzul).length * (c.Azul || 0) +
        jogadasAno.filter(j => j.CartaoVermelho).length * (c.Vermelho || 0)

      selectedProfile.value = { ...profile, pontuacao: pontuacaoCalculada }
    } else {
      selectedProfile.value = profile
    }
  } catch (err) {
    console.error('Falha ao carregar perfil:', err)
  } finally {
    isProfileLoading.value = false
  }
}

const formatPercent = (val) => {
  if (val === undefined || val === null) return '0.0'
  return parseFloat(val).toFixed(1)
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const dataAtual = computed(() => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }))

const handlePrint = () => {
  window.print()
}

// Watchers
watch(() => peladaAtual.value.id, (newId) => {
  if (newId) fetchRanking()
}, { immediate: true })

onMounted(() => {
  if (peladaAtual.value.id) fetchRanking()
})
</script>

<style scoped>
.ranking-container {
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-header {
  margin-bottom: 8px;
  padding-top: 15px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.print-icon {
  color: #4CAF50;
  cursor: pointer;
}

.ranking-title {
  color: #4CAF50;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px; /* Limita a altura para caber o filtro na tela */
  min-height: 200px;
}

.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead th {
  background-color: #00897B;
  color: #FFFFFF; /* Texto branco para contraste total no fundo verde escuro */
  padding: 12px 8px;
  text-align: center;
  font-weight: 700;
  border-bottom: 2px solid var(--border-color);
  text-transform: uppercase;
  font-size: 0.75rem;
}

.col-jogador {
  padding-left: 8px;
  min-width: 140px;
  color: var(--primary-color);
  text-align: left !important;
  font-weight: 600;
}

.col-stat {
  min-width: 45px;
  font-weight: 500;
  color: var(--text-primary);
}

.text-center { text-align: center; }

tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.stripe-row {
  background-color: rgba(255, 255, 255, 0.03);
}

:deep(.light-mode) .stripe-row {
  background-color: rgba(0, 0, 0, 0.03);
}

td {
  padding: 12px 8px;
  vertical-align: middle;
}

.highlighted {
  color: #4CAF50;
  font-weight: 800;
  font-size: 1rem;
}

.jogador-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.jogador-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.perfil-icon-btn {
  color: var(--secondary-color);
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s, color 0.2s;
}

.perfil-icon-btn:hover {
  transform: scale(1.2);
  color: var(--primary-color);
}

.font-bold {
  font-weight: 700;
}

.loading-cell, .empty-row td {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-style: italic;
}

/* Paginação */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 16px;
  gap: 20px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-per-page select {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-controls svg {
  cursor: pointer;
  transition: opacity 0.2s;
  color: var(--primary-color);
}

.pagination-controls svg.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Filtro Inferior */
.filter-section {
  padding: 8px 12px;
}

.filter-select-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  flex: 1;
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.filter-icon-wrapper {
  color: var(--primary-color);
}

@media (max-width: 600px) {
  .ranking-table {
    font-size: 0.75rem;
  }
  
  .col-stat {
    min-width: 30px;
    padding: 8px 4px;
  }
  
  .pagination-bar {
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
}

/* Print-only: escondido na tela */
.print-only {
  display: none;
}

@media print {
  /* Esconde tudo exceto a tabela de impressão */
  .ranking-header,
  .pagination-bar,
  .filter-section,
  .table-card {
    display: none !important;
  }

  .print-only {
    display: block !important;
  }

  .ranking-container {
    padding: 0;
    gap: 0;
  }

  .print-header {
    text-align: center;
    margin-bottom: 16px;
    border-bottom: 3px solid #1b5e20;
    padding-bottom: 12px;
  }

  .print-logo {
    height: 40px;
    width: auto;
    margin-bottom: 6px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .print-header h1 {
    font-size: 20px;
    color: #1b5e20;
    font-weight: 900;
    margin: 0 0 4px 0;
  }

  .print-header p {
    font-size: 13px;
    color: #1b5e20;
    font-weight: 600;
    margin: 2px 0;
  }

  .print-date {
    font-size: 11px;
    color: #2e7d32;
    font-weight: 500;
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    color: #1b5e20;
  }

  .print-table thead th {
    background-color: #1b5e20 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color: #fff !important;
    padding: 6px 4px;
    text-align: center;
    font-size: 10px;
    font-weight: 700;
  }

  .print-table .col-jogador {
    text-align: left !important;
    padding-left: 6px;
    min-width: 120px;
    font-weight: 600;
  }

  .print-table td {
    padding: 5px 4px;
    border-bottom: 1px solid #c8e6c9;
    text-align: center;
    color: #1b5e20;
  }

  .print-table .stripe-row td {
    background-color: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-table .highlighted {
    color: #1b5e20;
    font-weight: 800;
  }
}
</style>
