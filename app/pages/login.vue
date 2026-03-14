<template>
  <div class="login-container">
    <!-- Versão do App + toggle tema no topo -->
    <div class="top-bar">
      <div class="app-version">Versão :{{ useRuntimeConfig().public.appVersion }}:1.0</div>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Modo claro' : 'Modo escuro'">
        <Sun v-if="isDark" :size="18" />
        <Moon v-else :size="18" />
      </button>
    </div>

    <div class="login-header">
      <div class="logo-area">
        <img src="/images/logo-dark.png" alt="ProPelada" class="login-logo" />
        <HelpCircle class="help-icon" :size="32" />
      </div>
    </div>

    <!-- LOGIN -->
    <div v-if="!isSignup" class="login-card">
      <p class="login-subtitle">Faça login para organizar sua pelada de futebol</p>

      <div class="login-form">
        <div class="input-field">
          <input
            v-model="email"
            type="email"
            placeholder="E-mail"
          />
        </div>

        <div class="input-field password-field">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Senha"
          />
          <button type="button" @click="showPassword = !showPassword" class="toggle-password">
            <EyeOff v-if="!showPassword" :size="20" />
            <Eye v-else :size="20" />
          </button>
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <div class="forgot-password">
          <NuxtLink to="/recuperar-senha">Esqueceu a senha?</NuxtLink>
        </div>

        <button @click="handleLogin" :disabled="loading" class="btn-admin">
          {{ loading ? 'ENTRANDO...' : 'ENTRAR COMO ADMINISTRADOR' }}
        </button>

        <button @click="handleGuestLogin" class="btn-visitor">
          ENTRAR COMO VISITANTE
        </button>
      </div>
    </div>

    <!-- CADASTRO -->
    <div v-else class="login-card">
      <p class="login-subtitle">Crie sua conta para organizar sua pelada</p>

      <div class="login-form">
        <div class="input-field">
          <input
            v-model="signupEmail"
            type="email"
            placeholder="E-mail"
          />
        </div>

        <div class="input-field password-field">
          <input
            v-model="signupPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Senha"
          />
          <button type="button" @click="showPassword = !showPassword" class="toggle-password">
            <EyeOff v-if="!showPassword" :size="20" />
            <Eye v-else :size="20" />
          </button>
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="signupSuccess" class="success-msg">{{ signupSuccess }}</div>

        <button @click="handleSignup" :disabled="loading" class="btn-admin">
          {{ loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA' }}
        </button>

        <button @click="isSignup = false; errorMsg = ''" class="btn-back">
          Já tenho conta — Entrar
        </button>
      </div>
    </div>

    <button class="btn-how-it-works" @click="navigateTo('/tutoriais')">
      <PlayCircle :size="24" class="icon" />
      Veja como funciona
    </button>

    <div class="register-link">
      Não tem uma conta?
      <a href="#" @click.prevent="isSignup = true; errorMsg = ''">Cadastre-se</a>
    </div>
  </div>
</template>

<script setup>
import { HelpCircle, Eye, EyeOff, PlayCircle, Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()
const { isVisitor, clearPelada } = usePelada()

const email = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')

// Sign-up state
const isSignup = ref(false)
const signupEmail = ref('')
const signupPassword = ref('')
const signupSuccess = ref('')

// Safety net: if navigation fails and user is sent back to login, reset loading
onMounted(() => { loading.value = false })

async function handleLogin() {
  if (!email.value || !password.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    isVisitor.value = false
    await navigateTo('/')
  } catch (e) {
    errorMsg.value = "Erro ao entrar: Verifique suas credenciais."
    loading.value = false
  }
}

async function handleGuestLogin() {
  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'nao-responder@propelada.com',
      password: 'ProP3l@d@',
    })
    if (error) throw error

    isVisitor.value = true
    if (process.client) sessionStorage.removeItem('acesso_liberado')
    clearPelada()
    await navigateTo('/')
  } catch (e) {
    errorMsg.value = "Erro ao entrar como visitante. Tente novamente."
    loading.value = false
  }
}

async function handleSignup() {
  if (!signupEmail.value || !signupPassword.value) {
    errorMsg.value = 'Preencha e-mail e senha.'
    return
  }
  if (signupPassword.value.length < 6) {
    errorMsg.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  loading.value = true
  errorMsg.value = ''
  signupSuccess.value = ''

  try {
    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.value,
      password: signupPassword.value,
    })
    if (error) throw error

    isVisitor.value = false

    if (data.session) {
      // Email confirmation disabled — session active, go directly to peladas
      navigateTo('/peladas')
    } else {
      // Email confirmation required
      signupSuccess.value = 'Conta criada! Confirme seu e-mail e depois faça login.'
      isSignup.value = false
    }
  } catch (e) {
    errorMsg.value = e.message || 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #37474f;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}

.top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-version {
  font-size: 10px;
  color: #00c853;
  opacity: 0.7;
}

.theme-toggle {
  background: none;
  border: none;
  color: #00c853;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
}

.login-header {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 50px;
}

.login-logo {
  max-height: 70px;
  width: auto;
}

.help-icon {
  color: #42a5f5;
  cursor: pointer;
}

.login-card {
  background-color: #14181b;
  width: 100%;
  max-width: 340px;
  padding: 30px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 40px;
  border: 1px solid #262d34;
}

.login-subtitle {
  color: #00c853;
  font-size: 14px;
  margin-bottom: 25px;
  line-height: 1.4;
  text-align: left;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-field input {
  width: 100%;
  background-color: #263238;
  border: 1px solid #37474f;
  padding: 14px;
  border-radius: 8px;
  color: #00c853;
  font-size: 16px;
  outline: none;
}

.input-field input::placeholder {
  color: #00c853;
  opacity: 0.6;
}

.password-field {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #00c853;
  cursor: pointer;
}

.forgot-password {
  text-align: right;
}

.forgot-password a {
  color: #00c853;
  font-size: 13px;
  text-decoration: none;
}

.btn-admin {
  background-color: #1c6a4e;
  color: #ffffff;
  border: 2px solid #00c853;
  padding: 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
}

.btn-admin:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-admin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-visitor {
  background-color: #42a5f5;
  color: #ffffff;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-visitor:hover {
  filter: brightness(1.1);
}

.btn-back {
  background: none;
  border: 1px solid #37474f;
  color: #00c853;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover { border-color: #00c853; }

.btn-how-it-works {
  background-color: #14181b;
  color: #00c853;
  border: none;
  width: 100%;
  max-width: 340px;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 60px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  cursor: pointer;
}

.register-link {
  color: #00c853;
  font-size: 14px;
}

.register-link a {
  font-weight: 700;
  text-decoration: none;
  color: #2e7d32;
  cursor: pointer;
}

.register-link a:hover { text-decoration: underline; }

.error-msg {
  color: #ff5252;
  font-size: 12px;
  text-align: center;
}

.success-msg {
  color: #00c853;
  font-size: 12px;
  text-align: center;
}
</style>
