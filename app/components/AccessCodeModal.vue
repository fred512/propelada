<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content access-modal" @click.stop>
      <div class="modal-header">
        <h2 class="access-title"><Key :size="20" /> Código de Acesso</h2>
        <button class="close-btn" @click="$emit('close')"><X :size="24" /></button>
      </div>
      <div class="access-body">
        <p class="access-desc">Digite o código de 6 dígitos fornecido pelo administrador para liberar as ações da partida.</p>
        <input
          v-model="codigo"
          type="text"
          maxlength="6"
          placeholder="000000"
          class="access-input"
          inputmode="numeric"
          @keyup.enter="confirmar"
        />
        <div v-if="errorMsg" class="access-error">{{ errorMsg }}</div>
        <button
          class="btn-access-confirm"
          :disabled="codigo.length !== 6 || loading"
          @click="confirmar"
        >
          {{ loading ? 'Verificando...' : 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Key, X } from 'lucide-vue-next'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['close', 'confirmed'])

const codigo = ref('')
const errorMsg = ref('')
const loading = ref(false)

const supabase = useSupabaseClient()
const { peladaAtual } = usePelada()

const confirmar = async () => {
  if (codigo.value.length !== 6) return
  loading.value = true
  errorMsg.value = ''
  try {
    const { data } = await supabase
      .from('CodigoAcesso')
      .select('expira')
      .eq('idPelada', peladaAtual.value.id)
      .eq('codigo', codigo.value)
      .maybeSingle()

    if (!data) { errorMsg.value = 'Código inválido.'; return }

    const expiraDate = new Date(data.expira)
    if (isNaN(expiraDate) || expiraDate <= new Date()) {
      errorMsg.value = 'Código expirado.'; return
    }

    sessionStorage.setItem('acesso_liberado', JSON.stringify({ expira: data.expira }))
    emit('confirmed')
    emit('close')
    codigo.value = ''
  } finally {
    loading.value = false
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

.access-modal { max-width: 320px; }

.access-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
  margin: 0;
}

.access-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.access-desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.access-input {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
}

.access-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.access-error {
  color: #F44336;
  font-size: 0.85rem;
  text-align: center;
}

.btn-access-confirm {
  padding: 12px;
  border-radius: 10px;
  background: var(--primary-color);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  width: 100%;
}

.btn-access-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
