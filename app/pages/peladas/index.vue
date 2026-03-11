<template>
  <div class="peladas-container">
    <div class="page-title-section">
      <h1 class="page-title">Minha Pelada</h1>
    </div>

    <!-- Formulário da Pelada Atual ou Nova -->
    <div class="form-card card">
      <div class="form-header">
        <h2>{{ editingId ? 'Editar dados da Pelada' : 'Cadastrar Nova Pelada' }}</h2>
        <span v-if="successMsg" class="success-badge">Salvo!</span>
      </div>

      <form @submit.prevent="savePelada" class="pelada-form">
        <div class="form-group">
          <label>Nome da Pelada *</label>
          <input v-model="form.NomePelada" type="text" placeholder="Ex: Pelada dos Amigos" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Responsável *</label>
            <input v-model="form.Responsavel" type="text" placeholder="Nome do responsável" required />
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input v-model="form.Telefone" type="tel" placeholder="(00) 00000-0000" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Dia da Semana *</label>
            <select v-model="form.Dia" required>
              <option value="Segunda">Segunda</option>
              <option value="Terça">Terça</option>
              <option value="Quarta">Quarta</option>
              <option value="Quinta">Quinta</option>
              <option value="Sexta">Sexta</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
          <div class="form-group">
            <label>Horário *</label>
            <input v-model="form.Horario" type="text" placeholder="Ex: 19:00" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>UF</label>
            <input v-model="form.UF" type="text" maxlength="2" placeholder="SP" />
          </div>
          <div class="form-group">
            <label>Cidade</label>
            <input v-model="form.Cidade" type="text" placeholder="Nome da cidade" />
          </div>
        </div>

        <div class="form-group">
          <label>Local / Campo</label>
          <input v-model="form.Local" type="text" placeholder="Nome do clube ou campo" />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <Save :size="16" />
            {{ isLoading ? 'Gravando...' : 'Gravar' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Lista de outras Peladas -->
    <div v-if="peladas && peladas.length > 0" class="outras-peladas card">
      <h3 class="section-title">Minhas Peladas</h3>
      <div class="peladas-list">
        <div
          v-for="pelada in peladas"
          :key="pelada.idPelada"
          class="pelada-item"
          :class="{ active: peladaAtual.id === pelada.idPelada }"
          @click="selectAndEdit(pelada)"
        >
          <div class="pelada-info">
            <span class="pelada-name">{{ pelada.NomePelada }}</span>
            <span class="pelada-meta">{{ pelada.Dia }} • {{ pelada.Horario }} • {{ pelada.Responsavel }}</span>
          </div>
          <ChevronRight :size="18" class="chevron" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Save, ChevronRight } from 'lucide-vue-next'

definePageMeta({ middleware: 'auth' })

const client = useSupabaseClient()
const user = useSupabaseUser()
const { peladaAtual, setPelada, fetchPelada } = usePelada()

const isLoading = ref(false)
const editingId = ref(null)
const errorMsg = ref('')
const successMsg = ref(false)

const form = ref({
  NomePelada: '',
  Responsavel: '',
  Telefone: '',
  Dia: 'Sábado',
  Horario: '',
  UF: '',
  Cidade: '',
  Local: '',
})

const { data: peladas, refresh } = await useAsyncData('peladas', async () => {
  const userId = user.value?.id
  if (!userId) return []
  const { data } = await client
    .from('Pelada')
    .select('idPelada, NomePelada, Responsavel, Dia, Horario, ExibeEstatistica')
    .eq('idUser', userId)
    .order('NomePelada')
  return data || []
}, { server: false, watch: [user] })

// Se há pelada ativa, carrega ela no form; senão modo "nova"
watchEffect(() => {
  if (peladaAtual.value.id && !editingId.value) {
    loadPeladaInForm(peladaAtual.value.id)
  }
})

async function loadPeladaInForm(id) {
  const { data } = await client
    .from('Pelada')
    .select('*')
    .eq('idPelada', id)
    .maybeSingle()
  if (data) {
    editingId.value = data.idPelada
    form.value = {
      NomePelada: data.NomePelada || '',
      Responsavel: data.Responsavel || '',
      Telefone: data.Telefone || '',
      Dia: data.Dia || 'Sábado',
      Horario: data.Horario || '',
      UF: data.UF || '',
      Cidade: data.Cidade || '',
      Local: data.Local || '',
    }
  }
}

function selectAndEdit(pelada) {
  setPelada(pelada)
  loadPeladaInForm(pelada.idPelada)
}


async function savePelada() {
  if (!user.value?.id) return
  isLoading.value = true
  errorMsg.value = ''

  const payload = { ...form.value, idUser: user.value.id }

  try {
    if (editingId.value) {
      const { error } = await client.from('Pelada').update(payload).eq('idPelada', editingId.value)
      if (error) throw error
    } else {
      const { data, error } = await client.from('Pelada').insert([payload]).select().single()
      if (error) throw error
      editingId.value = data.idPelada
      setPelada(data)
    }

    await refresh()
    // Atualiza o nome no header
    await fetchPelada(user.value.id)
    successMsg.value = true
    setTimeout(() => (successMsg.value = false), 2500)
  } catch (err) {
    errorMsg.value = 'Erro ao salvar. Verifique os campos obrigatórios.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (peladaAtual.value.id) {
    await loadPeladaInForm(peladaAtual.value.id)
  }
})
</script>

<style scoped>
.peladas-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.page-title-section { display: flex; align-items: center; padding-top: 15px; }

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.form-card { display: flex; flex-direction: column; gap: 20px; }

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.success-badge {
  background: #4caf50;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.pelada-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary-color);
}

input, select {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
}

input:focus, select:focus {
  border-color: var(--secondary-color);
  outline: none;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  flex: 1;
}

.btn-primary { background: var(--primary-color); color: white; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }


.error-msg { color: #ff5252; font-size: 0.85rem; }

/* Lista de peladas */
.outras-peladas { display: flex; flex-direction: column; gap: 12px; }

.section-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.peladas-list { display: flex; flex-direction: column; gap: 4px; }

.pelada-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.pelada-item:hover {
  background: rgba(0, 200, 83, 0.06);
  border-color: var(--border-color);
}

.pelada-item.active {
  background: rgba(0, 200, 83, 0.1);
  border-color: var(--primary-color);
  border-left: 4px solid var(--primary-color);
}

.pelada-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.pelada-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.pelada-meta {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.chevron { color: var(--text-secondary); flex-shrink: 0; }
</style>
