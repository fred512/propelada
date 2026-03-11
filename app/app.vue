<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
@import "tailwindcss";

*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  /* High Contrast Light Mode */
  --primary-color: #1b5e20; /* Verde Floresta Profundo */
  --secondary-color: #4CAF50; /* Verde vibrante para detalhes */
  --tertiary-color: #1565C0; /* Azul sólido para links */
  
  --bg-primary: #F4F7F6; /* Gelo/Cinza muito claro para fundo */
  --bg-secondary: #FFFFFF; /* Branco puro para cards */
  --bg-header: #E0E7E5; /* Verde gelo para cabeçalho */
  
  --text-primary: #1A1C1E; /* Quase preto para leitura */
  --text-secondary: #42474E; /* Cinza escuro para subtextos */
  --text-highlight: #1b5e20; /* Verde para destaques */
  --text-on-primary: #FFFFFF;
  
  --border-color: #C4C7C5;
  --card-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.dark {
  /* High Contrast Dark Mode */
  --primary-color: #00E676; /* Verde Neon mais legível */
  --secondary-color: #FFD54F;
  --tertiary-color: #64B5F6;
  
  --bg-primary: #1A1C1E; /* Fundo escuro profundo */
  --bg-secondary: #2D2F31; /* Cards cinza escuro */
  --bg-header: #14181b; /* Cabeçalho preto */
  
  --text-primary: #E2E2E6; /* Gelo para leitura */
  --text-secondary: #C4C7C5; /* Cinza médio */
  --text-highlight: #00E676;
  --text-on-primary: #000000;
  
  --border-color: #444746;
  --card-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
