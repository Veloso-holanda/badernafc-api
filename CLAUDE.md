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

NestJS 11 + MongoDB Atlas (Mongoose) + Firebase Admin auth. Tudo em PT-BR.

```
PartidasModule → CicloMensalModule, JogadoresModule
JogadoresModule → UsuariosModule
CicloMensalModule → importa Partida schema direto (evita dep circular)
```

`FirebaseAuthMiddleware` global (exclui `/` e `/health`). `@FirebaseAuth()` decorator injeta o user no controller.

### Regras de negocio

- Criar CicloMensal auto-gera todas as Partidas do periodo
- Lista abre 1 dia antes da partida (`aberturaLista`), fecha 1h antes do horario (`fechamentoLista`)
- Status: `aguardando` → `aberta` → `fechada` → `sorteada` → `finalizada`
- Antes das 18h no dia, so mensalista confirma; diarista vai pra `listaEspera`
- Admin cria jogador (gera `codigoVincular` 8 chars), usuario vincula pelo codigo

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

## Environment Variables

`.env`: `MONGODB_URI`, `PORT`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`
