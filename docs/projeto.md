# Baderna FC API - Documentacao do Projeto

## Visao Geral

API REST para gestao de grupos de futebol recreativo ("peladas"). Automatiza organizacao de partidas, gestao de jogadores, balanceamento de times e controle financeiro.

**Autor:** Gabriel Souza

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS 11 |
| Linguagem | TypeScript 5.7 |
| Banco de dados | MongoDB (via Mongoose 8) |
| Autenticacao | Firebase Admin 13 |
| Validacao | class-validator + class-transformer |
| Testes | Jest 30 + Supertest 7 |
| Linting | ESLint 9 + Prettier 3 |

---

## Convencoes do Projeto

### Idioma: Portugues

Todo o codigo do projeto usa **portugues** para nomes de:
- **Pastas e arquivos**: `usuarios/`, `criar-usuario.dto.ts`, `usuarios.service.ts`
- **Classes e tipos**: `Usuario`, `UsuarioDocument`, `CriarUsuarioDto`, `UsuariosService`
- **Enums**: `UsuarioPerfil.ADMIN`, `UsuarioPerfil.USUARIO`
- **Propriedades/campos**: `nome`, `apelido`, `telefone`, `fotoUrl`, `perfil`, `ativo`
- **Metodos**: `criar()`, `buscarTodos()`, `buscarPorId()`, `atualizar()`, `remover()`
- **Rotas REST**: `/usuarios`, `/usuarios/eu`
- **Variaveis locais**: `usuario`, `existente`, `usuarioAuth`

**Excecoes** (mantidas em ingles):
- Termos tecnicos sem traducao natural: `firebaseUid`, `email`
- Decorators do framework: `@Controller`, `@Injectable`, `@Prop`
- Nomes de imports/libs externas

### Padrao de Nomenclatura

| Elemento | Padrao | Exemplo |
|----------|--------|---------|
| Pasta do modulo | kebab-case pt | `usuarios/`, `jogadores/` |
| Arquivo | kebab-case pt | `criar-usuario.dto.ts` |
| Classe | PascalCase pt | `UsuariosService` |
| Metodo | camelCase pt | `buscarPorId()` |
| Propriedade | camelCase pt | `fotoUrl`, `telefone` |
| Rota REST | kebab-case pt | `/usuarios`, `/partidas` |
| Enum | PascalCase pt | `UsuarioPerfil` |

---

## Arquitetura

Projeto modular NestJS com a seguinte estrutura:

```
src/
├── usuarios/             # Gestao de usuarios
├── jogadores/            # Gestao de jogadores (planejado)
├── partidas/             # Gestao de partidas (planejado)
├── financeiro/           # Gestao financeira (planejado)
├── sorteio/              # Algoritmo de sorteio (planejado)
├── comum/                # Guards, decorators, filters, interceptors (planejado)
├── config/               # Configuracoes da aplicacao (planejado)
└── firebase/             # Provider e middleware Firebase
```

---

## Modulos Planejados

### Gestao de Membros
- Cadastro de jogadores (nome, apelido, foto, contato)
- Perfil tecnico: posicao (Goleiro/Linha), nivel (1-5), status (Ativo/Lesionado/Afastado)

### Gestao de Partidas
- Agendamento com data, hora e local
- Confirmacao de presenca + lista de espera
- Registro de resultados e placares

### Sorteio de Times
- Distribuicao automatica de goleiros
- Balanceamento por nivel de habilidade
- Equalizacao da forca dos times

### Gestao Financeira
- Controle de mensalidades e pagamentos avulsos
- Gestao de despesas (aluguel, equipamentos)
- Visao geral do caixa

### Autenticacao/Autorizacao
- Firebase Authentication com validacao de tokens JWT
- Perfis: Admin e Usuario
- Protecao de rotas por roles

---

## Configuracao

### Variaveis de Ambiente (.env)

| Variavel | Descricao |
|----------|-----------|
| `MONGODB_URI` | URI de conexao com MongoDB |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `FIREBASE_PRIVATE_KEY` | Chave privada Firebase |
| `FIREBASE_CLIENT_EMAIL` | Email do client Firebase |
| `PORT` | Porta da aplicacao (padrao: 3000) |
| `NODE_ENV` | Ambiente (development/production) |

### Scripts

| Comando | Descricao |
|---------|-----------|
| `npm run start:dev` | Desenvolvimento com watch |
| `npm run build` | Build para producao |
| `npm run start:prod` | Inicia build de producao |
| `npm run test` | Testes unitarios |
| `npm run test:e2e` | Testes end-to-end |
| `npm run lint` | Linting |
| `npm run format` | Formatacao |

---

## CORS

Origens permitidas:
- `http://localhost:*` (desenvolvimento)
- `https://baderna-fc.web.app` (producao)
- `https://baderna-fc.firebaseapp.com` (producao)

---

## Roadmap

1. **Fase 1 - Setup Base** (Concluido): Projeto inicial, MongoDB, Firebase Auth
2. **Fase 2 - Core** (Em desenvolvimento): CRUD jogadores, partidas, balanceamento, presenca
3. **Fase 3 - Financeiro**: Mensalidades, despesas, relatorios
4. **Fase 4 - Estatisticas**: Rankings, conquistas, historico detalhado
5. **Futuro**: Notificacoes push, chat, calendario, app mobile
