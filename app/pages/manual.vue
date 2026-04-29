<template>
  <div class="manual-container">
    <PageHeader title="Manual de Utilização" subtitle="Saiba como usar o ProPelada" />

    <!-- Tabs -->
    <div class="tabs-row">
      <button
        class="tab-btn"
        :class="{ active: tab === 'visitante' }"
        @click="tab = 'visitante'"
      >
        <Eye :size="16" />
        Visitante
      </button>
      <button
        class="tab-btn"
        :class="{ active: tab === 'admin' }"
        @click="tab = 'admin'"
      >
        <ShieldCheck :size="16" />
        Administrador
      </button>
    </div>

    <!-- ===================== VISITANTE ===================== -->
    <div v-if="tab === 'visitante'" class="content">

      <div class="intro-card">
        <Eye :size="28" class="intro-icon" />
        <div>
          <h2 class="intro-title">Modo Visitante</h2>
          <p class="intro-desc">Acompanhe a pelada, veja o ranking e o seu perfil sem precisar de conta. O administrador gera um código de acesso para você entrar.</p>
        </div>
      </div>

      <Section title="Como entrar">
        <Step n="1" text="Abra o ProPelada no celular ou navegador." />
        <Step n="2" text="Clique em Acessar como Visitante na tela de login." />
        <Step n="3" text="Digite o código de 6 dígitos fornecido pelo administrador." />
        <Step n="4" text="Clique em Entrar. O código expira em 3 horas." />
        <InfoBox text="Se o código não funcionar, peça um novo ao administrador. Cada código é válido por 3 horas." />
      </Section>

      <Section title="O que você pode ver">
        <FeatureRow icon="🏆" title="Ranking" desc="Tabela de classificação com pontos, vitórias, empates e gols de todos os jogadores." />
        <FeatureRow icon="⚽" title="Partidas" desc="Histórico de partidas e o resultado de cada uma." />
        <FeatureRow icon="👤" title="Perfil do jogador" desc="Clique no nome de qualquer jogador para ver gols, cartões, presenças e pontuação." />
        <FeatureRow icon="📊" title="Estatísticas" desc="Gráficos de desempenho por período (se o administrador liberar)." />
        <FeatureRow icon="📋" title="Resumo da partida" desc="Escalação, gols e cartões detalhados de cada jogo." />
      </Section>

      <Section title="Ranking — entendendo as colunas">
        <TableInfo :rows="rankingCols" />
      </Section>

      <Section title="Pontuação — como funciona">
        <PointsCard :rows="pontos" />
      </Section>

      <Section title="Perfil do jogador">
        <Step n="1" text="No ranking, clique no nome de qualquer jogador." />
        <Step n="2" text="O perfil abre com todas as estatísticas da temporada:" />
        <ul class="bullet-list">
          <li>Gols marcados e gols contra</li>
          <li>Cartões amarelo, azul e vermelho</li>
          <li>Presenças, faltas e jogos assistidos</li>
          <li>Vitórias, empates e derrotas</li>
          <li>Pontuação total e abonos</li>
        </ul>
      </Section>

    </div>

    <!-- ===================== ADMIN ===================== -->
    <div v-if="tab === 'admin'" class="content">

      <div class="intro-card intro-card--admin">
        <ShieldCheck :size="28" class="intro-icon" />
        <div>
          <h2 class="intro-title">Modo Administrador</h2>
          <p class="intro-desc">Controle completo da pelada: crie partidas, registre gols e cartões em tempo real, gerencie substituições e gere relatórios.</p>
        </div>
      </div>

      <Section title="Primeiro acesso">
        <Step n="1" text="Na tela de login, clique em Criar conta." />
        <Step n="2" text="Preencha nome, e-mail e senha." />
        <Step n="3" text="Clique em Cadastrar." />
        <Step n="4" text="Crie sua primeira pelada em Peladas no menu lateral." />
      </Section>

      <Section title="Configurar a pelada">
        <Step n="1" text="Acesse Peladas no menu lateral." />
        <Step n="2" text='Preencha: nome, responsável, dia da semana, horário e local.' />
        <Step n="3" text="Clique em Salvar." />
        <InfoBox text="Em Configurações você define as cores dos times e os pontos por presença, vitória, empate, derrota e cartões." />
      </Section>

      <Section title="Cadastrar jogadores">
        <Step n="1" text="Acesse Participantes." />
        <Step n="2" text="Clique em Adicionar jogador." />
        <Step n="3" text="Preencha nome, apelido, tipo (jogador, goleiro, convidado...) e nível." />
        <Step n="4" text="Opcionalmente, envie uma foto de perfil." />
        <Step n="5" text="Clique em Salvar." />
      </Section>

      <Section title="Criar uma partida">
        <Step n="1" text="Acesse Partidas." />
        <Step n="2" text="Clique em Nova Partida." />
        <Step n="3" text="Selecione a data e clique em Criar." />
        <Step n="4" text="A partida abre automaticamente para gerenciamento." />
      </Section>

      <Section title="Gerenciar a partida — 1º Tempo">
        <Step n="1" text="Clique em + Adicionar no painel de cada time para escalar os jogadores." />
        <Step n="2" text="Use o campo de busca para encontrar rapidamente (clique no X para limpar)." />
        <Step n="3" text="Clique em ▶ no cronômetro para iniciar a contagem do tempo." />
        <Step n="4" text="Durante o jogo, clique em qualquer jogador para registrar ações:" />
        <TableInfo :rows="acoesJogador" />
        <InfoBox text="O cronômetro continua mesmo se você sair da tela. Para somente quando você clica nele ou no botão 1º Tempo." />
      </Section>

      <Section title="Intervalo e substituições">
        <Step n="1" text="Ao fim do 1º tempo, clique em 1º Tempo." />
        <Step n="2" text="O modal de intervalo abre. Clique em Sai ao lado de quem vai sair (o botão vira Volta para desfazer)." />
        <Step n="3" text="Para adicionar alguém da fila de espera, clique em Espera no painel do time." />
        <Step n="4" text="Verifique os contadores: cada time deve ter 9 jogadores." />
        <Step n="5" text="Clique em Iniciar 2º Tempo." />
        <InfoBox text="Jogadores que entraram no intervalo aparecem com a tag ENT no resumo da partida." />
      </Section>

      <Section title="Lista de espera">
        <Step n="1" text="Clique em + Lista de Espera na tela da partida." />
        <Step n="2" text="Pesquise e adicione os jogadores que vão aguardar." />
        <p class="section-note">Jogadores na lista de espera acumulam pontos de 'Assistiu' na pontuação.</p>
      </Section>

      <Section title="Encerrar a partida">
        <Step n="1" text="Ao fim do 2º tempo, clique em Encerrar." />
        <Step n="2" text="Confirme o encerramento. O resultado é salvo automaticamente." />
        <Step n="3" text="Clique em Resumo para ver o scorecard completo." />
      </Section>

      <Section title="Resumo da partida">
        <p class="section-note">Clique em Resumo para abrir o scorecard com três abas:</p>
        <FeatureRow icon="📋" title="Geral" desc="Todos os jogadores com gols, cartões e status (SAIU / ENT)." />
        <FeatureRow icon="1️⃣" title="1º Tempo" desc="Escalação e gols do primeiro tempo." />
        <FeatureRow icon="2️⃣" title="2º Tempo" desc="Escalação e gols do segundo tempo." />
      </Section>

      <Section title="Código de acesso para visitantes">
        <Step n="1" text="Acesse Código de Acesso no menu lateral." />
        <Step n="2" text="O código ativo de 6 dígitos é exibido com o horário de expiração." />
        <Step n="3" text="Compartilhe o código com seus jogadores." />
        <Step n="4" text="Para gerar um novo, clique em Gerar novo código e confirme." />
        <InfoBox text="Cada código é válido por 3 horas. Gerar um novo invalida o anterior." />
      </Section>

      <Section title="Relatórios">
        <FeatureRow icon="📄" title="Pontuação Jogadores" desc="Tabela com gols, cartões, presenças, resultados e pontuação de todos." />
        <FeatureRow icon="✅" title="Conferência de Pontuação" desc="Detalhamento por categoria — presença, falta, assistiu, chuva e abono. As 2 primeiras faltas são abonadas (×4 pts cada)." />
        <InfoBox text="Use o botão Imprimir nos relatórios para salvar em PDF." />
      </Section>

      <Section title="Configurações">
        <FeatureRow icon="🎨" title="Cores dos times" desc="Escolha a cor do Time 1 e do Time 2." />
        <FeatureRow icon="🏅" title="Critérios de pontuação" desc="Ajuste os pontos por presença, assistiu, chuva, vitória, empate, derrota e cartões." />
        <FeatureRow icon="👁️" title="Estatísticas para visitantes" desc="Liga ou desliga a exibição de estatísticas no modo visitante." />
        <FeatureRow icon="📅" title="Período das estatísticas" desc="Define o intervalo de datas usado nos gráficos e relatórios." />
      </Section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Eye, ShieldCheck } from 'lucide-vue-next'

const tab = ref('visitante')

const rankingCols = [
  { key: '%A', desc: 'Percentual de aparições (presenças / total de partidas)' },
  { key: 'J', desc: 'Jogos disputados' },
  { key: 'P', desc: 'Pontuação total' },
  { key: 'V', desc: 'Vitórias' },
  { key: 'E', desc: 'Empates' },
  { key: 'D', desc: 'Derrotas' },
  { key: 'GP', desc: 'Gols marcados' },
  { key: 'GC', desc: 'Gols contra' },
  { key: 'SG', desc: 'Saldo de gols (GP − GC)' },
]

const pontos = [
  { label: 'Vitória', value: '3 pts' },
  { label: 'Empate', value: '1 pt' },
  { label: 'Derrota', value: '0 pts' },
  { label: 'Presença', value: 'conforme config.' },
  { label: 'Abono (1ª e 2ª falta)', value: '×4 pts' },
]

const acoesJogador = [
  { key: 'Gol', desc: 'Clique em + ao lado de Gols' },
  { key: 'Gol contra', desc: 'Clique em + ao lado de Gol Contra' },
  { key: 'Cartão', desc: 'Clique no ícone do cartão (amarelo, azul ou vermelho)' },
  { key: 'Substituição', desc: 'Marque Substituído e informe quando saiu' },
  { key: 'Trocar de time', desc: 'Move o jogador para o time adversário' },
  { key: 'Remover', desc: 'Retira o jogador da partida' },
]

// Componentes inline
const Section = defineComponent({
  props: { title: String },
  setup(props, { slots }) {
    return () => h('div', { class: 'manual-section' }, [
      h('h3', { class: 'section-title' }, props.title),
      h('div', { class: 'section-body' }, slots.default?.()),
    ])
  },
})

const Step = defineComponent({
  props: { n: [String, Number], text: String },
  setup(props) {
    return () => h('div', { class: 'step-row' }, [
      h('span', { class: 'step-num' }, props.n),
      h('span', { class: 'step-text' }, props.text),
    ])
  },
})

const InfoBox = defineComponent({
  props: { text: String },
  setup(props) {
    return () => h('div', { class: 'info-box' }, [
      h('span', { class: 'info-icon' }, 'ℹ️'),
      h('span', props.text),
    ])
  },
})

const FeatureRow = defineComponent({
  props: { icon: String, title: String, desc: String },
  setup(props) {
    return () => h('div', { class: 'feature-row' }, [
      h('span', { class: 'feature-icon' }, props.icon),
      h('div', [
        h('strong', { class: 'feature-title' }, props.title),
        h('p', { class: 'feature-desc' }, props.desc),
      ]),
    ])
  },
})

const TableInfo = defineComponent({
  props: { rows: Array },
  setup(props) {
    return () => h('div', { class: 'info-table' }, [
      ...props.rows.map(r =>
        h('div', { class: 'info-table-row' }, [
          h('span', { class: 'info-table-key' }, r.key),
          h('span', { class: 'info-table-val' }, r.desc),
        ])
      ),
    ])
  },
})

const PointsCard = defineComponent({
  props: { rows: Array },
  setup(props) {
    return () => h('div', { class: 'points-grid' }, [
      ...props.rows.map(r =>
        h('div', { class: 'points-card' }, [
          h('span', { class: 'points-value' }, r.value),
          h('span', { class: 'points-label' }, r.label),
        ])
      ),
    ])
  },
})
</script>

<style scoped>
.manual-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* TABS */
.tabs-row {
  display: flex;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 6px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--primary-color);
  color: #fff;
}

/* INTRO CARD */
.intro-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: color-mix(in srgb, var(--primary-color) 12%, var(--bg-secondary));
  border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
  border-radius: 16px;
  padding: 18px 16px;
}

.intro-card--admin {
  background: color-mix(in srgb, #3b82f6 12%, var(--bg-secondary));
  border-color: color-mix(in srgb, #3b82f6 30%, transparent);
}

.intro-icon {
  color: var(--primary-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.intro-card--admin .intro-icon { color: #3b82f6; }

.intro-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.intro-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

/* SECTION */
.manual-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-note {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* STEPS */
.step-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.step-text {
  font-size: 0.875rem;
  color: var(--text-primary);
  line-height: 1.5;
}

/* INFO BOX */
.info-box {
  display: flex;
  gap: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--primary-color);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.info-icon { flex-shrink: 0; }

/* FEATURE ROW */
.feature-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.feature-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.feature-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* TABLE INFO */
.info-table {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.info-table-row {
  display: grid;
  grid-template-columns: 56px 1fr;
  align-items: center;
  gap: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
}

.info-table-row:last-child { border-bottom: none; }

.info-table-key {
  font-weight: 800;
  color: var(--primary-color);
  flex-shrink: 0;
  border-right: 2px solid var(--border-color);
  padding-right: 10px;
  margin-right: 12px;
}

.info-table-val {
  color: var(--text-secondary);
  line-height: 1.4;
  padding-left: 12px;
}

/* POINTS GRID */
.points-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.points-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.points-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary-color);
}

.points-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
}

/* BULLET LIST */
.bullet-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
  margin: 0;
}

.bullet-list li {
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding-left: 18px;
  position: relative;
  line-height: 1.5;
}

.bullet-list li::before {
  content: '✓';
  color: var(--primary-color);
  position: absolute;
  left: 0;
  font-weight: 700;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
