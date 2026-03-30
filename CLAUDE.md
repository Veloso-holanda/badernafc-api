# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run start:dev     # Dev com hot reload (porta 3000)
npm run build         # Compila para dist/
npm run lint          # ESLint com auto-fix
npm run test          # Jest unit tests
npm run test:e2e      # E2E tests
```

## Architecture

NestJS 11 + MongoDB Atlas (Mongoose) + Firebase Admin auth. Tudo em PT-BR. **Multi-tenant**: cada time tem seus proprios dados isolados.

```
TimesModule → (Time, Membro schemas) + ConfiguracoesGerais auto-criado
PartidasModule → CicloMensalModule, JogadoresModule, ConfiguracoesGeraisModule, CommonModule
JogadoresModule → UsuariosModule, CommonModule
CicloMensalModule → importa Partida schema direto (evita dep circular), CommonModule
FinanceiroModule → CommonModule (sem dependencia de ConfiguracoesGerais — usa valores do ciclo)
CommonModule → registra Membro/Usuario schemas, exporta TimeMembroGuard/AdminTimeGuard
```

### Multi-tenancy

- Todas as rotas de negocio ficam sob `/times/:timeId/...`
- `TimeMembroGuard` valida que o usuario autenticado e membro ativo do time
- `AdminTimeGuard` valida que o membro tem `papel: 'admin'` no time
- Todo documento tenant-scoped (Jogador, CicloMensal, Partida, Despesa, ConfiguracoesGerais) tem campo `time: ObjectId`
- Todo service recebe `timeId` como primeiro parametro e filtra com `{ time: new Types.ObjectId(timeId) }`
- `Usuario` e global (sem campo `time`); a relacao usuario-jogador por time vive em `Membro.jogador`

### Rotas globais (sem timeId)

- `POST /usuarios` — signup
- `GET/PUT/DELETE /usuarios/eu` — perfil do usuario
- `POST /times` — criar time
- `GET /times` — listar meus times
- `POST /times/entrar` — entrar via codigoConvite

### Auth & Guards

- `FirebaseAuthMiddleware` global (exclui `/` e `/health`). `@FirebaseAuth()` decorator injeta o user
- `TimeMembroGuard` — aplicado em controllers nested (`times/:timeId/*`). Injeta `req.membro` e `req.usuario`
- `AdminTimeGuard` — verifica `req.membro.papel === 'admin'`
- `SuperAdminGuard` (`firebase/guards/admin.guard.ts`) — verifica `Usuario.perfil === 'admin'` (moderacao plataforma)

### Regras de negocio

#### Jogador
- Admin do time cria jogador (gera `codigoVincular` 8 chars), usuario vincula pelo codigo dentro do time
- `codigoVincular` do Jogador e unico por time (index composto `{ time, codigoVincular }`)
- Jogador com `goleiro: true` nao entra na lista de presenca, nao participa do sorteio e nao paga mensalidade

#### Ciclo Mensal
- Apenas um ciclo ATIVO por time por vez (RN01)
- Criar CicloMensal auto-gera todas as Partidas do periodo (usando config do time)
- `valorMensalidade` e `valorDiaria` sao copiados da config na criacao, mas podem ser editados por ciclo
- `mensalistas` e um subdocumento `[{ jogador: ObjectId, pago: boolean }]` — admin marca pagamento individualmente
- Ciclo fecha automaticamente (lazy check) quando `dataFinal < agora`

#### ConfiguracoesGerais
- Criada automaticamente ao criar o time (com defaults)
- Campos de tempo: `antecedenciaAberturaLista` (horas antes para abrir lista), `tempoLimiteMensalistas` (horas antes para fechar para mensalistas)
- Campos de sorteio: `jogadoresPorTime`, `quantidadeTimes`
- Campos financeiros: `valorCicloMensal`, `diaria`, `valorMensalista`
- Campos de partida: `diaFutebol` (0-6), `horaFutebol` (HH:MM)

#### Partida — Lista de presenca
- Status: `agendada` → `aberta` → `aberta_diaristas` → `sorteada` → `finalizada`
- Lista abre `antecedenciaAberturaLista` horas antes da partida (`aberturaLista`)
- Fase ABERTA (antes de `fechamentoMensalistas`): so mensalistas confirmam; diaristas vao pra `listaEspera`
- Fase ABERTA_DIARISTAS (apos `fechamentoMensalistas`): so diaristas confirmam; mensalistas NAO podem mais
- Lista fica aberta ate o admin realizar o sorteio — nao fecha automaticamente
- `limiteJogadores` = `jogadoresPorTime * quantidadeTimes` (calculado na geracao)
- Prioridade de mensalista e independente de pagamento (pagamento e so controle financeiro)

#### Sorteio de times
- `POST /partidas/:id/sortear` — distribui 1 jogador de cada nivel (1-5★) por time (round-robin)
- Valida distribuicao: cada nivel precisa ter >= `quantidadeTimes` jogadores; senao, alerta admin para ajustar notas
- Excedentes distribuidos equilibrando soma de estrelas
- `POST /partidas/:id/refazer-sorteio` — limpa e resorteia
- `PUT /partidas/:id/definir-goleiros` — admin define goleiro de cada time manualmente (pós-sorteio)
- Nota da partida (`jogadores.$.nota`) pode ser ajustada sem alterar nota fixa (`Jogador.nivel`)
- Resultado armazenado em `timesSorteados: [{ nome, jogadores[], goleiro, somaEstrelas }]`

#### Financeiro
- Resumo usa `ciclo.valorMensalidade` e `ciclo.valorDiaria` (valores do ciclo, nao da config)
- Conta apenas mensalistas que pagaram (`mensalistas.filter(m => m.pago)`)
- Despesas sao lançamentos manuais (aluguel, coletes, bolas, etc.)

## Style Rules

- Single quotes, trailing commas everywhere (Prettier)
- `any` liberado (`no-explicit-any: off`, `noImplicitAny: false`)
- Floating promises sao warning, nao erro
- `strictNullChecks: true` mas sem `strictBindCallApply`
- Module system: `nodenext` (usa imports com extensao `.js` nos paths relativos)

## NUNCA fazer

- Nunca escrever nomes de variaveis, metodos, campos do banco ou mensagens de erro em ingles — tudo PT-BR
- Nunca usar string crua em `.find()` para campos que sao ObjectId ref — sempre `new Types.ObjectId()`
- Nunca importar `PartidasModule` dentro de `CicloMensalModule` — causa dep circular; importar o schema direto
- Nunca criar partidas manualmente — elas sao geradas automaticamente ao criar o CicloMensal
- Nunca adicionar `@IsOptional()` em campos obrigatorios dos DTOs de criacao (`criar-*.dto.ts`)
- Nunca expor rotas sem auth sem adicionar exclusao explicita no middleware (`app.module.ts`)
- Nunca usar `PartialType` ou heranca nos DTOs — cada DTO e explicito com seus proprios decorators
- Nunca consultar dados tenant-scoped sem filtrar por `time` — todas queries devem incluir o filtro
- Nunca usar `Usuario.jogador` — campo removido; a relacao usuario-jogador por time vive em `Membro`
- Nunca permitir goleiro na lista de presenca ou no sorteio — goleiros sao gerenciados a parte
- Nunca usar valores financeiros da ConfiguracoesGerais no resumo — usar `ciclo.valorMensalidade` e `ciclo.valorDiaria`

## Environment Variables

`.env`: `MONGODB_URI`, `PORT`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`
