<template>
  <div class="partidas-index-container">
    <div v-if="pending" class="loading">Carregando partidas...</div>
    <div v-else-if="error" class="error">Erro ao carregar partidas.</div>
    <div v-else class="empty-state">
      <Trophy :size="64" />
      <h2>Partidas</h2>
      <p v-if="latestMatch">Redirecionando para a partida mais recente...</p>
      <p v-else>Nenhuma partida encontrada para esta pelada.</p>
      <button v-if="!latestMatch" class="btn btn-primary" @click="createNewMatch">
        Criar Primeira Partida
      </button>
    </div>
  </div>
</template>

<script setup>
import { Trophy } from 'lucide-vue-next'

const client = useSupabaseClient()
const { peladaAtual } = usePelada()
const router = useRouter()

const { data: latestMatch, pending, error, refresh } = await useAsyncData('latestMatch', async () => {
  if (!peladaAtual.value.id) return null
  
  console.log('Buscando última partida para pelada:', peladaAtual.value.id)
  
  const { data, error } = await client
    .from('Partida')
    .select('idPartida, Data')
    .eq('IdPelada', peladaAtual.value.id)
    .order('Data', { ascending: false })
    .order('idPartida', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  if (error) {
    console.error('Erro ao buscar última partida:', error)
    return null
  }
  
  console.log('Última partida encontrada:', data)
  return data
}, {
  // O watch garante que refresca quando o ID mudar
  watch: [() => peladaAtual.value.id]
})

// Efeito para redirecionar assim que a partida for carregada
watch(() => latestMatch.value, (newMatch) => {
  if (newMatch?.idPartida) {
    console.log('Redirecionando para:', newMatch.idPartida)
    router.push(`/partidas/${newMatch.idPartida}`)
  }
}, { immediate: true })

// Se entrar na página e já tiver pelada mas latestMatch for null, tenta forçar um refresh
onMounted(() => {
  if (peladaAtual.value.id && !latestMatch.value && !pending.value) {
    refresh()
  }
})

const createNewMatch = async () => {
  if (!peladaAtual.value.id) return
  const { data, error } = await client
    .from('Partida')
    .insert([{
      IdPelada: peladaAtual.value.id,
      Data: new Date().toISOString().split('T')[0],
      Status: '1º Tempo'
    }])
    .select()
    .single()

  if (data) {
    router.push(`/partidas/${data.idPartida}`)
  }
}
</script>

<style scoped>
.partidas-index-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--primary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}
</style>
