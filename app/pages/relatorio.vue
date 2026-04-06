<script setup>
import { ref } from 'vue'
import { FileText } from 'lucide-vue-next'
import RelatorioPontuacaoModal from '~/components/RelatorioPontuacaoModal.vue'

const isPontuacaoModalOpen = ref(false)
</script>

<template>
  <div class="relatorio-container">
    <PageHeader title="Relatórios" subtitle="Selecione um relatório para visualizar" />

    <RelatorioPontuacaoModal
      :is-open="isPontuacaoModalOpen"
      @close="isPontuacaoModalOpen = false"
    />

    <div class="relatorio-grid">
      <button class="relatorio-card" @click="isPontuacaoModalOpen = true">
        <div class="relatorio-card-icon">
          <FileText :size="36" />
        </div>
        <div class="relatorio-card-body">
          <h3 class="relatorio-card-title">Pontuação Jogadores</h3>
          <p class="relatorio-card-desc">
            Tabela completa com gols, cartões, presenças, resultados e pontuação de todos os jogadores.
          </p>
        </div>
        <span class="relatorio-card-cta">Gerar Relatório →</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.relatorio-container {
  padding: 16px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: var(--text-primary);
}

.relatorio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

.relatorio-card-icon {
  color: var(--primary-color);
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.relatorio-card-body {
  flex: 1;
}

.relatorio-card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--secondary-color);
  margin: 0 0 6px;
}

.relatorio-card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.relatorio-card-cta {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary-color);
  align-self: flex-end;
}
</style>
