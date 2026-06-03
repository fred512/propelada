<script setup>
import { ref } from 'vue'
import { ClipboardCheck, Trophy, BarChart2 } from 'lucide-vue-next'
import RelatorioConferenciaModal from '~/components/RelatorioConferenciaModal.vue'
import RankingModal from '~/components/RankingModal.vue'
import ResumoModal from '~/components/ResumoModal.vue'

const isConferenciaOpen = ref(false)
const isRankingOpen = ref(false)
const isResumoOpen = ref(false)
</script>

<template>
  <div class="relatorio-container">
    <PageHeader title="Relatórios" subtitle="Selecione um relatório para visualizar" />

    <RelatorioConferenciaModal
      :is-open="isConferenciaOpen"
      @close="isConferenciaOpen = false"
    />

    <RankingModal
      :is-open="isRankingOpen"
      @close="isRankingOpen = false"
    />

    <ResumoModal
      :is-open="isResumoOpen"
      @close="isResumoOpen = false"
    />

    <div class="cards-grid">
      <button class="relatorio-card" @click="isConferenciaOpen = true">
        <div class="card-icon conferencia-icon">
          <ClipboardCheck :size="36" />
        </div>
        <div class="card-body">
          <h3 class="card-title">Conferência de Pontuação</h3>
          <p class="card-desc">
            Detalhamento por categoria: presença, falta, jogo assistido, abono e chuva.
          </p>
        </div>
        <span class="card-cta">Gerar Relatório →</span>
      </button>

      <button class="relatorio-card" @click="isRankingOpen = true">
        <div class="card-icon ranking-icon">
          <Trophy :size="36" />
        </div>
        <div class="card-body">
          <h3 class="card-title">Ranking</h3>
          <p class="card-desc">
            Classificação geral com pontos, vitórias, empates, derrotas e saldo de gols.
          </p>
        </div>
        <span class="card-cta">Ver Ranking →</span>
      </button>

      <button class="relatorio-card" @click="isResumoOpen = true">
        <div class="card-icon resumo-icon">
          <BarChart2 :size="36" />
        </div>
        <div class="card-body">
          <h3 class="card-title">Resumo da Pelada</h3>
          <p class="card-desc">
            Visão geral: jogadores, partidas, gols por tempo, cartões e desempenho dos times.
          </p>
        </div>
        <span class="card-cta">Ver Resumo →</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.relatorio-container {
  padding: 16px;
  max-width: 650px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--text-primary);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.relatorio-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.relatorio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  border-color: var(--primary-color);
}

.card-icon {
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.conferencia-icon {
  color: var(--primary-color);
  background: rgba(76,175,80,0.1);
}

.ranking-icon {
  color: #F59E0B;
  background: rgba(245,158,11,0.1);
}

.resumo-icon {
  color: #42A5F5;
  background: rgba(66,165,245,0.1);
}

.card-body { flex: 1; }

.card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--secondary-color);
  margin: 0 0 6px;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.card-cta {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary-color);
  align-self: flex-end;
}
</style>
