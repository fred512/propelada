<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Detecta bfcache (botão voltar do navegador) e revalida a sessão
if (process.client) {
  window.addEventListener('pageshow', async (event) => {
    if (event.persisted) {
      const supabase = useSupabaseClient()
      const isVisitor = useCookie('isVisitor')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && !isVisitor.value) {
        window.location.href = '/login'
      }
    }
  })
}
</script>

<style>
@import "tailwindcss";
@plugin "tailwindcss-animate";

@theme {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  /* ── Tema ProPelada Light ── */
  --primary-color: #1b5e20;
  --secondary-color: #4CAF50;
  --tertiary-color: #1565C0;
  --bg-primary: #F4F7F6;
  --bg-secondary: #FFFFFF;
  --bg-header: #E0E7E5;
  --text-primary: #1A1C1E;
  --text-secondary: #42474E;
  --text-highlight: #1b5e20;
  --text-on-primary: #FFFFFF;
  --border-color: #C4C7C5;
  --card-shadow: 0 2px 4px rgba(0,0,0,0.05);

  /* ── shadcn-vue tokens (light) ── */
  --background: 240 10% 97%;
  --foreground: 220 15% 10%;
  --card: 0 0% 100%;
  --card-foreground: 220 15% 10%;
  --popover: 0 0% 100%;
  --popover-foreground: 220 15% 10%;
  --primary: 125 68% 24%;
  --primary-foreground: 0 0% 100%;
  --secondary: 123 43% 49%;
  --secondary-foreground: 0 0% 100%;
  --muted: 210 10% 93%;
  --muted-foreground: 220 9% 46%;
  --accent: 125 30% 95%;
  --accent-foreground: 125 68% 24%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 13% 77%;
  --input: 220 13% 77%;
  --ring: 125 68% 24%;
  --radius: 0.5rem;
}

.dark {
  /* ── Tema ProPelada Dark ── */
  --primary-color: #00E676;
  --secondary-color: #FFD54F;
  --tertiary-color: #64B5F6;
  --bg-primary: #1A1C1E;
  --bg-secondary: #2D2F31;
  --bg-header: #14181b;
  --text-primary: #E2E2E6;
  --text-secondary: #C4C7C5;
  --text-highlight: #00E676;
  --text-on-primary: #000000;
  --border-color: #444746;
  --card-shadow: 0 4px 8px rgba(0,0,0,0.3);

  /* ── shadcn-vue tokens (dark) ── */
  --background: 220 15% 11%;
  --foreground: 210 12% 89%;
  --card: 220 12% 18%;
  --card-foreground: 210 12% 89%;
  --popover: 220 12% 18%;
  --popover-foreground: 210 12% 89%;
  --primary: 145 100% 45%;
  --primary-foreground: 0 0% 0%;
  --secondary: 45 100% 65%;
  --secondary-foreground: 0 0% 0%;
  --muted: 220 10% 22%;
  --muted-foreground: 220 9% 70%;
  --accent: 145 30% 15%;
  --accent-foreground: 145 100% 45%;
  --destructive: 0 70% 55%;
  --destructive-foreground: 0 0% 100%;
  --border: 220 10% 28%;
  --input: 220 10% 28%;
  --ring: 145 100% 45%;
  --radius: 0.5rem;
}

html, body {
  width: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

body {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: "Inter", sans-serif;
  transition: background-color 0.3s, color 0.3s;
}

@media print {
  .top-header,
  .sidebar,
  .sidebar-overlay,
  .menu-toggle,
  .version-info {
    display: none !important;
  }

  body {
    background: #fff !important;
  }

  .main-container {
    margin-left: 0 !important;
  }

  .page-content {
    padding: 0 !important;
  }
}
</style>
