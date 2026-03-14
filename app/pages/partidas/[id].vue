<template>
  <div class="sumula-container">
    <header class="sumula-header">
      <div class="header-main-actions">
        <div class="pelada-info">
          <h3 class="sumula-title">Súmula do Jogo</h3>
        </div>

        <div class="action-icons">
          <button
            v-if="tipoUsuario === 'Visitante'"
            class="icon-btn key-access"
            :class="{ 'key-unlocked': acessoLiberado }"
            :title="acessoLiberado ? 'Acesso liberado' : 'Inserir código de acesso'"
            @click="!acessoLiberado && (showAccessModal = true)"
          >
            <Key :size="20" />
          </button>
          <button class="icon-btn search-blue" title="Pesquisar Partidas" @click="showSearchModal = true">
            <Search :size="20" />
          </button>
          <button class="icon-btn yellow" title="Resumo da Partida" @click="showSummary = true; summaryTab = 'geral'">
            <FileText :size="20" />
          </button>
          <button v-if="podeEditar" class="icon-btn red" title="Criar Nova Partida" @click="showCreateMatch = true">
            <Plus :size="20" />
          </button>
          <button v-if="podeEditar" class="icon-btn teal" title="Lista de Espera" @click="targetTeam = ''; showWaitingList = true">
            <Users :size="20" />
            <span class="badge">{{ waitingList?.length || 0 }}</span>
          </button>
          <button
            v-if="podeEditar && !partida?.Fechada"
            class="icon-btn green"
            title="Encerrar Partida"
            @click="closeMatch"
          >
            <CheckSquare :size="20" />
          </button>
          <button
            v-if="podeEditar && partida?.Fechada"
            class="icon-btn orange"
            title="Reabrir Partida"
            @click="reopenMatch"
          >
            <LockOpen :size="20" />
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
        <div v-if="partida?.Fechada" class="badge-encerrada">Encerrada</div>
        <button v-else class="help-btn" @click="showHelp = true">?</button>
      </div>

      <div class="score-display">
        <div class="team-players team-players-1">
          <div class="team-icon">
            <Users :size="24" />
          </div>
          <span class="player-count-badge">{{ team1Players.length }}</span>
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
          <span class="player-count-badge">{{ team2Players.length }}</span>
        </div>
      </div>
    </div>

    <!-- Times Grid -->
    <div class="teams-grid">
      <!-- Time 1 -->
      <div
        class="team-column"
        :class="{ 'drag-over': dragOverTeam === '1' }"
        :style="{ backgroundColor: configCores.time1 }"
        @dragover.prevent="dragOverTeam = '1'"
        @dragleave="dragOverTeam = null"
        @drop.prevent="dropOnTeam('1')"
      >
        <div class="team-header">
          <span>TIME 1 (Azul)</span>
          <button class="btn-add-mini" @click="openAddPlayer('1')">
            <Plus :size="16" />
          </button>
        </div>
        <div class="players-list" @dragover.prevent @drop.prevent="dropOnTeam('1')">
          <div
            v-for="p in team1Players"
            :key="p.id"
            class="player-item"
            draggable="true"
            @dragstart="dragStart(p)"
            @dragend="dragOverTeam = null"
          >
            <div class="player-top">
              <span class="player-name">{{ p.Nome }}</span>
              <div class="player-cards">
                <span v-if="p.CartaoAmarelo" class="card-chip card-yellow" />
                <span v-if="p.CartaoAzul" class="card-chip card-blue" />
                <span v-if="p.CartaoVermelho" class="card-chip card-red" />
              </div>
              <button class="btn-perfil" @click="viewPlayerProfile(p)">
                <User :size="16" />
              </button>
            </div>
            <div v-if="p.substituido" class="sub-indicator">Substituído</div>
            <div class="player-bottom">
              <div class="player-stats">
                <button class="stat-goal-btn" @click="quickAddGoal(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.Gol || 0 }}</span>
                </button>
                <button v-if="(p.GolContra || 0) > 0" class="stat-goal-btn" style="color: #F44336;" @click="openPlayerActions(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.GolContra }}</span>
                </button>
              </div>
              <div v-if="podeEditar" class="player-actions">
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
      <div
        class="team-column"
        :class="{ 'drag-over': dragOverTeam === '2' }"
        :style="{ backgroundColor: configCores.time2 }"
        @dragover.prevent="dragOverTeam = '2'"
        @dragleave="dragOverTeam = null"
        @drop.prevent="dropOnTeam('2')"
      >
        <div class="team-header">
          <span>TIME 2 (Amarelo)</span>
          <button class="btn-add-mini" @click="openAddPlayer('2')">
            <Plus :size="16" />
          </button>
        </div>
        <div class="players-list" @dragover.prevent @drop.prevent="dropOnTeam('2')">
          <div
            v-for="p in team2Players"
            :key="p.id"
            class="player-item"
            draggable="true"
            @dragstart="dragStart(p)"
            @dragend="dragOverTeam = null"
          >
            <!-- Estrutura idêntica ao time 1 -->
            <div class="player-top">
              <span class="player-name">{{ p.Nome }}</span>
              <div class="player-cards">
                <span v-if="p.CartaoAmarelo" class="card-chip card-yellow" />
                <span v-if="p.CartaoAzul" class="card-chip card-blue" />
                <span v-if="p.CartaoVermelho" class="card-chip card-red" />
              </div>
              <button class="btn-perfil" @click="viewPlayerProfile(p)">
                <User :size="16" />
              </button>
            </div>
            <div v-if="p.substituido" class="sub-indicator">Substituído</div>
            <div class="player-bottom">
              <div class="player-stats">
                <button class="stat-goal-btn" @click="quickAddGoal(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.Gol || 0 }}</span>
                </button>
                <button v-if="(p.GolContra || 0) > 0" class="stat-goal-btn" style="color: #F44336;" @click="openPlayerActions(p)">
                  <SoccerBall class="soccer-icon goal-icon" /><span>{{ p.GolContra }}</span>
                </button>
              </div>
              <div v-if="podeEditar" class="player-actions">
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
          <div class="sub-period-group">
            <button
              class="sub-period-btn"
              :class="{ active: !selectedPlayer.Substituido }"
              @click="setSubstitution(null)"
            >Não</button>
            <button
              class="sub-period-btn"
              :class="{ active: selectedPlayer.Substituido && selectedPlayer.TempSub === 1 }"
              @click="setSubstitution(1)"
            >1º Tempo</button>
            <button
              class="sub-period-btn sub-period-btn--2"
              :class="{ active: selectedPlayer.Substituido && selectedPlayer.TempSub === 2 }"
              @click="setSubstitution(2)"
            >Intervalo</button>
          </div>
        </div>

        <!-- Trocar Time -->
        <div class="action-row">
          <span class="action-label">Time</span>
          <button class="btn-switch-team" @click="switchTeam">
            Mover para {{ selectedPlayer.Time === '1' ? 'Time 2 (Amarelo)' : 'Time 1 (Azul)' }}
          </button>
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

        <!-- Barra de abas fixa -->
        <div class="s-tab-bar">
          <button class="s-tb-btn" :class="{ active: summaryTab === 'geral' }" @click="summaryTab = 'geral'">Geral</button>
          <button class="s-tb-btn" :class="{ active: summaryTab === 'primeiro' }" @click="summaryTab = 'primeiro'">1ºTempo</button>
          <button class="s-tb-btn" :class="{ active: summaryTab === 'segundo' }" @click="summaryTab = 'segundo'">2ºTempo</button>
        </div>

        <!-- Área scrollável -->
        <div class="s-scroll-area">

          <!-- ABA GERAL -->
          <template v-if="summaryTab === 'geral'">
            <div class="s-content-header">
              <span class="s-content-title">Resumo da Partida</span>
              <button class="close-btn" @click="showSummary = false"><X :size="20" /></button>
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
          <template v-else-if="summaryTab === 'primeiro'">
            <div class="s-content-header">
              <span class="s-content-title">Resumo 1º Tempo</span>
              <button class="close-btn" @click="showSummary = false"><X :size="20" /></button>
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
              <button class="close-btn" @click="showSummary = false"><X :size="20" /></button>
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

    <!-- Modal de Intervalo -->
    <div v-if="showHalftimeModal" class="modal-overlay">
      <div class="modal-content ht-modal" @click.stop>
        <div class="ht-header">
          <span class="ht-title">Intervalo</span>
          <button class="close-btn" @click="showHalftimeModal = false"><X :size="22" /></button>
        </div>
        <p class="ht-subtitle">Marque quem sai e adicione substitutos antes de iniciar o 2º Tempo.</p>

        <!-- Contadores -->
        <div class="ht-counts">
          <span class="ht-count" :class="{ 'ht-count-ok': team1SecondHalfCount === 9, 'ht-count-warn': team1SecondHalfCount !== 9 }">
            Time 1: {{ team1SecondHalfCount }}/9
          </span>
          <span class="ht-count" :class="{ 'ht-count-ok': team2SecondHalfCount === 9, 'ht-count-warn': team2SecondHalfCount !== 9 }">
            Time 2: {{ team2SecondHalfCount }}/9
          </span>
        </div>

        <!-- Times -->
        <div class="ht-two-cols">
          <!-- Time 1 -->
          <div class="ht-team t1-bg">
            <div class="ht-team-header">
              <span class="ht-team-label">TIME 1</span>
              <button class="ht-add-btn" @click="openAddPlayer('1')"><Plus :size="14" /> Espera</button>
            </div>
            <div v-for="p in team1Players" :key="'ht1_'+p.id" class="ht-player" :class="{ 'ht-player-out': p.substituido }">
              <span class="ht-player-name">{{ p.Nome }}</span>
              <span v-if="p.entrou_no_intervalo" class="ht-entry-tag">ENTROU</span>
              <button class="ht-leave-btn" :class="{ 'ht-leave-active': p.substituido }" @click="toggleHalftimeLeave(p)">
                {{ p.substituido ? 'Volta' : 'Sai' }}
              </button>
            </div>
          </div>

          <!-- Time 2 -->
          <div class="ht-team t2-bg">
            <div class="ht-team-header">
              <span class="ht-team-label">TIME 2</span>
              <button class="ht-add-btn" @click="openAddPlayer('2')"><Plus :size="14" /> Espera</button>
            </div>
            <div v-for="p in team2Players" :key="'ht2_'+p.id" class="ht-player" :class="{ 'ht-player-out': p.substituido }">
              <span class="ht-player-name">{{ p.Nome }}</span>
              <span v-if="p.entrou_no_intervalo" class="ht-entry-tag">ENTROU</span>
              <button class="ht-leave-btn" :class="{ 'ht-leave-active': p.substituido }" @click="toggleHalftimeLeave(p)">
                {{ p.substituido ? 'Volta' : 'Sai' }}
              </button>
            </div>
          </div>
        </div>

        <button class="ht-start-btn" @click="startSecondHalf">
          Iniciar 2º Tempo
        </button>
      </div>
    </div>

    <!-- Modal de Lista de Espera -->
    <div v-if="showWaitingList" class="modal-overlay" @click="showWaitingList = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ targetTeam ? `Adicionar ao Time ${targetTeam}` : 'Lista de Espera' }}</h2>
          <div style="display:flex;gap:8px;align-items:center;">
            <button v-if="!targetTeam" class="icon-btn search-blue" style="width:36px;height:36px;" title="Buscar participante" @click="openParticipantSearch">
              <Search :size="16" />
            </button>
            <button class="close-btn" @click="showWaitingList = false"><X :size="24" /></button>
          </div>
        </div>
        <div class="waiting-list-body">
          <div v-if="waitingList.length === 0" class="empty-list">Ninguém na espera.</div>

          <!-- Modo seleção: aberto pelo "+" do time -->
          <template v-if="targetTeam">
            <div
              v-for="w in waitingList"
              :key="w.idJogadorLista"
              class="waiting-item"
              :class="{ 'ps-item-selected': selectedWaitingPlayers.has(w.idJogadorLista) }"
              style="cursor:pointer; border: 1px solid transparent;"
              @click="toggleWaitingSelection(w)"
            >
              <span>{{ w.Apelido || '?' }}</span>
              <div class="ps-checkbox" :class="{ 'ps-checked': selectedWaitingPlayers.has(w.idJogadorLista) }">
                <Check v-if="selectedWaitingPlayers.has(w.idJogadorLista)" :size="14" />
              </div>
            </div>
          </template>

          <!-- Modo normal: aberto pelo botão de lista de espera -->
          <template v-else>
            <div v-for="w in waitingList" :key="w.idJogadorLista" class="waiting-item">
              <span>{{ w.Apelido || '?' }}</span>
              <button class="btn-delete-waiting" @click="removeFromWaitingList(w)" title="Remover da lista">
                <Trash2 :size="16" />
              </button>
            </div>
          </template>
        </div>

        <div v-if="targetTeam" class="ps-footer">
          <button
            class="ps-btn-add"
            :disabled="selectedWaitingPlayers.size === 0 || isAddingToTeam"
            @click="addSelectedToTeam"
          >
            {{ isAddingToTeam ? 'Adicionando...' : `Adicionar (${selectedWaitingPlayers.size})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Busca de Participantes -->
    <div v-if="showParticipantSearch" class="modal-overlay" @click="showParticipantSearch = false">
      <div class="modal-content participant-search-modal" @click.stop>
        <div class="modal-header">
          <h2 class="search-title">Adicionar à Lista</h2>
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
            :class="{ 'ps-item-selected': selectedParticipants.has(p.IdParticipante) }"
            @click="toggleParticipantSelection(p)"
          >
            <div class="ps-info">
              <span class="ps-name">{{ p.Apelido || p.apelido || p.Nome || p.nome }}</span>
              <span class="ps-type">{{ p.TipoParticipante }}</span>
            </div>
            <div class="ps-checkbox" :class="{ 'ps-checked': selectedParticipants.has(p.IdParticipante) }">
              <Check v-if="selectedParticipants.has(p.IdParticipante)" :size="14" />
            </div>
          </div>
        </div>

        <div class="ps-footer">
          <button
            class="ps-btn-add"
            :disabled="selectedParticipants.size === 0 || isAddingToList"
            @click="addSelectedToWaitingList"
          >
            {{ isAddingToList ? 'Adicionando...' : `Adicionar (${selectedParticipants.size})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Código de Acesso -->
    <div v-if="showAccessModal" class="modal-overlay" @click.self="showAccessModal = false">
      <div class="modal-content access-modal" @click.stop>
        <div class="modal-header">
          <h2 class="access-title"><Key :size="20" /> Código de Acesso</h2>
          <button class="close-btn" @click="showAccessModal = false"><X :size="24" /></button>
        </div>
        <div class="access-body">
          <p class="access-desc">Digite o código de 6 dígitos fornecido pelo administrador para liberar as ações da partida.</p>
          <input
            v-model="acessoCodigoInput"
            type="text"
            maxlength="6"
            placeholder="000000"
            class="access-input"
            inputmode="numeric"
            @keyup.enter="validarCodigo"
          />
          <div v-if="acessoError" class="access-error">{{ acessoError }}</div>
          <button
            class="btn-access-confirm"
            :disabled="acessoCodigoInput.length !== 6 || acessoLoading"
            @click="validarCodigo"
          >
            {{ acessoLoading ? 'Verificando...' : 'Confirmar' }}
          </button>
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
  <!-- Toast: jogador substituído -->
  <transition name="toast-fade">
    <div v-if="quickGoalMsg" class="quick-goal-toast">{{ quickGoalMsg }}</div>
  </transition>

  </div>
</template>

<script setup>
import {
  Key, Search, FileText, Plus, Users, CheckSquare,
  Clock, User, RefreshCw, Menu, CloudRain, X,
  StickyNote, RotateCcw, Calendar, Check, Minus, Trash2, LockOpen
} from 'lucide-vue-next'
import PlayerProfileModal from '~/components/PlayerProfileModal.vue'
import SoccerBall from '~/components/SoccerBall.vue'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado, setPelada, isVisitor } = usePelada()

// Estado
const partida = ref(null)
const team1Players = ref([])
const team2Players = ref([])
const waitingList = ref([])
const scoreTeam1 = ref(0)
const scoreTeam2 = ref(0)
const timeRemaining = ref(0)
const tipoUsuario = computed(() => isVisitor.value ? 'Visitante' : 'Admin')
const configCores = ref({ time1: '#2196F3', time2: '#FFEB3B' })

// Controle de acesso visitante
const acessoLiberado = ref(false)
const acessoCodigoInput = ref('')
const acessoError = ref('')
const acessoLoading = ref(false)
const podeEditar = computed(() => tipoUsuario.value !== 'Visitante' || acessoLiberado.value)
const today = new Date()
const newMatchDate = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)

// Modais
const showHelp = ref(false)
const showSummary = ref(false)
const showWaitingList = ref(false)
const showHalftimeModal = ref(false)
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
const selectedParticipants = ref(new Map())
const isAddingToList = ref(false)
const selectedWaitingPlayers = ref(new Map())
const isAddingToTeam = ref(false)
const draggedPlayer = ref(null)
const dragOverTeam = ref(null)


// Cronômetro
const { timerRunning, timerSeconds, timerStartTime, formatTimer, toggleTimer, resetTimer, resumeIfRunning, cleanup: cleanupTimer } = useMatchTimer()
let timerClickCount = 0
let timerClickTimeout = null

const getCurrentTime = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
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
      toggleTimer(getCurrentTime())
    }, 280)
  }
}

const toggleHalf = () => {
  if (!partida.value || !podeEditar.value) return
  const current = (partida.value.Status || '').trim()
  if (current === '2º Tempo') {
    saveStatus('1º Tempo')
  } else {
    showHalftimeModal.value = true
  }
}

const saveStatus = async (newStatus) => {
  partida.value.Status = newStatus
  timerStartTime.value = getCurrentTime()
  resetTimer()
  const { error } = await supabase
    .from('Partida')
    .update({ Status: newStatus })
    .eq('idPartida', partida.value.idPartida)
  if (error) console.error('Erro ao salvar status:', JSON.stringify(error))
}

const startSecondHalf = async () => {
  await saveStatus('2º Tempo')
  showHalftimeModal.value = false
}

const toggleHalftimeLeave = async (player) => {
  const newVal = !player.substituido
  const id = player.id || player.IdJogadorPartida || player.idJogadorPartida
  const { error } = await supabase
    .from('JogadorPartida')
    .update({ substituido: newVal })
    .eq('id', id)
  if (!error) player.substituido = newVal
}

onUnmounted(() => {
  cleanupTimer()
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

const validarCodigo = async () => {
  if (acessoCodigoInput.value.length !== 6) return
  acessoLoading.value = true
  acessoError.value = ''
  try {
    const { data } = await supabase
      .from('CodigoAcesso')
      .select('expira')
      .eq('idPelada', peladaAtual.value.id)
      .eq('codigo', acessoCodigoInput.value)
      .maybeSingle()

    if (!data) { acessoError.value = 'Código inválido.'; return }

    const expiraDate = new Date(data.expira)
    if (isNaN(expiraDate) || expiraDate <= new Date()) {
      acessoError.value = 'Código expirado.'; return
    }

    sessionStorage.setItem('acesso_liberado', JSON.stringify({ expira: data.expira }))
    acessoLiberado.value = true
    showAccessModal.value = false
    acessoCodigoInput.value = ''
  } finally {
    acessoLoading.value = false
  }
}

onMounted(async () => {
  // Verifica acesso liberado salvo na sessão
  if (process.client) {
    const stored = sessionStorage.getItem('acesso_liberado')
    if (stored) {
      try {
        const { expira } = JSON.parse(stored)
        if (new Date(expira) > new Date()) acessoLiberado.value = true
        else sessionStorage.removeItem('acesso_liberado')
      } catch { sessionStorage.removeItem('acesso_liberado') }
    }
  }
  await fetchMatchData()
  resumeIfRunning()
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

// Escalação por período
// 1º tempo: quem NÃO entrou no intervalo (todos que começaram)
const team1Primeiro = computed(() =>
  team1Players.value.filter(p => !p.entrou_no_intervalo)
)
const team2Primeiro = computed(() =>
  team2Players.value.filter(p => !p.entrou_no_intervalo)
)
// 2º tempo: quem não foi substituído (incluindo quem entrou no intervalo)
const team1Segundo = computed(() =>
  team1Players.value.filter(p => !p.substituido)
)
const team2Segundo = computed(() =>
  team2Players.value.filter(p => !p.substituido)
)

// Contagem para o 2º tempo (não substituídos = ficam + entram)
const team1SecondHalfCount = computed(() => team1Players.value.filter(p => !p.substituido).length)
const team2SecondHalfCount = computed(() => team2Players.value.filter(p => !p.substituido).length)

const selectMatch = (id) => {
  showSearchModal.value = false
  router.push(`/partidas/${id}`)
}

const targetTeam = ref('1')

// Ações
const openAddPlayer = (team) => {
  targetTeam.value = team
  selectedWaitingPlayers.value = new Map()
  showWaitingList.value = true
}

const toggleWaitingSelection = (w) => {
  const map = new Map(selectedWaitingPlayers.value)
  if (map.has(w.idJogadorLista)) {
    map.delete(w.idJogadorLista)
  } else {
    map.set(w.idJogadorLista, w)
  }
  selectedWaitingPlayers.value = map
}

const addSelectedToTeam = async () => {
  if (!partida.value || selectedWaitingPlayers.value.size === 0) return
  isAddingToTeam.value = true

  const status = (partida.value?.Status || '').trim()
  const entrouIntervalo = showHalftimeModal.value || status === '2\u00ba Tempo'
  const rows = [...selectedWaitingPlayers.value.values()].map(w => ({
    idPartida: partida.value.idPartida,
    IdPelada: partida.value.IdPelada,
    IdParticipante: w.idParticipante || w.IdParticipante,
    Nome: w.Apelido || '?',
    Time: targetTeam.value,
    Gol: 0,
    CartaoAmarelo: false,
    CartaoAzul: false,
    CartaoVermelho: false,
    substituido: false,
    entrou_no_intervalo: entrouIntervalo
  }))

  console.log('addSelectedToTeam rows:', JSON.stringify(rows))

  const { error } = await supabase.from('JogadorPartida').insert(rows)
  isAddingToTeam.value = false

  if (!error) {
    const ids = [...selectedWaitingPlayers.value.keys()]
    await supabase.from('ListaEspera').delete().in('idJogadorLista', ids)
    showWaitingList.value = false
    selectedWaitingPlayers.value = new Map()
    await fetchMatchData()
    await fetchWaitingList()
  } else {
    console.error('Erro ao adicionar jogadores ao time:', error)
    alert('Erro: ' + (error.message || error.code || JSON.stringify(error)))
  }
}

const addToMatch = async (participante) => {
  if (!partida.value) return

  const { error } = await supabase
    .from('JogadorPartida')
    .insert([{
      idPartida: partida.value.idPartida,
      IdPelada: partida.value.IdPelada,
      idParticipante: participante.IdParticipante || participante.idParticipante,
      Nome: participante.Nome || participante.apelido || participante.nome || '?',
      Time: targetTeam.value,
      Gol: 0,
      CartaoAmarelo: false,
      CartaoAzul: false,
      CartaoVermelho: false,
      substituido: false
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
    .update({ substituido: !p.substituido })
    .eq(idField, id)

  if (!error) await fetchMatchData()
}

const viewPlayerProfile = async (participante) => {
  isProfileLoading.value = true
  showProfileModal.value = true
  selectedProfile.value = null

  try {
    const today = new Date()
    const anoAtual = today.getFullYear()
    const dataHoje = `${anoAtual}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const dataIni = `${anoAtual}-01-01`

    const idJogador = participante.idParticipante || participante.IdParticipante
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
  } catch (e) {
    console.error('Erro ao carregar perfil:', e)
  } finally {
    isProfileLoading.value = false
  }
}

const openPlayerActions = (p) => {
  if (!podeEditar.value) return
  // Descobre dinamicamente o nome da coluna PK (IdJogadorPartida, idJogadorPartida, id, etc.)
  const idField = Object.keys(p).find(k => k.toLowerCase() === 'idjogadorpartida') || 'id'
  const resolvedId = p[idField]
  console.log('openPlayerActions: idField=', idField, 'id=', resolvedId, 'keys=', Object.keys(p))
  selectedPlayer.value = {
    ...p,
    _idField: idField,
    _id: resolvedId,
    Substituido: p.substituido === true || p.substituido === 1,
    TempSub: p.tempo_substituido ?? (p.substituido === true ? 2 : null)
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

const updatePlayerStats = async (updates) => {
  if (!selectedPlayer.value) return

  const id = selectedPlayer.value._id || selectedPlayer.value.IdJogadorPartida || selectedPlayer.value.idJogadorPartida
  const idField = selectedPlayer.value._idField || 'IdJogadorPartida'

  if (!id) {
    actionError.value = `ID do jogador não encontrado. Feche e abra o modal novamente.`
    return
  }

  actionError.value = ''
  const { error } = await supabase
    .from('JogadorPartida')
    .update(updates)
    .eq(idField, id)

  if (!error) {
    Object.assign(selectedPlayer.value, updates)
    await fetchMatchData()
  } else {
    actionError.value = `Erro ao salvar: ${error.message || error.code || 'verifique as permissões do Supabase'}`
    console.error('Erro ao atualizar campos:', error)
  }
}

const changeGoal = async (delta) => {
  const newGol = Math.max(0, (selectedPlayer.value.Gol || 0) + delta)
  const isFirstHalf = (partida.value.Status || '').trim() !== '2º Tempo'
  const halfField = isFirstHalf ? 'GolPrimeiro' : 'GolSegundo'
  const newHalfVal = Math.max(0, (selectedPlayer.value[halfField] || 0) + delta)
  await updatePlayerStats({ Gol: newGol, [halfField]: newHalfVal })
}

const changeGoalContra = async (delta) => {
  const newGolContra = Math.max(0, (selectedPlayer.value.GolContra || 0) + delta)
  const isFirstHalf = (partida.value.Status || '').trim() !== '2º Tempo'
  const halfField = isFirstHalf ? 'GolContraPrimeiro' : 'GolContraSegundo'
  const newHalfVal = Math.max(0, (selectedPlayer.value[halfField] || 0) + delta)
  await updatePlayerStats({ GolContra: newGolContra, [halfField]: newHalfVal })
}

const quickGoalMsg = ref('')
let quickGoalMsgTimer = null

const quickAddGoal = async (p) => {
  if (!podeEditar.value) return
  if (p.substituido) {
    quickGoalMsg.value = `${(p.Nome || '').trim()} foi substituído`
    clearTimeout(quickGoalMsgTimer)
    quickGoalMsgTimer = setTimeout(() => { quickGoalMsg.value = '' }, 2500)
    return
  }
  const idField = Object.keys(p).find(k => k.toLowerCase() === 'idjogadorpartida') || 'id'
  const id = p[idField]
  if (!id) return
  const newGol = (p.Gol || 0) + 1
  const isFirstHalf = (partida.value.Status || '').trim() !== '2º Tempo'
  const halfField = isFirstHalf ? 'GolPrimeiro' : 'GolSegundo'
  const newHalfVal = (p[halfField] || 0) + 1
  const { error } = await supabase.from('JogadorPartida').update({ Gol: newGol, [halfField]: newHalfVal }).eq(idField, id)
  if (!error) {
    p.Gol = newGol
    p[halfField] = newHalfVal
    await fetchMatchData()
  }
}

const toggleCard = async (cardField) => {
  const newVal = !selectedPlayer.value[cardField]
  await updatePlayerStat(cardField, newVal)
}

const setSubstitution = async (tempo) => {
  // tempo: null = não substituído | 1 = saiu no 1ºT | 2 = saiu no intervalo
  const isSub = tempo !== null
  await updatePlayerStats({
    substituido: isSub,
    tempo_substituido: tempo
  })
  selectedPlayer.value.Substituido = isSub
  selectedPlayer.value.TempSub = tempo
  if (isSub) showActionsModal.value = false
}

const toggleSubstitution = async () => {
  const newVal = !selectedPlayer.value.Substituido
  await updatePlayerStat('substituido', newVal)
  showActionsModal.value = false
}

const dragStart = (p) => {
  draggedPlayer.value = p
}

const dropOnTeam = async (team) => {
  dragOverTeam.value = null
  const p = draggedPlayer.value
  draggedPlayer.value = null
  if (!p || p.Time === team) return

  const idField = Object.keys(p).find(k => k.toLowerCase() === 'idjogadorpartida') || 'id'
  const id = p[idField]
  if (!id) return

  const { error } = await supabase
    .from('JogadorPartida')
    .update({ Time: team })
    .eq(idField, id)

  if (!error) await fetchMatchData()
  else console.error('Erro ao mover jogador:', error)
}

const switchTeam = async () => {
  if (!selectedPlayer.value) return
  const newTeam = selectedPlayer.value.Time === '1' ? '2' : '1'
  const idField = Object.keys(selectedPlayer.value).find(k => k.toLowerCase() === 'idjogadorpartida') || 'id'
  const id = selectedPlayer.value[idField] || selectedPlayer.value._id
  if (!id) return

  const { error } = await supabase
    .from('JogadorPartida')
    .update({ Time: newTeam })
    .eq(idField, id)

  if (!error) {
    showActionsModal.value = false
    await fetchMatchData()
  } else {
    actionError.value = `Erro ao trocar time: ${error.message}`
  }
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
    await supabase.from('ListaEspera').insert([{
      idParticipante: selectedPlayer.value.IdParticipante || selectedPlayer.value.idParticipante,
      IdPartida: partida.value.idPartida,
      Apelido: selectedPlayer.value.Nome || '?',
      Classificacao: 0,
    }])
    await fetchWaitingList()
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
  const [year, month, day] = date.split('T')[0].split('-')
  return `${day}/${month}/${year}`
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

const reopenMatch = async () => {
  if (!partida.value) return
  if (!confirm('Deseja reabrir a partida? Os resultados registrados serão mantidos até um novo encerramento.')) return

  const { error } = await supabase
    .from('Partida')
    .update({ Fechada: false })
    .eq('idPartida', partida.value.idPartida)

  if (error) {
    alert('Erro ao reabrir a partida: ' + error.message)
    return
  }

  await fetchMatchData()
}

// Busca de participantes para adicionar à lista de espera
const openParticipantSearch = async () => {
  participantSearchQuery.value = ''
  participantSearchResults.value = []
  selectedParticipants.value = new Map()
  showParticipantSearch.value = true
  await searchParticipants()
}

const toggleParticipantSelection = (p) => {
  const id = p.IdParticipante
  const map = new Map(selectedParticipants.value)
  if (map.has(id)) {
    map.delete(id)
  } else {
    map.set(id, p)
  }
  selectedParticipants.value = map
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

const addSelectedToWaitingList = async () => {
  if (selectedParticipants.value.size === 0) return
  isAddingToList.value = true
  const matchId = route.params.id

  const rows = [...selectedParticipants.value.values()].map(p => ({
    idParticipante: p.IdParticipante ?? p.idParticipante,
    IdPartida: Number(matchId),
    Apelido: (p.Apelido || p.apelido || '').trim() || (p.Nome || p.nome || '?'),
    Classificacao: 0,
  }))

  const { error } = await supabase.from('ListaEspera').insert(rows)

  isAddingToList.value = false
  if (!error) {
    showParticipantSearch.value = false
    participantSearchQuery.value = ''
    participantSearchResults.value = []
    selectedParticipants.value = new Map()
    await fetchWaitingList()
    showWaitingList.value = true
  } else {
    console.error('Erro ao adicionar à lista de espera:', JSON.stringify(error))
    alert(`Erro ao adicionar jogadores: ${error.message || error.code || JSON.stringify(error)}`)
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
  gap: 8px;
}

.pelada-info {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pelada-info h2 {
  font-size: 0.9rem;
  color: var(--tertiary-color);
  margin: 0;
  text-decoration: underline;
}

.sumula-title {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 4px 0;
  text-align: center;
}

.icon-btn.key-access {
  background: rgba(76, 175, 80, 0.15);
  color: #81c784;
  border: 1px solid rgba(76, 175, 80, 0.4);
}

.icon-btn.key-access.key-unlocked {
  background: rgba(76, 175, 80, 0.3);
  color: #4CAF50;
  cursor: default;
}

.access-modal {
  max-width: 320px;
}

.access-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.access-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.access-desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.access-input {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
}

.access-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.access-error {
  color: #F44336;
  font-size: 0.85rem;
  text-align: center;
}

.btn-access-confirm {
  padding: 12px;
  border-radius: 10px;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  width: 100%;
}

.btn-access-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.icon-btn.orange { background: #E65100; }

.badge-encerrada {
  background: #C62828;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

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
  padding: 12px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  overflow: hidden;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 12px 12px 0;
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
  padding-bottom: 8px;
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
  padding: 8px 8px 0;
  flex-shrink: 0;
}

.team-column {
  border-radius: 12px;
  color: #1a1a2e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  transition: box-shadow 0.15s;
}

.team-column.drag-over {
  box-shadow: 0 0 0 3px #ffffff, 0 0 0 5px rgba(0,0,0,0.4);
}

.player-item[draggable="true"] { cursor: grab; }
.player-item[draggable="true"]:active { cursor: grabbing; }

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
  gap: 4px;
}

.player-cards {
  display: flex;
  gap: 3px;
  align-items: center;
  margin-left: auto;
  margin-right: 4px;
}

.card-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
}
.card-chip::after {
  content: '';
  display: block;
  width: 9px;
  height: 13px;
  border-radius: 2px;
}
.card-yellow::after { background: #FDD835; }
.card-blue::after   { background: #2196F3; }
.card-red::after    { background: #F44336; }

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

.sub-period-group {
  display: flex;
  gap: 6px;
}

.sub-period-btn {
  padding: 7px 12px;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.sub-period-btn.active {
  background: #455A64;
  border-color: #607D8B;
  color: white;
}

.sub-period-btn--2.active {
  background: #37474F;
  border-color: #546E7A;
}

.btn-switch-team {
  background: #1565C0;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.btn-switch-team:hover { filter: brightness(1.15); }

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

/* Barra de abas fixa */
.s-tab-bar {
  flex-shrink: 0;
  display: flex;
  border-bottom: 2px solid var(--border-color);
}

.s-tb-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all 0.15s;
}

.s-tb-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.s-scroll-area {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 12px;
}

/* Cabeçalho dentro de cada aba */
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

/* Linhas de evento (gols/cartões) */
.s-evt-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  gap: 6px;
}

.s-evt-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.s-evt-num {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--text-primary);
  flex-shrink: 0;
}

.s-evt-gc {
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(198,40,40,0.15);
  color: #C62828;
  border-radius: 4px;
  padding: 1px 4px;
  flex-shrink: 0;
}

.s-section-mt {
  margin-top: 10px;
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

.s-fp-sub-tag {
  font-size: 0.55rem;
  font-weight: 800;
  background: rgba(96,125,139,0.3);
  color: #607D8B;
  padding: 1px 4px;
  border-radius: 3px;
}

.s-fp-entry-tag {
  font-size: 0.55rem;
  font-weight: 800;
  background: rgba(76,175,80,0.2);
  color: #388E3C;
  padding: 1px 4px;
  border-radius: 3px;
}

/* Abas do resumo */
.s-tab-btns {
  display: flex;
  gap: 6px;
  padding: 0 16px 12px;
}

.s-tab-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.s-tab-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* Vista por tempo */
.s-tempo-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0 8px;
}

.s-half-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.s-half-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.s-half-badge {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.s-half-badge-1 {
  background: rgba(21,101,192,0.18);
  color: #1565C0;
}

.s-half-badge-2 {
  background: rgba(230,81,0,0.15);
  color: #E65100;
}

.s-half-score-mini {
  font-size: 0.85rem;
  font-weight: 900;
  color: var(--text-secondary);
  opacity: 0.7;
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

/* ── Halftime modal ─────────────────────────────── */
.ht-modal {
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px !important;
}

.ht-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ht-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-color);
}

.ht-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: -4px 0 0;
}

.ht-counts {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.ht-count {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 5px 14px;
  border-radius: 20px;
}

.ht-count-ok  { background: rgba(76,175,80,0.18); color: #388E3C; }
.ht-count-warn { background: rgba(255,152,0,0.18); color: #E65100; }

.ht-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.ht-team {
  border-radius: 12px;
  padding: 10px;
}

.ht-team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ht-team-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
}

.ht-add-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
}

.ht-player {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.ht-player-out .ht-player-name {
  text-decoration: line-through;
  opacity: 0.45;
}

.ht-player-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ht-entry-tag {
  font-size: 0.55rem;
  font-weight: 800;
  background: rgba(76,175,80,0.2);
  color: #388E3C;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}

.ht-leave-btn {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.ht-leave-active {
  background: rgba(96,125,139,0.25);
  border-color: #607D8B;
  color: #607D8B;
}

.ht-start-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition: filter 0.15s;
}

.ht-start-btn:hover { filter: brightness(1.1); }

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
  border: 1px solid transparent;
}

.ps-item:hover { background: rgba(0,230,118,0.08); }
.ps-item-selected { background: rgba(0,230,118,0.12); border-color: var(--primary-color); }

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

.ps-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.ps-checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #1A1C1E;
}

.ps-footer {
  padding: 12px;
  border-top: 1px solid var(--border-color);
}

.ps-btn-add {
  width: 100%;
  background: var(--primary-color);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

.ps-btn-add:disabled { opacity: 0.4; cursor: not-allowed; }

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

.quick-goal-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(30,30,30,0.92);
  color: #fff;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
}

.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.3s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; }
</style>
