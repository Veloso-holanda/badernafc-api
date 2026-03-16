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
- Garantir equilíbrio técnico entre equipes através de algoritmos inteligentes
- Facilitar a gestão financeira do grupo
- Consolidar conhecimentos em desenvolvimento backend com NestJS
- Aplicar boas práticas de arquitetura e clean code

---

## 🚀 Tecnologias Utilizadas

### Core
- **[NestJS](https://nestjs.com/)** - Framework progressivo para Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[MongoDB](https://www.mongodb.com/)** - Banco de dados NoSQL
- **[Mongoose](https://mongoosejs.com/)** - ODM para MongoDB

### Autenticação & Segurança
- **[Firebase Admin](https://firebase.google.com/docs/admin/setup)** - Autenticação e validação de tokens
- **[Class Validator](https://github.com/typestack/class-validator)** - Validação de dados
- **[Class Transformer](https://github.com/typestack/class-transformer)** - Transformação de objetos

### Qualidade de Código
- **[ESLint](https://eslint.org/)** - Linting e padronização de código
- **[Prettier](https://prettier.io/)** - Formatação automática
- **[Jest](https://jestjs.io/)** - Framework de testes

---

## 📦 Funcionalidades

### 👥 Gestão de Membros
- Cadastro completo de jogadores (nome, apelido, foto, contato)
- Sistema de perfil técnico:
  - Posição (Goleiro ou Jogador de Linha)
  - Nível de habilidade (1-5 estrelas)
  - Status (Ativo, Lesionado, Afastado)

### 📅 Gestão de Partidas
- Agendamento de partidas com data, hora e local
- Sistema de confirmação de presença
- Lista de espera automática para excedentes
- Registo de resultados e placares

### ⚖️ Algoritmo de Sorteio (Team Balancer)
- Distribuição automática de goleiros
- Balanceamento baseado em níveis de habilidade
- Equalização da "força" das equipes
- Geração automática de times equilibrados

### 📊 Histórico e Estatísticas
- Registo de resultados de partidas
- Estatísticas de desempenho (em desenvolvimento)
- Histórico de jogos

### 💰 Gestão Financeira
- Controle de mensalidades
- Registo de pagamentos avulsos
- Gestão de despesas (aluguel, equipamentos, etc.)
- Visão geral do caixa do grupo

### 🔐 Autenticação e Autorização
- Integração com Firebase Authentication
- Sistema de perfis (Admin e User)
- Validação de tokens JWT
- Proteção de rotas por roles

---

## 🏗️ Arquitetura

O projeto segue a arquitetura modular do NestJS, com separação clara de responsabilidades:

```
src/
├── auth/                 # Módulo de autenticação
├── users/                # Gestão de utilizadores
├── players/              # Gestão de jogadores
├── matches/              # Gestão de partidas
├── finances/             # Gestão financeira
├── team-balancer/        # Algoritmo de sorteio
├── common/               # Recursos compartilhados
│   ├── guards/           # Guards de autenticação/autorização
│   ├── decorators/       # Decorators customizados
│   ├── filters/          # Exception filters
│   └── interceptors/     # Interceptors
└── config/               # Configurações da aplicação
```

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)
- Conta Firebase (para autenticação)

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
MONGODB_URI=mongodb://localhost:27017/badernafc

# Firebase
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY=sua-chave-privada
FIREBASE_CLIENT_EMAIL=seu-client-email

# Application
PORT=3000
NODE_ENV=development
```

5. Inicie a aplicação:
```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

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
- [x] Configuração inicial do projeto
- [x] Estrutura de módulos
- [x] Integração com MongoDB
- [x] Configuração Firebase Auth

### 🚧 Fase 2 - Funcionalidades Core (Em Desenvolvimento)
- [ ] CRUD completo de jogadores
- [ ] Sistema de gestão de partidas
- [ ] Algoritmo de balanceamento de times
- [ ] Sistema de presença

### 📋 Fase 3 - Gestão Financeira
- [ ] Controlo de mensalidades
- [ ] Gestão de despesas
- [ ] Relatórios financeiros
- [ ] Dashboard de caixa

### 🎯 Fase 4 - Estatísticas e Gamificação
- [ ] Sistema de estatísticas individuais
- [ ] Ranking de jogadores
- [ ] Sistema de conquistas
- [ ] Histórico detalhado

### 🔮 Futuro
- [ ] Notificações push
- [ ] Sistema de chat
- [ ] Integração com calendários
- [ ] App mobile (React Native)

---

## 🤝 Contribuições

Este é um projeto pessoal de aprendizado, mas contribuições, sugestões e feedbacks são sempre bem-vindos!

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
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

- Arquitetura de aplicações backend com NestJS
- Design patterns (Dependency Injection, Repository Pattern)
- Integração com serviços externos (Firebase, MongoDB)
- Autenticação e autorização com JWT
- Validação e transformação de dados
- Testes automatizados
- Boas práticas de desenvolvimento (SOLID, Clean Code)
- Documentação de APIs

---

<div align="center">
  <p>Desenvolvido com 💚 por Gabriel Souza</p>
  <p>⚽ Bora marcar aquela pelada! ⚽</p>
</div>
