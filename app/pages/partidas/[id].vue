<template>
  <div class="sumula-container">
    <header class="sumula-header">
      <div class="header-main-actions">
        <div class="pelada-info">
          <h2>{{ nomeFormatado }}</h2>
          <div class="title-with-key">
            <button v-if="tipoUsuario === 'Visitante'" class="key-btn" @click="showAccessModal = true">
              <Key :size="20" />
            </button>
            <h3>Súmula do Jogo</h3>
          </div>
        </div>
        
        <div class="action-icons">
          <button class="icon-btn search-blue" title="Pesquisar Partidas" @click="showSearchModal = true">
            <Search :size="20" />
          </button>
          <button class="icon-btn yellow" title="Resumo da Partida" @click="showSummary = true">
            <FileText :size="20" />
          </button>
          <button class="icon-btn red" title="Criar Nova Partida" @click="showCreateMatch = true">
            <Plus :size="20" />
          </button>
          <button class="icon-btn teal" title="Lista de Espera" @click="showWaitingList = true">
            <Users :size="20" />
            <span class="badge">{{ waitingList?.length || 0 }}</span>
          </button>
          <button class="icon-btn green" title="Fechar Partida" @click="closeMatch">
            <CheckSquare :size="20" />
          </button>
        </div>
      </div>
    </header>

    <div class="scoreboard-section card">
      <div class="game-meta">
        <div
          class="timer-badge"
          :class="{ 'second-half': partida?.Status === '2º Tempo', 'timer-running': timerRunning }"
          @click="handleTimerClick"
          title="1 clique: ligar/desligar | 2 cliques: zerar"
        >
          <Clock :size="16" />
          <span v-if="timerRunning || timerSeconds > 0">{{ formatTimer }}</span>
          <span v-else>⏱</span>
        </div>

        <!-- Badge de tempo -->
        <div
          class="half-badge"
          :class="{ 'half-badge-2': partida?.Status === '2º Tempo' }"
          @click="toggleHalf"
          title="Clique para trocar o tempo"
        >
          {{ partida?.Status || '1º Tempo' }}
        </div>
        <div class="game-date">
          {{ formatDate(partida?.Data) }}
        </div>
        <button class="help-btn" @click="showHelp = true">?</button>
      </div>

      <div class="score-display">
        <div class="team-players team-players-1">
          <div class="team-icon">
            <Users :size="24" />
          </div>
          <span class="player-count-badge">17</span>
        </div>
        
        <div class="central-score">
          <span class="score-num team1">{{ scoreTeam1 }}</span>
          <span class="score-divider">x</span>
          <span class="score-num team2">{{ scoreTeam2 }}</span>
        </div>

        <div class="team-players team-players-2">
          <div class="team-icon">
            <Users :size="24" />
          </div>
          <span class="player-count-badge">17</span>
        </div>
      </div>
    </div>

    <!-- Times Grid -->
    <div class="teams-grid">
      <!-- Time 1 -->
      <div class="team-column" :style="{ backgroundColor: configCores.time1 }">
        <div class="team-header">
          <span>TIME 1 (Azul)</span>
          <button class="btn-add-mini" @click="openAddPlayer('1')">
            <Plus :size="16" />
          </button>
        </div>
        <div class="players-list">
          <div v-for="p in team1Players" :key="p.IdJogadorPartida" class="player-item">
            <div class="player-top">
              <span class="player-name">{{ p.Nome }}</span>
              <button class="btn-perfil" @click="viewPlayerProfile(p)">
                <User :size="16" />
              </button>
            </div>
            <div v-if="p.Substituido" class="sub-indicator">Substituído</div>
            <div class="player-bottom">
              <div class="player-stats">
                <button class="stat-goal-btn" @click="openPlayerActions(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.Gol || 0 }}</span>
                </button>
                <button v-if="(p.GolContra || 0) > 0" class="stat-goal-btn" style="color: #F44336;" @click="openPlayerActions(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.GolContra }}</span>
                </button>
              </div>
              <div class="player-actions">
                <button class="btn-menu-mini" @click="openPlayerActions(p)">
                  <Menu :size="18" />
                </button>
                <button class="btn-sub-mini" @click="substitutePlayer(p)">
                  <RefreshCw :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Time 2 -->
      <div class="team-column" :style="{ backgroundColor: configCores.time2 }">
        <div class="team-header">
          <span>TIME 2 (Amarelo)</span>
          <button class="btn-add-mini" @click="openAddPlayer('2')">
            <Plus :size="16" />
          </button>
        </div>
        <div class="players-list">
          <div v-for="p in team2Players" :key="p.IdJogadorPartida" class="player-item">
            <!-- Estrutura idêntica ao time 1 -->
            <div class="player-top">
              <span class="player-name">{{ p.Nome }}</span>
              <button class="btn-perfil" @click="viewPlayerProfile(p)">
                <User :size="16" />
              </button>
            </div>
            <div v-if="p.Substituido" class="sub-indicator">Substituído</div>
            <div class="player-bottom">
              <div class="player-stats">
                <button class="stat-goal-btn" @click="openPlayerActions(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.Gol || 0 }}</span>
                </button>
                <button v-if="(p.GolContra || 0) > 0" class="stat-goal-btn" style="color: #F44336;" @click="openPlayerActions(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.GolContra }}</span>
                </button>
              </div>
              <div class="player-actions">
                <button class="btn-menu-mini" @click="openPlayerActions(p)">
                  <Menu :size="18" />
                </button>
                <button class="btn-sub-mini" @click="substitutePlayer(p)">
                  <RefreshCw :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Flutuante -->
    <footer class="sumula-footer card">
      <button class="rain-toggle" :class="{ 'active': partida?.Chuva || partida?.chuva }" @click="toggleRain">
        <CloudRain :size="24" />
      </button>
      
      <div class="match-status-timer">
        <span class="timer-label">Início do {{ partida?.Status || '1º Tempo' }}</span>
        <span class="timer-clock">{{ timerStartTime }}</span>
      </div>

      <div class="referee-info">
        <span class="referee-name">Juiz</span>
      </div>
    </footer>

    <!-- Modal Perfil do Jogador -->
    <PlayerProfileModal
      :is-open="showProfileModal"
      :profile="selectedProfile"
      :is-loading="isProfileLoading"
      @close="showProfileModal = false"
    />

    <!-- Modal Tutorial Partida -->
    <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
      <div class="modal-content help-modal" @click.stop>
        <div class="modal-header">
          <h2 class="tutorial-title">Tutorial - Súmula do Jogo</h2>
          <button class="close-btn" @click="showHelp = false"><X :size="24" /></button>
        </div>
        <div class="help-grid">
          <p class="help-section-title">Botões do Cabeçalho</p>
          <div class="help-item">
            <span class="icon-circle blue"><Search :size="16" /></span>
            <span>Pesquisar e selecionar outra partida por data</span>
          </div>
          <div class="help-item">
            <span class="icon-circle yellow"><FileText :size="16" /></span>
            <span>Ver resumo dos resultados da partida atual</span>
          </div>
          <div class="help-item">
            <span class="icon-circle red"><Plus :size="16" /></span>
            <span>Criar nova partida — distribui os jogadores automaticamente</span>
          </div>
          <div class="help-item">
            <span class="icon-circle teal"><Users :size="16" /></span>
            <span>Lista de espera — jogadores aguardando para jogar</span>
          </div>
          <div class="help-item">
            <span class="icon-circle green"><CheckSquare :size="16" /></span>
            <span>Fechar partida — habilita estatísticas e bloqueia edições</span>
          </div>
          <p class="help-section-title" style="margin-top: 12px">Cartão do Jogador</p>
          <div class="help-item">
            <span class="icon-emoji">👤</span>
            <span>Ver perfil completo com estatísticas históricas do jogador</span>
          </div>
          <div class="help-item">
            <span class="icon-emoji">⚽</span>
            <span>Toque na bola para abrir as ações do jogador (gols, cartões, etc.)</span>
          </div>
          <div class="help-item">
            <span class="icon-circle dark"><Menu :size="18" /></span>
            <span>Menu de ações: registrar gols, gols contra, cartões, substituição e remoção</span>
          </div>
          <div class="help-item">
            <span class="icon-circle gray"><RefreshCw :size="18" /></span>
            <span>Marcar jogador como substituído</span>
          </div>
          <p class="help-section-title" style="margin-top: 12px">Scoreboard</p>
          <div class="help-item">
            <span class="icon-emoji">⏱️</span>
            <span>Cronômetro — 1 toque: ligar/desligar | 2 toques rápidos: zerar</span>
          </div>
          <div class="help-item">
            <span class="icon-emoji">🕐</span>
            <span>Badge 1º/2º Tempo — toque para trocar o período da partida</span>
          </div>
          <p class="help-section-title" style="margin-top: 12px">Rodapé</p>
          <div class="help-item">
            <span class="icon-emoji">🌧️</span>
            <span>Indicar que a partida ocorreu com chuva</span>
          </div>
          <div class="help-item">
            <span class="icon-emoji">📋</span>
            <span>Status e horário de início do período atual da partida</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Ações do Jogador -->
    <div v-if="showActionsModal && selectedPlayer" class="modal-overlay" @click="showActionsModal = false">
      <div class="modal-content actions-modal" @click.stop>
        <div class="modal-header">
          <div>
            <h2 class="actions-player-name">{{ selectedPlayer.Nome }}</h2>
            <p class="actions-player-sub">Ocorrências da Partida</p>
          </div>
          <button class="close-btn" @click="showActionsModal = false"><X :size="24" /></button>
        </div>

        <!-- Erro de atualização -->
        <div v-if="actionError" class="action-error-msg">
          ⚠️ {{ actionError }}
        </div>

        <!-- Aviso de substituído -->
        <div v-if="selectedPlayer.Substituido === true" class="sub-warning">
          <RefreshCw :size="16" />
          Jogador substituído — ações bloqueadas
        </div>

        <!-- Gols Pro -->
        <div class="action-row" :class="{ 'row-disabled': selectedPlayer.Substituido === true }">
          <span class="action-label">
            <SoccerBall class="action-icon goal-green" />
            Gols
          </span>
          <div class="counter-group">
            <button class="counter-btn minus" :disabled="selectedPlayer.Substituido === true" @click="changeGoal(-1)"><Minus :size="16" /></button>
            <span class="counter-val">{{ selectedPlayer.Gol || 0 }}</span>
            <button class="counter-btn plus" :disabled="selectedPlayer.Substituido === true" @click="changeGoal(1)"><Plus :size="16" /></button>
          </div>
        </div>

        <!-- Gols Contra -->
        <div class="action-row" :class="{ 'row-disabled': selectedPlayer.Substituido === true }">
          <span class="action-label">
            <SoccerBall class="action-icon goal-red" />
            Gol Contra
          </span>
          <div class="counter-group">
            <button class="counter-btn minus" :disabled="selectedPlayer.Substituido === true" @click="changeGoalContra(-1)"><Minus :size="16" /></button>
            <span class="counter-val">{{ selectedPlayer.GolContra || 0 }}</span>
            <button class="counter-btn plus" :disabled="selectedPlayer.Substituido === true" @click="changeGoalContra(1)"><Plus :size="16" /></button>
          </div>
        </div>

        <!-- Cartões -->
        <div class="action-row" :class="{ 'row-disabled': selectedPlayer.Substituido === true }">
          <span class="action-label">Cartões</span>
          <div class="cards-group">
            <button
              class="card-toggle"
              :class="{ 'card-active-yellow': selectedPlayer.CartaoAmarelo }"
              :disabled="selectedPlayer.Substituido === true"
              @click="toggleCard('CartaoAmarelo')"
            >
              <span class="card-rect yellow-rect" />
            </button>
            <button
              class="card-toggle"
              :class="{ 'card-active-blue': selectedPlayer.CartaoAzul }"
              :disabled="selectedPlayer.Substituido === true"
              @click="toggleCard('CartaoAzul')"
            >
              <span class="card-rect blue-rect" />
            </button>
            <button
              class="card-toggle"
              :class="{ 'card-active-red': selectedPlayer.CartaoVermelho }"
              :disabled="selectedPlayer.Substituido === true"
              @click="toggleCard('CartaoVermelho')"
            >
              <span class="card-rect red-rect" />
            </button>
          </div>
        </div>

        <!-- Substituído -->
        <div class="action-row">
          <span class="action-label"><RefreshCw :size="18" /> Substituído</span>
          <button
            class="toggle-sub"
            :class="{ active: selectedPlayer.Substituido === true }"
            @click="toggleSubstitution"
          >{{ selectedPlayer.Substituido === true ? 'Sim' : 'Não' }}</button>
        </div>

        <!-- Remover -->
        <div class="action-row-danger">
          <button class="btn-remove-player" @click="removeFromMatch">
            🗑️ Remover da Partida
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Resumo da Partida -->
    <div v-if="showSummary" class="modal-overlay" @click="showSummary = false">
      <div class="modal-content summary-modal" @click.stop>

        <!-- Cabeçalho fixo: fechar + info + placar -->
        <div class="s-fixed-header">
          <div class="s-tabs-row">
            <span class="s-modal-title">Resumo da Partida</span>
            <button class="close-btn" @click="showSummary = false"><X :size="22" /></button>
          </div>

          <!-- Info da partida -->
          <div class="s-match-info">
            <span v-if="partida?.Chuva || partida?.chuva" class="s-rain"><CloudRain :size="28" /></span>
            <span class="s-info-date">{{ formatDate(partida?.Data) }}</span>
          </div>

          <!-- Placar geral -->
          <div class="s-placar-row">
            <span class="s-placar-label">Placar :</span>
            <span class="s-placar-num t1-color">{{ scoreTeam1 }}</span>
            <span class="s-placar-x">x</span>
            <span class="s-placar-num t2-color">{{ scoreTeam2 }}</span>
          </div>

          <!-- Placar por Tempo -->
          <div class="s-half-scores">
            <div class="s-half-item">
              <span class="s-half-label">1º Tempo</span>
              <span class="s-half-num t1-color">{{ score1T1 }}</span>
              <span class="s-half-x">x</span>
              <span class="s-half-num t2-color">{{ score1T2 }}</span>
            </div>
            <div class="s-half-divider" />
            <div class="s-half-item">
              <span class="s-half-label">2º Tempo</span>
              <span class="s-half-num t1-color">{{ score2T1 }}</span>
              <span class="s-half-x">x</span>
              <span class="s-half-num t2-color">{{ score2T2 }}</span>
            </div>
          </div>
        </div>

        <!-- Área scrollável: apenas os times -->
        <div class="s-scroll-area">
          <div class="s-two-cols">
            <!-- Time 1 (Azul) -->
            <div class="s-team-card t1-bg">
              <p class="s-team-card-title">TIME 1</p>
              <p class="s-section-lbl">Jogadores</p>
              <div v-for="p in team1Players" :key="'t1p'+p.IdJogadorPartida" class="s-full-player">
                <span class="s-fp-name" :class="{ 'fp-sub': p.Substituido }">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="(p.Gol||0)>0" class="s-fp-stat">
                    <SoccerBall style="width:12px;height:12px;color:#1b5e20;" /> {{ p.Gol }}
                  </span>
                  <span v-if="(p.GolContra||0)>0" class="s-fp-stat">
                    <SoccerBall style="width:12px;height:12px;color:#b71c1c;" /> {{ p.GolContra }}
                  </span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                  <span v-if="p.Substituido" class="s-fp-sub-tag">SUB</span>
                </div>
              </div>
            </div>

            <!-- Time 2 (Amarelo) -->
            <div class="s-team-card t2-bg">
              <p class="s-team-card-title">TIME 2</p>
              <p class="s-section-lbl">Jogadores</p>
              <div v-for="p in team2Players" :key="'t2p'+p.IdJogadorPartida" class="s-full-player">
                <span class="s-fp-name" :class="{ 'fp-sub': p.Substituido }">{{ p.Nome }}</span>
                <div class="s-fp-events">
                  <span v-if="(p.Gol||0)>0" class="s-fp-stat">
                    <SoccerBall style="width:12px;height:12px;color:#1b5e20;" /> {{ p.Gol }}
                  </span>
                  <span v-if="(p.GolContra||0)>0" class="s-fp-stat">
                    <SoccerBall style="width:12px;height:12px;color:#b71c1c;" /> {{ p.GolContra }}
                  </span>
                  <span v-if="p.CartaoAmarelo" class="s-fc-chip fc-yellow" />
                  <span v-if="p.CartaoAzul" class="s-fc-chip fc-blue" />
                  <span v-if="p.CartaoVermelho" class="s-fc-chip fc-red" />
                  <span v-if="p.Substituido" class="s-fp-sub-tag">SUB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Pesquisa de Partidas -->
    <div v-if="showSearchModal" class="modal-overlay" @click="showSearchModal = false">
      <div class="modal-content search-modal" @click.stop>
        <div class="modal-header">
          <h2 class="search-title">Selecione uma Partida</h2>
          <button class="close-btn" @click="showSearchModal = false"><X :size="24" /></button>
        </div>
        
        <div class="search-filters">
          <div class="date-filter-row">
            <input type="date" v-model="startDate" class="date-input-native" />
            <span class="filter-sep">até</span>
            <input type="date" v-model="endDate" class="date-input-native" />
            <button v-if="dateFilterActive" class="btn-clear-filter" @click="startDate = ''; endDate = ''">✕</button>
          </div>
        </div>

        <div class="matches-search-list">
          <div class="matches-search-scroll">
            <div v-for="m in filteredMatches" :key="m.idPartida" class="match-search-item" @click="selectMatch(m.idPartida)">
              <span class="match-date">{{ formatDate(m.Data) }}</span>
              <Check v-if="m.idPartida == route.params.id" :size="20" class="selected-check" />
              <div v-else class="check-box"></div>
            </div>
          </div>
          <button
            v-if="!dateFilterActive && matches.length > 5"
            class="btn-load-more"
            @click="showAllMatches = !showAllMatches"
          >
            {{ showAllMatches ? 'Mostrar últimas 5' : `Ver todas (${matches.length})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Lista de Espera -->
    <div v-if="showWaitingList" class="modal-overlay" @click="showWaitingList = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Lista de Espera</h2>
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="icon-btn search-blue" style="width:36px;height:36px;" title="Buscar participante" @click="openParticipantSearch">
              <Search :size="16" />
            </button>
            <button class="close-btn" @click="showWaitingList = false"><X :size="24" /></button>
          </div>
        </div>
        <div class="waiting-list-body">
          <div v-if="waitingList.length === 0" class="empty-list">Ninguém na espera.</div>
          <div v-for="w in waitingList" :key="w.idJogadorLista" class="waiting-item">
            <span>{{ w.Apelido || '?' }}</span>
            <button class="btn-delete-waiting" @click="removeFromWaitingList(w)" title="Remover da lista">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Busca de Participantes -->
    <div v-if="showParticipantSearch" class="modal-overlay" @click="showParticipantSearch = false">
      <div class="modal-content participant-search-modal" @click.stop>
        <div class="modal-header">
          <h2 class="search-title">Buscar Participante</h2>
          <button class="close-btn" @click="showParticipantSearch = false"><X :size="24" /></button>
        </div>

        <div class="ps-search-row">
          <input
            v-model="participantSearchQuery"
            type="text"
            placeholder="Nome ou apelido..."
            class="ps-input"
            @input="searchParticipants"
          />
        </div>

        <div class="ps-list">
          <div v-if="isSearchingParticipants" class="ps-loading">Buscando...</div>
          <div v-else-if="participantSearchResults.length === 0" class="ps-empty">
            Nenhum participante encontrado
          </div>
          <div
            v-for="p in participantSearchResults"
            :key="p.IdParticipante"
            class="ps-item"
            @click="addToWaitingList(p)"
          >
            <div class="ps-info">
              <span class="ps-name">{{ p.Apelido || p.apelido || p.Nome || p.nome }}</span>
              <span class="ps-type">{{ p.TipoParticipante }}</span>
            </div>
            <Plus :size="18" class="ps-add-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criação de Partida -->
    <div v-if="showCreateMatch" class="modal-overlay" @click="showCreateMatch = false">
      <div class="modal-content new-match-modal" @click.stop>
        <div class="modal-header">
          <h2 class="nm-title">Nova Partida</h2>
          <button class="close-btn" @click="showCreateMatch = false"><X :size="24" /></button>
        </div>

        <div class="nm-body">
          <div class="nm-field">
            <label class="nm-label"><Calendar :size="15" /> Data da Partida</label>
            <input v-model="newMatchDate" type="date" class="nm-input" />
          </div>


          <div class="nm-actions">
            <button class="nm-btn-cancel" @click="showCreateMatch = false">Cancelar</button>
            <button class="nm-btn-create" :disabled="!newMatchDate" @click="createNewMatch">
              <Plus :size="16" /> Criar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Key, Search, FileText, Plus, Users, CheckSquare,
  Clock, User, RefreshCw, Menu, CloudRain, X,
  StickyNote, RotateCcw, Calendar, Check, Minus, Trash2
} from 'lucide-vue-next'
import PlayerProfileModal from '~/components/PlayerProfileModal.vue'
import SoccerBall from '~/components/SoccerBall.vue'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado, setPelada } = usePelada()

// Estado
const partida = ref(null)
const team1Players = ref([])
const team2Players = ref([])
const waitingList = ref([])
const scoreTeam1 = ref(0)
const scoreTeam2 = ref(0)
const timeRemaining = ref(0)
const tipoUsuario = ref('Admin')
const configCores = ref({ time1: '#2196F3', time2: '#FFEB3B' })
const newMatchDate = ref(new Date().toISOString().split('T')[0])

// Modais
const showHelp = ref(false)
const showSummary = ref(false)
const showWaitingList = ref(false)
const showAccessModal = ref(false)
const showCreateMatch = ref(false)
const showSearchModal = ref(false)

// Modal Perfil do Jogador
const showProfileModal = ref(false)
const selectedProfile = ref(null)
const isProfileLoading = ref(false)

// Modal Ações do Jogador
const showActionsModal = ref(false)
const selectedPlayer = ref(null)
const actionError = ref('')

const matches = ref([])
const startDate = ref('')
const endDate = ref('')
const showAllMatches = ref(false)

// Resumo
const summaryTab = ref('geral')

// Busca de participantes
const showParticipantSearch = ref(false)
const participantSearchQuery = ref('')
const participantSearchResults = ref([])
const isSearchingParticipants = ref(false)


// Cronômetro
const timerRunning = ref(false)
const timerSeconds = ref(0)
const timerStartTime = ref('--:--')
let timerInterval = null
let timerClickCount = 0
let timerClickTimeout = null

const getCurrentTime = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const formatTimer = computed(() => {
  const m = Math.floor(timerSeconds.value / 60)
  const s = timerSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const toggleTimer = () => {
  if (timerRunning.value) {
    clearInterval(timerInterval)
    timerRunning.value = false
  } else {
    timerStartTime.value = getCurrentTime()
    timerInterval = setInterval(() => { timerSeconds.value++ }, 1000)
    timerRunning.value = true
  }
}

const resetTimer = () => {
  clearInterval(timerInterval)
  timerRunning.value = false
  timerSeconds.value = 0
}

const handleTimerClick = () => {
  timerClickCount++
  if (timerClickCount >= 2) {
    clearTimeout(timerClickTimeout)
    timerClickCount = 0
    resetTimer()
  } else {
    timerClickTimeout = setTimeout(() => {
      timerClickCount = 0
      toggleTimer()
    }, 280)
  }
}

const toggleHalf = async () => {
  if (!partida.value) return
  const current = (partida.value.Status || '').trim()
  const newStatus = current === '2\u00ba Tempo' ? '1\u00ba Tempo' : '2\u00ba Tempo'

  // Atualiza localmente de forma imediata
  partida.value.Status = newStatus
  timerStartTime.value = getCurrentTime()
  resetTimer()

  // Salva no banco (mesmo padrão do toggleRain)
  const { error } = await supabase
    .from('Partida')
    .update({ Status: newStatus })
    .eq('idPartida', partida.value.idPartida)
  if (error) console.error('Erro ao salvar status:', JSON.stringify(error))
}

onUnmounted(() => {
  clearInterval(timerInterval)
  clearTimeout(timerClickTimeout)
})

const fetchWaitingList = async () => {
  const matchId = route.params.id
  if (!matchId) return

  const { data, error } = await supabase
    .from('ListaEspera')
    .select('idJogadorLista, Apelido, idParticipante, Classificacao')
    .eq('IdPartida', Number(matchId))
    .order('idJogadorLista')

  if (!error && data) {
    waitingList.value = data
  } else {
    console.error('Erro ao buscar ListaEspera:', error)
  }
}


const fetchMatches = async () => {
  const targetId = peladaAtual.value.id || partida.value?.IdPelada
  if (!targetId) return

  const { data, error } = await supabase
    .from('Partida')
    .select('idPartida, Data')
    .eq('IdPelada', targetId)
    .order('Data', { ascending: false })
  
  if (error) {
    console.error('Erro ao buscar partidas:', error)
  } else if (data) {
    matches.value = data
  }
}

const fetchMatchData = async () => {
  const matchId = route.params.id
  if (!matchId) return

  console.log('Iniciando fetchMatchData para ID:', matchId)

  // 1. Buscar dados básicos da partida e Pelada
  const { data: matchData, error: matchError } = await supabase
    .from('Partida')
    .select(`
      *,
      Pelada:IdPelada(*)
    `)
    .eq('idPartida', matchId)
    .single()

  if (matchError) {
    console.error('Erro ao buscar dados da partida:', matchError)
    return
  }

  if (matchData) {
    console.log('Dados da partida carregados:', matchData)
    partida.value = matchData
    
    // 2. Buscar jogadores da partida separadamente (mais confiável)
    const { data: playersData, error: playersError } = await supabase
      .from('JogadorPartida')
      .select('*')
      .eq('idPartida', matchId)

    if (playersError) {
      console.error('Erro ao buscar jogadores da partida:', playersError)
    } else {
      console.log('Jogadores da partida carregados:', playersData?.length || 0, 'jogadores')
      processPlayers(playersData || [])
    }
    
    // Sincroniza a pelada atual
    if (matchData.Pelada && (!peladaAtual.value.id || peladaAtual.value.id !== matchData.Pelada.idPelada)) {
      setPelada(matchData.Pelada)
    }
    
    if (matches.value.length === 0) {
      fetchMatches()
    }
    
    fetchWaitingList()
  }
}

onMounted(async () => {
  await fetchMatchData()
})

// REVERIFY: Watch for route ID changes to reload data without full mount
watch(() => route.params.id, (newId) => {
  if (newId) {
    console.log('ID da partida mudou para:', newId)
    fetchMatchData()
  }
})

// Recarregar partidas e lista de espera quando a pelada for definida/alterada
watch(() => peladaAtual.value.id, (newId) => {
  if (newId) {
    fetchMatches()
    fetchWaitingList()
  }
}, { immediate: true })

const dateFilterActive = computed(() => startDate.value || endDate.value)

const filteredMatches = computed(() => {
  if (!matches.value || matches.value.length === 0) return []

  let result = matches.value

  if (dateFilterActive.value) {
    result = result.filter(m => {
      if (!m.Data) return false
      const d = m.Data.split('T')[0]
      if (startDate.value && d < startDate.value) return false
      if (endDate.value && d > endDate.value) return false
      return true
    })
  } else if (!showAllMatches.value) {
    result = result.slice(0, 5)
  }

  return result
})

// Computeds para resumo
const team1Scorers = computed(() =>
  team1Players.value.filter(p => (p.Gol || 0) > 0).sort((a, b) => (b.Gol || 0) - (a.Gol || 0))
)
const team2Scorers = computed(() =>
  team2Players.value.filter(p => (p.Gol || 0) > 0).sort((a, b) => (b.Gol || 0) - (a.Gol || 0))
)
const team1CardsPlayers = computed(() =>
  team1Players.value.filter(p => p.CartaoAmarelo || p.CartaoAzul || p.CartaoVermelho)
)
const team2CardsPlayers = computed(() =>
  team2Players.value.filter(p => p.CartaoAmarelo || p.CartaoAzul || p.CartaoVermelho)
)

// Placar por tempo — nomes reais da tabela JogadorPartida
const getGol1T = (p) => p.GolPrimeiro || 0
const getGol2T = (p) => p.GolSegundo || 0
const getGolContra1T = (p) => p.GolContraPrimeiro || 0
const getGolContra2T = (p) => p.GolContraSegundo || 0

const score1T1 = computed(() => team1Players.value.reduce((acc, p) => acc + getGol1T(p), 0)
  + team2Players.value.reduce((acc, p) => acc + getGolContra1T(p), 0))
const score1T2 = computed(() => team2Players.value.reduce((acc, p) => acc + getGol1T(p), 0)
  + team1Players.value.reduce((acc, p) => acc + getGolContra1T(p), 0))
const score2T1 = computed(() => team1Players.value.reduce((acc, p) => acc + getGol2T(p), 0)
  + team2Players.value.reduce((acc, p) => acc + getGolContra2T(p), 0))
const score2T2 = computed(() => team2Players.value.reduce((acc, p) => acc + getGol2T(p), 0)
  + team1Players.value.reduce((acc, p) => acc + getGolContra2T(p), 0))

const selectMatch = (id) => {
  showSearchModal.value = false
  router.push(`/partidas/${id}`)
}

const targetTeam = ref('1')

// Ações
const openAddPlayer = (team) => {
  targetTeam.value = team
  showWaitingList.value = true
}

const addToMatch = async (participante) => {
  if (!partida.value) return

  const { error } = await supabase
    .from('JogadorPartida')
    .insert([{
      idPartida: partida.value.idPartida,
      idParticipante: participante.IdParticipante || participante.idParticipante,
      Nome: participante.Nome || participante.apelido || participante.nome || '?',
      Time: targetTeam.value,
      Gol: 0,
      CartaoAmarelo: false,
      CartaoAzul: false,
      CartaoVermelho: false,
      Substituido: false
    }])

  if (!error) {
    showWaitingList.value = false
    await fetchMatchData()
  } else {
    console.error('Erro ao adicionar jogador à partida:', error)
  }
}

const substitutePlayer = async (p) => {
  const idField = Object.keys(p).find(k => k.toLowerCase() === 'idjogadorpartida') || 'IdJogadorPartida'
  const id = p[idField]
  
  if (!id) {
    console.error('substitutePlayer: ID não encontrado em', p)
    return
  }

  const { error } = await supabase
    .from('JogadorPartida')
    .update({ Substituido: !p.Substituido })
    .eq(idField, id)

  if (!error) await fetchMatchData()
}

const viewPlayerProfile = async (participante) => {
  isProfileLoading.value = true
  showProfileModal.value = true
  selectedProfile.value = null

  try {
    const { data: pelada } = await supabase
      .from('Pelada')
      .select('DataInicial, DataFinal')
      .eq('idPelada', peladaAtual.value.id)
      .maybeSingle()

    const dataIni = pelada?.DataInicial || `${new Date().getFullYear()}-01-01`
    const dataFim = pelada?.DataFinal   || new Date().toISOString().split('T')[0]

    const idJogador = participante.idParticipante || participante.IdParticipante

    const { data: profile } = await supabase
      .rpc('fn_perfil_jogador', {
        p_idjogador:  idJogador,
        p_datainicial: dataIni,
        p_datafinal:   dataFim
      })
      .maybeSingle()

    selectedProfile.value = profile
  } catch (e) {
    console.error('Erro ao carregar perfil:', e)
  } finally {
    isProfileLoading.value = false
  }
}

const openPlayerActions = (p) => {
  // Descobre dinamicamente o nome da coluna PK (IdJogadorPartida, idJogadorPartida, id, etc.)
  const idField = Object.keys(p).find(k => k.toLowerCase() === 'idjogadorpartida') || 'id'
  const resolvedId = p[idField]
  console.log('openPlayerActions: idField=', idField, 'id=', resolvedId, 'keys=', Object.keys(p))
  selectedPlayer.value = {
    ...p,
    _idField: idField,
    _id: resolvedId,
    Substituido: p.Substituido === true || p.Substituido === 1
  }
  actionError.value = ''
  showActionsModal.value = true
}

const updatePlayerStat = async (field, value) => {
  if (!selectedPlayer.value) return
  
  const id = selectedPlayer.value._id || selectedPlayer.value.IdJogadorPartida || selectedPlayer.value.idJogadorPartida
  const idField = selectedPlayer.value._idField || 'IdJogadorPartida'
  
  if (!id) {
    actionError.value = `ID do jogador não encontrado. Feche e abra o modal novamente.`
    console.error('updatePlayerStat: IdJogadorPartida não encontrado em', selectedPlayer.value)
    return
  }

  actionError.value = ''
  const { error } = await supabase
    .from('JogadorPartida')
    .update({ [field]: value })
    .eq(idField, id)

  if (!error) {
    selectedPlayer.value[field] = value
    await fetchMatchData()
  } else {
    actionError.value = `Erro ao salvar (${field}): ${error.message || error.code || 'verifique as permissões do Supabase'}`
    console.error(`Erro ao atualizar ${field}:`, error)
  }
}

const changeGoal = async (delta) => {
  const newVal = Math.max(0, (selectedPlayer.value.Gol || 0) + delta)
  await updatePlayerStat('Gol', newVal)
}

const changeGoalContra = async (delta) => {
  const newVal = Math.max(0, (selectedPlayer.value.GolContra || 0) + delta)
  await updatePlayerStat('GolContra', newVal)
}

const toggleCard = async (cardField) => {
  const newVal = !selectedPlayer.value[cardField]
  await updatePlayerStat(cardField, newVal)
}

const toggleSubstitution = async () => {
  const newVal = !selectedPlayer.value.Substituido
  await updatePlayerStat('Substituido', newVal)
}

const removeFromMatch = async () => {
  if (!selectedPlayer.value) return
  
  const id = selectedPlayer.value._id || selectedPlayer.value.IdJogadorPartida || selectedPlayer.value.idJogadorPartida
  const idField = selectedPlayer.value._idField || 'IdJogadorPartida'
  
  if (!id) {
    actionError.value = `ID do jogador não encontrado para remover.`
    return
  }

  const { error } = await supabase
    .from('JogadorPartida')
    .delete()
    .eq(idField, id)

  if (!error) {
    showActionsModal.value = false
    selectedPlayer.value = null
    await fetchMatchData()
  } else {
    actionError.value = `Erro ao remover: ${error.message}`
  }
}

const processPlayers = (players) => {
  console.log('Processando jogadores. Total recebido:', players?.length)
  if (players && players.length > 0) {
    console.log('=== CAMPOS DO JOGADORPARTIDA ===', Object.keys(players[0]))
    console.log('Primeiro jogador completo:', JSON.stringify(players[0]))
  }

  // Mapeamento flexível: aceita 1/2 ou azul/amarelo
  team1Players.value = players.filter(p => {
    const rawT = p.Time || p.time || p.idTime || p.IdTime || ''
    const t = String(rawT).toLowerCase().trim()
    // Debug para entender o valor exato
    if (players.indexOf(p) === 0) console.log('Valor Time processado:', t, `(Original: "${rawT}")`)
    
    return t === '1' || t === 'azul'
  }).sort((a, b) => (a.Nome || '').localeCompare(b.Nome || ''))
  
  team2Players.value = players.filter(p => {
    const rawT = p.Time || p.time || p.idTime || p.IdTime || ''
    const t = String(rawT).toLowerCase().trim()
    return t === '2' || t === 'amarelo'
  }).sort((a, b) => (a.Nome || '').localeCompare(b.Nome || ''))
  
  console.log('Time 1:', team1Players.value.length, 'jogadores')
  console.log('Time 2:', team2Players.value.length, 'jogadores')
  
  scoreTeam1.value = team1Players.value.reduce((acc, p) => acc + (p.Gol || p.gol || 0), 0) + team2Players.value.reduce((acc, p) => acc + (p.GolContra || p.golContra || 0), 0)
  scoreTeam2.value = team2Players.value.reduce((acc, p) => acc + (p.Gol || p.gol || 0), 0) + team1Players.value.reduce((acc, p) => acc + (p.GolContra || p.golContra || 0), 0)
}

const formatDate = (date) => {
  if (!date) return '--/--/----'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const toggleRain = async () => {
  if (tipoUsuario.value !== 'Admin') return
  const isRaining = partida.value.Chuva || partida.value.chuva || false
  const newVal = !isRaining
  
  // Try sending both variations if we are not sure about case sensitivity in DB
  const updatePayload = partida.value.hasOwnProperty('chuva') 
    ? { chuva: newVal } 
    : { Chuva: newVal }

  const { error } = await supabase
    .from('Partida')
    .update(updatePayload)
    .eq('idPartida', partida.value.idPartida)
  
  if (!error) {
    if (partida.value.hasOwnProperty('chuva')) partida.value.chuva = newVal
    if (partida.value.hasOwnProperty('Chuva')) partida.value.Chuva = newVal
    if (!partida.value.hasOwnProperty('chuva') && !partida.value.hasOwnProperty('Chuva')) {
      partida.value.Chuva = newVal // default fallback
    }
  } else {
    // try fallback just in case
    const fallbackPayload = updatePayload.chuva !== undefined ? { Chuva: newVal } : { chuva: newVal }
    const { error: err2 } = await supabase.from('Partida').update(fallbackPayload).eq('idPartida', partida.value.idPartida)
    if (!err2) {
      partida.value.Chuva = newVal
      partida.value.chuva = newVal
    } else {
        console.error('Error toggling rain:', error, err2)
    }
  }
}

const closeMatch = async () => {
  if (!partida.value) return
  if (partida.value.Fechada) { alert('Esta partida já está fechada.'); return }
  if (!confirm('Deseja fechar a partida? Isso registrará os resultados e impedirá novas alterações.')) return

  // Determinar resultado com base no placar atual
  let resultado1, resultado2
  if (scoreTeam1.value > scoreTeam2.value) {
    resultado1 = 'Vitoria'; resultado2 = 'Derrota'
  } else if (scoreTeam2.value > scoreTeam1.value) {
    resultado1 = 'Derrota'; resultado2 = 'Vitoria'
  } else {
    resultado1 = 'Empate'; resultado2 = 'Empate'
  }

  const ids1 = team1Players.value.map(p => p.id).filter(Boolean)
  const ids2 = team2Players.value.map(p => p.id).filter(Boolean)

  const ops = []
  if (ids1.length) ops.push(supabase.from('JogadorPartida').update({ Resultado: resultado1 }).eq('idPartida', partida.value.idPartida).in('id', ids1))
  if (ids2.length) ops.push(supabase.from('JogadorPartida').update({ Resultado: resultado2 }).eq('idPartida', partida.value.idPartida).in('id', ids2))
  ops.push(supabase.from('Partida').update({ Fechada: true }).eq('idPartida', partida.value.idPartida))

  const results = await Promise.all(ops)
  const erro = results.find(r => r.error)
  if (erro) {
    alert('Erro ao fechar a partida: ' + erro.error.message)
    return
  }

  await fetchMatchData()
  alert('Partida fechada! Resultado: Time 1 ' + resultado1 + ' / Time 2 ' + resultado2)
}

// Busca de participantes para adicionar à lista de espera
const openParticipantSearch = async () => {
  participantSearchQuery.value = ''
  participantSearchResults.value = []
  showParticipantSearch.value = true
  await searchParticipants()
}

const searchParticipants = async () => {
  if (!peladaAtual.value.id) return
  isSearchingParticipants.value = true

  let query = supabase
    .from('Participantes')
    .select('*')
    .eq('IdPelada', peladaAtual.value.id)
    .order('Nome')

  if (participantSearchQuery.value.trim()) {
    query = query.ilike('Nome', `%${participantSearchQuery.value.trim()}%`)
  }

  const { data } = await query
  // Filtra tipos válidos no cliente (Jogador, Goleiro, Convidado)
  const valid = ['Jogador', 'Goleiro', 'Convidado', 'jogador', 'goleiro', 'convidado']
  participantSearchResults.value = (data || []).filter(p =>
    !p.TipoParticipante || valid.includes(p.TipoParticipante)
  )
  isSearchingParticipants.value = false
}

const addToWaitingList = async (participante) => {
  const matchId = route.params.id
  const idParticipante = participante.IdParticipante ?? participante.idParticipante
  // Usa Nome como Apelido se Apelido estiver vazio
  const apelido = (participante.Apelido || participante.apelido || '').trim()
    || (participante.Nome || participante.nome || '?')

  const { error } = await supabase
    .from('ListaEspera')
    .insert([{
      idParticipante: idParticipante,
      IdPartida: Number(matchId),
      Apelido: apelido,
      Classificacao: 0,
    }])

  if (!error) {
    showParticipantSearch.value = false
    participantSearchQuery.value = ''
    participantSearchResults.value = []
    await fetchWaitingList()
    showWaitingList.value = true
  } else {
    console.error('Erro ao adicionar à lista de espera:', JSON.stringify(error))
    alert(`Erro ao adicionar jogador: ${error.message || error.code || JSON.stringify(error)}`)
  }
}

const removeFromWaitingList = async (w) => {
  const id = w.idJogadorLista || w.id
  if (!id) return
  const { error } = await supabase
    .from('ListaEspera')
    .delete()
    .eq('idJogadorLista', id)
  if (!error) {
    await fetchWaitingList()
  } else {
    console.error('Erro ao remover da lista de espera:', error)
  }
}

const createNewMatch = async () => {
  if (!peladaAtual.value.id || !newMatchDate.value) return

  const { data, error } = await supabase
    .from('Partida')
    .insert([{
      IdPelada: peladaAtual.value.id,
      Data: newMatchDate.value,
      Tempo: '1º Tempo',
      chuva: false,
    }])
    .select('idPartida')
    .single()

  if (!error && data) {
    showCreateMatch.value = false
    router.push(`/partidas/${data.idPartida}`)
  } else {
    console.error('Erro ao criar partida:', error)
  }
}
</script>

<style scoped>
.sumula-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  overflow: hidden;
  padding: 0;
  background-color: var(--bg-primary);
}

.card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.sumula-header {
  height: 18%;
  min-height: 0;
  flex-shrink: 0;
  padding: 8px 12px;
  z-index: 50;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.header-main-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.pelada-info {
  text-align: center;
}

.pelada-info h2 {
  font-size: 0.9rem;
  color: var(--tertiary-color);
  margin: 0;
  text-decoration: underline;
}

.title-with-key {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.key-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
}

.title-with-key h3 {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 4px 0;
}

.action-icons {
  display: flex;
  gap: 10px;
}

.icon-btn {
  width: 48px;
  height: 40px;
  border-radius: 8px;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.icon-btn.search-blue { background: #22567F; }
.icon-btn.yellow { background: #E7BF2B; }
.icon-btn.red { background: #D64343; }
.icon-btn.teal { background: #96D2D9; color: #1a1a2e; }
.icon-btn.green { background: #1C6A4E; }

.icon-btn .badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #1A1C1E;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  border: 2px solid #4CAF50;
}

.scoreboard-section {
  height: 15%;
  min-height: 0;
  flex-shrink: 0;
  padding: 6px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 15px 12px 6px;
}

.timer-badge {
  background-color: #4CAF50;
  padding: 4px 12px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s, transform 0.1s;
}

.timer-badge:active { transform: scale(0.95); }
.timer-badge.second-half { background-color: #FFB300; }
.timer-badge.timer-running { background-color: #43A047; box-shadow: 0 0 0 3px rgba(76,175,80,0.35); }

.half-badge {
  background-color: #1565C0;
  padding: 4px 14px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.82rem;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s, transform 0.1s;
}
.half-badge:active { transform: scale(0.95); }
.half-badge-2 { background-color: #E65100; }

.game-date {
  color: var(--primary-color);
  font-weight: 800;
  font-size: 1.1rem;
}

.help-btn {
  background: none;
  border: none;
  color: #F44336;
  font-size: 1.8rem;
  font-weight: 900;
  cursor: pointer;
}

.score-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.team-players {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.team-icon {
  background: var(--bg-primary);
  padding: 10px;
  border-radius: 50%;
  color: var(--primary-color);
}

.player-count-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--primary-color);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: 2px solid var(--bg-secondary);
}

.central-score {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 3rem;
  font-weight: 900;
}

.score-num.team1 { color: #2196F3; }
.score-num.team2 { color: #FF8F00; }
.score-divider { opacity: 0.3; }

/* Ícones com cor do time */
.team-players-1 .team-icon { background: rgba(33,150,243,0.15); color: #2196F3; }
.team-players-1 .player-count-badge { background: #2196F3; }
.team-players-2 .team-icon { background: rgba(255,143,0,0.15); color: #FF8F00; }
.team-players-2 .player-count-badge { background: #FF8F00; }

.teams-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  height: 50%;
  min-height: 0;
  padding: 0 8px;
  flex-shrink: 0;
}

.team-column {
  border-radius: 12px;
  color: #1a1a2e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.team-header {
  padding: 10px;
  background: rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
  font-size: 0.9rem;
}

.players-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.player-item {
  background: rgba(255,255,255,0.4);
  border-radius: 8px;
  padding: 8px;
  border-bottom: 2px solid rgba(0,0,0,0.1);
}

.player-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-name {
  font-weight: 700;
  font-size: 0.9rem;
}

.btn-perfil {
  background: none;
  border: none;
  opacity: 0.6;
  cursor: pointer;
}

.sub-indicator {
  background: black;
  color: white;
  font-size: 0.8rem;
  font-weight: 800;
  text-align: center;
  padding: 4px 0;
  margin-top: 4px;
}

.player-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.player-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-goal-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 800;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  color: inherit;
}

.player-cards {
  display: flex;
  gap: 3px;
}

.card-mini {
  width: 10px;
  height: 14px;
  border-radius: 2px;
}

.card-mini.yellow { background: #FFEB3B; }
.card-mini.blue { background: #2196F3; }
.card-mini.red { background: #F44336; }

.player-actions {
  display: flex;
  gap: 6px;
}

.btn-menu-mini, .btn-sub-mini {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
}

.sumula-footer {
  height: 9%;
  min-height: 0;
  flex-shrink: 0;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.rain-toggle {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rain-toggle.active {
  background: #2196F3;
  color: white;
  border-color: #2196F3;
}

.match-timer {
  background: #4CAF50;
  padding: 8px 24px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
}

.match-status-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.timer-label { font-size: 0.7rem; font-weight: 700; opacity: 0.8; color: var(--text-secondary); }
.timer-clock { font-size: 1.4rem; font-weight: 900; color: var(--primary-color); letter-spacing: 1px; }

.referee-info {
  color: #1C6A4E;
  font-weight: 800;
  font-size: 1.1rem;
  text-transform: capitalize;
}
/* Modais */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tutorial-title {
  font-style: italic;
  color: var(--primary-color);
  text-decoration: underline;
  font-size: 1.3rem;
}

.help-modal {
  max-height: 85vh;
  overflow-y: auto;
}

.help-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.help-item.sub-item {
  padding-left: 20px;
}

.icon-circle {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-circle.green { background: #2E7D32; }
.icon-circle.red { background: #C62828; }
.icon-circle.blue { background: #1565C0; }
.icon-circle.yellow { background: #F9A825; }
.icon-circle.teal { background: #00897B; }
.icon-circle.dark { background: #37474F; }
.icon-circle.light { background: #607D8B; }
.icon-circle.gray { background: #78909C; }

.icon-emoji {
  width: 32px;
  min-width: 32px;
  text-align: center;
  font-size: 1.2rem;
}

.waiting-list-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.waiting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 0.8rem;
}

.mt-4 { margin-top: 16px; }

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.btn-delete-waiting {
  background: none;
  border: none;
  color: #ef5350;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.btn-delete-waiting:hover { opacity: 1; }
/* Search Modal */
.search-modal {
  max-width: 400px;
}

.search-title {
  color: #1C6A4E;
  font-size: 1.4rem;
  font-weight: 700;
}

.search-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filter-date {
  flex: 1;
  display: flex;
  align-items: center;
  background: #E0E7E5;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #CCC;
}

.date-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  color: #1a1a2e;
  width: 100%;
}

.calendar-icon {
  color: #1C6A4E;
}

.matches-search-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.matches-search-scroll {
  max-height: 50vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border-color);
}

.match-search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: background 0.2s;
}

.match-search-item:hover {
  background: rgba(0,200,83,0.08);
}

.match-date {
  font-size: 1.1rem;
  color: #1C6A4E;
  font-weight: 600;
}

.selected-check {
  color: #1C6A4E;
}

.check-box {
  width: 20px;
  height: 20px;
  border: 2px solid #1C6A4E;
  border-radius: 4px;
}

.btn-occurrences {
  background: none;
  border: none;
  color: #1565C0;
  cursor: pointer;
  padding: 4px;
}

.soccer-icon {
  font-size: 22px;
  line-height: 1;
}

.goal-icon { color: #4CAF50; }

/* Action modal icons */
.action-icon {
  width: 1.4rem;
  height: 1.4rem;
  vertical-align: middle;
}

.goal-green { color: #4CAF50; }
.goal-red   { color: #F44336; }

/* Tutorial — seções */
.help-section-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 700;
  margin: 4px 0 0 0;
}

/* Modal Ações do Jogador */
.actions-modal {
  max-width: 380px;
}

.actions-player-name {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.actions-player-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 2px 0 0 0;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-color);
}

.action-row-danger {
  padding-top: 16px;
  display: flex;
  justify-content: center;
}

.action-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 700;
  color: white;
}

.counter-btn.minus { background: #C62828; }
.counter-btn.plus  { background: #2E7D32; }

.counter-val {
  font-size: 1.5rem;
  font-weight: 800;
  min-width: 32px;
  text-align: center;
  color: var(--text-primary);
}

.cards-group {
  display: flex;
  gap: 10px;
}

.card-toggle {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: transparent;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  opacity: 0.4;
}

.card-toggle.active {
  opacity: 1;
  border-color: white;
  transform: scale(1.1);
}

.toggle-sub {
  padding: 8px 20px;
  border-radius: 20px;
  border: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-sub.active {
  background: #455A64;
  border-color: #607D8B;
  color: white;
}

.btn-remove-player {
  background: #C62828;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 28px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  width: 100%;
  transition: filter 0.15s;
}

.btn-remove-player:hover { filter: brightness(1.15); }

/* Substitution warning in actions modal */
.action-error-msg {
  background: rgba(244, 67, 54, 0.12);
  border: 1px solid #F44336;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.82rem;
  color: #F44336;
  margin-bottom: 4px;
}

.sub-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid #F9A825;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: #F9A825;
  margin-bottom: 4px;
}

.row-disabled {
  opacity: 0.35;
  pointer-events: none;
}

/* Card rect buttons */
.card-rect {
  display: block;
  width: 18px;
  height: 26px;
  border-radius: 3px;
}

.yellow-rect { background: #FFEB3B; }
.blue-rect   { background: #2196F3; }
.red-rect    { background: #F44336; }

.card-toggle {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  opacity: 0.35;
}

.card-toggle:disabled { cursor: not-allowed; }
.card-active-yellow { opacity: 1; border-color: #FFEB3B; box-shadow: 0 0 8px rgba(255,235,59,0.5); }
.card-active-blue   { opacity: 1; border-color: #2196F3; box-shadow: 0 0 8px rgba(33,150,243,0.5); }
.card-active-red    { opacity: 1; border-color: #F44336; box-shadow: 0 0 8px rgba(244,67,54,0.5); }

/* Search modal - date filter */
.date-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.date-input-native {
  flex: 1;
  min-width: 120px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 10px;
  color: var(--text-primary);
  font-size: 0.85rem;
  color-scheme: dark;
}

:root:not(.dark) .date-input-native {
  color-scheme: light;
}

.filter-sep {
  color: var(--text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
}

.btn-clear-filter {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-load-more {
  width: 100%;
  padding: 12px;
  background: none;
  border: none;
  border-top: 1px solid var(--border-color);
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
}

/* Summary modal */
.summary-modal {
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}

.summary-title {
  color: #F9A825;
  font-size: 1.2rem;
  font-weight: 800;
  margin: 0;
}

.summary-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.s-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
}

.s-badges { display: flex; gap: 6px; }

.s-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.s-badge.green { background: #2E7D32; }
.s-badge.blue  { background: #1565C0; }

.summary-scoreboard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 12px;
  margin-bottom: 16px;
}

.s-team-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.s-score {
  display: flex;
  align-items: center;
  gap: 12px;
}

.s-num {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--primary-color);
}

.s-x {
  font-size: 1.5rem;
  color: var(--text-secondary);
  opacity: 0.4;
}

.summary-teams-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 12px;
}

.s-divider {
  background: var(--border-color);
  width: 1px;
}

.s-col-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 700;
  margin: 0 0 8px 0;
}

.s-player-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  gap: 4px;
}

.s-player-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s-player-name.is-sub {
  text-decoration: line-through;
  opacity: 0.5;
}

.s-events {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.s-ball {
  width: 14px;
  height: 14px;
}

.s-card-dot {
  display: inline-block;
  width: 10px;
  height: 14px;
  border-radius: 2px;
}

.s-yellow { background: #FFEB3B; }
.s-blue   { background: #2196F3; }
.s-red    { background: #F44336; }

.s-sub-tag {
  font-size: 0.6rem;
  font-weight: 800;
  color: #607D8B;
  background: rgba(96,125,139,0.2);
  padding: 1px 5px;
  border-radius: 4px;
}

/* ── Summary modal redesign ─────────────────────── */
.summary-modal {
  max-width: 480px;
  height: 90vh !important;
  max-height: 90vh !important;
  overflow: hidden !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
}

.s-fixed-header {
  flex-shrink: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-color);
}

.s-scroll-area {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 12px;
}

.s-tabs-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 10px;
}

.s-modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
}

.s-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-primary);
  border-radius: 10px;
  padding: 3px;
}

.s-tab {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.s-tab.active {
  background: var(--primary-color);
  color: var(--text-on-primary);
}

.s-match-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  position: relative;
}

.s-rain { 
  color: #42A5F5; 
  position: absolute;
  left: 16px;
  display: flex;
  align-items: center;
}
.s-info-date { font-weight: 700; font-size: 1.1rem; color: var(--text-primary); }
.s-info-sep { opacity: 0.3; }
.s-info-status { color: var(--primary-color); font-weight: 700; }

.s-placar-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 16px 16px;
}

.s-placar-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.s-placar-num {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
  min-width: 36px;
  text-align: center;
}

.t1-color { color: #2196F3; }
.t2-color { color: #FF8F00; }

.s-placar-x {
  font-size: 1.2rem;
  color: var(--text-secondary);
  opacity: 0.4;
  font-weight: 900;
}

.s-content { padding: 0 12px 16px; }

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

.t1-bg { background: rgba(33,150,243,0.25); border: 1px solid rgba(33,150,243,0.4); }
.t2-bg { background: rgba(255,193,7,0.25); border: 1px solid rgba(255,193,7,0.4); }

.s-team-card-title {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  text-align: center;
}

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

.s-fp-sub-tag {
  font-size: 0.55rem;
  font-weight: 800;
  background: rgba(96,125,139,0.3);
  color: #607D8B;
  padding: 1px 4px;
  border-radius: 3px;
}

.s-half-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 24px 40px;
  color: var(--text-secondary);
  text-align: center;
}

.s-half-placeholder p {
  font-weight: 700;
  margin: 0;
}

.s-half-placeholder span {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* Placar por tempo no resumo */
.s-half-scores {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px 14px;
  flex-wrap: wrap;
}

.s-half-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 5px 12px;
}

.s-half-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 4px;
}

.s-half-num {
  font-size: 1.1rem;
  font-weight: 900;
  min-width: 18px;
  text-align: center;
}

.s-half-x {
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.4;
  font-weight: 900;
}

.s-half-divider {
  width: 1px;
  height: 30px;
  background: var(--border-color);
  opacity: 0.5;
}

/* ── Participant search modal ───────────────────── */
.participant-search-modal {
  max-width: 380px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.ps-search-row {
  margin-bottom: 12px;
}

.ps-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 10px 14px;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.ps-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 340px;
}

.ps-loading, .ps-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.ps-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.ps-item:hover { background: rgba(0,230,118,0.08); }

.ps-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.ps-type {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.ps-add-icon { color: var(--primary-color); }

/* ── Nova partida modal ─────────────────────────── */
.new-match-modal { max-width: 340px; }

.nm-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.nm-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nm-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.nm-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  width: 100%;
  color-scheme: dark;
}

:root:not(.dark) .nm-input {
  color-scheme: light;
}

.nm-info-box {
  background: rgba(0,230,118,0.07);
  border: 1px solid rgba(0,230,118,0.25);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.nm-info-box p { margin: 0; }

.nm-actions {
  display: flex;
  gap: 10px;
}

.nm-btn-cancel {
  flex: 1;
  padding: 11px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 700;
  cursor: pointer;
}

.nm-btn-create {
  flex: 2;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: var(--text-on-primary);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.nm-btn-create:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
