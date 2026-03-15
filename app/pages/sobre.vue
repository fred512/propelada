<template>
  <div class="landing">

    <!-- HERO -->
    <section class="hero">
      <img src="/images/propelada-dark.png" alt="ProPelada" class="hero-logo" />
      <p class="hero-sub">Gestão de peladas de futebol</p>
      <p class="hero-desc">
        Registre partidas, acompanhe rankings e gerencie sua pelada direto pelo celular. <strong>Grátis.</strong>
      </p>
      <a href="/login" class="btn-cta">Comece Grátis ⚽</a>
      <p class="hero-hint">Sem instalar nada · Funciona no celular</p>
    </section>

    <!-- FEATURES -->
    <section class="features">
      <h2 class="section-title">O que você pode fazer</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="f in features" :key="f.icon">
          <span class="feature-icon">{{ f.icon }}</span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- RANKING -->
    <section class="highlight">
      <div class="highlight-text">
        <h2>🏆 Ranking completo</h2>
        <ul>
          <li>Classificação por pontos e aproveitamento</li>
          <li>Artilheiros e gols contra</li>
          <li>Vitórias, derrotas e empates por jogador</li>
          <li>Filtro por pelada</li>
          <li>Imprime em PDF</li>
        </ul>
      </div>
    </section>

    <!-- MODO VISITANTE -->
    <section class="highlight highlight-alt">
      <div class="highlight-text">
        <h2>👥 Modo visitante</h2>
        <p>
          Gere um código e compartilhe com os jogadores.
          Eles acompanham o ranking e o perfil deles pelo celular, sem precisar de conta.
        </p>
      </div>
    </section>

    <!-- ESTATÍSTICAS -->
    <section class="highlight">
      <div class="highlight-text">
        <h2>📊 Estatísticas por período</h2>
        <p>
          Veja gráficos de gols, presenças, vitórias, cartões e muito mais.
          Filtre por data e acompanhe a evolução da pelada.
        </p>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="cta-final">
      <h2>Pronto para organizar sua pelada?</h2>
      <p>Gratuito, sem app, funciona no celular.</p>
      <a href="/login" class="btn-cta">Criar conta grátis</a>
      <p class="cta-contact">
        Dúvidas? <a href="/contato">Fale conosco</a>
      </p>
    </section>

    <!-- FOOTER -->
    <footer class="landing-footer">
      <p>© {{ new Date().getFullYear() }} ProPelada · <a href="/login">Entrar</a></p>
    </footer>

  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const features = [
  { icon: '⚽', title: 'Registre partidas', desc: 'Escalação, gols, cartões e substituições em tempo real.' },
  { icon: '📋', title: 'Sumula digital', desc: 'Resumo completo da partida por tempo, com placar e eventos.' },
  { icon: '📈', title: 'Ranking automático', desc: 'Classificação gerada automaticamente a cada partida registrada.' },
  { icon: '👤', title: 'Perfil do jogador', desc: 'Histórico completo: presenças, gols, cartões e pontuação.' },
  { icon: '🔒', title: 'Modo visitante', desc: 'Compartilhe um código com os jogadores para acesso somente leitura.' },
  { icon: '🌙', title: 'Modo claro e escuro', desc: 'Interface adaptada para qualquer preferência visual.' },
]
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.landing {
  background: #0d0d0d;
  color: #e5e7eb;
  font-family: 'Segoe UI', Arial, sans-serif;
  min-height: 100vh;
}

/* HERO */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px 48px;
  background: radial-gradient(ellipse at top, #0a2e0a 0%, #0d0d0d 60%);
}

.hero-logo {
  width: 220px;
  max-width: 80vw;
  margin-bottom: 8px;
}

.hero-sub {
  color: #4ade80;
  font-size: 1rem;
  margin-bottom: 20px;
  letter-spacing: 0.05em;
}

.hero-desc {
  font-size: 1.1rem;
  color: #d1d5db;
  max-width: 420px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.hero-desc strong { color: #4ade80; }

.btn-cta {
  background: #16a34a;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 16px 40px;
  border-radius: 50px;
  text-decoration: none;
  transition: background 0.2s, transform 0.1s;
  display: inline-block;
}
.btn-cta:hover { background: #15803d; transform: scale(1.03); }

.hero-hint {
  margin-top: 12px;
  font-size: 0.8rem;
  color: #6b7280;
}

/* FEATURES */
.features {
  padding: 48px 24px;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 1.4rem;
  color: #4ade80;
  margin-bottom: 28px;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 480px) {
  .features-grid { grid-template-columns: 1fr; }
}

.feature-card {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 20px 16px;
}

.feature-icon {
  font-size: 1.8rem;
  display: block;
  margin-bottom: 8px;
}

.feature-card h3 {
  color: #4ade80;
  font-size: 0.95rem;
  margin-bottom: 6px;
}

.feature-card p {
  color: #9ca3af;
  font-size: 0.82rem;
  line-height: 1.5;
}

/* HIGHLIGHTS */
.highlight {
  padding: 40px 24px;
  border-top: 1px solid #1f1f1f;
}

.highlight-alt {
  background: #111;
}

.highlight-text {
  max-width: 600px;
  margin: 0 auto;
}

.highlight-text h2 {
  font-size: 1.25rem;
  color: #4ade80;
  margin-bottom: 16px;
}

.highlight-text p {
  color: #9ca3af;
  line-height: 1.7;
  font-size: 0.95rem;
}

.highlight-text ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-text ul li::before {
  content: '✓ ';
  color: #4ade80;
  font-weight: 700;
}

.highlight-text ul li {
  color: #d1d5db;
  font-size: 0.95rem;
}

/* CTA FINAL */
.cta-final {
  text-align: center;
  padding: 56px 24px;
  background: radial-gradient(ellipse at bottom, #0a2e0a 0%, #0d0d0d 60%);
  border-top: 1px solid #1f1f1f;
}

.cta-final h2 {
  font-size: 1.3rem;
  color: #f9fafb;
  margin-bottom: 8px;
}

.cta-final p {
  color: #6b7280;
  margin-bottom: 28px;
  font-size: 0.9rem;
}

.cta-contact {
  margin-top: 20px !important;
  font-size: 0.82rem !important;
  color: #6b7280 !important;
}

.cta-contact a {
  color: #4ade80;
  text-decoration: none;
}

/* FOOTER */
.landing-footer {
  text-align: center;
  padding: 20px;
  border-top: 1px solid #1a1a1a;
  font-size: 0.8rem;
  color: #4b5563;
}

.landing-footer a {
  color: #4ade80;
  text-decoration: none;
}
</style>
