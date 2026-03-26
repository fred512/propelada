<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content new-match-modal" @click.stop>
      <div class="modal-header">
        <h2 class="nm-title">Nova Partida</h2>
        <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
      </div>

      <div class="nm-body">
        <div class="nm-field">
          <label class="nm-label"><Calendar :size="15" /> Data da Partida</label>
          <input v-model="date" type="date" class="nm-input" />
        </div>

        <div class="nm-actions">
          <button class="nm-btn-cancel" @click="$emit('close')">Cancelar</button>
          <button class="nm-btn-create" :disabled="!date" @click="criar">
            <Plus :size="16" /> Criar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Calendar, Plus } from 'lucide-vue-next'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['close', 'created'])

const today = new Date()
const date = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)

const supabase = useSupabaseClient()
const { peladaAtual } = usePelada()

const criar = async () => {
  if (!peladaAtual.value.id || !date.value) return

  const { data, error } = await supabase
    .from('Partida')
    .insert([{
      IdPelada: peladaAtual.value.id,
      Data: date.value,
      Tempo: '1',
      chuva: false,
    }])
    .select('idPartida')
    .single()

  if (!error && data) {
    emit('created', data.idPartida)
    emit('close')
  } else {
    console.error('Erro ao criar partida:', error)
  }
}
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

.close-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

.new-match-modal { max-width: 340px; }

.nm-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.nm-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nm-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.nm-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 0.95rem;
  width: 100%;
  color-scheme: dark;
}

:root:not(.dark) .nm-input { color-scheme: light; }

.nm-actions {
  display: flex;
  gap: 10px;
}

.nm-btn-cancel {
  flex: 1;
  padding: 11px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 700;
  cursor: pointer;
}

.nm-btn-create {
  flex: 2;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: var(--text-on-primary);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.nm-btn-create:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
