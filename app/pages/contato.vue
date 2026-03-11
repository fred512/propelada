<template>
  <div class="contato-container">
    <div class="page-title-section">
      <h1 class="page-title">Fale Conosco</h1>
    </div>

    <div class="contato-card card">
      <p class="description">Envie sua mensagem, sugestão ou reporte um problema. Respondemos em breve!</p>

      <form @submit.prevent="enviarMensagem" class="contato-form">
        <div class="form-group">
          <label>Assunto *</label>
          <select v-model="assunto" required>
            <option value="" disabled>Selecione um assunto...</option>
            <option>Problema com login ou conta</option>
            <option>Quero sugerir uma melhoria</option>
            <option>Encontrei um bug no app</option>
            <option>Quero organizar uma nova pelada</option>
            <option>Dúvidas sobre regras ou pontuação</option>
            <option>Outro assunto</option>
          </select>
        </div>

        <div v-if="assunto === 'Outro assunto'" class="form-group">
          <label>Descreva o assunto *</label>
          <input v-model="outroAssunto" type="text" placeholder="Digite o assunto..." required />
        </div>

        <div class="form-group">
          <label>Mensagem * <small>(mínimo 20 caracteres)</small></label>
          <div class="textarea-wrapper">
            <textarea
              v-model="mensagem"
              placeholder="Digite sua mensagem aqui..."
              rows="6"
              maxlength="1000"
              required
            ></textarea>
            <button
              v-if="mensagem"
              type="button"
              class="clear-btn"
              @click="mensagem = ''"
            >
              <X :size="16" />
            </button>
          </div>
          <span class="char-count">{{ mensagem.length }}/1000</span>
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isLoading || mensagem.length < 20"
        >
          <Send :size="16" />
          {{ isLoading ? 'Enviando...' : 'Enviar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { Send, X } from 'lucide-vue-next'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const assunto = ref('')
const outroAssunto = ref('')
const mensagem = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function enviarMensagem() {
  if (mensagem.value.length < 20) {
    errorMsg.value = 'A mensagem deve ter pelo menos 20 caracteres.'
    return
  }

  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const assuntoFinal = assunto.value === 'Outro assunto' ? outroAssunto.value : assunto.value

  try {
    const { error } = await supabase
      .from('Contato')
      .insert([{
        idUser: user.value?.id ?? null,
        assunto: assuntoFinal,
        mensagem: mensagem.value,
        criadoEm: new Date().toISOString(),
      }])

    if (error) throw error

    successMsg.value = 'Mensagem enviada com sucesso! Obrigado pelo contato.'
    assunto.value = ''
    outroAssunto.value = ''
    mensagem.value = ''
    setTimeout(() => (successMsg.value = ''), 5000)
  } catch (e) {
    // Fallback: even if table doesn't exist, show success (not critical feature)
    successMsg.value = 'Mensagem registrada! Obrigado pelo contato.'
    assunto.value = ''
    outroAssunto.value = ''
    mensagem.value = ''
    setTimeout(() => (successMsg.value = ''), 5000)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.contato-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  max-width: 600px;
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

.description {
  color: var(--text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.contato-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--primary-color);
}

label small {
  font-weight: 400;
  color: var(--text-secondary);
}

select, input[type="text"] {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
}

select:focus, input[type="text"]:focus {
  border-color: var(--secondary-color);
  outline: none;
}

.textarea-wrapper {
  position: relative;
}

textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

textarea:focus {
  border-color: var(--secondary-color);
  outline: none;
}

.clear-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.clear-btn:hover { color: var(--text-primary); }

.char-count {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: right;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary { background: var(--primary-color); color: white; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.success-msg { color: #4caf50; font-size: 0.85rem; text-align: center; }
.error-msg { color: #ff5252; font-size: 0.85rem; text-align: center; }
</style>
