import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );

    await app.init();
  });

  it('POST /tarefas, Cadastrando um Livro', async () => {
    const dados = {
      titulo: "Estudar NESTJS",
      descricao: "Praticar testes E2E"
    }
    const resposta = await request(app.getHttpServer())
    .post("/tarefas")
    .send(dados)
    .expect(201)

    expect(resposta.body).toMatchObject({
      titulo: dados.titulo,
      descricao:dados.descricao,
      status: "nao_iniciada"
    })
  });

  it("POST /tarefas, tentativa de cadastrar tarefas com dados inválidos (string vazia)", async () => {
    const dados = {
      titulo: "",
      descricao: "Estudar até amanhã"
    }

    const resposta = await request(app.getHttpServer())
    .post("/tarefas")
    .send(dados)
    .expect(400)

    expect(resposta.body.message).toContain("O titulo deve ter no minimo 2 caracteres")
    expect(resposta.body.message).toContain("Campo vazio e só espaçamentos não são permitidos")
  })

  it("POST /tarefas, tentativa de cadastrar tarefas com dados inválidos (string vazia e com espaçamento)", async () => {
    const dados = {
      titulo: "         ",
      descricao: "Estudar até amanhã"
    }

    const resposta = await request(app.getHttpServer())
    .post("/tarefas")
    .send(dados)
    .expect(400)

    expect(resposta.body.message).toContain("O titulo deve ter no minimo 2 caracteres")
    expect(resposta.body.message).toContain("Campo vazio e só espaçamentos não são permitidos")
  })

  it("GET /tarefas/:id deve retornar a tarefa cadastrada", async () => {
    const dados = {
      titulo: "Estudar NESTJS",
      descricao: "Praticar testes E2E"
    }

    const cadastro = await request(app.getHttpServer())
    .post("/tarefas")
    .send(dados)
    .expect(201)

    const id = cadastro.body.id

    const resultado = await request(app.getHttpServer())
    .get(`/tarefas/${id}`)
    .expect(200)

    expect(resultado.body).toMatchObject({
      id,
      titulo: dados.titulo,
      descricao: dados.descricao,
      status: "nao_iniciada"
    })
  })

  it("GET /tarefas/:id tentativa de buscar uma tarefa inexistente", async () => {
    const id = 444
    const resultado = await request(app.getHttpServer()).get(`/tarefas/${id}`).expect(404)

    expect(resultado.body.message).toContain("Tarefa não encontrada")
  })

  it("DELETE /tarefas/:id deve deletar tarefa criada com sucesso", async () => {
    const dados = {
      titulo: "Estudar JS"
    }

    const cadastro = await request(app.getHttpServer())
    .post("/tarefas")
    .send(dados)
    .expect(201)

    const id = cadastro.body.id

    await request(app.getHttpServer())
    .delete(`/tarefas/${id}`)
    .expect(204)
  })

   it("DELETE /tarefas/:id deve falhar ao tentar deletar uma tarefa inexistente", async () => {
    const id = 999

    await request(app.getHttpServer())
    .delete(`/tarefas/${id}`)
    .expect(404)
  })

  it("PATCH /tarefas/:id deve atualizar as informações da tarefa com sucesso", async () => {
    const dadosIniciais = {
      titulo: "Estudar História"
    }

    const cadastro = await request(app.getHttpServer()).post("/tarefas")
    .send(dadosIniciais)
    .expect(201)

    const id = cadastro.body.id

    const novosDados = {
      titulo: "Dominar conteudo de história",
      status: "em_andamento"
    }

    const resultado = await request(app.getHttpServer())
    .patch(`/tarefas/${id}`)
    .send(novosDados)
    .expect(200)

    expect(resultado.body).toMatchObject({
      titulo: novosDados.titulo,
      status: novosDados.status
    })
  })

  it("PATCH /tarefas/:id deve rejeitar atualização com dados inválidos", async () => {
    const dadosIniciais = {
      titulo: "Estudar Testes",
      descricao: "Escrevendo specs"
    }

    const cadastro = await request(app.getHttpServer())
      .post("/tarefas")
      .send(dadosIniciais)
      .expect(201)

    const id = cadastro.body.id

    const dadosInvalidos = {
      titulo: ""
    }

    const resposta = await request(app.getHttpServer())
      .patch(`/tarefas/${id}`)
      .send(dadosInvalidos)
      .expect(400)

      expect(resposta.body.message).toContain("O titulo deve ter no minimo 2 caracteres");
  })
  
  afterEach(async () => {
    await app.close();
  });
});
