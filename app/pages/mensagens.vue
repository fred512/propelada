<template>
  <div class="mensagens-container">
    <PageHeader title="Mensagens" subtitle="Fale Conosco dos usuários" />

    <PageCard>
      <div v-if="isLoading" class="loading-state">
        <LoadingState message="Carregando mensagens..." />
      </div>

      <div v-else-if="mensagens.length === 0" class="empty-state">
        <EmptyState :icon="MessageSquare" message="Nenhuma mensagem recebida." />
      </div>

      <div v-else class="mensagens-list">
        <div
          v-for="m in mensagens"
          :key="m.id"
          class="mensagem-card"
          :class="{ 'nao-lida': !m.lida }"
          @click="marcarLida(m)"
        >
          <div class="mensagem-header">
            <div class="mensagem-meta">
              <span class="mensagem-assunto">{{ m.assunto }}</span>
              <span v-if="!m.lida" class="badge-nao-lida">Nova</span>
            </div>
            <span class="mensagem-data">{{ formatDate(m.criadoEm) }}</span>
          </div>
          <p class="mensagem-texto">{{ m.mensagem }}</p>
          <div class="mensagem-footer">
            <span class="mensagem-user">{{ m.idUser ? 'Usuário registrado' : 'Visitante' }}</span>
            <button v-if="!m.lida" class="btn-marcar" @click.stop="toggleLida(m)">
              <Check :size="14" /> Marcar como lida
            </button>
            <button v-else class="btn-marcar btn-nao-lida" @click.stop="toggleLida(m)">
              <MailOpen :size="14" /> Marcar como não lida
            </button>
          </div>
        </div>
      </div>
    </PageCard>
  </div>
</template>

<script setup>
import { MessageSquare, Check, MailOpen } from 'lucide-vue-next'

const supabase = useSupabaseClient()

const mensagens = ref([])
const isLoading = ref(true)

async function fetchMensagens() {
  isLoading.value = true
  const { data, error } = await supabase
    .from('Contato')
    .select('*')
    .order('criadoEm', { ascending: false })

  if (!error && data) mensagens.value = data
  isLoading.value = false
}

async function toggleLida(m) {
  const novoValor = !m.lida
  const { error } = await supabase
    .from('Contato')
    .update({ lida: novoValor })
    .eq('id', m.id)
  if (!error) m.lida = novoValor
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(fetchMensagens)
</script>

<style scoped>
.mensagens-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.loading-state,
.empty-state {
  padding: 40px 0;
}

.mensagens-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mensagem-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  background: var(--bg-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.mensagem-card:hover {
  border-color: var(--primary-color);
}

.mensagem-card.nao-lida {
  border-left: 3px solid var(--primary-color);
  background: rgba(0, 200, 83, 0.04);
}

.mensagem-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}

.mensagem-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mensagem-assunto {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.badge-nao-lida {
  background: var(--primary-color);
  color: #0d1a0d;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mensagem-data {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

.mensagem-texto {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
  white-space: pre-wrap;
}

.mensagem-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.mensagem-user {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.btn-marcar {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary-color);
  background: none;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-marcar:hover {
  background: rgba(0, 200, 83, 0.1);
}

.btn-nao-lida {
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.btn-nao-lida:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
}
</style>
