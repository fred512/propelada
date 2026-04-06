<template>
  <aside 
    class="sidebar" 
    :class="{ 'is-mobile-hidden': !isOpen }"
    v-show="isOpen || isDesktop"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <img :src="logoUrl" alt="ProPelada" class="sidebar-logo" />
      </div>
      <button class="mobile-close-btn" @click="$emit('close')">
        <X :size="24" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in menuItems" :key="item.label" class="nav-item">
          <NuxtLink
            :to="item.to"
            class="nav-link"
            :class="{ 'is-active': route.path === item.to || route.path.startsWith(item.to + '/') }"
            @click="$emit('close')"
          >
            <component :is="item.icon" class="nav-icon" :size="20" />
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge && item.badge.value > 0" class="nav-badge">{{ item.badge.value }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <ul class="nav-list secondary">
        <li class="nav-item">
          <NuxtLink to="/contato" class="nav-link" @click="$emit('close')">
            <Mail class="nav-icon" :size="20" />
            <span class="nav-label">Fale Conosco</span>
          </NuxtLink>
        </li>
        <li v-if="!isVisitor" class="nav-item">
          <NuxtLink
            to="/configuracoes"
            class="nav-link"
            @click="$emit('close')"
          >
            <Settings class="nav-icon" :size="20" />
            <span class="nav-label">Configurações</span>
          </NuxtLink>
        </li>
        <li class="nav-item logout">
          <button @click="handleSignOut" class="nav-link logout-btn">
            <LogOut class="nav-icon" :size="20" />
            <span class="nav-label">Sair</span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Home,
  Users,
  Dribbble,
  Trophy,
  BarChart2,
  Key,
  Award,
  DollarSign,
  PlayCircle,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
  X,
  FileText,
} from "lucide-vue-next";

defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close"]);
const supabase = useSupabaseClient();

const colorMode = useColorMode();
const isDesktop = ref(false);

const logoUrl = computed(() => {
  return colorMode.value === "dark"
    ? "/images/propelada-dark.png"
    : "/images/Propelada8.png";
});

const route = useRoute()
const { isVisitor, peladaAtual, canViewEstatisticas, clearPelada } = usePelada()

const mensagensNaoLidas = ref(0)

async function fetchMensagensNaoLidas() {
  if (isVisitor.value) return
  const { count } = await supabase
    .from('Contato')
    .select('*', { count: 'exact', head: true })
    .eq('lida', false)
  mensagensNaoLidas.value = count || 0
}

onMounted(() => {
  isDesktop.value = window.innerWidth > 1024
  fetchMensagensNaoLidas()
})

const allMenuItems = [
  { label: "Início", to: "/", icon: Home },
  { label: "Participantes", to: "/participantes", icon: Users, adminOnly: true },
  { label: "Peladas", to: "/peladas", icon: Dribbble, adminOnly: true },
  { label: "Partidas", to: "/partidas", icon: Trophy },
  { label: "Estatísticas", to: "/estatisticas", icon: BarChart2, visitorNeedsPermission: true },
  { label: "Acesso", to: "/acesso", icon: Key, adminOnly: true },
  { label: "Ranking", to: "/ranking", icon: Award },
  { label: "Relatórios", to: "/relatorio", icon: FileText, adminOnly: true },
  { label: "Assinatura", to: "/assinatura", icon: DollarSign, adminOnly: true },
  { label: "Tutoriais", to: "/tutoriais", icon: PlayCircle },
  { label: "Mensagens", to: "/mensagens", icon: MessageSquare, adminOnly: true, badge: mensagensNaoLidas },
];

const menuItems = computed(() => {
  return allMenuItems.filter(item => {
    if (isVisitor.value && item.adminOnly) return false
    if (item.visitorNeedsPermission && !canViewEstatisticas.value) return false
    return true
  })
})

async function handleSignOut() {
  clearPelada()
  isVisitor.value = false
  if (process.client) {
    sessionStorage.removeItem('acesso_liberado')
    Object.keys(localStorage)
      .filter(key => key.startsWith('sb-'))
      .forEach(key => localStorage.removeItem(key))
  }
  await supabase.auth.signOut()
  window.location.href = '/login'
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  height: 100dvh;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  color: var(--primary-color);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
  border-right: 1px solid var(--border-color);
}

.dark .sidebar {
  background: linear-gradient(180deg, #07101a 0%, #060D17 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
}

/* Linha verde no topo da sidebar */
.dark .sidebar::before {
  content: '';
  display: block;
  height: 2px;
  background: linear-gradient(90deg, #00FF87 0%, rgba(0,255,135,0.1) 100%);
  flex-shrink: 0;
}

.sidebar-footer {
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-close-btn {
  display: none;
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  pointer-events: auto;
  z-index: 1010;
}

.mobile-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-logo {
  max-height: 40px;
  width: auto;
  object-fit: contain;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 4px 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 16px;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 10px;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: rgba(0, 200, 83, 0.08);
  color: var(--primary-color);
  transform: translateX(3px);
}

.router-link-active,
.is-active {
  background-color: rgba(0, 200, 83, 0.12);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
  font-weight: 700;
}

/* Ajuste modo claro */
:root:not(.dark) .nav-link {
  color: var(--text-secondary);
}
:root:not(.dark) .nav-link:hover,
:root:not(.dark) .router-link-active,
:root:not(.dark) .is-active {
  background-color: rgba(28, 106, 78, 0.1);
  color: var(--primary-color);
}

.nav-icon {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.18s;
}

.nav-link:hover .nav-icon,
.router-link-active .nav-icon,
.is-active .nav-icon {
  opacity: 1;
}

.nav-label {
  font-size: 15px;
  letter-spacing: 0.2px;
}

.sidebar-footer {
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
}

.nav-badge {
  margin-left: auto;
  background: var(--primary-color);
  color: #0d1a0d;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.logout-btn:hover {
  background-color: rgba(239, 35, 60, 0.1);
  color: #ff5252;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
    box-shadow: 4px 0 15px rgba(0,0,0,0.3);
  }
  
  .sidebar.is-mobile-hidden {
    transform: translateX(-100%);
  }

  .mobile-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
