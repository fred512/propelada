# ProPelada — Manual de Utilização

> Gerenciamento completo de peladas: times, partidas, ranking e relatórios.

---

## O que é o ProPelada?

O ProPelada é um aplicativo web (PWA) para organizar peladas de futebol. Com ele você registra partidas, controla gols e cartões em tempo real, gerencia a lista de espera, acompanha o ranking dos jogadores e gera relatórios de pontuação.

Funciona no celular como um app instalado (Android e iOS) e também no navegador do computador.

---

## Dois tipos de acesso

| Tipo | Como entrar | O que pode fazer |
|------|-------------|-----------------|
| **Administrador** | E-mail e senha | Gerenciar tudo: partidas, jogadores, configurações |
| **Visitante** | Código de 6 dígitos | Visualizar partidas, ranking e estatísticas |

---

## 1. Login

Ao abrir o app você verá a tela de login.

**Como administrador:**
1. Informe seu e-mail e senha.
2. Clique em **Entrar**.

**Como visitante:**
1. Clique em **Acessar como Visitante**.
2. Digite o código de 6 dígitos fornecido pelo administrador.
3. Clique em **Entrar**.

> O código de visitante expira em 3 horas. Peça um novo ao administrador se necessário.

**Criar conta (novo administrador):**
1. Clique em **Criar conta**.
2. Preencha nome, e-mail e senha.
3. Clique em **Cadastrar**.

---

## 2. Tela inicial

Após o login você verá o menu principal com as seções do app:

- **Partidas** — gerenciar e acompanhar partidas
- **Participantes** — cadastrar e gerenciar jogadores
- **Ranking** — tabela de classificação
- **Estatísticas** — gráficos de desempenho
- **Relatório** — relatórios de pontuação
- **Configurações** — ajustes da pelada

A pelada ativa aparece no topo. Se você tiver mais de uma pelada, pode alternar entre elas nessa tela.

---

## 3. Configurar uma pelada

Antes de usar o app, configure sua pelada em **Peladas** (acessível pelo menu lateral).

Campos disponíveis:
- Nome da pelada
- Responsável
- Telefone de contato
- Dia da semana
- Horário
- Local, cidade e estado

Clique em **Salvar** para confirmar.

---

## 4. Participantes

Em **Participantes** você cadastra os jogadores da pelada.

**Cadastrar jogador:**
1. Clique em **Adicionar jogador**.
2. Preencha: nome, apelido, data de nascimento, telefone.
3. Escolha o tipo: Jogador / Ex-jogador / Convidado / Goleiro / Árbitro.
4. Informe posição, nível (bom/médio/ruim) e faixa etária.
5. Opcionalmente, envie uma foto de perfil.
6. Clique em **Salvar**.

**Buscar jogador:** use o campo de pesquisa para filtrar por nome ou apelido.

**Ver perfil:** clique no jogador para abrir o perfil com estatísticas completas (gols, cartões, presenças, resultados, pontuação).

---

## 5. Partidas

### 5.1 Criar uma partida

1. Acesse **Partidas**.
2. Clique em **Nova Partida**.
3. Selecione a data (padrão: hoje).
4. Clique em **Criar**.

A partida abre automaticamente na tela de gerenciamento.

---

### 5.2 Tela da partida

Esta é a tela principal do app. Nela você gerencia tudo em tempo real.

**O que você vê:**
- **Cronômetro** — tempo de jogo em andamento (persiste mesmo ao sair da tela)
- **Placar** — gols de cada time (Time 1 × Time 2)
- **Listas de jogadores** — um painel por time com todos os jogadores escalados
- **Lista de espera** — jogadores aguardando para entrar
- **Status da partida** — 1º Tempo / Intervalo / 2º Tempo / Encerrada

**Controles principais:**
| Botão | Ação |
|-------|------|
| ▶ / ⏸ (cronômetro) | Inicia ou pausa o cronômetro |
| **1º Tempo** | Abre o modal de intervalo para fazer substituições |
| **Encerrar** | Finaliza a partida |
| **Resumo** | Exibe o resumo da partida com escalações e gols |

---

### 5.3 Adicionar jogadores à partida

1. Clique em **+ Adicionar** no painel do time desejado.
2. Pesquise pelo nome ou apelido no campo de busca (clique no **X** para limpar a busca).
3. Selecione os jogadores marcando as caixinhas.
4. Clique em **Adicionar ao Time**.

---

### 5.4 Registrar ações de um jogador

Clique no nome ou avatar do jogador na lista do time. O modal de ações abre com as opções:

| Ação | Como fazer |
|------|-----------|
| **Gol** | Clique em **+** ao lado de "Gols" |
| **Gol contra** | Clique em **+** ao lado de "Gol Contra" |
| **Cartão amarelo** | Clique no ícone de cartão amarelo |
| **Cartão azul** | Clique no ícone de cartão azul |
| **Cartão vermelho** | Clique no ícone de cartão vermelho |
| **Substituir** | Marque "Substituído" e informe quando saiu |
| **Trocar de time** | Clique em "Trocar de time" |
| **Remover da partida** | Clique em "Remover" |

> Jogadores marcados como substituídos ficam bloqueados para novas ações.

---

### 5.5 Intervalo (1º → 2º Tempo)

Ao clicar em **1º Tempo**, o modal de intervalo abre:

1. **Marque quem sai** clicando em **Sai** ao lado do jogador (o botão vira **Volta** para desfazer).
2. **Adicione jogadores da fila de espera** clicando em **Espera** no painel do time.
3. Verifique os contadores — cada time deve ter **9 jogadores** no 2º tempo.
4. Clique em **Iniciar 2º Tempo** para continuar.

> Jogadores adicionados durante o intervalo recebem a tag **ENT** no resumo.

---

### 5.6 Lista de espera

A lista de espera mostra os jogadores que não entraram na partida.

- Para **adicionar à lista de espera**: clique em **+ Lista de Espera** e pesquise o jogador.
- Para **remover da lista**: clique no ícone de excluir ao lado do jogador.
- Os jogadores da lista de espera acumulam pontos de "assistiu" na pontuação.

---

### 5.7 Cronômetro

- O cronômetro continua rodando mesmo que você saia da tela da partida.
- Ele **para** apenas quando você clica nele (pausar) ou clica em **1º Tempo**.
- Se fechar o navegador e reabrir, o tempo continuará de onde parou.

---

### 5.8 Resumo da partida

Clique em **Resumo** para ver o scorecard completo da partida.

**Abas disponíveis:**
- **Geral** — todos os jogadores dos dois times com gols, cartões e status (SAIU / ENT)
- **1º Tempo** — escalação e gols do primeiro tempo
- **2º Tempo** — escalação e gols do segundo tempo

Clique no avatar de qualquer jogador para abrir seu perfil individual.

---

## 6. Ranking

Acesse **Ranking** para ver a classificação dos jogadores na temporada.

**Colunas da tabela:**
| Coluna | Significado |
|--------|------------|
| **%A** | Percentual de aparições (presenças / total de partidas) |
| **J** | Jogos disputados |
| **P** | Pontuação total |
| **V** | Vitórias |
| **E** | Empates |
| **D** | Derrotas |
| **GP** | Gols marcados |
| **GC** | Gols contra |
| **SG** | Saldo de gols |

**Pontuação:** Vitória = 3 pts · Empate = 1 pt · Derrota = 0 pts

Clique no nome do jogador para abrir o perfil completo.

Use o botão de **impressão** para salvar ou imprimir o ranking.

---

## 7. Estatísticas

Em **Estatísticas** você visualiza gráficos de desempenho por período.

**Como filtrar:**
1. Selecione a data de início e fim.
2. Clique em **Sincronizar** para atualizar os dados.

**Gráficos disponíveis:**
- Gols marcados
- Presenças
- Vitórias / Derrotas / Empates
- Cartões amarelos, azuis e vermelhos

Cada gráfico mostra os **top 10 jogadores** do período selecionado.

---

## 8. Relatórios

Acesse **Relatório** para gerar relatórios detalhados.

### 8.1 Pontuação dos Jogadores

Tabela completa com todos os jogadores e suas estatísticas:
- Gols e gols contra
- Cartões (amarelo, azul, vermelho)
- Presenças, faltas e jogos como espectador
- Resultados (V/E/D)
- Pontuação total

Os 3 primeiros colocados recebem medalhas de ouro, prata e bronze.

### 8.2 Conferência de Pontuação

Relatório detalhado para auditoria da pontuação, mostrando os pontos por categoria:

| Categoria | Descrição |
|-----------|-----------|
| **Presença** | Jogou na partida |
| **Falta** | Não compareceu |
| **Assistiu** | Estava na lista de espera |
| **Chuva** | Jogo cancelado por chuva |
| **Abono** | Falta justificada (conta como presença) — as **2 primeiras faltas** são abonadas. Cada abono vale **×4 pontos** |

Use o botão **Imprimir** para salvar ou exportar o relatório em PDF.

---

## 9. Configurações

Em **Configurações** você ajusta as opções da pelada ativa.

**Opções disponíveis:**

| Configuração | Descrição |
|-------------|-----------|
| **Exibir estatísticas para visitantes** | Liga/desliga o acesso às estatísticas no modo visitante |
| **Período das estatísticas** | Define a data de início e fim usada nos gráficos |
| **Cores dos times** | Escolhe as cores do Time 1 e Time 2 |
| **Critérios de pontuação** | Define os pontos por presença, assistiu, chuva, vitória, empate, derrota e penalidades por cartão |

Clique em **Salvar** após cada alteração.

---

## 10. Código de acesso para visitantes

Para compartilhar a pelada com visitantes (amigos, jogadores):

1. Acesse **Código de Acesso** no menu lateral.
2. O código de 6 dígitos ativo é exibido com o horário de expiração.
3. Compartilhe o código com os visitantes.
4. Para gerar um novo código, clique em **Gerar novo código** e confirme.

> Cada código é válido por **3 horas**. Gerar um novo invalida o anterior.

---

## 11. Instalar como app (PWA)

O ProPelada pode ser instalado no celular como um aplicativo nativo.

**Android (Chrome):**
1. Acesse o site no Chrome.
2. Toque nos três pontos (menu).
3. Selecione **Adicionar à tela inicial**.

**iPhone (Safari):**
1. Acesse o site no Safari.
2. Toque no botão de compartilhar (quadrado com seta).
3. Selecione **Adicionar à Tela Inicial**.

Após instalar, o app abre em tela cheia sem barra do navegador.

---

## 12. Tema claro / escuro

Use o botão de alternância de tema (ícone de sol/lua) na barra superior ou na tela de login para alternar entre o modo escuro (padrão) e o modo claro.

---

## Perguntas frequentes

**O cronômetro parou quando saí da tela. O que fazer?**
Isso não deve acontecer. O cronômetro continua rodando em segundo plano. Se por algum motivo parou, toque nele para reiniciar.

**Posso ter mais de uma pelada?**
Sim. Crie peladas adicionais em **Peladas** e alterne entre elas na tela inicial.

**Como desfazer um gol registrado por engano?**
Clique no jogador, depois clique em **−** ao lado de "Gols" para decrementar.

**O visitante pode editar dados?**
Não. Visitantes apenas visualizam partidas, ranking e estatísticas (se habilitado pelo admin).

**Como imprimir o ranking ou relatório?**
Use o botão de impressão disponível no ranking e nos modais de relatório. O arquivo é gerado como PDF pelo navegador.

---

*ProPelada — v67*
