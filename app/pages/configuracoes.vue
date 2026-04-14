<template>
  <div class="config-container">
    <PageHeader title="Configurações do App" />

    <PageCard v-if="!peladaAtual.id">
      <EmptyState :icon="Settings" message="Selecione uma pelada para acessar as configurações." />
    </PageCard>

    <div v-else class="config-content">

      <!-- Exibição de Estatísticas -->
      <PageCard class="config-card">
        <SectionTitle :icon="BarChart2" title="Exibição de Estatísticas" />
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">Exibir Estatísticas para Visitantes</span>
            <span class="toggle-desc">Quando ativo, visitantes poderão ver o dashboard de estatísticas desta pelada.</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <transition name="fade">
              <span v-if="toggleMsgOk" class="success-msg" style="margin: 0;">Salvo!</span>
            </transition>
            <!-- Switch shadcn-vue -->
            <UiSwitch
              :model-value="exibeEstatistica"
              :disabled="isSaving"
              @update:model-value="toggleEstatistica"
            />
          </div>
        </div>
      </PageCard>

      <!-- Período dos Gráficos -->
      <PageCard class="config-card">
        <SectionTitle :icon="Calendar" title="Período dos Gráficos" />
        <p class="section-desc">Define o intervalo de datas exibido nos gráficos de estatísticas.</p>
        <div class="date-row">
          <div class="form-group">
            <label>Data Início</label>
            <input v-model="dataInicial" type="date" @change="salvarDatas" />
          </div>
          <div class="form-group">
            <label>Data Fim</label>
            <input v-model="dataFinal" type="date" @change="salvarDatas" />
          </div>
        </div>
        <transition name="fade">
          <div v-if="dataMsgOk" class="success-msg">Datas salvas automaticamente!</div>
        </transition>
        <div v-if="dataMsgErr" class="error-msg">{{ dataMsgErr }}</div>
      </PageCard>

      <!-- Botão para abrir modal de Cores e Pontuação -->
      <button class="btn btn-open-modal" @click="showModal = true">
        <Sliders :size="18" />
        Cores dos Times e Critérios de Pontuação
      </button>

    </div>

    <!-- Modal shadcn-vue Dialog -->
    <UiDialog
      :open="showModal"
      title="Cores e Pontuação"
      class="max-w-[600px] max-h-[88vh] overflow-y-auto !border-0"
      @update:open="showModal = $event"
    >
      <div class="modal-body">

        <!-- Cores dos Times -->
        <div class="modal-section">
          <div class="modal-section-title">
            <Palette :size="18" />
            <h3>Cores dos Times</h3>
          </div>
          <div class="teams-colors-row">
            <div class="team-color-block">
              <label>Time 1</label>
              <div class="color-swatches">
                <button
                  v-for="c in coresPredefinidas"
                  :key="c.nome"
                  class="swatch-btn"
                  :class="{ selected: corTime1 === c.nome }"
                  :style="{ background: c.hex }"
                  :title="c.nome"
                  @click="corTime1 = c.nome"
                ></button>
              </div>
              <span class="team-preview" :style="{ background: hexDaCor(corTime1) }">Time {{ corTime1 }}</span>
            </div>
            <div class="team-color-block">
              <label>Time 2</label>
              <div class="color-swatches">
                <button
                  v-for="c in coresPredefinidas"
                  :key="c.nome"
                  class="swatch-btn"
                  :class="{ selected: corTime2 === c.nome }"
                  :style="{ background: c.hex }"
                  :title="c.nome"
                  @click="corTime2 = c.nome"
                ></button>
              </div>
              <span class="team-preview" :style="{ background: hexDaCor(corTime2) }">Time {{ corTime2 }}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" @click="salvarCores" :disabled="isSaving">
            <Save :size="14" /> Salvar Cores
          </button>
          <div v-if="coresMsgOk" class="success-msg">Cores salvas!</div>
        </div>

        <div class="modal-divider"></div>

        <!-- Critérios de Pontuação -->
        <div class="modal-section">
          <div class="modal-section-title">
            <Star :size="18" />
            <h3>Critérios de Pontuação</h3>
          </div>
          <p class="section-desc">Defina quantos pontos cada evento vale. Valores negativos deduzem pontos.</p>

          <div class="pontos-grid">
            <div class="ponto-item" v-for="campo in camposPontuacao" :key="campo.key">
              <label>{{ campo.label }}</label>
              <input v-model.number="pontuacao[campo.key]" type="number" min="-99" max="99" />
            </div>
          </div>

          <button class="btn btn-primary btn-sm" @click="salvarPontuacao" :disabled="isSaving">
            <Save :size="14" /> {{ isSaving ? 'Salvando...' : 'Salvar Pontuação' }}
          </button>
          <div v-if="pontosMsgOk" class="success-msg">Pontuação salva!</div>
          <div v-if="pontosMsgErr" class="error-msg">{{ pontosMsgErr }}</div>
        </div>

      </div>
    </UiDialog>

  </div>
</template>

<script setup>
import { Settings, BarChart2, Calendar, Save, Palette, Star, Sliders } from 'lucide-vue-next'
import UiSwitch from '@/components/ui/switch/Switch.vue'
import UiDialog from '@/components/ui/dialog/Dialog.vue'
import { watchPelada } from '~/composables/usePelada'
import { useTimedMessage } from '~/composables/useTimedMessage'

definePageMeta({ middleware: 'auth' })

const supabase = useSupabaseClient()
const { peladaAtual } = usePelada()

// Modal
const showModal = ref(false)

// Estatísticas / Datas
const exibeEstatistica = ref(false)
const { visible: toggleMsgOk, show: showToggleMsg } = useTimedMessage(3000)
const dataInicial = ref('')
const dataFinal = ref('')
const isSaving = ref(false)
const { visible: dataMsgOk, show: showDataMsg } = useTimedMessage(3000)
const dataMsgErr = ref('')

// Cores
const { cores: coresPredefinidas, hexDaCor } = useTeamColors()
const corTime1 = ref('Amarelo')
const corTime2 = ref('Azul')
const { visible: coresMsgOk, show: showCoresMsg } = useTimedMessage(3000)

// Pontuação
const pontuacao = ref({
  PartidasJogadas: 1,
  PartidasAssistida: 1,
  JogadasChuva: 1,
  AssistidasChuva: 1,
  Vitorias: 1,
  Empates: 1,
  Derrotas: 0,
  Amarelo: -1,
  Azul: -1,
  Vermelho: -1,
})
const { visible: pontosMsgOk, show: showPontosMsg } = useTimedMessage(3000)
const pontosMsgErr = ref('')

const camposPontuacao = [
  { key: 'PartidasJogadas',   label: 'Partidas Jogadas' },
  { key: 'PartidasAssistida', label: 'Partidas Assistidas' },
  { key: 'JogadasChuva',      label: 'Jogou na Chuva' },
  { key: 'AssistidasChuva',   label: 'Assistiu na Chuva' },
  { key: 'Vitorias',          label: 'Vitória' },
  { key: 'Empates',           label: 'Empate' },
  { key: 'Derrotas',          label: 'Derrota' },
  { key: 'Amarelo',           label: 'Cartão Amarelo' },
  { key: 'Azul',              label: 'Cartão Azul' },
  { key: 'Vermelho',          label: 'Cartão Vermelho' },
]

function toInputDate(s) {
  if (!s) return ''
  if (s.includes('/')) { const [d,m,y] = s.split('/'); return `${y}-${m}-${d}` }
  return s.slice(0, 10)
}

async function carregarConfigs() {
  if (!peladaAtual.value.id) return

  const { data: pelada } = await supabase
    .from('Pelada')
    .select('ExibeEstatistica, CorTime1, CorTime2, DataInicial, DataFinal')
    .eq('idPelada', peladaAtual.value.id)
    .maybeSingle()
  if (pelada) {
    exibeEstatistica.value = pelada.ExibeEstatistica ?? false
    if (pelada.CorTime1) corTime1.value = pelada.CorTime1
    if (pelada.CorTime2) corTime2.value = pelada.CorTime2
    dataInicial.value = toInputDate(pelada.DataInicial) || '2025-01-01'
    dataFinal.value = toInputDate(pelada.DataFinal) || '2025-12-31'
  } else {
    dataInicial.value = '2025-01-01'
    dataFinal.value = '2025-12-31'
  }

  const { data: pontos } = await supabase
    .from('Pontuacao')
    .select('*')
    .eq('IdPelada', peladaAtual.value.id)
    .maybeSingle()
  if (pontos) {
    Object.keys(pontuacao.value).forEach(k => {
      if (pontos[k] !== undefined) pontuacao.value[k] = pontos[k]
    })
  }
}

async function toggleEstatistica() {
  isSaving.value = true
  const novo = !exibeEstatistica.value

  let { error } = await supabase.from('Pelada').update({ ExibeEstatistica: novo }).eq('idPelada', peladaAtual.value.id)

  if (error) {
    const res = await supabase.from('Pelada').update({ exibeEstatistica: novo }).eq('idPelada', peladaAtual.value.id)
    error = res.error
  }

  if (!error) {
    exibeEstatistica.value = novo
    peladaAtual.value = { ...peladaAtual.value, exibeEstatistica: novo, ExibeEstatistica: novo }
    showToggleMsg()
  } else {
    console.error('Erro ao atualizar estatistica:', error)
  }
  isSaving.value = false
}

async function salvarDatas() {
  if (!dataInicial.value || !dataFinal.value) { dataMsgErr.value = 'Preencha as duas datas.'; return }
  isSaving.value = true; dataMsgErr.value = ''
  const { error } = await supabase
    .from('Pelada')
    .update({ DataInicial: dataInicial.value, DataFinal: dataFinal.value })
    .eq('idPelada', peladaAtual.value.id)
  if (error) { dataMsgErr.value = 'Erro ao salvar datas.' } else { showDataMsg() }
  isSaving.value = false
}

async function salvarCores() {
  isSaving.value = true
  await supabase.from('Pelada').update({ CorTime1: corTime1.value, CorTime2: corTime2.value }).eq('idPelada', peladaAtual.value.id)
  showCoresMsg()
  isSaving.value = false
}

async function salvarPontuacao() {
  isSaving.value = true; pontosMsgErr.value = ''
  const { data: ex } = await supabase.from('Pontuacao').select('id').eq('IdPelada', peladaAtual.value.id).maybeSingle()
  const payload = { ...pontuacao.value, IdPelada: peladaAtual.value.id }
  const op = ex
    ? supabase.from('Pontuacao').update(payload).eq('IdPelada', peladaAtual.value.id)
    : supabase.from('Pontuacao').insert([payload])
  const { error } = await op
  if (error) { pontosMsgErr.value = 'Erro ao salvar pontuação.' } else { showPontosMsg() }
  isSaving.value = false
}

watchPelada(() => carregarConfigs())
</script>

<style scoped>
.config-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 650px;
  margin: 0 auto;
}

.config-content { display: flex; flex-direction: column; gap: 16px; }
.config-card { display: flex; flex-direction: column; gap: 14px; }
.section-desc { margin: 0; font-size: 0.83rem; color: var(--text-secondary); }

/* Toggle */
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.toggle-info { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.toggle-label { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
.toggle-desc { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }
.toggle-btn {
  width: 52px; height: 28px; border-radius: 14px; background: var(--border-color);
  border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0;
}
.toggle-btn.active { background: var(--primary-color); }
.toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.toggle-knob {
  position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
  border-radius: 50%; background: white; transition: transform 0.2s; display: block;
}
.toggle-btn.active .toggle-knob { transform: translateX(24px); }

/* Datas */
.date-row { display: flex; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
label { font-size: 0.82rem; font-weight: 600; color: var(--primary-color); }
input[type="date"] {
  padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color);
  background: var(--bg-primary); color: var(--text-primary); font-size: 0.95rem;
}
input[type="date"]:focus { border-color: var(--secondary-color); outline: none; }

/* Botão abrir modal */
.btn-open-modal {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px 20px; border-radius: 14px; font-weight: 700; font-size: 0.95rem;
  cursor: pointer; border: 2px dashed var(--primary-color);
  background: transparent; color: var(--primary-color); transition: all 0.2s;
}
.btn-open-modal:hover { background: rgba(var(--primary-color), 0.05); opacity: 0.85; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: flex-end; justify-content: center; z-index: 1000;
}

@media (min-width: 600px) {
  .modal-overlay { align-items: center; }
}

.modal-box {
  background: var(--bg-secondary);
  border-radius: 20px 20px 0 0;
  width: 100%; max-width: 600px;
  max-height: 88vh; overflow-y: auto;
  border: 1px solid var(--border-color);
}

@media (min-width: 600px) {
  .modal-box { border-radius: 20px; }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-color);
  position: sticky; top: 0; background: var(--bg-secondary); z-index: 1;
}
.modal-title { margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--primary-color); }
.modal-close {
  background: none; border: none; color: var(--text-secondary);
  cursor: pointer; padding: 4px; border-radius: 6px;
}
.modal-close:hover { color: var(--text-primary); }

.modal-body { padding: 20px 24px 28px; display: flex; flex-direction: column; gap: 24px; }

.modal-section { display: flex; flex-direction: column; gap: 14px; }
.modal-section-title { display: flex; align-items: center; gap: 8px; color: var(--primary-color); }
.modal-section-title h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }

.modal-divider { border: none; border-top: 1px solid var(--border-color); }

/* Cores dos times */
.teams-colors-row { display: flex; gap: 24px; flex-wrap: wrap; }
.team-color-block { display: flex; flex-direction: column; gap: 10px; }
.team-color-block label { font-size: 0.82rem; font-weight: 600; color: var(--primary-color); }

.color-swatches { display: flex; gap: 8px; }
.swatch-btn {
  width: 36px; height: 36px; border-radius: 8px;
  border: 3px solid transparent; cursor: pointer;
  transition: transform 0.15s, border-color 0.15s;
}
.swatch-btn:hover { transform: scale(1.1); }
.swatch-btn.selected { border-color: var(--text-primary); transform: scale(1.15); }

.team-preview {
  display: inline-block; padding: 5px 16px; border-radius: 8px;
  font-weight: 700; font-size: 0.82rem; color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5); align-self: flex-start;
}

/* Pontuação */
.pontos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.ponto-item { display: flex; flex-direction: column; gap: 5px; }
.ponto-item label { font-size: 0.8rem; font-weight: 600; color: var(--primary-color); }
.ponto-item input {
  padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);
  background: var(--bg-primary); color: var(--text-primary); font-size: 0.95rem;
  text-align: center; width: 100%;
}
.ponto-item input:focus { border-color: var(--secondary-color); outline: none; }

/* Botões */
.btn {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 11px 20px; border-radius: 10px;
  font-weight: 700; cursor: pointer; border: none; transition: all 0.2s;
}
.btn-sm { padding: 9px 16px; font-size: 0.88rem; }
.btn-primary { background: var(--primary-color); color: white; }
.dark .btn-primary { color: #0d1a0d; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.success-msg { color: #4caf50; font-size: 0.85rem; text-align: center; }
.error-msg { color: #ff5252; font-size: 0.85rem; text-align: center; }
</style>
