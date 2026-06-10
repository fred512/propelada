<template>
  <Dialog
    :open="isOpen"
    @update:open="(val) => { if (!val) emit('close') }"
    class="max-w-[98vw] w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl !bg-[var(--bg-secondary)]"
  >
    <!-- Header -->
    <div class="rel-header">
      <h2 class="rel-title">Ranking</h2>
      <div class="rel-header-actions">
        <button class="rel-btn-print" @click="handlePrint" title="Imprimir / Salvar PDF">
          <Printer :size="20" />
          <span>PDF</span>
        </button>
        <button class="rel-close-btn" @click="emit('close')"><X :size="20" /></button>
      </div>
    </div>

    <!-- Corpo -->
    <div class="rel-body">
      <div v-if="isLoading" class="rel-loading">Carregando dados...</div>
      <div v-else-if="rankingData.length === 0" class="rel-empty">Nenhum dado encontrado.</div>

      <div v-else class="rel-table-wrapper">
        <table class="rel-table">
          <thead>
            <tr>
              <th class="col-rank">#</th>
              <th class="col-jogador">Jogador</th>
              <th>%A</th>
              <th>J</th>
              <th>P</th>
              <th>V</th>
              <th>D</th>
              <th>E</th>
              <th>GP</th>
              <th>GC</th>
              <th>SG</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in rankingData"
              :key="i"
              :class="{ 'stripe-row': i % 2 !== 0 }"
            >
              <td class="text-center">
                <span class="pos-badge" :class="posBadgeClass(row.classificacao - 1)">{{ row.classificacao }}º</span>
              </td>
              <td class="col-jogador">{{ row.jogador }}</td>
              <td class="text-center font-bold">{{ formatPercent(row['%A']) }}</td>
              <td class="text-center highlighted">{{ row.j }}</td>
              <td class="text-center pts-value">{{ row.p }}</td>
              <td class="text-center">{{ row.v }}</td>
              <td class="text-center">{{ row.d }}</td>
              <td class="text-center">{{ row.e }}</td>
              <td class="text-center">{{ row.gp }}</td>
              <td class="text-center">{{ row.gc }}</td>
              <td class="text-center">{{ row.sg }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="rel-footer">
      {{ rankingData.length }} jogadores · {{ nomeFormatado }}
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Printer, X } from 'lucide-vue-next'
import Dialog from '@/components/ui/dialog/Dialog.vue'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])

const supabase = useSupabaseClient()
const { peladaAtual, nomeFormatado } = usePelada()

const rankingData = ref([])
const isLoading = ref(false)

const dataAtual = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
)

const posBadgeClass = (index) => {
  if (index === 0) return 'pos-gold'
  if (index === 1) return 'pos-silver'
  if (index === 2) return 'pos-bronze'
  return ''
}

const formatPercent = (val) => {
  if (val === undefined || val === null) return '0.0'
  return parseFloat(val).toFixed(1)
}

async function carregarDados() {
  if (!peladaAtual.value.id) return
  isLoading.value = true
  try {
    const { data } = await supabase
      .from('view_ranking_geral_jogadores')
      .select('*')
      .eq('IdPelada', peladaAtual.value.id)
      .order('classificacao', { ascending: true })
    rankingData.value = data || []
  } finally {
    isLoading.value = false
  }
}

watch(() => props.isOpen, (val) => { if (val) carregarDados() })

function handlePrint() {
  const pelada = nomeFormatado.value
  const data = dataAtual.value
  const logoUrl = window.location.origin + '/images/Propelada8.png'

  const rows = rankingData.value.map((row, i) => `
    <tr class="${i % 2 !== 0 ? 'stripe' : ''}">
      <td class="text-center">${row.classificacao}º</td>
      <td>${row.jogador}</td>
      <td class="text-center">${formatPercent(row['%A'])}</td>
      <td class="text-center">${row.j}</td>
      <td class="text-center pts">${row.p}</td>
      <td class="text-center">${row.v}</td>
      <td class="text-center">${row.d}</td>
      <td class="text-center">${row.e}</td>
      <td class="text-center">${row.gp}</td>
      <td class="text-center">${row.gc}</td>
      <td class="text-center">${row.sg}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Ranking ProPelada</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 15px; padding: 20px; color: #111; }
    .header { text-align: center; margin-bottom: 16px; }
    .header img { height: 48px; display: block; margin: 0 auto 6px; }
    .header h1 { font-size: 25px; margin: 0; font-weight: 900; }
    .header p { color: #666; margin: 3px 0 0; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1b5e20; color: white; padding: 7px 8px; font-size: 14px; text-align: center; font-weight: 700; }
    td { padding: 7px 8px; border-bottom: 1px solid #ddd; font-size: 15px; }
    .stripe td { background: #f5f5f5; }
    .text-center { text-align: center; }
    .pts { font-weight: 800; font-size: 16px; color: #1565c0; }
  </style></head><body>
  <div class="header">
    <img src="${logoUrl}" />
    <h1>Ranking ProPelada</h1>
    <p>${pelada} · Gerado em ${data}</p>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Jogador</th><th>%A</th><th>J</th><th>P</th>
      <th>V</th><th>D</th><th>E</th><th>GP</th><th>GC</th><th>SG</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="text-align:center;font-size:12px;color:#666;margin-top:12px">${rankingData.value.length} jogadores</p>
  </body></html>`

  const w = window.open('', '_blank', 'width=1000,height=700')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print() }, 600)
}
</script>

<style scoped>
.rel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-secondary);
}

.rel-title {
  color: var(--secondary-color);
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  text-decoration: underline;
  text-underline-offset: 6px;
}

.rel-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rel-btn-print {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.rel-btn-print:hover { background: #388E3C; }

.rel-close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
}
.rel-close-btn:hover { color: var(--text-primary); }

.rel-body {
  overflow-y: auto;
  max-height: calc(85vh - 120px);
}

.rel-loading, .rel-empty {
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

.rel-footer {
  padding: 10px 20px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.rel-table-wrapper { overflow-x: auto; }

.rel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.rel-table th {
  padding: 9px 8px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
  text-align: center;
}

.rel-table td {
  padding: 9px 8px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
}

.col-rank { width: 40px; }
.col-jogador { min-width: 130px; text-align: left !important; font-weight: 600; }

.stripe-row td { background: var(--bg-primary); }
.text-center { text-align: center; }
.font-bold { font-weight: 700; }
.highlighted { color: var(--primary-color); font-weight: 700; }
.pts-value { font-weight: 800; color: #42A5F5; }

.pos-badge {
  display: inline-block;
  min-width: 28px;
  padding: 2px 4px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
}
.pos-gold   { background: #FFD700; color: #333; }
.pos-silver { background: #C0C0C0; color: #333; }
.pos-bronze { background: #CD7F32; color: #fff; }
</style>
