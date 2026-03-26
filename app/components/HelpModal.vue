<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content help-modal" @click.stop>
      <div class="modal-header">
        <h2 class="tutorial-title">Tutorial - Súmula do Jogo</h2>
        <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
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
</template>

<script setup>
import { X, Search, FileText, Plus, Users, CheckSquare, Menu, RefreshCw } from 'lucide-vue-next'

defineProps({ modelValue: Boolean })
defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
  border: 1px solid var(--border-color);
  animation: modalSpring 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dark .modal-content {
  background: rgba(9,15,28,0.94);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 24px 64px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@keyframes modalSpring {
  from { opacity: 0; transform: scale(0.92) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
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

.help-section-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 700;
  margin: 4px 0 0 0;
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

.icon-circle.green  { background: #2E7D32; }
.icon-circle.red    { background: #C62828; }
.icon-circle.blue   { background: #1565C0; }
.icon-circle.yellow { background: #F9A825; }
.icon-circle.teal   { background: #00897B; }
.icon-circle.dark   { background: #37474F; }
.icon-circle.gray   { background: #78909C; }

.icon-emoji {
  width: 32px;
  min-width: 32px;
  text-align: center;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}
</style>
