# Tarefas API

API REST desenvolvida com **NestJS**, **TypeScript**, **TypeORM** e **PostgreSQL**, com o objetivo de praticar desenvolvimento backend, organização de aplicações, persistência de dados e testes automatizados.

## Tecnologias utilizadas

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker e Docker Compose
- class-validator
- class-transformer
- Vitest
- Supertest

## Funcionalidades

A API permite realizar operações de gerenciamento de tarefas por meio de endpoints REST.

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/tarefas` | Cadastra uma nova tarefa |
| GET | `/tarefas` | Lista todas as tarefas |
| GET | `/tarefas/:id` | Busca uma tarefa pelo ID |
| PATCH | `/tarefas/:id` | Atualiza uma tarefa |
| DELETE | `/tarefas/:id` | Realiza a exclusão lógica de uma tarefa |

### Estrutura de uma tarefa

| Atributo | Tipo | Descrição |
|---|---|---|
| `id` | number | Identificador único |
| `titulo` | string | Título da tarefa (obrigatório) |
| `descricao` | string | Descrição da tarefa (opcional) |
| `status` | enum | Situação atual da tarefa |
| `criadaEm` | Date | Data de criação |
| `excluidaEm` | Date ou null | Data da exclusão lógica |

### Status disponíveis

- `nao_iniciada`
- `em_andamento`
- `finalizada`
- `descartada`

### Exclusão lógica

A API utiliza o recurso de *Soft Delete* do TypeORM.

Ao excluir uma tarefa, ela não é removida fisicamente do banco de dados. Em vez disso, a coluna `excluidaEm` recebe a data da exclusão.

Tarefas excluídas deixam de aparecer nas consultas padrão da API.

## Validação e tratamento de erros

A aplicação utiliza DTOs com `class-validator` e `class-transformer` para validar e transformar os dados recebidos.

Também possui um `ValidationPipe` global configurado com:

- `whitelist`: remove propriedades que não possuem decorators de validação.
- `forbidNonWhitelisted`: rejeita propriedades não permitidas.
- `transform`: transforma os dados recebidos conforme as regras definidas.

### Principais códigos HTTP

| Código | Descrição |
|---|---|
| 200 | Requisição realizada com sucesso |
| 201 | Recurso criado |
| 204 | Recurso excluído com sucesso |
| 400 | Dados inválidos |
| 404 | Recurso não encontrado |

## Como executar o projeto

### Pré-requisitos

- Node.js
- npm
- Docker
- Docker Compose

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
cd estudo-nestjs
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, utilizando o `.env.example` como referência.

Exemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=tarefas_dev
DB_SYNCHRONIZE=true
```

### 4. Iniciar o banco de dados

```bash
docker compose up -d
```

O Docker Compose iniciará o container do PostgreSQL.

### 5. Executar a aplicação

```bash
npm run start:dev
```

Por padrão, a aplicação estará disponível em `http://localhost:3000`.

## Testes automatizados

O projeto possui testes unitários e testes E2E utilizando Vitest.

### Testes unitários

```bash
npm test
```

Os testes unitários verificam o comportamento dos Services e Controllers, utilizando mocks para isolar suas dependências.

### Modo de observação

```bash
npm run test:watch
```

### Cobertura de testes

```bash
npm run test:cov
```

### Testes E2E

```bash
npm run test:e2e
```

Os testes E2E utilizam Supertest para realizar requisições HTTP à aplicação, verificando o funcionamento integrado das rotas, controllers, services e persistência de dados.

Para evitar interferência nos dados de desenvolvimento, os testes utilizam um banco PostgreSQL separado, chamado `tarefas_test`.

Configure o arquivo `.env.test` utilizando o `.env.test.example` como referência.

O ambiente de testes é selecionado automaticamente pelo script `test:e2e`.

## Estrutura do projeto

```text
estudo-nestjs/
├── src/
│   ├── tarefas/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── tarefas.controller.ts
│   │   ├── tarefas.service.ts
│   │   └── tarefas.module.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
│   └── app.e2e-spec.ts
├── docker-compose.yml
├── .env.example
├── .env.test.example
├── package.json
└── vitest.config.e2e.ts
```

*Estrutura ilustrativa dos principais arquivos e diretórios.*

## Objetivo do projeto

Este projeto foi desenvolvido como parte do meu aprendizado em desenvolvimento backend, com foco na construção de APIs REST utilizando NestJS.

Durante o desenvolvimento, foram praticados conceitos como arquitetura modular, operações CRUD, integração com banco de dados relacional, validação de dados, tratamento de exceções, Docker e testes automatizados.
