<template>
  <div class="home-container">
    <main class="content">
      <header class="welcome-header">
        <h1>Bem-vindo ao ProPelada</h1>
        <p v-if="!isVisitor">Gerencie suas partidas, jogadores e estatísticas em um só lugar.</p>
        <p v-else-if="!peladaAtual.id">Escolha uma pelada para consultar resultados e estatísticas.</p>
        <p v-else>Acompanhando a pelada selecionada.</p>
      </header>

      <!-- Seletor de Pelada para Visitante (só mostra se não tem pelada selecionada ou se está trocando) -->
      <div v-if="isVisitor && (!peladaAtual.id || showPeladaSelector)" class="visitor-selection">
        <div class="selection-card card">
          <div class="search-box">
            <Search :size="20" class="search-icon" />
            <input 
              v-model="peladaQuery" 
              type="text" 
              placeholder="Pesquisar pelada por nome..."
              class="pelada-search"
            />
          </div>

          <div class="peladas-list" v-if="filteredPeladas.length > 0">
            <div 
              v-for="p in filteredPeladas" 
              :key="p.idPelada" 
              class="pelada-item"
              :class="{ active: peladaAtual.id === p.idPelada }"
              @click="selectPelada(p)"
            >
              <div class="pelada-info">
                <span class="pelada-name">{{ p.NomePelada }}</span>
                <span class="pelada-detail">{{ p.Dia }} - {{ p.Horario }} • Resp: {{ p.Responsavel }}</span>
              </div>
              <ChevronRight :size="20" class="arrow-icon" />
            </div>
          </div>
          <div v-else-if="isLoading" class="list-empty">Buscando peladas...</div>
          <div v-else class="list-empty">Nenhuma pelada encontrada.</div>
        </div>
      </div>

      <!-- Card da pelada selecionada (visitante) -->
      <div v-if="isVisitor && peladaAtual.id && !showPeladaSelector" class="selected-pelada-card">
        <div class="selected-pelada-info">
          <span class="selected-pelada-label">Pelada selecionada</span>
          <span class="selected-pelada-name">{{ peladaAtual.nome }}</span>
          <span class="selected-pelada-detail">{{ peladaAtual.dia }} - {{ peladaAtual.horario }} • Resp: {{ peladaAtual.responsavel }}</span>
        </div>
        <button class="btn-trocar" @click="showPeladaSelector = true">
          <RefreshCw :size="16" />
          Trocar Pelada
        </button>
      </div>

      <!-- Menu de navegação principal -->
      <div v-if="peladaAtual.id || !isVisitor" class="nav-grid">
        <NuxtLink to="/partidas" class="nav-card">
          <div class="nav-icon-wrap nav-green">
            <Trophy :size="28" />
          </div>
          <span class="nav-label">Partidas</span>
        </NuxtLink>

        <NuxtLink v-if="!isVisitor" to="/participantes" class="nav-card">
          <div class="nav-icon-wrap nav-blue">
            <Users :size="28" />
          </div>
          <span class="nav-label">Participantes</span>
        </NuxtLink>

        <NuxtLink v-if="canViewEstatisticas" to="/estatisticas" class="nav-card">
          <div class="nav-icon-wrap nav-yellow">
            <BarChart2 :size="28" />
          </div>
          <span class="nav-label">Estatísticas</span>
        </NuxtLink>

        <NuxtLink to="/ranking" class="nav-card">
          <div class="nav-icon-wrap nav-orange">
            <Award :size="28" />
          </div>
          <span class="nav-label">Ranking</span>
        </NuxtLink>

        <NuxtLink v-if="!isVisitor" to="/configuracoes" class="nav-card">
          <div class="nav-icon-wrap nav-gray">
            <Settings :size="28" />
          </div>
          <span class="nav-label">Configurações</span>
        </NuxtLink>

        <NuxtLink to="/tutoriais" class="nav-card">
          <div class="nav-icon-wrap nav-purple">
            <PlayCircle :size="28" />
          </div>
          <span class="nav-label">Tutoriais</span>
        </NuxtLink>
      </div>

    </main>
  </div>
</template>

<script setup>
import { Search, ChevronRight, RefreshCw, Trophy, Users, BarChart2, Award, Settings, PlayCircle } from 'lucide-vue-next'

definePageMeta({
  middleware: "auth",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const colorMode = (() => {
  try {
    return useColorMode()
  } catch (e) {
    return { value: 'dark', preference: 'dark' }
  }
})()
const { isVisitor, peladaAtual, fetchAllPeladas, setPelada, canViewEstatisticas } = usePelada()

const peladas = ref([])
const peladaQuery = ref('')
const isLoading = ref(false)
const showPeladaSelector = ref(false)

const filteredPeladas = computed(() => {
  if (!peladaQuery.value) return peladas.value
  const query = peladaQuery.value.toLowerCase()
  return peladas.value.filter(p => 
    p.NomePelada.toLowerCase().includes(query) || 
    p.Responsavel.toLowerCase().includes(query)
  )
})

function selectPelada(p) {
  setPelada(p)
  showPeladaSelector.value = false
  peladaQuery.value = ''
}

onMounted(async () => {
  if (isVisitor.value) {
    isLoading.value = true
    peladas.value = await fetchAllPeladas()
    isLoading.value = false
  }
})
</script>

<style scoped>
.content {
  padding: 1.5rem 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-header {
  margin-bottom: 2rem;
  text-align: center;
}

.welcome-header h1 {
  font-size: 1.8rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.welcome-header p {
  font-size: 1rem;
  color: var(--text-secondary);
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s;
  text-decoration: none;
}

.stat-card.clickable:hover {
  border-color: var(--secondary-color);
  background: color-mix(in srgb, var(--secondary-color), transparent 95%);
  transform: translateY(-5px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Seletor de Visitante */
.visitor-selection {
  margin-bottom: 2rem;
}

.selection-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

.search-box {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.search-icon {
  color: var(--secondary-color);
  margin-right: 12px;
}

.pelada-search {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.peladas-list {
  max-height: 300px;
  overflow-y: auto;
}

.pelada-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.pelada-item:last-child {
  border-bottom: none;
}

.pelada-item:hover {
  background: rgba(0, 200, 83, 0.05);
}

.pelada-item.active {
  background: rgba(0, 200, 83, 0.1);
  border-left: 4px solid var(--secondary-color);
}

.pelada-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pelada-name {
  font-weight: 700;
  color: var(--primary-color);
}

.pelada-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--secondary-color);
  opacity: 0.5;
}

.list-empty {
  padding: 30px;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

/* Card da pelada selecionada */
.selected-pelada-card {
  background: var(--bg-secondary);
  border: 1px solid var(--secondary-color);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: var(--card-shadow);
  border-left: 4px solid var(--secondary-color);
}

.selected-pelada-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.selected-pelada-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 600;
}

.selected-pelada-name {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-pelada-detail {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.btn-trocar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-trocar:hover {
  border-color: var(--secondary-color);
  color: var(--primary-color);
  background: rgba(0, 200, 83, 0.05);
}

/* Grid de navegação */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

@media (min-width: 480px) {
  .nav-grid { grid-template-columns: repeat(3, 1fr); }
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-card:hover {
  transform: translateY(-3px);
  border-color: var(--secondary-color);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.nav-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.nav-green  { background: #1C6A4E; }
.nav-blue   { background: #1565C0; }
.nav-yellow { background: #E65100; }
.nav-orange { background: #FF6F00; }
.nav-gray   { background: #455A64; }
.nav-purple { background: #6A1B9A; }

.nav-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}
</style>
