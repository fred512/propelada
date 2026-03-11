<template>
  <div class="participantes-container">
    <!-- Título Local Estilizado -->
    <div class="page-title-section">
      <h1 class="page-title">Cadastro de Participantes</h1>
    </div>

    <!-- Modal de Perfil -->
    <PlayerProfileModal 
      :is-open="isProfileModalOpen"
      :profile="selectedProfile"
      :is-loading="isProfileLoading"
      @close="isProfileModalOpen = false"
    />

    <!-- Barra de Ações (Botões Coloridos) -->
    <div class="actions-bar card">
      <div class="search-input-wrapper">
        <input 
          v-model.trim="searchQuery" 
          type="text" 
          placeholder="Pesquisar participante..." 
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="button-group">
        <button v-if="editingId" class="action-btn btn-profile" @click="openProfile(editingId)" title="Ver Perfil">
          <UserCircle :size="20" />
        </button>
        <button class="action-btn btn-reset" @click="clearForm" title="Limpar">
          <RotateCcw :size="20" />
        </button>
        <button class="action-btn btn-save" @click="saveParticipant" :disabled="isLoading" title="Gravar">
          <Save :size="20" />
        </button>
        <button class="action-btn btn-search" @click="handleSearch" title="Pesquisar">
          <Search :size="20" />
        </button>
      </div>
    </div>

    <!-- Lista de Participantes (Estilo Mobile) -->
    <div v-show="showResults" class="list-section card">
      <div class="section-header">
        <h3>Lista de Participantes ({{ participants.length }})</h3>
        <span v-if="isLoading" class="loading-indicator">Buscando...</span>
      </div>
      
      <div class="participants-mobile-list">
        <div 
          v-for="p in participants" 
          :key="p.IdParticipante" 
          class="participant-item"
          @click="editParticipant(p)"
        >
          <div class="p-avatar">
            <img v-if="p.FotoURL" :src="p.FotoURL" />
            <UserIcon v-else :size="24" />
          </div>
          <div class="p-info">
            <div class="p-name">{{ p.Nome }}</div>
            <div class="p-sub">{{ p.TipoParticipante }} • {{ p.Posicao }}</div>
          </div>
          <div class="p-level" :class="p.NivelAtuacao?.toLowerCase()">
            {{ p.NivelAtuacao }}
          </div>
        </div>
        
        <div v-if="!isLoading && participants.length === 0" class="empty-list">
          Nenhum participante encontrado com "{{ searchQuery }}".
        </div>
      </div>
    </div>

    <div class="form-card card">
      <div class="form-layout">
        <!-- Coluna de Campos -->
        <div class="fields-column">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.nome" type="text" placeholder="Nome completo" required />
          </div>

          <div class="form-group">
            <label>Apelido</label>
            <input v-model="form.apelido" type="text" placeholder="Como é conhecido" />
          </div>

          <div class="form-group">
            <label>Celular</label>
            <input v-model="form.celular" type="tel" placeholder="(00) 00000-0000" />
          </div>

          <div class="form-group row-group">
            <div class="field-item">
              <label>Dt Nascimento</label>
              <div class="input-with-icon">
                <input v-model="form.dTNasc" type="date" />
                <Calendar :size="18" class="field-icon" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Tipo Participante</label>
            <select v-model="form.tipoParticipante">
              <option value="Jogador">Jogador</option>
              <option value="Ex-Jogador">Ex-Jogador</option>
              <option value="Convidado">Convidado</option>
              <option value="Goleiro">Goleiro</option>
              <option value="Juiz">Juiz</option>
            </select>
          </div>

          <div class="form-group">
            <label>Posição</label>
            <select v-model="form.posicao">
              <option value="Zagueiro">Zagueiro</option>
              <option value="Meio campo">Meio campo</option>
              <option value="Lateral">Lateral</option>
              <option value="Atacante">Atacante</option>
            </select>
          </div>

          <div class="form-group">
            <label>Nível</label>
            <select v-model="form.nivelAtuacao">
              <option v-if="form.nivelAtuacao && !['Bom','Médio','Ruim'].includes(form.nivelAtuacao)" :value="form.nivelAtuacao">{{ form.nivelAtuacao }}</option>
              <option value="Bom">Bom</option>
              <option value="Médio">Médio</option>
              <option value="Ruim">Ruim</option>
            </select>
          </div>

          <div class="form-group">
            <label>Idade</label>
            <select v-model="form.nivelIdade">
              <option v-if="form.nivelIdade && !['Novo','Médio','Velho'].includes(form.nivelIdade)" :value="form.nivelIdade">{{ form.nivelIdade }}</option>
              <option value="Novo">Novo</option>
              <option value="Médio">Médio</option>
              <option value="Velho">Velho</option>
            </select>
          </div>

          <div class="form-group">
            <label>Velocidade</label>
            <select v-model="form.nivelVelocidade">
              <option v-if="form.nivelVelocidade && !['Rápido','Médio','Lento'].includes(form.nivelVelocidade)" :value="form.nivelVelocidade">{{ form.nivelVelocidade }}</option>
              <option value="Rápido">Rápido</option>
              <option value="Médio">Médio</option>
              <option value="Lento">Lento</option>
            </select>
          </div>

          <div class="form-group">
            <label>Cargo</label>
            <select v-model="form.cargo">
              <option value="">Nenhum</option>
            </select>
          </div>
        </div>

        <!-- Coluna de Foto -->
        <div class="photo-column">
          <div class="avatar-container">
            <div class="avatar-circle">
              <img v-if="form.fotoURL" :src="form.fotoURL" alt="Foto" />
              <div v-else class="avatar-placeholder">
                <UserIcon :size="80" />
              </div>
            </div>
            <button class="btn-change-photo" @click="triggerPhotoUpload">
              Alterar foto
            </button>
            <input 
              type="file" 
              ref="photoInput" 
              style="display: none" 
              accept="image/*" 
              @change="handlePhotoUpload"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  RotateCcw, 
  Save, 
  Search, 
  Calendar, 
  User as UserIcon,
  UserCircle 
} from 'lucide-vue-next'
import PlayerProfileModal from '~/components/PlayerProfileModal.vue'

const supabase = useSupabaseClient()
const { peladaAtual } = usePelada()

// Estado
const isLoading = ref(false)
const editingId = ref(null)
const photoInput = ref(null)
const searchQuery = ref('')
const participants = ref([])
const showResults = ref(false)

// Estado do Modal de Perfil
const isProfileModalOpen = ref(false)
const isProfileLoading = ref(false)
const selectedProfile = ref(null)

const form = ref({
  nome: '',
  apelido: '',
  celular: '',
  dTNasc: '',
  tipoParticipante: 'Jogador',
  posicao: 'Meio campo',
  nivelAtuacao: 'Médio',
  nivelIdade: 'Médio',
  nivelVelocidade: 'Médio',
  cargo: '',
  fotoURL: ''
})

// Funções
const fetchParticipants = async () => {
  console.log('fetchParticipants iniciado. Pelada ID:', peladaAtual.value.id)
  
  if (!peladaAtual.value.id) {
    console.warn('Busca cancelada: peladaAtual.id está ausente.')
    return
  }
  
  isLoading.value = true
  
  try {
    let query = supabase
      .from('Participantes')
      .select('*')
      .eq('IdPelada', peladaAtual.value.id)
    
    if (searchQuery.value) {
      console.log('Aplicando filtro de busca:', searchQuery.value)
      // Busca por Nome OU Apelido
      query = query.or(`Nome.ilike.%${searchQuery.value}%,Apelido.ilike.%${searchQuery.value}%`)
    }
    
    const { data, error } = await query.order('Nome')
    
    if (error) {
      console.error('Erro na busca de participantes:', error)
      participants.value = []
    } else {
      console.log(`Busca concluída: ${data?.length || 0} encontrados`)
      if (data && data.length > 0) {
        console.log('DEBUG: Chaves do primeiro participante:', Object.keys(data[0] || {}))
      }
      participants.value = data || []
    }
  } catch (err) {
    console.error('Falha ao buscar participantes:', err)
    participants.value = []
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  console.log('Iniciando pesquisa por:', searchQuery.value)
  showResults.value = true
  fetchParticipants()
}

const clearForm = () => {
  editingId.value = null
  searchQuery.value = ''
  showResults.value = false
  form.value = {
    nome: '', apelido: '', celular: '', dTNasc: '',
    tipoParticipante: 'Jogador', posicao: 'Meio campo',
    nivelAtuacao: 'Médio', nivelIdade: 'Médio',
    nivelVelocidade: 'Médio', cargo: '', fotoURL: ''
  }
}

const editParticipant = async (p) => {
  editingId.value = p.IdParticipante
  showResults.value = false
  isLoading.value = true

  const { data, error } = await supabase
    .from('Participantes')
    .select('*')
    .eq('IdParticipante', p.IdParticipante)
    .single()

  isLoading.value = false

  const src = (!error && data) ? data : p
  form.value = {
    nome: src.Nome || '',
    apelido: src.Apelido || '',
    celular: src.Celular || '',
    dTNasc: src.DTNasc ? src.DTNasc.split('T')[0] : '',
    tipoParticipante: src.TipoParticipante || 'Jogador',
    posicao: src.Posicao || 'Meio campo',
    nivelAtuacao: src.NivelAtuacao || 'Médio',
    nivelIdade: src.NivelIdade || 'Médio',
    nivelVelocidade: src.NivelVelocidade || 'Médio',
    cargo: src.Cargo || '',
    fotoURL: src.FotoURL || ''
  }
}

const saveParticipant = async () => {
  if (!peladaAtual.value.id) return
  isLoading.value = true

  const payload = {
    Nome: form.value.nome,
    Apelido: form.value.apelido,
    Celular: form.value.celular,
    DTNasc: form.value.dTNasc || null,
    TipoParticipante: form.value.tipoParticipante,
    Posicao: form.value.posicao,
    NivelAtuacao: form.value.nivelAtuacao,
    NivelIdade: form.value.nivelIdade,
    NivelVelocidade: form.value.nivelVelocidade,
    Cargo: form.value.cargo,
    FotoURL: form.value.fotoURL,
    IdPelada: peladaAtual.value.id
  }

  try {
    if (editingId.value) {
      await supabase.from('Participantes').update(payload).eq('IdParticipante', editingId.value)
    } else {
      await supabase.from('Participantes').insert([payload])
    }
    clearForm()
    fetchParticipants()
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const openProfile = async (idJogador) => {
  if (!idJogador) return
  
  isProfileLoading.value = true
  isProfileModalOpen.value = true
  selectedProfile.value = null

  try {
    // 1. Buscar datas configuradas da pelada
    const { data: pelada } = await supabase
      .from('Pelada')
      .select('DataInicial, DataFinal')
      .eq('idPelada', peladaAtual.value.id)
      .maybeSingle()

    const dataIni = pelada?.DataInicial || `${new Date().getFullYear()}-01-01`
    const dataFim = pelada?.DataFinal || new Date().toISOString().split('T')[0]

    // 2. Buscar perfil via RPC
    const { data: profileData, error: profileError } = await supabase
      .rpc('fn_perfil_jogador', {
        p_idjogador: idJogador,
        p_datainicial: dataIni,
        p_datafinal: dataFim
      })
      .maybeSingle()

    if (profileError) {
      console.error('Erro ao buscar perfil do jogador:', profileError)
    } else if (profileData) {
      selectedProfile.value = profileData
    }
  } catch (err) {
    console.error('Falha ao carregar perfil:', err)
  } finally {
    isProfileLoading.value = false
  }
}

const triggerPhotoUpload = () => photoInput.value.click()

const handlePhotoUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Logica simplificada: usar FileReader para preview local por agora
  // Em produção, deve subir para o Supabase Storage Bucket 'avatars'
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.fotoURL = e.target.result
  }
  reader.readAsDataURL(file)
}

// Observar mudanças na pelada para carregar participantes
watch(() => peladaAtual.value.id, (newId) => {
  if (newId) {
    console.log('Pelada ID detectado em participantes, buscando lista...')
    fetchParticipants()
  }
}, { immediate: true })

onMounted(() => {
  if (peladaAtual.value.id) {
    fetchParticipants()
  }
})
</script>

<style scoped>
.participantes-container {
  padding: 16px;
  max-width: 100%;
  margin: 0 auto;
  color: var(--text-primary);
  box-sizing: border-box;
}

.page-title-section {
  text-align: center;
  margin-bottom: 24px;
  padding-top: 15px;
}

.page-title {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 8px;
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.2rem;
  }
}

.card {
  background-color: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  margin-bottom: 16px;
}

.actions-bar {
  display: flex;
  align-items: center; /* Alinha o input com os botões */
  justify-content: space-between;
  padding: 12px 16px;
  gap: 12px;
}

.search-input-wrapper {
  flex: 1;
}

.search-input-wrapper input {
  height: 44px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0 16px;
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 8px; /* Reduzido de 12px para mobile */
}

.action-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: opacity 0.2s;
}

.btn-reset { background-color: #F44336; }
.btn-save { background-color: #2196F3; }
.btn-search { background-color: #00897B; }
.btn-profile { background-color: var(--secondary-color); }

.action-btn:hover { opacity: 0.9; }

.form-card {
  padding: 24px;
}

@media (max-width: 600px) {
  .form-card, .list-section {
    padding: 12px;
  }
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 24px;
}

@media (max-width: 600px) {
  .form-layout {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column-reverse;
  }
  .photo-column {
    margin-bottom: 24px;
  }
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.9rem;
}

input, select {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-primary);
  width: 100%;
}

.input-with-icon {
  position: relative;
}

.field-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
}

.photo-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-change-photo {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Lista */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
}

.loading-indicator {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.participants-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--bg-primary);
  border-radius: 12px;
  cursor: pointer;
}

.p-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.p-avatar img { width: 100%; height: 100%; object-fit: cover; }

.p-info { flex: 1; }
.p-name { font-weight: 700; color: var(--text-primary); }
.p-sub { font-size: 0.8rem; opacity: 0.7; }

.p-level {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
}

.p-level.bom { color: #4CAF50; border-color: #4CAF50; }
.p-level.médio { color: #FFB300; border-color: #FFB300; }
.p-level.ruim { color: #F44336; border-color: #F44336; }

.empty-list {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
  opacity: 0.7;
  font-style: italic;
}
</style>
