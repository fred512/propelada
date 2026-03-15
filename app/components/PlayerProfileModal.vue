<script setup lang="ts">
import { X, User, Contact, Target, Square, ThumbsUp, ThumbsDown, CloudRain, Trophy, Frown, Zap } from 'lucide-vue-next'
import Dialog from '@/components/ui/dialog/Dialog.vue'

const props = defineProps({
  isOpen: Boolean,
  profile: Object,
  isLoading: Boolean
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}
</script>

<template>
  <Dialog
    :open="isOpen"
    @update:open="(val) => { if (!val) close() }"
    @close="close"
    class="max-w-[400px] p-0 overflow-hidden rounded-3xl !bg-[var(--bg-secondary)]"
  >
    <!-- Header fixo -->
    <div class="modal-header-custom profile-header-sticky">
      <h2 class="modal-title-custom">Perfil Jogador</h2>
      <button class="profile-close-btn" @click="close"><X :size="22" /></button>
    </div>

    <!-- Conteúdo scrollável -->
    <div class="profile-scroll-body">
      <div v-if="isLoading" class="loading-state">
        Carregando perfil...
      </div>

      <div v-else-if="profile" class="modal-body">
        <!-- Foto e Nomes -->
        <div class="profile-intro">
          <div class="photo-container">
            <img
              :src="profile.foto_url || '/images/default-avatar.png'"
              :alt="profile.nome_jogador"
              class="profile-photo"
            />
          </div>
          <div class="name-section">
            <div class="nickname">
              <User :size="32" class="icon-inline" />
              <span>{{ profile.apelido_jogador || profile.nome_jogador }}</span>
            </div>
            <div class="full-name">
              <Contact :size="20" class="icon-inline" />
              <span>{{ profile.nome_jogador }}</span>
            </div>
          </div>
        </div>

        <!-- Estatísticas em Linhas -->
        <div class="stats-list">
          <!-- Gols -->
          <div class="stat-row">
            <div class="stat-values">
              <div class="stat-item green"><Target :size="24" /><span>{{ profile.numero_de_gols }}</span></div>
              <div class="stat-item red"><Target :size="24" /><span>{{ profile.numero_de_gols_contra }}</span></div>
            </div>
            <span class="stat-label">Gols</span>
          </div>

          <!-- Cartões -->
          <div class="stat-row">
            <div class="stat-values">
              <div class="card-item yellow"><Square :size="24" fill="currentColor" /><span class="card-badge">{{ profile.total_cartao_amarelo }}</span></div>
              <div class="card-item blue"><Square :size="24" fill="currentColor" /><span class="card-badge">{{ profile.total_cartao_azul }}</span></div>
              <div class="card-item red"><Square :size="24" fill="currentColor" /><span class="card-badge">{{ profile.total_cartao_vermelho }}</span></div>
            </div>
            <span class="stat-label">Cartões</span>
          </div>

          <!-- Presenças -->
          <div class="stat-row">
            <div class="stat-values">
              <div class="stat-item blue"><ThumbsUp :size="24" /><span>{{ profile.qtd_participacoes }}</span></div>
              <div class="stat-item red"><ThumbsDown :size="24" /><span>{{ profile.qtd_ausencias }}</span></div>
              <div class="stat-item light-blue"><CloudRain :size="24" /><span>{{ profile.qtd_partidas_chuva }}</span></div>
            </div>
            <span class="stat-label">Presenças</span>
          </div>

          <!-- Resultados -->
          <div class="stat-row">
            <div class="stat-values">
              <div class="stat-item gold"><Trophy :size="24" /><span>{{ profile.vitorias }}</span></div>
              <div class="stat-item red"><Frown :size="24" /><span>{{ profile.derrotas }}</span></div>
              <div class="stat-item sky"><Square :size="24" /><span>{{ profile.empates }}</span></div>
            </div>
            <span class="stat-label">Resultados</span>
          </div>

          <!-- Pontuação -->
          <div class="stat-row no-border">
            <div class="stat-values">
              <div class="stat-item primary"><Zap :size="24" fill="currentColor" /><span class="score-value">{{ profile.pontuacao }}</span></div>
            </div>
            <span class="stat-label">Pontuação</span>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <footer v-if="profile?.DataInicial" class="modal-footer">
        <span class="date-range">
          Dados de {{ formatDate(profile.DataInicial) }} até {{ formatDate(profile.DataFinal) }}
        </span>
      </footer>
    </div>
  </Dialog>
</template>

<style scoped>
/* Sobrescreve posicionamento e tamanho do DialogContent via Radix */
:deep([role="dialog"]) {
  top: 5% !important;
  transform: translateX(-50%) !important;
  max-height: 88vh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  margin-top: env(safe-area-inset-top, 16px) !important;
}

@media (max-width: 640px) {
  :deep([role="dialog"]) {
    top: 8% !important;
    max-height: 84vh !important;
  }
}

.modal-header-custom {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}
.profile-close-btn:hover { color: var(--text-primary); }

.modal-title-custom {
  color: var(--secondary-color);
  font-size: 1.8rem;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 8px;
  margin: 0;
}

.profile-header-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.profile-scroll-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-body {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.photo-container {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid var(--bg-primary);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-section {
  text-align: left;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nickname {
  color: var(--secondary-color);
  font-size: 1.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 12px;
}

.full-name {
  color: #4CAF50;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.9;
}

.stats-list {
  display: flex;
  flex-direction: column;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row.no-border { border-bottom: none; }

.stat-values {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 700;
}

.stat-label {
  color: #42a5f5;
  font-weight: 700;
  font-size: 1.2rem;
}

.green { color: #4CAF50; }
.red { color: #F44336; }
.blue { color: #42A5F5; }
.light-blue { color: #81D4FA; }
.gold { color: #FFD54F; }
.sky { color: #2196F3; }
.primary { color: #42A5F5; }

.card-item {
  position: relative;
  display: flex;
  align-items: center;
}

.card-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.7rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.yellow { color: #FFEB3B; }

.score-value {
  font-size: 1.5rem;
  color: #42A5F5;
}

.modal-footer {
  padding: 12px 24px;
  text-align: center;
  background-color: rgba(0,0,0,0.05);
}

.date-range {
  color: #42A5F5;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}
</style>
