<template>
  <div class="layout-wrapper" :class="{ 'sidebar-open': isMounted && isSidebarOpen }">
    <Sidebar :is-open="isSidebarOpen" @close="closeSidebar" />
    
    <div class="main-container">
      <header class="top-header">
        <div class="header-content">
          <div class="header-left">
            <button class="menu-toggle" @click="toggleSidebar">
              <Menu v-if="!isSidebarOpen" :size="32" />
              <X v-else :size="32" />
            </button>
          </div>

          <div class="header-center">
            <img :src="logoUrl" alt="ProPelada" class="header-logo" />
          <ClientOnly>
              <div v-if="peladaAtual.id" class="user-peek">
                <span class="logged-user">{{ isVisitor ? 'Modo Visitante' : 'Usuário Logado : ' + peladaAtual.responsavel }}</span>
                <h2 class="active-pelada">{{ nomeFormatado }}</h2>
              </div>
              <div v-else class="user-peek">
                <span class="logged-user">{{ isVisitor ? 'Modo Visitante' : '' }}</span>
                <h2 class="active-pelada">Nenhuma Pelada Selecionada</h2>
              </div>
            </ClientOnly>
          </div>
          
          <div class="header-right">
            <span class="version-info">v{{ appVersion }}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main class="page-content">
        <slot />
      </main>
    </div>

    <div
      v-show="isSidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <div class="rotate-overlay">
      <div class="rotate-content">
        <div class="rotate-icon">📱</div>
        <p>Gire o dispositivo para retrato</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Menu, X } from 'lucide-vue-next'

const isSidebarOpen = ref(false)
const isMounted = ref(false)
const colorMode = (() => {
  try {
    return useColorMode()
  } catch (e) {
    return { value: 'dark', preference: 'dark' }
  }
})()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { peladaAtual, nomeFormatado, isVisitor, fetchPelada } = usePelada()
const { public: { appVersion } } = useRuntimeConfig()

const logoUrl = computed(() =>
  colorMode.value === 'dark' ? '/images/propelada-dark.png' : '/images/Propelada8.png'
)

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

watch(isSidebarOpen, (val) => {
  if (process.client && window.innerWidth <= 1024) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onMounted(async () => {
  isMounted.value = true
  
  // Listener definitivo para mudanças de autenticação
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('LAYOUT AUTH EVENT:', event, 'User ID:', session?.user?.id)
    if (session?.user?.id) {
      fetchPelada(session.user.id)
    }
  })

  if (window.innerWidth > 1024) {
    isSidebarOpen.value = true
  }
  
  // Verificação inicial
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user?.id) {
    console.log('LAYOUT INITIAL SESSION:', session.user.id)
    await fetchPelada(session.user.id)
  }
})
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  width: 100%;
  min-width: 0; /* Permite encolher */
}

@media (min-width: 1025px) {
  .layout-wrapper.sidebar-open .main-container {
    margin-left: 260px;
  }
}

.top-header {
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 8px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-sizing: border-box;
  box-shadow: 0 1px 0 var(--border-color), 0 4px 24px rgba(0,0,0,0.3);
  transition: left 0.3s ease;
}

.dark .top-header {
  background: linear-gradient(180deg, #060B10 0%, #080D14 100%);
  border-bottom: 1px solid rgba(0,255,135,0.12);
  box-shadow: 0 1px 0 rgba(0,255,135,0.12), 0 4px 32px rgba(0,0,0,0.6);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-left, .header-right {
  flex: 0 0 44px;
  display: flex;
  flex-shrink: 0;
}

.header-right {
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-end;
}

.version-info {
  font-size: 0.6rem;
  opacity: 0.5;
  white-space: nowrap;
  position: fixed;
  top: 2px;
  right: 44px;
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  padding: 0 4px;
  max-width: calc(100% - 100px);
}

.header-logo {
  height: 32px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

.user-peek {
  text-align: center;
  width: 100%;
}

.logged-user {
  display: block;
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}

.active-pelada {
  margin: 0;
  font-family: var(--font-display, 'Barlow Condensed', sans-serif);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  white-space: normal;
  word-break: break-word;
  line-height: 1.1;
}

.dark .active-pelada {
  text-shadow: 0 0 16px rgba(0,255,135,0.4);
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.15s;
  z-index: 1100;
}

.menu-toggle:hover {
  background: rgba(0,255,135,0.08);
}

.page-content {
  flex: 1;
  width: 100%;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
  box-sizing: border-box;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.rotate-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: #1A1C1E;
  z-index: 9999;
  align-items: center;
  justify-content: center;
}

.rotate-content {
  text-align: center;
  color: white;
}

.rotate-icon {
  font-size: 4rem;
  animation: rotate-hint 1.5s ease-in-out infinite alternate;
}

.rotate-content p {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 16px;
  opacity: 0.85;
}

@keyframes rotate-hint {
  from { transform: rotate(0deg); }
  to   { transform: rotate(90deg); }
}

@media (orientation: landscape) and (max-width: 1024px) {
  .rotate-overlay { display: flex; }
}

@media (min-width: 1025px) {
  .sidebar-overlay {
    display: none !important;
  }

  .layout-wrapper.sidebar-open .top-header {
    left: 260px;
  }
}
</style>
