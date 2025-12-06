<div align="center">
  <h1>⚽ Baderna FC API</h1>
  <p>
    <strong>Plataforma completa de gestão para grupos de futebol recreativo</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </p>
</div>

---

## 📖 Sobre o Projeto

O **Baderna FC** é uma API REST desenvolvida para automatizar e simplificar a gestão de grupos de futebol recreativo ("peladas"). A plataforma oferece funcionalidades completas para organização de partidas, gestão de jogadores, balanceamento automático de times e controle financeiro do grupo.

Este projeto foi desenvolvido como parte do meu portfólio para consolidar conhecimentos em desenvolvimento full stack, utilizando as melhores práticas e tecnologias modernas do ecossistema Node.js.

### 🎯 Objetivos do Projeto

- Automatizar a organização de partidas recreativas
- Sortear 4 times equilibrados através de algoritmos inteligentes
- Gerenciar ciclos mensais com sistema de mensalidades
- Controlar presença com prioridade para mensalistas
- Facilitar a gestão financeira do clube (caixa para confraternizações)
- Consolidar conhecimentos em desenvolvimento backend com NestJS
- Aplicar boas práticas de arquitetura e clean code

---

## 🚀 Tecnologias Utilizadas

### Core
- **[NestJS](https://nestjs.com/)** 11.0.1 - Framework progressivo para Node.js
- **[TypeScript](https://www.typescriptlang.org/)** 5.7.3 - Superset JavaScript com tipagem estática
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Banco de dados NoSQL em cloud
- **[Mongoose](https://mongoosejs.com/)** 8.20.1 - ODM para MongoDB

### Autenticação & Segurança
- **[Firebase Admin](https://firebase.google.com/docs/admin/setup)** 13.6.0 - Autenticação e validação de tokens JWT
- **[Class Validator](https://github.com/typestack/class-validator)** 0.14.3 - Validação de dados
- **[Class Transformer](https://github.com/typestack/class-transformer)** 0.5.1 - Transformação de objetos

### Qualidade de Código
- **[ESLint](https://eslint.org/)** - Linting e padronização de código
- **[Prettier](https://prettier.io/)** - Formatação automática
- **[Jest](https://jestjs.io/)** 30.0.0 - Framework de testes

---

## 📦 Funcionalidades

### 👥 Gestão de Usuários
- Cadastro de usuários autenticados via Firebase
- Sistema de perfis (Admin e Usuário)
- Controle de status ativo/inativo
- Integração com Firebase Authentication

### 🎮 Gestão de Jogadores
- Cadastro completo de jogadores (nome, apelido, foto)
- Sistema de classificação por nível (1-5 estrelas)
- Diferenciação de posição (Goleiro ou Jogador de Linha)
- Status de atividade (Ativo/Inativo)
- Filtros por posição e nível

### 📅 Gestão de Ciclos Mensais
- Criação de ciclos com período definido (mês)
- Limite de 20 mensalistas (padrão, configurável)
- Cálculo automático de mensalidade (valor campo ÷ quantidade jogadores)
- Controle de status (Aberto → Fechado → Encerrado)
- Lista de mensalistas com validação de vagas
- **Virtuals calculados:**
  - `completo`: Indica se ciclo atingiu limite de mensalistas
  - `valorMensalidade`: Valor individual calculado
  - `vagasRestantes`: Vagas disponíveis

### ⚽ Gestão de Partidas
- Agendamento de partidas (terças-feiras)
- Sistema de confirmação de presença
- Diferenciação de pagamento (Mensalista ou Avulso)
- Prioridade para mensalistas até prazo limite (18h)
- Abertura para avulsos após prazo
- Controle de goleiros (não entram no sorteio)
- Status da partida (Pendente → Lista Aberta → Times Sorteados → Concluída/Cancelada)
- **Virtuals calculados:**
  - `quantidadeConfirmados`: Total de confirmados
  - `vagasRestantes`: Vagas disponíveis
  - `partidaCheia`: Indica se atingiu limite

### ⚖️ Sistema de Sorteio de Times
- Geração automática de 4 times equilibrados
- Distribuição baseada em níveis de habilidade (1-5 estrelas)
- Ajuste manual de nível por partida (nivelAjustado)
- Goleiros ficam de fora do sorteio
- Times identificados por cores (Vermelho, Azul, Verde, Amarelo)
- Equalização da força total das equipes

### 💰 Gestão Financeira
- Registro de entradas (mensalidades e diárias)
- Registro de saídas (aluguel campo, equipamentos, confraternização)
- Categorização de transações
- Rastreabilidade (vínculo com ciclo, partida, jogador)
- Cálculo dinâmico de saldo do clube
- Relatórios por período
- Método de pagamento (PIX, Dinheiro, Cartão, Transferência)

### 🔐 Autenticação e Autorização
- Integração com Firebase Authentication
- Middleware de validação de tokens JWT
- Decorator customizado `@FirebaseAuth()` para injeção de usuário
- Guards de autorização por roles (Admin)
- Proteção de rotas sensíveis
- CORS configurado para produção (Firebase Hosting)

---

## 🏗️ Arquitetura

O projeto segue a arquitetura modular do NestJS, com separação clara de responsabilidades:

```
src/
├── firebase/                  # Módulo de autenticação Firebase
│   ├── decorators/
│   │   └── firebaseAuth.decorator.ts
│   ├── firebase.provider.ts
│   ├── firebaseAuth.middleware.ts
│   └── serviceAccountKey.json
├── usuario/                   # Gestão de usuários
│   └── schemas/
│       └── usuario.schema.ts
├── jogador/                   # Gestão de jogadores
│   └── schemas/
│       └── jogador.schema.ts
├── ciclo/                     # Gestão de ciclos mensais
│   └── schemas/
│       └── ciclo.schema.ts
├── partida/                   # Gestão de partidas (a implementar)
│   └── schemas/
│       └── partida.schema.ts
├── financeiro/                # Gestão financeira (a implementar)
│   └── schemas/
│       └── financeiro.schema.ts
├── common/                    # Recursos compartilhados (a implementar)
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

---

## 📊 Modelagem de Dados (Schemas)

### Usuario Schema
```typescript
{
  tipo: 'usuario' | 'admin',
  nome: string,
  email: string (unique),
  foto?: string,
  status_ativo: boolean
}
```

### Jogador Schema
```typescript
{
  nome: string,
  apelido?: string,
  foto?: string,
  posicao: 'jogador' | 'goleiro',
  nivel: number (1-5),
  status: 'ativo' | 'inativo',
  criado_em: Date,
  atualizado_em: Date
}
```

### Ciclo Schema
```typescript
{
  nome: string,
  dataInicio: Date,
  dataFim: Date,
  quantidadePartidas: number,
  valorCampo: number,
  quantidadeJogadores: number (default: 20),
  status: 'aberto' | 'fechado' | 'encerrado',
  mensalistas: ObjectId[] (ref: Jogador),
  criado_em: Date,
  atualizado_em: Date,
  // Virtuals
  completo: boolean,
  valorMensalidade: number,
  vagasRestantes: number
}
```

### Partida Schema
```typescript
{
  data: Date,
  local: string,
  cicloId: ObjectId (ref: Ciclo),
  status: 'pendente' | 'lista_aberta' | 'times_sorteados' | 'concluida' | 'cancelada',
  maxJogadores: number (default: 20),
  goleiros: ObjectId[] (ref: Jogador),
  listaPresenca: [{
    jogadorId: ObjectId,
    statusConfirmacao: 'pendente' | 'confirmado' | 'recusado',
    confirmedoEm?: Date,
    tipoPagamento: 'mensalista' | 'avulso',
    nivelAjustado?: number (1-5)
  }],
  listaAbertaEm?: Date,
  prazoLimitePrioridade?: Date,
  timesSorteados?: [{
    nome: string,
    cor: string,
    jogadores: ObjectId[]
  }],
  observacoes?: string,
  criadoPor: ObjectId (ref: Usuario),
  criado_em: Date,
  atualizado_em: Date,
  // Virtuals
  quantidadeConfirmados: number,
  vagasRestantes: number,
  partidaCheia: boolean
}
```

### Financeiro Schema
```typescript
{
  tipo: 'entrada' | 'saida',
  categoria: 'mensalidade' | 'diaria' | 'aluguel_campo' | 'equipamento' | 'confraternizacao' | 'outro',
  valor: number,
  descricao: string,
  data: Date,
  metodoPagamento?: 'pix' | 'dinheiro' | 'cartao' | 'transferencia',
  cicloId?: ObjectId (ref: Ciclo),
  partidaId?: ObjectId (ref: Partida),
  jogadorId?: ObjectId (ref: Jogador),
  criadoPor: ObjectId (ref: Usuario),
  criado_em: Date,
  atualizado_em: Date
}
```

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- MongoDB Atlas (ou local)
- Projeto Firebase com Authentication habilitado

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/badernafc-api.git
cd badernafc-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações:
```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Application
PORT=3000
NODE_ENV=development
```

5. Configure o Firebase:
   - Baixe o `serviceAccountKey.json` do Firebase Console
   - Coloque em `src/firebase/serviceAccountKey.json`
   - **IMPORTANTE:** Arquivo já está no `.gitignore` (não commitar!)

6. Inicie a aplicação:
```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov

# Modo watch
npm run test:watch
```

---

## 📝 Scripts Disponíveis

```bash
npm run start          # Inicia a aplicação
npm run start:dev      # Inicia em modo desenvolvimento (watch)
npm run start:debug    # Inicia em modo debug
npm run build          # Build para produção
npm run format         # Formata o código com Prettier
npm run lint           # Executa o ESLint
```

---

## 🗺️ Roadmap

### ✅ Fase 1 - Setup Base (Concluído)
- [x] Configuração inicial do projeto NestJS
- [x] Integração com MongoDB Atlas
- [x] Configuração Firebase Authentication
- [x] Middleware de autenticação JWT
- [x] Estrutura modular de pastas
- [x] CORS configurado
- [x] ValidationPipe global

### ✅ Fase 2 - Schemas (Concluído)
- [x] Schema Usuario
- [x] Schema Jogador
- [x] Schema Ciclo com virtuals
- [x] Schema Partida (Issue #2)
- [x] Schema Financeiro (Issue #2)

### 🚧 Fase 3 - CRUDs Completos (Issue #3 - Em Desenvolvimento)
- [ ] DTOs de validação (CreateDto, UpdateDto)
- [ ] Services com lógica de negócio
- [ ] Controllers com endpoints RESTful
- [ ] Guards de autorização (AdminGuard)
- [ ] Testes com Postman/Insomnia

#### Módulos a Implementar:
- [ ] **UsuarioModule** - CRUD + buscar por email
- [ ] **JogadorModule** - CRUD + filtros (ativos, goleiros, por posição)
- [ ] **CicloModule** - CRUD + gerenciar mensalistas + cálculos
- [ ] **PartidaModule** - CRUD + confirmações + sortear times
- [ ] **FinanceiroModule** - CRUD + calcular saldo + relatórios

### 📋 Fase 4 - Algoritmo de Sorteio Avançado
- [ ] Algoritmo de balanceamento por nível
- [ ] Distribuição equilibrada de habilidades
- [ ] Ajustes manuais de times
- [ ] Histórico de times sorteados

### 💼 Fase 5 - Gestão Financeira Avançada
- [ ] Dashboard financeiro
- [ ] Relatórios por período
- [ ] Gráficos de entrada/saída
- [ ] Controle de inadimplência
- [ ] Export de relatórios (PDF/Excel)

### 🔔 Fase 6 - Notificações
- [ ] Notificações por email
- [ ] Lembretes de partidas
- [ ] Avisos de abertura de lista
- [ ] Notificações de pagamento

### 🎯 Fase 7 - Testes e Documentação
- [ ] Testes unitários (Services)
- [ ] Testes e2e (Endpoints)
- [ ] Documentação Swagger/OpenAPI
- [ ] Cobertura de testes > 80%

### 🔮 Futuro
- [ ] Sistema de conquistas/badges
- [ ] Ranking de jogadores
- [ ] Estatísticas detalhadas
- [ ] Integração com calendários (Google Calendar)
- [ ] App mobile (React Native)
- [ ] Sistema de chat em tempo real

---

## 🌐 Endpoints (Planejados)

### Health Check
```
GET /health  # Verificar status da API
```

### Usuários
```
GET    /usuarios           # Listar todos
GET    /usuarios/:id       # Buscar por ID
POST   /usuarios           # Criar (Admin)
PUT    /usuarios/:id       # Atualizar
DELETE /usuarios/:id       # Deletar (Admin)
```

### Jogadores
```
GET    /jogadores                 # Listar todos
GET    /jogadores/ativos          # Listar ativos
GET    /jogadores/goleiros        # Listar goleiros
GET    /jogadores/:id             # Buscar por ID
POST   /jogadores                 # Criar (Admin)
PUT    /jogadores/:id             # Atualizar (Admin)
DELETE /jogadores/:id             # Deletar (Admin)
```

### Ciclos
```
GET    /ciclos                    # Listar todos
GET    /ciclos/:id                # Buscar por ID
POST   /ciclos                    # Criar (Admin)
POST   /ciclos/:id/mensalistas    # Adicionar mensalista
PUT    /ciclos/:id                # Atualizar (Admin)
DELETE /ciclos/:id                # Deletar (Admin)
```

### Partidas
```
GET    /partidas                          # Listar todas
GET    /partidas/:id                      # Buscar por ID
POST   /partidas                          # Criar (Admin)
POST   /partidas/:id/confirmar-presenca   # Confirmar presença
POST   /partidas/:id/sortear-times        # Sortear times (Admin)
PUT    /partidas/:id                      # Atualizar (Admin)
DELETE /partidas/:id                      # Deletar (Admin)
```

### Financeiro
```
GET    /financeiro           # Listar transações
GET    /financeiro/saldo     # Calcular saldo atual
POST   /financeiro           # Criar transação (Admin)
PUT    /financeiro/:id       # Atualizar (Admin)
DELETE /financeiro/:id       # Deletar (Admin)
```

---

## 🔐 Autenticação

A API utiliza Firebase Authentication com tokens JWT. Todas as rotas (exceto `/health`) requerem autenticação.

### Headers Obrigatórios
```
Authorization: Bearer <firebase_token>
```

### Decorator Customizado
```typescript
@FirebaseAuth()
getUser(@FirebaseAuth() user: any) {
  // user contém dados do token Firebase
  console.log(user.uid, user.email);
}
```

### Proteção por Role
```typescript
@UseGuards(AdminGuard)
@Post()
create() {
  // Apenas admins podem acessar
}
```

---

## 🤝 Contribuições

Este é um projeto pessoal de aprendizado, mas contribuições, sugestões e feedbacks são sempre bem-vindos!

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Gabriel Souza**

- GitHub: [@Veloso-holanda](https://github.com/Veloso-holanda)
- LinkedIn: [Gabriel Veloso](https://linkedin.com/in/gabriel-veloso-dev)

---

## 📚 Aprendizados

Este projeto me permitiu consolidar conhecimentos em:

- **Arquitetura NestJS:** Módulos, Providers, Controllers, Middleware
- **Mongoose & MongoDB:** Schemas, Virtuals, Validações, Referências
- **Firebase Admin SDK:** Autenticação JWT, Middleware customizado
- **TypeScript Avançado:** Decorators, Types, Interfaces
- **Validação de Dados:** Class-validator, DTOs, ValidationPipe
- **Modelagem de Dados:** NoSQL, Relacionamentos, Sub-documentos
- **Design Patterns:** Dependency Injection, Repository Pattern
- **Boas Práticas:** SOLID, Clean Code, Nomenclatura em português
- **Git Flow:** Issues, Branches, Commits semânticos

---

<div align="center">
  <p>Desenvolvido com 💚 por Gabriel Souza</p>
  <p>⚽ Bora marcar aquela pelada! ⚽</p>
</div>
