<template>
  <div class="acesso-container">
    <PageHeader title="Gera Código de Acesso" />

    <PageCard class="content-card">
      <p class="description">
        Gere um código de 6 dígitos para que visitantes possam consultar dados da sua pelada.
        O código expira em <strong>3 horas</strong>.
      </p>

      <EmptyState v-if="!peladaAtual.id" :icon="Key" message="Selecione uma pelada primeiro para gerar o código de acesso." />

      <div v-else class="main-content">
        <!-- Código atual -->
        <div v-if="codigoAtual" class="code-display card">
          <span class="code-label">Código Atual</span>
          <span class="code-value">{{ codigoAtual.codigo }}</span>
          <span class="code-expiry">
            <Clock :size="14" />
            Expira em: {{ formatExpira(codigoAtual.expira) }}
          </span>
        </div>

        <!-- Novo código gerado -->
        <div v-if="codigoGerado" class="code-display code-new card">
          <span class="code-label">Novo Código Gerado</span>
          <span class="code-value">{{ codigoGerado }}</span>
          <span class="code-expiry">
            <Clock :size="14" />
            Expira em: {{ formatExpira(expira) }}
          </span>
        </div>

        <!-- Confirmação -->
        <div v-if="showConfirm" class="confirm-box card">
          <p>Confirma a geração do código de acesso?<br />
            <small>O código anterior será substituído.</small>
          </p>
          <div class="confirm-actions">
            <button class="btn btn-outline" @click="showConfirm = false">Cancelar</button>
            <button class="btn btn-primary" :disabled="isLoading" @click="confirmarGeracao">
              {{ isLoading ? 'Gerando...' : 'Confirmar' }}
            </button>
          </div>
        </div>

        <button
          v-if="!showConfirm"
          class="btn btn-primary btn-full"
          @click="showConfirm = true"
        >
          <RefreshCw :size="18" />
          Gerar Código de Acesso
        </button>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      </div>
    </PageCard>
  </div>
</template>

<script setup>
import { Key, Clock, RefreshCw } from 'lucide-vue-next'
import { watchPelada } from '~/composables/usePelada'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const { peladaAtual } = usePelada()

const codigoAtual = ref(null)
const codigoGerado = ref('')
const expira = ref('')
const showConfirm = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

function gerarCodigo6Digitos() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getTimePlus3Hours() {
  const now = new Date()
  now.setHours(now.getHours() + 3)
  return now.toISOString()
}

function formatExpira(str) {
  if (!str) return ''
  const d = new Date(str)
  if (isNaN(d)) return str // fallback para formato antigo (só hora)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

async function carregarCodigoAtual() {
  if (!peladaAtual.value.id) return
  const { data } = await supabase
    .from('CodigoAcesso')
    .select('codigo, expira')
    .eq('idPelada', peladaAtual.value.id)
    .maybeSingle()
  codigoAtual.value = data
}

async function confirmarGeracao() {
  isLoading.value = true
  errorMsg.value = ''
  showConfirm.value = false
  try {
    await supabase
      .from('CodigoAcesso')
      .delete()
      .eq('idPelada', peladaAtual.value.id)

    const novoCodigo = gerarCodigo6Digitos()
    const novaExpiracao = getTimePlus3Hours()

    const { error } = await supabase
      .from('CodigoAcesso')
      .insert([{ idPelada: peladaAtual.value.id, codigo: novoCodigo, expira: novaExpiracao }])

    if (error) throw error

    codigoGerado.value = novoCodigo
    expira.value = novaExpiracao
    codigoAtual.value = { codigo: novoCodigo, expira: novaExpiracao }
  } catch (e) {
    errorMsg.value = 'Erro ao gerar código. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}

watchPelada(() => carregarCodigoAtual())
</script>

<style scoped>
.acesso-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.content-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* inner sub-card (code display, confirm box) */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.code-new {
  border-left: 4px solid var(--primary-color);
}

.code-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 600;
}

.code-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 8px;
  font-family: monospace;
}

.code-expiry {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.confirm-box {
  border-left: 4px solid #ff9800;
}

.confirm-box p {
  margin: 0 0 16px 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.confirm-box small {
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-full {
  width: 100%;
  flex: unset;
}

.error-msg {
  color: #ff5252;
  font-size: 0.85rem;
  text-align: center;
}
</style>
