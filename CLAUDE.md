# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Comandos

```bash
npm run dev       # Servidor de desenvolvimento na porta 3001
npm run build     # Build de produção
npm run generate  # Geração de site estático
npm run preview   # Pré-visualização do build de produção
```

Não há suite de testes. Nenhum comando de linting está configurado.

## Arquitetura

**ProPelada** é um PWA em português para gerenciar peladas. É uma **Nuxt 4 SPA** (SSR desativado) com **integração direta ao Supabase** — não há camada de API backend; todas as operações de dados vão diretamente ao Supabase via `useSupabaseClient()`.

### Diretórios Principais

- `app/pages/` — Roteamento baseado em arquivos. A página mais complexa é `partidas/[id].vue` (detalhe da partida).
- `app/components/` — Modais ricos em funcionalidades para gestão de partidas + primitivos shadcn-vue em `ui/`.
- `app/composables/` — Estado global via `useState` do Nuxt (sem Pinia). `usePelada.js` é o gerenciador de estado principal.
- `app/middleware/auth.ts` — Guard de autenticação de rotas; suporta modo autenticado e modo visitante (baseado em cookie).
- `app/layouts/default.vue` — Layout único com sidebar responsivo, logo, versão e alternador de tema.

### Gerenciamento de Estado

Sem Pinia. O estado é gerenciado via `useState()` do Nuxt em composables, principalmente `usePelada.js`, que rastreia:
- Pelada ativa (`idPelada`, `NomePelada`, `Responsavel`, `Dia`, `Horario`, `ExibeEstatistica`)
- Modo visitante (via cookie `isVisitor`, validade de 7 dias)

### Autenticação e Modo Visitante

Dois caminhos de acesso:
1. **Autenticado**: Sessão Supabase via `useSupabaseUser()`.
2. **Visitante**: Cookie `isVisitor` definido ao inserir o código de acesso. Visitantes podem navegar mas não gerenciar.

O middleware (`app/middleware/auth.ts`) trata ambos os caminhos e redireciona não-visitantes não autenticados para `/login`.

### Supabase

- Módulo: `@nuxtjs/supabase` — auto-importa `useSupabaseClient()` e `useSupabaseUser()`.
- URL: `https://ynxylfeavoziqbccvdhp.supabase.co` (também em `.env` como `SUPABASE_URL`/`SUPABASE_KEY`).
- Tabelas principais: `Pelada` (partidas), `JogadorPartida` (registros jogador-partida).

### Atenção ao Editar Arquivos

`app/pages/partidas/[id].vue` tem terminações de linha CRLF e caracteres especiais UTF-8, o que pode causar falha na ferramenta Edit. Ao editar este arquivo, **escreva um script Node.js** em `C:/Users/fredb/.claude/script.js` e execute-o a partir do diretório do projeto.

### Stack de UI

- **Tailwind CSS 4** + **Radix Vue** + **shadcn-vue** para componentes.
- **Lucide Vue Next** para ícones.
- **Chart.js** / **vue-chartjs** para gráficos de estatísticas.
- Fontes: Barlow Condensed (títulos), Outfit (corpo) via Google Fonts.
- Modo escuro como padrão via `@nuxtjs/color-mode`.

### Deploy

Cloudflare Pages + GitHub (branch `master`), ~2 min de deploy. Antes de fazer deploy, atualize a versão em `package.json`. Veja `project_deploy.md` para detalhes.

### Modelo de Dados: JogadorPartida

- `substituido=true` → jogador saiu (no intervalo se `tempo_substituido=null`; durante o jogo se `tempo_substituido=1`)
- `entrou_no_intervalo=true` → jogador entrou no intervalo (apenas no 2º tempo)
- `GolPrimeiro` / `GolSegundo` → gols por tempo
- `GolContraPrimeiro` / `GolContraSegundo` → gols contra por tempo
- Regra: 9 jogadores por time por tempo, 18 total por partida
