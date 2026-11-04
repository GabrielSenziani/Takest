import { Test, TestingModule } from '@nestjs/testing';
import { TarefasService } from './tarefas.service.js';
import { Tarefa } from './tarefa.entity.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusTarefa } from './status-tarefa.enum.js';
import { NotFoundException } from '@nestjs/common';

describe('TarefasService', () => {
  let service: TarefasService;
   let repositorioMock: Repository<Tarefa>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TarefasService, {
        provide: getRepositoryToken(Tarefa),
        useValue: {
          findOneBy: vi.fn(),
          find: vi.fn(),
          create: vi.fn(),
          save: vi.fn(),
          softRemove: vi.fn()
        }
      }],
    }).compile();

    repositorioMock = module.get<Repository<Tarefa>>(
      getRepositoryToken(Tarefa)
    )

    service = module.get<TarefasService>(TarefasService);
    vi.clearAllMocks()
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repositorioMock).toBeDefined()
  });

  describe("Criar Tarefa", () => {
    it("Deve criar tarefa e salvar com sucesso", async () => {
      const dto = {
        titulo: "Nova Tarefa",
        descricao: "Concluir até amanhã"
      }

      const tarefaCriada = { 
        id: 1, 
        ...dto 
      }

      vi.spyOn(repositorioMock, "create").mockReturnValue(tarefaCriada as any)
      vi.spyOn(repositorioMock, "save").mockResolvedValue(tarefaCriada as any)

      const resultado = await service.criarTarefa(dto)
      
      expect(resultado).toEqual(tarefaCriada)
      expect(resultado.titulo).toBe("Nova Tarefa")
      expect(resultado.descricao).toBe("Concluir até amanhã")
      expect(repositorioMock.create).toHaveBeenCalledWith(dto)
      expect(repositorioMock.save).toHaveBeenCalledWith(tarefaCriada)
    })

    it("Deve lançar erro ao falhar", async () => {
      const dto = {
        titulo: "",
        descricao: ""
      }

      const tarefaCriada = {
        id: 1,
        ...dto
      }

      vi.spyOn(repositorioMock, "create").mockReturnValue(tarefaCriada as any)

      vi.spyOn(repositorioMock, "save").mockRejectedValue(new Error("Erro ao salvar a tarefa"))

      await expect(service.criarTarefa(dto))
      .rejects.toThrow("Erro ao salvar a tarefa")

      expect(repositorioMock.save).toHaveBeenCalledWith(tarefaCriada)


    })
  })

  describe("Listar tarefas", () => {
    it("Deve retornar um array de tarefas", async () => {
      const dataMock = new Date('2026-11-03T10:00:00Z');

      const listaDeTarefas = [
        {
        id: 1, 
        titulo: "Estudar engenharia", 
        criadaEm: dataMock, 
        status: StatusTarefa.NAO_INICIADA
      },
      {
        id: 2, 
        titulo: "Estudar I.A", 
        criadaEm: dataMock, 
        status: StatusTarefa.EM_ANDAMENTO
      }
    ]

      vi.spyOn(repositorioMock, "find").mockResolvedValue(listaDeTarefas as any)

      const resultado = await service.listarTodos()

      expect(resultado).toEqual(listaDeTarefas)
      expect(resultado[0].status).toBe(StatusTarefa.NAO_INICIADA)
      expect(resultado[1].status).toBe(StatusTarefa.EM_ANDAMENTO)
    })

    it("Deve retornar um array vazio", async () => {

      vi.spyOn(repositorioMock, "find").mockResolvedValue([] as any)

      const resultado = await service.listarTodos()

      expect(resultado).toEqual([])
      expect(repositorioMock.find).toHaveBeenCalledTimes(1)
    })
  })

  describe("Buscar por Id", () => {
    it("Deve retornar a tarefa criada", async () => {
      const dataMock = new Date()

      const dto = {
        titulo: "tarefa criada"
      }

      const tarefaCriada = {
        id: 1,
        ...dto,
        status: StatusTarefa.EM_ANDAMENTO,
        criadaEm: dataMock
      }

      vi.spyOn(repositorioMock, "findOneBy").mockResolvedValue(tarefaCriada as any)

      const resultado = await service.buscaPorId(1)

      expect(resultado).toEqual(tarefaCriada)
      expect(repositorioMock.findOneBy).toHaveBeenCalledWith({ id: 1 })
    })

    it("NotFoundException esperado", async () => {
      vi.spyOn(repositorioMock, "findOneBy").mockResolvedValue(null)

      await expect(service.buscaPorId(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe("Atualização de tarefas", () => {
    it("Deve buscar e atualizar uma tarefa existente", async () => {
      const dataMock = new Date()
      const updateDto = {
        titulo: "Estudar Nest.js",
        status: StatusTarefa.EM_ANDAMENTO
      }

      const tarefaCriada = {
        id: 1,
        titulo: "Estudar Node.js",
        status: StatusTarefa.NAO_INICIADA,
        criadaEm: dataMock
      }

      const tarefaAtualizada = {
        ...tarefaCriada,
        ...updateDto
      }

      vi.spyOn(repositorioMock, "findOneBy").mockResolvedValue(tarefaCriada as any)
      vi.spyOn(repositorioMock, "save").mockResolvedValue(tarefaAtualizada as any)

      const resultado = await service.atualizarTarefa(1, updateDto)

      expect(resultado).toEqual(tarefaAtualizada)
      expect(repositorioMock.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(repositorioMock.save).toHaveBeenCalledWith(tarefaAtualizada)
    })

    it("NotFoundExeception esperado na parte de atualização", async () => {
      const updateDto = {
        titulo: "Nova tarefa",
        status: StatusTarefa.NAO_INICIADA
      }

      vi.spyOn(repositorioMock, "findOneBy").mockResolvedValue(null)

      await expect(service.atualizarTarefa(1, updateDto)).rejects.toThrow(NotFoundException)

      expect(repositorioMock.save).not.toHaveBeenCalled()
    })
  })

  describe("Exclusão de tarefas", () => {
    it("Deve realizar a busca pela tarefa e exclui-lá em seguida", async () => {

      const dataMock = new Date()

      const tarefaCriada = {
        id: 1,
        titulo: "Realizar testes automatizados",
        descricao: "Até segunda-feira deve ser concluida",
        status: StatusTarefa.NAO_INICIADA,
        criadaEm: dataMock
      }

      vi.spyOn(repositorioMock, "findOneBy").mockResolvedValue(tarefaCriada as any)
      vi.spyOn(repositorioMock, "softRemove").mockResolvedValue(tarefaCriada as any)

      const resultado = await service.excluirTarefa(1)

      expect(resultado).toEqual(tarefaCriada)
      expect(resultado.id).toBe(1)

      expect(repositorioMock.findOneBy).toHaveBeenCalledWith({ id: 1 })
      expect(repositorioMock.softRemove).toHaveBeenCalledWith(tarefaCriada)
    })

    it("NotFoundException esperado por conta de tarefa inexistente", async () => {
      vi.spyOn(repositorioMock, "findOneBy").mockResolvedValue(null)

      await expect(service.excluirTarefa(999)).rejects.toThrow(NotFoundException)

      expect(repositorioMock.softRemove).not.toHaveBeenCalled()
    })
  })
});