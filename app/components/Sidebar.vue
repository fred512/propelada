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
          <NuxtLink :to="item.to" class="nav-link" @click="$emit('close')">
            <component :is="item.icon" class="nav-icon" :size="20" />
            <span class="nav-label">{{ item.label }}</span>
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
  Settings,
  LogOut,
  X,
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

onMounted(() => {
  isDesktop.value = window.innerWidth > 1024;
});

const logoUrl = computed(() => {
  return colorMode.value === "dark"
    ? "/images/propelada-dark.png"
    : "/images/Propelada8.png";
});

const { isVisitor, peladaAtual, canViewEstatisticas, clearPelada } = usePelada()

const allMenuItems = [
  { label: "Início", to: "/", icon: Home },
  { label: "Participantes", to: "/participantes", icon: Users, adminOnly: true },
  { label: "Peladas", to: "/peladas", icon: Dribbble, adminOnly: true },
  { label: "Partidas", to: "/partidas", icon: Trophy },
  { label: "Estatísticas", to: "/estatisticas", icon: BarChart2, visitorNeedsPermission: true },
  { label: "Acesso", to: "/acesso", icon: Key, adminOnly: true },
  { label: "Ranking", to: "/ranking", icon: Award },
  { label: "Assinatura", to: "/assinatura", icon: DollarSign, adminOnly: true },
  { label: "Tutoriais", to: "/tutoriais", icon: PlayCircle },
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
  await supabase.auth.signOut();
  console.log('Usuário deslogado, fechando menu');
  navigateTo("/login");
  emit("close");
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
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
  gap: 16px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--primary-color);
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover,
.router-link-active {
  background-color: rgba(
    0,
    200,
    83,
    0.1
  ); /* Verde translúcido para o modo escuro */
  color: var(--secondary-color);
}

/* Ajuste específico para o modo claro para usar a cor primária #1c6a4e */
:root:not(.dark) .nav-link:hover,
:root:not(.dark) .router-link-active {
  background-color: rgba(28, 106, 78, 0.1);
  color: var(--primary-color);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  font-size: 16px;
}

.sidebar-footer {
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
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
