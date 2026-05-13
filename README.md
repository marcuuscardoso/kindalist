# Kinda List - Tech Test

Sistema completo de gerenciamento de listas e tarefas desenvolvido como teste técnico, com backend em Node.js, Express, Prisma e MySQL, frontend em React, autenticação via cookies HttpOnly e organização seguindo arquitetura hexagonal.

O projeto permite registro e autenticação de usuários, criação e organização de listas, criação de tarefas, visualização em lista ou board, arquivamento de listas e controle de sessão seguro com access token e refresh token via cookie.

Uma collection do Postman com todos os endpoints está disponível na raiz do projeto: `kindalist.postman_collection.json`. Para usar, importe o arquivo diretamente no Postman.

## Índice

- [Descrição](#descrição)
- [Requisitos](#requisitos)
- [Instalação e Inicialização](#instalação-e-inicialização)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura](#arquitetura)
- [Metodologia de Testes](#metodologia-de-testes)
- [Frontend](#frontend)
- [Considerações sobre o Projeto](#considerações-sobre-o-projeto)
- [Comandos Úteis](#comandos-úteis)
- [Documentação da API](#documentação-da-api)

## Descrição

Este projeto implementa um TODO List completo, com foco em separação de responsabilidades, regras de negócio isoladas no core da aplicação e comunicação com o banco de dados através de ports e adapters.

O sistema permite:

- Registro e login de usuários
- Autenticação com cookies HttpOnly
- Refresh token stateful salvo hasheado no banco
- Criação, edição, arquivamento e exclusão de listas
- Criação, edição, exclusão e movimentação de tasks
- Visualização das tasks em modo lista e board
- Listagem de listas arquivadas
- Sanitização de payloads
- Validação de dados com Zod
- Testes unitários para usecases, controllers, middlewares e rotas

## Requisitos

### Requisitos do Sistema

- **Node.js** >= 20.x
- **NPM** >= 10.x
- **Docker** e **Docker Compose**
- **MySQL** 8.x via Docker

## Instalação e Inicialização

### 1. Clone o repositório

```bash
git clone https://github.com/marcuuscardoso/kindalist.git
cd kindalist
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env` em `apps/backend`:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Exemplo:

```env
NODE_ENV="development"
DATABASE_URL="mysql://kindalist:password@localhost:3306/kindalist"
JWT_ACCESS_SECRET="uma_chave_segura_com_no_minimo_32_caracteres"
JWT_ACCESS_EXPIRES_IN="15m"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

Crie também um arquivo `.env` em `apps/frontend`:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Exemplo:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Inicie os serviços de infraestrutura

```bash
docker compose up -d
```

### 5. Execute as migrações do banco

```bash
cd apps/backend
npx prisma migrate dev
npx prisma generate
cd ../..
```

### 6. Execute o backend

```bash
npm run dev:backend
```

O backend estará disponível em:

```bash
http://localhost:3000
```

### 7. Execute o frontend

Em outro terminal:

```bash
npm run dev:frontend
```

O frontend estará disponível em:

```bash
http://localhost:5173
```

## Estrutura do Projeto

O projeto é organizado em monorepo com workspaces:

```txt
apps/
├── backend/
│   ├── prisma/                         # Schema e migrations do banco
│   └── src/
│       ├── core/                       # Domínio e aplicação
│       │   ├── domain/                 # Entidades, enums e erros de domínio
│       │   └── application/            # UseCases, ports e utilitários
│       ├── adapters/                   # Entrada HTTP e saída Prisma
│       │   ├── input/http/             # Controllers, routes, schemas, middlewares
│       │   └── output/prisma/          # Repositories Prisma
│       ├── infrastructure/             # Config, container, services e database
│       ├── shared/                     # Respostas e código compartilhado
│       ├── app.ts                      # Configuração do Express
│       └── index.ts                    # Entry point da aplicação
│
└── frontend/
    └── src/
        ├── app/                        # Router, guards e provider de autenticação
        ├── components/                 # Componentes de layout, auth, drawers e UI
        ├── pages/                      # Páginas da aplicação
        ├── schemas/                    # Schemas Zod do frontend
        ├── services/                   # Camada de comunicação com a API
        └── types/                      # Tipos compartilhados do frontend
```

## Arquitetura

O backend segue arquitetura hexagonal.

As regras de negócio ficam no `core`, sem depender de Express, Prisma, Zod, JWT, bcrypt ou qualquer lib externa. A comunicação com o mundo externo acontece através de ports:

- **Input ports**: contratos dos usecases
- **Output ports**: contratos de repositories e serviços
- **Adapters input**: controllers, routes, schemas e middlewares HTTP
- **Adapters output**: repositories Prisma
- **Infrastructure**: implementação concreta de banco, JWT, bcrypt, configuração e container de dependências

Esse desenho permite que os usecases sejam testados com mocks, sem subir servidor, banco de dados ou serviços externos.

## Metodologia de Testes

O projeto foi desenvolvido com TDD como disciplina central. Os testes foram escritos antes da implementação, guiando o design das interfaces (ports) e o comportamento esperado de cada camada. A suíte possui **23 suites** e **115 testes**, todos passando sem dependências externas (banco ou servidor real).

Para executar:

```bash
cd apps/backend

npm test
npm run test:watch
npm run test:coverage
```

### Testes unitários de UseCases

Os UseCases contêm a regra de negócio pura da aplicação e foram o ponto de partida do TDD. Cada dependência (repositórios, serviços de token, hasher) é uma interface (Port), o que torna possível substituí-la por um `jest.Mocked<Port>` sem qualquer configuração adicional.

Essa abordagem tem duas vantagens concretas: os testes rodam em memória, sem I/O, e validam exatamente a regra de negócio. Casos como "usuário não encontrado", "dono incorreto" e "limite de 1000 registros no bulk create" são verificados de forma determinística e isolada.

### Testes unitários de Controllers e Middlewares

Os Controllers são testados de forma similar: os UseCases são mockados e o teste verifica que a entrada HTTP (body, cookies, params) é corretamente mapeada para o input do UseCase, e que erros de domínio (`NotFoundException`, `ConflictException`, etc.) chegam ao cliente com o status HTTP correto.

O `authenticationMiddleware` segue o mesmo padrão: é uma função pura que recebe `req`, `res` e `next` — testável com objetos fake simples, sem nenhuma camada extra.

### Testes de integração

Três comportamentos não podem ser verificados adequadamente com objetos fake:

**Pipeline PUBLIC/OPEN/PRIVATE (`define-router`):** a composição de middlewares no Express (encadeamento via `next()`, propagação de erros para o `errorHandler`, cookies sendo lidos pelo `cookie-parser`) só se manifesta corretamente em um servidor HTTP de verdade. Um mock de `req/res` não executa o pipeline — ele simula um ponto específico dele.

**Rate limiting:** o `express-rate-limit` conta requisições por IP usando estado interno atrelado à instância do middleware. Testar se o 429 é retornado na 21ª requisição exige que 21 requisições HTTP reais sejam disparadas contra um servidor ativo.

**CORS:** a negociação de CORS depende de headers reais de resposta (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`) gerados pelo middleware `cors` em resposta a um `Origin` específico na requisição. Isso não é verificável inspecionando um objeto de resposta mockado.

Para esses casos, cada teste cria um servidor Express em uma porta aleatória (`app.listen(0)`) via um helper `withServer`, executa as requisições com `fetch` e fecha o servidor ao final — sem estado compartilhado entre testes.

## Frontend

O frontend foi desenvolvido com React, TypeScript, React Router, Tailwind e uma camada de services para comunicação com a API.

Principais telas:

- Login
- Registro
- Dashboard com listas
- Visualização de lista em modo lista
- Visualização de lista em modo board
- Listas arquivadas
- Side panels para criação e edição de listas e tasks

O frontend utiliza cookies HttpOnly para autenticação. Por isso, as requisições são feitas com `credentials: 'include'`, e o CORS do backend é configurado através de `FRONTEND_URL`.

## Considerações sobre o Projeto

Este projeto foi desenvolvido exclusivamente como parte de um teste técnico e serve como demonstração de conceitos de arquitetura, organização de código e desenvolvimento fullstack.

Em um cenário de produção real, algumas melhorias seriam necessárias:

### Segurança

- Configurar secrets reais e rotacionáveis
- Adicionar proteção CSRF, já que a autenticação utiliza cookies
- Configurar política de CORS por ambiente
- Melhorar auditoria de sessões e revogação de dispositivos

### Banco de Dados

- Adicionar índices compostos conforme o crescimento das queries
- Implementar paginação para listas e tasks
- Avaliar full-text search para busca textual
- Criar estratégia de backup e restore

### Frontend

- Melhorar estados de loading e erro por operação
- Adicionar feedback visual para ações destrutivas
- Melhorar responsividade mobile
- Adicionar testes de componentes e fluxos críticos

### Observabilidade

- Adicionar logging estruturado
- Adicionar tracing e métricas
- Criar health check
- Integrar monitoramento com ferramentas como Grafana, Prometheus ou ELK

## Comandos Úteis

### Raiz do projeto

```bash
npm install
npm run dev:backend
npm run dev:frontend
npm test
docker compose up -d
docker compose down
```

### Backend

```bash
npm run dev --workspace=apps/backend
npm run build --workspace=apps/backend
npm run start --workspace=apps/backend
npm run test --workspace=apps/backend
npm run test:watch --workspace=apps/backend
npm run test:coverage --workspace=apps/backend
```

### Frontend

```bash
npm run dev --workspace=apps/frontend
npm run build --workspace=apps/frontend
npm run preview --workspace=apps/frontend
```

### Prisma

Execute os comandos dentro de `apps/backend`:

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
npx prisma migrate reset
npx prisma studio
```

### Banco de Dados

```bash
docker compose up -d
docker compose down
docker compose down -v
```

`docker compose down -v` remove também o volume do MySQL, apagando os dados locais.

## Documentação da API

**Base URL:** `http://localhost:3000`

**Autenticação:** cookies HttpOnly.

O access token, refresh token e session id são enviados como cookies.

Todas as respostas seguem o formato:

```json
{
  "status": "success",
  "message": "Success",
  "data": {}
}
```

Em caso de erro:

```json
{
  "status": "error",
  "message": "Mensagem do erro",
  "data": null
}
```

### Autenticação

**POST** `/auth/register`

Cria um novo usuário comum e inicia uma sessão.

**Payload:**

```json
{
  "name": "Marina Costa",
  "email": "marina@kindalist.app",
  "password": "Password@123"
}
```

---

**POST** `/auth/login`

Autentica um usuário existente e cria uma nova sessão.

**Payload:**

```json
{
  "email": "marina@kindalist.app",
  "password": "Password@123"
}
```

**Observação:** os tokens são retornados via cookies HttpOnly.

---

**POST** `/auth/logout`

Encerra a sessão atual e remove os cookies de autenticação.

---

**POST** `/auth/refresh`

Renova o access token usando o refresh token e session id enviados via cookie.

**Observação:** o refresh token é opaco, não é JWT, e fica salvo hasheado no banco. A rotação é atômica — o token antigo é invalidado na mesma operação que gera o novo.

---

**GET** `/auth/me`

Retorna as informações do usuário autenticado.

**Resposta de Sucesso:**

```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "name": "Marina Costa",
      "email": "marina@kindalist.app",
      "role": "MEMBER"
    }
  }
}
```

### Listas

**GET** `/lists?archived=false`

Lista as listas do usuário autenticado.

**Query params:**

- `archived`: `true` ou `false`

---

**POST** `/lists`

Cria uma nova lista.

**Payload:**

```json
{
  "title": "Redesign do site",
  "description": "Site institucional v2 — landing, blog e docs."
}
```

---

**PATCH** `/lists/:listId`

Atualiza uma lista existente.

**Payload:**

```json
{
  "title": "Redesign do site",
  "description": "Nova descrição da lista."
}
```

---

**PATCH** `/lists/:listId/archive`

Arquiva ou restaura uma lista.

**Payload:**

```json
{
  "isArchived": true
}
```

---

**DELETE** `/lists/:listId`

Remove uma lista do usuário autenticado.

**Observação:** as tasks da lista são removidas em cascade pelo banco.

### Tasks

**GET** `/lists/:listId/tasks`

Lista todas as tasks de uma lista.

---

**POST** `/lists/:listId/tasks`

Cria uma nova task.

**Payload:**

```json
{
  "title": "Relatório de concorrência",
  "description": "Linear, Height, Things, Todoist — 4 pages.",
  "status": "TODO",
  "priority": "HIGH",
  "deadline": "2026-05-12T00:00:00.000Z"
}
```

---

**POST** `/lists/:listId/tasks/bulk`

Cria várias tasks de uma vez.

**Payload:**

```json
{
  "tasks": [
    {
      "title": "Comprar pão",
      "priority": "LOW"
    },
    {
      "title": "Enviar relatório",
      "status": "IN_PROGRESS",
      "priority": "HIGH"
    }
  ]
}
```

**Regras:**

- O array não pode estar vazio
- O limite máximo é de 1000 tasks por requisição
- A lista precisa pertencer ao usuário autenticado

**Resposta de Sucesso:**

```json
{
  "status": "success",
  "message": "Success",
  "data": {
    "count": 2
  }
}
```

---

**PATCH** `/lists/:listId/tasks/:taskId`

Atualiza uma task.

**Payload:**

```json
{
  "title": "Relatório de concorrência atualizado",
  "status": "DONE",
  "priority": "MEDIUM",
  "deadline": null
}
```

---

**DELETE** `/lists/:listId/tasks/:taskId`

Remove uma task.
