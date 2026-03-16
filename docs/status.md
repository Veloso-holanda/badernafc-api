# Baderna FC API - Status do Projeto

> Documento vivo que registra a situacao atual do desenvolvimento.

---

## Estado Atual: Fase 2 - Funcionalidades Core (Em Desenvolvimento)

**Data da ultima atualizacao:** 2026-03-07

---

## O que ja existe

### Infraestrutura
- [x] Projeto NestJS inicializado e configurado
- [x] TypeScript configurado
- [x] ESLint + Prettier configurados
- [x] Jest configurado para testes

### Banco de Dados
- [x] Conexao com MongoDB via Mongoose (async, usando ConfigService)

### Autenticacao
- [x] Firebase Admin SDK inicializado (`firebase.provider.ts`)
- [x] Middleware de autenticacao (`FirebaseAuthMiddleware`) - valida token JWT em todas as rotas exceto `/` e `/health`
- [x] Decorator `@FirebaseAuth()` para extrair usuario autenticado do request

### Usuarios (CRUD)
- [x] Schema `Usuario` com campos: firebaseUid, nome, apelido, email, fotoUrl, telefone, perfil, ativo
- [x] DTOs com validacao (`CriarUsuarioDto`, `AtualizarUsuarioDto`)
- [x] `UsuariosService` com operacoes CRUD vinculadas ao firebaseUid
- [x] `UsuariosController` com endpoints protegidos por autenticacao

### Ciclo Mensal (CRUD)
- [x] Schema `CicloMensal` com campos: dataInicial, dataFinal, diaSemana, horario, valorMensal, quantidadePartidas, mensalistas
- [x] DTOs com validacao (`CriarCicloMensalDto`, `AtualizarCicloMensalDto`)
- [x] `CicloMensalService` com CRUD + calculos automaticos:
  - `dataFinal` = dataInicial + 1 mes
  - `quantidadePartidas` = contagem de ocorrencias do `diaSemana` no periodo
- [x] `AtualizarCicloMensalDto` permite alterar apenas `valorMensal` e `mensalistas`
- [x] `CicloMensalController` com endpoints CRUD
- [x] Campo `mensalistas` referencia `Jogador`

### Partidas (Gestao de lista + presenca)
- [x] Schema `Partida` com campos: cicloMensal, data, horario, status, jogadores[], listaEspera[], limiteJogadores
- [x] Sub-schema `JogadorPartida`: jogador (ref), nota, mensalista, confirmadoEm
- [x] Status: aberta, fechada, sorteada, finalizada
- [x] Logica de prioridade: mensalistas confirmam primeiro, diaristas vao pra lista de espera ate 18h
- [x] Admin pode editar nota do jogador por partida (independente do nivel oficial)
- [x] Promover diarista da lista de espera para a lista principal
- [x] Data e horario herdados do CicloMensal ao criar partida

### Jogadores (CRUD + Vinculacao)
- [x] Schema `Jogador` com campos: nome, apelido, nivel, codigoVincular, usuario, email, telefone, vinculado
- [x] DTOs com validacao (`CriarJogadorDto`, `AtualizarJogadorDto`, `VincularJogadorDto`)
- [x] `JogadoresService` com CRUD + sistema de vinculacao por codigo
- [x] `codigoVincular` gerado automaticamente (8 chars hex) ao criar jogador
- [x] Vinculacao: usuario envia codigo -> preenche email/telefone do cadastro -> marca como vinculado
- [x] `JogadoresModule` importa `UsuariosModule` para buscar dados do usuario na vinculacao

### Endpoints
- [x] `GET /` - Hello World (rota publica)
- [x] `GET /health` - Health check (rota publica)
- [x] `POST /usuarios` - Cadastro de usuario (usa firebaseUid do token)
- [x] `GET /usuarios` - Listar todos os usuarios
- [x] `GET /usuarios/eu` - Perfil do usuario autenticado
- [x] `GET /usuarios/:id` - Buscar usuario por ID
- [x] `PUT /usuarios/eu` - Atualizar perfil do usuario autenticado
- [x] `DELETE /usuarios/eu` - Remover conta do usuario autenticado
- [x] `POST /ciclos-mensais` - Criar ciclo mensal (dataFinal e quantidadePartidas calculados automaticamente)
- [x] `GET /ciclos-mensais` - Listar todos os ciclos
- [x] `GET /ciclos-mensais/atual` - Buscar ciclo ativo pela data atual
- [x] `GET /ciclos-mensais/:id` - Buscar ciclo por ID
- [x] `PUT /ciclos-mensais/:id` - Atualizar ciclo (apenas valorMensal e mensalistas)
- [x] `DELETE /ciclos-mensais/:id` - Remover ciclo
- [x] `POST /jogadores` - Criar jogador (admin gera codigoVincular automatico)
- [x] `GET /jogadores` - Listar todos os jogadores
- [x] `GET /jogadores/:id` - Buscar jogador por ID
- [x] `PUT /jogadores/:id` - Atualizar jogador (nome, apelido, nivel)
- [x] `DELETE /jogadores/:id` - Remover jogador
- [x] `POST /jogadores/vincular` - Vincular usuario autenticado a jogador via codigo
- [x] `POST /partidas` - Criar partida (calcula proxima data do ciclo)
- [x] `GET /partidas` - Listar todas as partidas
- [x] `GET /partidas/:id` - Buscar partida por ID
- [x] `GET /partidas/ciclo/:cicloMensalId` - Listar partidas de um ciclo
- [x] `POST /partidas/:id/confirmar` - Confirmar presenca (mensalista prioridade, diarista espera)
- [x] `POST /partidas/:id/promover` - Promover jogador da lista de espera
- [x] `DELETE /partidas/:id/jogador/:jogadorId` - Remover jogador da partida
- [x] `PUT /partidas/:id/nota` - Atualizar nota do jogador na partida
- [x] `PUT /partidas/:id/fechar` - Fechar lista da partida
- [x] `DELETE /partidas/:id` - Remover partida

### Configuracao
- [x] CORS configurado (localhost + dominos Firebase Hosting)
- [x] ValidationPipe global com transform habilitado
- [x] ConfigModule global para variaveis de ambiente

---

## O que falta (proximo passo: Fase 2)

### Modulos a criar
- [x] Modulo de Jogadores (CRUD + vinculacao)
- [x] Modulo de Partidas (gestao de lista, presenca, notas)
- [ ] Modulo de Sorteio (algoritmo de balanceamento)

### Melhorias pendentes
- [x] Firebase provider usando variaveis de ambiente ao inves de arquivo JSON direto
- [ ] Guards de autorizacao por role (Admin/User)
- [ ] Exception filters customizados
- [ ] Interceptors para logging/transformacao

---

## Observacoes Tecnicas

- ~~O `firebase.provider.ts` importa `serviceAccountKey.json` diretamente~~ - Corrigido: agora usa env vars
- ~~O middleware de auth seta headers CORS manualmente alem do `enableCors()` no `main.ts`~~ - Corrigido: CORS agora e gerido apenas pelo `enableCors()`
- ~~Nenhum schema Mongoose foi criado ainda~~ - Corrigido: schema `Usuario` criado com collection `usuarios`

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
