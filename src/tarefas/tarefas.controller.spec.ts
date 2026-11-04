import { Test, TestingModule } from '@nestjs/testing';
import { TarefasController } from './tarefas.controller.js';
import { TarefasService } from './tarefas.service.js';
import { StatusTarefa } from './status-tarefa.enum.js';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TarefasController', () => {
  let controller: TarefasController;
  let tarefasService: TarefasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TarefasController],
      providers: [ 
        {
          provide: TarefasService,
          useValue: {
            listarTodos: vi.fn(),
            buscaPorId: vi.fn(),
            criarTarefa: vi.fn(),
            atualizarTarefa: vi.fn(),
            excluirTarefa: vi.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<TarefasController>(TarefasController);

    tarefasService = module.get<TarefasService>(TarefasService)

    vi.clearAllMocks()
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("Listar Tarefas", () => {
    it("Deve Listar as duas tarefas registradas", async () => {
      const dataMock = new Date()
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

        const spyService = vi.spyOn(tarefasService, "listarTodos").mockResolvedValue(listaDeTarefas as any)

        const resultC = await controller.listarTodasAsTarefas()
        
        expect(resultC).toEqual(listaDeTarefas)
  
        expect(spyService).toHaveBeenCalledTimes(1)
    })

    it("Deve retornar um array vazio sem tarefas registradas", async () => {
      const spyService = vi.spyOn(tarefasService, "listarTodos").mockResolvedValue([] as any)

      const resultC = await controller.listarTodasAsTarefas()

      expect(resultC).toEqual([])

      expect(spyService).toHaveBeenCalledTimes(1)
    })
  })

  describe("Busca por Id", () => {
    it("Deve buscar a tarefa registrada pelo id", async () => {
      const dataMock = new Date()

      const dto = {
        titulo: "Realizar documentação"
      }

      const tarefaCriada = {
        id: 1,
        ...dto,
        status: StatusTarefa.EM_ANDAMENTO,
        criadaEm: dataMock
      }

      const spyService = vi.spyOn(tarefasService, "buscaPorId").mockResolvedValue(tarefaCriada as any)

      const resultC = await controller.buscaTarefaPorId(1)

      expect(resultC).toEqual(tarefaCriada)

      expect(spyService).toHaveBeenCalledTimes(1)
      expect(spyService).toHaveBeenCalledWith(1)
    })

    it("Não deve retornar tarefa inexistente", async () => {
      vi.spyOn(tarefasService, "buscaPorId").mockRejectedValue(new NotFoundException())

      await expect(controller.buscaTarefaPorId(999)).rejects.toThrow(NotFoundException)
    })
  })

  describe("Criar Tarefa", () => {
    it("Deve criar a tarefa com sucesso e simular salvamento", async () => {
      const dataMock = new Date() 
      const dto = {
        titulo: "Realizar testes de integração"
      }

      const tarefaCriada = {
        id: 1,
        ...dto,
        status: StatusTarefa.EM_ANDAMENTO,
        criadaEm: dataMock
      }

      const spyService = vi.spyOn(tarefasService, "criarTarefa").mockResolvedValue(tarefaCriada as any)
      
      const resultC = await controller.criarNovaTarefa(dto)

      expect(resultC).toEqual(tarefaCriada)

      expect(spyService).toHaveBeenCalledTimes(1)
      expect(spyService).toHaveBeenCalledWith(dto)
    })

    it("Simula InternalServerErrorException durante a criação da tarefa", async () => {
      vi.spyOn(tarefasService, "criarTarefa").mockRejectedValue(new InternalServerErrorException())

      const dtoMock = { titulo: "Nova tarefa" }
      await expect(controller.criarNovaTarefa(dtoMock)).rejects.toThrow(InternalServerErrorException)
    })
  })

  describe("Atualização de tarefas", () => {
    it("Deve buscar e atualizar uma tarefa existente", async () => {
      const dataMock = new Date() 
      const dto = {
        titulo: "Realizar atualização no banco SQL"
      }

      const tarefaCriada = {
        id: 1,
        ...dto,
        status: StatusTarefa.EM_ANDAMENTO,
        criadaEm: dataMock
      }

      const tarefaAtualizada = {
        ...tarefaCriada
      }

      const spyService = vi.spyOn(tarefasService, "atualizarTarefa").mockResolvedValue(tarefaAtualizada as any)

      const resultC = await controller.atualizarTarefa(1, dto)

      expect(resultC).toEqual(tarefaAtualizada)

      expect(spyService).toHaveBeenCalledWith(1, dto)
      expect(spyService).toHaveBeenCalledTimes(1)
    })

    it("Deve retornar NotFoundException para tarefa inexistente", async () => {
      vi.spyOn(tarefasService, "atualizarTarefa").mockRejectedValue(new NotFoundException())

      const updateDto = { titulo: "Tarefa que não existe" }
      await expect(controller.atualizarTarefa(999, updateDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("Excluir tarefa", () => {
    it("Deve excluir tarefa existente com sucesso", async () => {
      const dataMock = new Date() 

      const dto = {
        titulo: "Realizar testes de exclusão"
      }

      const tarefaCriada = {
        id: 1,
        ...dto,
        status: StatusTarefa.EM_ANDAMENTO,
        criadaEm: dataMock
      }

      const spyService = vi.spyOn(tarefasService, "excluirTarefa").mockResolvedValue(tarefaCriada as any)

      const resultC = await controller.excluirTarefa(1)

      expect(resultC).toEqual(tarefaCriada)

      expect(spyService).toHaveBeenCalledTimes(1)
      expect(spyService).toHaveBeenCalledWith(1)
    })

    it("Deve retornar NotFoundException", async () => {
      vi.spyOn(tarefasService, "excluirTarefa").mockRejectedValue(new NotFoundException())

      await expect(controller.excluirTarefa(999)).rejects.toThrow(NotFoundException)
    })
  })
});
