# Baderna FC API - Status do Projeto

> Documento vivo que registra a situacao atual do desenvolvimento.

---

## Estado Atual: Fase 2 - Funcionalidades Core (Concluida) | Fase 3 - Pendente

**Data da ultima atualizacao:** 2026-03-16

---

## O que ja existe

### Infraestrutura
- [x] Projeto NestJS 11 inicializado e configurado
- [x] TypeScript 5.7 configurado
- [x] ESLint 9 + Prettier 3 configurados
- [x] Jest 30 configurado para testes
- [x] CORS configurado (localhost + dominios Firebase Hosting)
- [x] ValidationPipe global com transform habilitado
- [x] ConfigModule global para variaveis de ambiente

### Banco de Dados
- [x] Conexao com MongoDB Atlas via Mongoose 8 (async, usando ConfigService)

### Autenticacao (Firebase)
- [x] Firebase Admin SDK 13 inicializado (`firebase.provider.ts`) usando env vars
- [x] Middleware de autenticacao (`FirebaseAuthMiddleware`) - valida token JWT em todas as rotas exceto `/` e `/health`
- [x] Decorator `@FirebaseAuth()` para extrair usuario autenticado do request

### Modulo Usuarios (`/usuarios`)
- [x] Schema `Usuario`: firebaseUid (unique), nome, apelido, email (unique), fotoUrl, telefone, perfil (admin/usuario), ativo
- [x] DTOs com validacao: `CriarUsuarioDto`, `AtualizarUsuarioDto`
- [x] CRUD completo vinculado ao firebaseUid
- [x] Endpoints:
  - `POST /usuarios` - Criar usuario
  - `GET /usuarios` - Listar todos
  - `GET /usuarios/eu` - Perfil do usuario autenticado
  - `GET /usuarios/:id` - Buscar por ID
  - `PUT /usuarios/eu` - Atualizar perfil
  - `DELETE /usuarios/eu` - Remover conta

### Modulo Jogadores (`/jogadores`)
- [x] Schema `Jogador`: nome, apelido, nivel (1-5), codigoVincular (8 chars hex, unique), usuario (ref), email, telefone, vinculado
- [x] DTOs com validacao: `CriarJogadorDto`, `AtualizarJogadorDto`, `VincularJogadorDto`
- [x] CRUD completo + sistema de vinculacao por codigo
- [x] `codigoVincular` gerado automaticamente ao criar jogador
- [x] Vinculacao: usuario envia codigo -> preenche dados do cadastro -> marca vinculado
- [x] Importa `UsuariosModule` para buscar dados na vinculacao
- [x] Endpoints:
  - `POST /jogadores` - Criar jogador
  - `GET /jogadores` - Listar todos (populado com usuario)
  - `GET /jogadores/:id` - Buscar por ID
  - `PUT /jogadores/:id` - Atualizar jogador
  - `DELETE /jogadores/:id` - Remover jogador
  - `POST /jogadores/vincular` - Vincular usuario ao jogador via codigo

### Modulo Ciclo Mensal (`/ciclos-mensais`)
- [x] Schema `CicloMensal`: dataInicial, dataFinal (auto +1 mes), diaSemana (0-6), horario (HH:MM), valorMensal, quantidadePartidas (auto), mensalistas[] (ref Jogador)
- [x] DTOs com validacao: `CriarCicloMensalDto`, `AtualizarCicloMensalDto`
- [x] CRUD completo + calculos automaticos (dataFinal, quantidadePartidas)
- [x] Atualizacao restrita a `valorMensal` e `mensalistas`
- [x] Endpoints:
  - `POST /ciclos-mensais` - Criar ciclo
  - `GET /ciclos-mensais` - Listar todos (populado com mensalistas)
  - `GET /ciclos-mensais/atual` - Buscar ciclo ativo pela data atual
  - `GET /ciclos-mensais/:id` - Buscar por ID
  - `PUT /ciclos-mensais/:id` - Atualizar ciclo
  - `DELETE /ciclos-mensais/:id` - Remover ciclo

### Modulo Partidas (`/partidas`)
- [x] Schema `Partida`: cicloMensal (ref), data, horario, status (aberta/fechada/sorteada/finalizada), jogadores[] (sub-schema), listaEspera[] (ref), limiteJogadores (default 20)
- [x] Sub-schema `JogadorPartida`: jogador (ref), nota (1-5), mensalista, confirmadoEm
- [x] DTOs com validacao: `CriarPartidaDto`, `ConfirmarPresencaDto`, `AtualizarNotaDto`
- [x] Logica de prioridade: mensalistas confirmam primeiro, diaristas vao pra lista de espera ate 18h
- [x] Nota do jogador por partida independente do nivel oficial
- [x] Data e horario herdados do CicloMensal ao criar partida
- [x] Endpoints:
  - `POST /partidas` - Criar partida (calcula proxima data do ciclo)
  - `GET /partidas` - Listar todas (populado)
  - `GET /partidas/:id` - Buscar por ID
  - `GET /partidas/ciclo/:cicloMensalId` - Listar partidas de um ciclo
  - `POST /partidas/:id/confirmar` - Confirmar presenca
  - `POST /partidas/:id/promover` - Promover da lista de espera
  - `DELETE /partidas/:id/jogador/:jogadorId` - Remover jogador
  - `PUT /partidas/:id/nota` - Atualizar nota do jogador
  - `PUT /partidas/:id/fechar` - Fechar lista da partida
  - `DELETE /partidas/:id` - Remover partida

---

## O que falta

### Fase 2 - Pendencias restantes
- [ ] Modulo de Sorteio (algoritmo de balanceamento de times por nivel)
- [ ] Guards de autorizacao por role (Admin/Usuario)
- [ ] Exception filters customizados
- [ ] Interceptors para logging/transformacao

### Fase 3 - Financeiro
- [ ] Modulo Financeiro (mensalidades, pagamentos avulsos, despesas, caixa)

### Fase 4 - Estatisticas
- [ ] Rankings, conquistas, historico detalhado

### Futuro
- [ ] Notificacoes push
- [ ] Chat
- [ ] Calendario
- [ ] App mobile

---

## Observacoes Tecnicas

- Firebase provider usa env vars (nao mais arquivo JSON direto)
- CORS gerido apenas pelo `enableCors()` no `main.ts`
- Todos os schemas Mongoose criados com collections dedicadas

---

## Historico de Sessoes

| Data | O que foi feito |
|------|----------------|
| 2026-03-07 | Leitura inicial do projeto, criacao da pasta docs com documentacao e status |
| 2026-03-07 | Firebase provider refatorado para usar env vars; removida redundancia de CORS no middleware |
| 2026-03-07 | Modulo Usuarios criado com CRUD completo |
| 2026-03-07 | Convencao de portugues adotada: modulo refatorado (nomes, rotas, campos, metodos) |
| 2026-03-07 | Modulo CicloMensal criado com CRUD completo |
| 2026-03-07 | CicloMensal: adicionado diaSemana, quantidadePartidas agora e calculado automaticamente |
| 2026-03-07 | Modulo Jogadores criado com CRUD + sistema de vinculacao por codigo |
| 2026-03-07 | CicloMensal: adicionado campo horario (HH:MM) |
| 2026-03-07 | Modulo Partidas criado com gestao de lista, prioridade mensalista/diarista, notas por partida |
| 2026-03-16 | Revisao completa do status; Fase 2 core concluida (4 modulos CRUD + auth + regras de negocio) |
