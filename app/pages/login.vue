<template>
  <div class="login-container" :class="{ 'light-mode': !isDark }">
    <!-- Versão do App + toggle tema no topo -->
    <div class="top-bar">
      <div class="app-version">v{{ useRuntimeConfig().public.appVersion }}</div>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Modo claro' : 'Modo escuro'">
        <Sun v-if="isDark" :size="18" />
        <Moon v-else :size="18" />
      </button>
    </div>

    <div class="login-header">
      <div class="logo-area">
        <img src="/images/logo-dark.png" alt="ProPelada" class="login-logo" />
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
import { Eye, EyeOff, PlayCircle, Sun, Moon } from 'lucide-vue-next'

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
/* ── Base ── */
.login-container {
  min-height: 100vh;
  background-color: #080D14;
  background-image:
    radial-gradient(ellipse 90% 50% at 50% 0%, rgba(0,255,135,0.07) 0%, transparent 65%),
    linear-gradient(180deg, #060B10 0%, #080D14 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: #E8EDF2;
  font-family: 'Outfit', sans-serif;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

.top-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-version {
  font-size: 10px;
  color: #00FF87;
  opacity: 0.5;
  font-family: 'Outfit', monospace;
  letter-spacing: 0.5px;
}

.theme-toggle {
  background: none;
  border: none;
  color: #00FF87;
  cursor: pointer;
  padding: 6px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.theme-toggle:hover { opacity: 1; }

.login-header {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 40px;
  animation: slideUp 0.5s ease 0.1s both;
}

.login-logo {
  max-height: 64px;
  width: auto;
  filter: drop-shadow(0 0 20px rgba(0,255,135,0.25));
}

/* ── Card ── */
.login-card {
  background: #0F1923;
  width: 100%;
  max-width: 340px;
  padding: 28px 24px;
  border-radius: 16px;
  border: 1px solid rgba(0,255,135,0.12);
  box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,135,0.04);
  margin-bottom: 16px;
  animation: slideUp 0.5s ease 0.2s both;
}

.login-subtitle {
  color: #8B9BB4;
  font-size: 13px;
  margin-bottom: 22px;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Inputs ── */
.input-field input {
  width: 100%;
  background: #080D14;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 13px 14px;
  border-radius: 10px;
  color: #E8EDF2;
  font-size: 15px;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-field input:focus {
  border-color: rgba(0,255,135,0.4);
  box-shadow: 0 0 0 3px rgba(0,255,135,0.06);
}

.input-field input::placeholder {
  color: #8B9BB4;
  opacity: 0.7;
}

.password-field { position: relative; }

.toggle-password {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #8B9BB4;
  cursor: pointer;
  transition: color 0.2s;
}
.toggle-password:hover { color: #00FF87; }

.forgot-password { text-align: right; }

.forgot-password a {
  color: #8B9BB4;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
}
.forgot-password a:hover { color: #00FF87; }

/* ── Botões ── */
.btn-admin {
  background: linear-gradient(135deg, #1C6A4E 0%, #145c42 100%);
  color: #ffffff;
  border: 1px solid rgba(0,255,135,0.35);
  padding: 15px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  margin-top: 6px;
  transition: all 0.2s;
  text-transform: uppercase;
}

.btn-admin:hover:not(:disabled) {
  border-color: rgba(0,255,135,0.6);
  box-shadow: 0 0 16px rgba(0,255,135,0.15);
}

.btn-admin:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-visitor {
  background: rgba(56, 189, 248, 0.12);
  color: #38BDF8;
  border: 1px solid rgba(56,189,248,0.3);
  padding: 15px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.btn-visitor:hover {
  background: rgba(56,189,248,0.18);
  border-color: rgba(56,189,248,0.5);
}

.btn-back {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  color: #8B9BB4;
  padding: 11px;
  border-radius: 10px;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover { border-color: rgba(0,255,135,0.3); color: #00FF87; }

/* ── Como funciona ── */
.btn-how-it-works {
  background: transparent;
  color: #8B9BB4;
  border: 1px solid rgba(255,255,255,0.08);
  width: 100%;
  max-width: 340px;
  padding: 11px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  margin-bottom: 32px;
  cursor: pointer;
  transition: all 0.2s;
  animation: slideUp 0.5s ease 0.3s both;
}
.btn-how-it-works:hover { color: #00FF87; border-color: rgba(0,255,135,0.25); }

/* ── Links ── */
.register-link {
  color: #8B9BB4;
  font-size: 13px;
  animation: slideUp 0.5s ease 0.35s both;
}

.register-link a {
  font-weight: 700;
  text-decoration: none;
  color: #00FF87;
  cursor: pointer;
}
.register-link a:hover { text-decoration: underline; }

.error-msg {
  color: #ff5252;
  font-size: 12px;
  text-align: center;
}

.success-msg {
  color: #00FF87;
  font-size: 12px;
  text-align: center;
}

/* ── Modo Claro ── */
.light-mode {
  background-color: #F4F7F6;
  background-image:
    radial-gradient(ellipse 90% 50% at 50% 0%, rgba(27,94,32,0.05) 0%, transparent 65%);
  color: #1A1C1E;
}

.light-mode .login-logo {
  filter: none;
}

.light-mode .login-card {
  background: #ffffff;
  border-color: #C4C7C5;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}

.light-mode .login-subtitle { color: #42474E; }

.light-mode .input-field input {
  background: #F4F7F6;
  border-color: #C4C7C5;
  color: #1A1C1E;
}
.light-mode .input-field input:focus {
  border-color: rgba(27,94,32,0.4);
  box-shadow: 0 0 0 3px rgba(27,94,32,0.06);
}
.light-mode .input-field input::placeholder { color: #42474E; opacity: 0.6; }
.light-mode .toggle-password { color: #42474E; }
.light-mode .toggle-password:hover { color: #1b5e20; }
.light-mode .forgot-password a { color: #42474E; }
.light-mode .forgot-password a:hover { color: #1b5e20; }
.light-mode .btn-admin {
  background: linear-gradient(135deg, #1b5e20 0%, #145c42 100%);
  border-color: rgba(27,94,32,0.4);
}
.light-mode .btn-admin:hover:not(:disabled) {
  box-shadow: 0 0 16px rgba(27,94,32,0.2);
}
.light-mode .btn-visitor {
  background: rgba(21,101,192,0.08);
  color: #1565C0;
  border-color: rgba(21,101,192,0.3);
}
.light-mode .btn-visitor:hover {
  background: rgba(21,101,192,0.14);
  border-color: rgba(21,101,192,0.5);
}
.light-mode .btn-back { border-color: #C4C7C5; color: #42474E; }
.light-mode .btn-back:hover { border-color: #1b5e20; color: #1b5e20; }
.light-mode .btn-how-it-works {
  border-color: #C4C7C5;
  color: #42474E;
}
.light-mode .btn-how-it-works:hover { color: #1b5e20; border-color: rgba(27,94,32,0.35); }
.light-mode .register-link { color: #42474E; }
.light-mode .register-link a { color: #1b5e20; }
.light-mode .app-version { color: #1b5e20; }
.light-mode .theme-toggle { color: #1b5e20; }
</style>
