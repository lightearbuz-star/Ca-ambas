import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  createMotorista, getMotoristas, getMotoristaById, updateMotorista, deleteMotorista,
  createCaminhao, getCaminhoes, getCaminhaById, updateCaminhao, deleteCaminhao,
  createCliente, getClientes, getClienteById, updateCliente, deleteCliente,
  createCacamba, getCacambas, getCacambaById, updateCacamba, deleteCacamba,
  createPedido, getPedidos, getPedidoById, updatePedido, deletePedido,
  createTransacao, getTransacoes, getTransacoesByPeriod, getTransacaoById, updateTransacao, deleteTransacao,
  createRota, getRotas, getRotaById, updateRota, deleteRota,
  createManutencao, getManutencoes, getManutencaoById, updateManutencao, deleteManutencao,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ MOTORISTAS ============
  motoristas: router({
    list: protectedProcedure.query(() => getMotoristas()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMotoristaById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        cpf: z.string().min(1),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        cnh: z.string().optional(),
        cnhValidade: z.date().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        status: z.enum(["ativo", "inativo", "afastado"]).default("ativo"),
      }))
      .mutation(({ input }) => createMotorista(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        cpf: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        cnh: z.string().optional(),
        cnhValidade: z.date().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        status: z.enum(["ativo", "inativo", "afastado"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateMotorista(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteMotorista(input.id)),
  }),

  // ============ CAMINHÕES ============
  caminhoes: router({
    list: protectedProcedure.query(() => getCaminhoes()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCaminhaById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        placa: z.string().min(1),
        marca: z.string().min(1),
        modelo: z.string().min(1),
        ano: z.number().int(),
        capacidadeToneladas: z.string().optional(),
        crlv: z.string().optional(),
        crlvValidade: z.date().optional(),
        seguroValidade: z.date().optional(),
        inspecaoTecnicaValidade: z.date().optional(),
        status: z.enum(["operacional", "manutencao", "inativo"]).default("operacional"),
      }))
      .mutation(({ input }) => createCaminhao(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        placa: z.string().optional(),
        marca: z.string().optional(),
        modelo: z.string().optional(),
        ano: z.number().int().optional(),
        capacidadeToneladas: z.string().optional(),
        crlv: z.string().optional(),
        crlvValidade: z.date().optional(),
        seguroValidade: z.date().optional(),
        inspecaoTecnicaValidade: z.date().optional(),
        status: z.enum(["operacional", "manutencao", "inativo"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCaminhao(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCaminhao(input.id)),
  }),

  // ============ CLIENTES ============
  clientes: router({
    list: protectedProcedure.query(() => getClientes()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getClienteById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        razaoSocial: z.string().min(1),
        cnpjCpf: z.string().min(1),
        contato: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        tipoCliente: z.enum(["pf", "pj"]),
        limiteCreditoReais: z.string().optional(),
        status: z.enum(["ativo", "inativo", "bloqueado"]).default("ativo"),
      }))
      .mutation(({ input }) => createCliente(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        razaoSocial: z.string().optional(),
        cnpjCpf: z.string().optional(),
        contato: z.string().optional(),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        cep: z.string().optional(),
        tipoCliente: z.enum(["pf", "pj"]).optional(),
        limiteCreditoReais: z.string().optional(),
        status: z.enum(["ativo", "inativo", "bloqueado"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCliente(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCliente(input.id)),
  }),

  // ============ CAÇAMBAS ============
  cacambas: router({
    list: protectedProcedure.query(() => getCacambas()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCacambaById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        identificacao: z.string().min(1),
        tamanho: z.string().min(1),
        capacidadeToneladas: z.string().optional(),
        tipoMaterial: z.string().optional(),
        localizacaoAtual: z.string().optional(),
        statusDisponibilidade: z.enum(["disponivel", "alugada", "manutencao", "inativa"]).default("disponivel"),
        dataAquisicao: z.date().optional(),
        valorAquisicaoReais: z.string().optional(),
      }))
      .mutation(({ input }) => createCacamba(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        identificacao: z.string().optional(),
        tamanho: z.string().optional(),
        capacidadeToneladas: z.string().optional(),
        tipoMaterial: z.string().optional(),
        localizacaoAtual: z.string().optional(),
        statusDisponibilidade: z.enum(["disponivel", "alugada", "manutencao", "inativa"]).optional(),
        dataAquisicao: z.date().optional(),
        valorAquisicaoReais: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateCacamba(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCacamba(input.id)),
  }),

  // ============ PEDIDOS ============
  pedidos: router({
    list: protectedProcedure.query(() => getPedidos()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPedidoById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        numeroPedido: z.string().min(1),
        clienteId: z.number(),
        cacambaId: z.number(),
        motoristaId: z.number().optional(),
        caminhaId: z.number().optional(),
        localEntrega: z.string().min(1),
        dataEntrega: z.date(),
        dataRetirada: z.date().optional(),
        prazoVencimentoRetirada: z.date(),
        valorLocacaoReais: z.string(),
        observacoes: z.string().optional(),
        status: z.enum(["pendente", "em_andamento", "entregue", "retirado", "faturado", "cancelado"]).default("pendente"),
      }))
      .mutation(({ input }) => createPedido(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        numeroPedido: z.string().optional(),
        clienteId: z.number().optional(),
        cacambaId: z.number().optional(),
        motoristaId: z.number().optional(),
        caminhaId: z.number().optional(),
        localEntrega: z.string().optional(),
        dataEntrega: z.date().optional(),
        dataRetirada: z.date().optional(),
        prazoVencimentoRetirada: z.date().optional(),
        valorLocacaoReais: z.string().optional(),
        observacoes: z.string().optional(),
        status: z.enum(["pendente", "em_andamento", "entregue", "retirado", "faturado", "cancelado"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updatePedido(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePedido(input.id)),
  }),

  // ============ TRANSAÇÕES ============
  transacoes: router({
    list: protectedProcedure.query(() => getTransacoes()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getTransacaoById(input.id)),
    
    getByPeriod: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(({ input }) => getTransacoesByPeriod(input.startDate, input.endDate)),
    
    create: protectedProcedure
      .input(z.object({
        tipo: z.enum(["receita", "despesa"]),
        categoria: z.string().min(1),
        descricao: z.string().min(1),
        valorReais: z.string(),
        pedidoId: z.number().optional(),
        dataTransacao: z.date(),
        dataRecebimentoPagamento: z.date().optional(),
        formaPagamento: z.string().optional(),
        comprovante: z.string().optional(),
        status: z.enum(["pendente", "pago", "cancelado"]).default("pendente"),
      }))
      .mutation(({ input }) => createTransacao(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        tipo: z.enum(["receita", "despesa"]).optional(),
        categoria: z.string().optional(),
        descricao: z.string().optional(),
        valorReais: z.string().optional(),
        pedidoId: z.number().optional(),
        dataTransacao: z.date().optional(),
        dataRecebimentoPagamento: z.date().optional(),
        formaPagamento: z.string().optional(),
        comprovante: z.string().optional(),
        status: z.enum(["pendente", "pago", "cancelado"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateTransacao(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTransacao(input.id)),
  }),

  // ============ ROTAS ============
  rotas: router({
    list: protectedProcedure.query(() => getRotas()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getRotaById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        pedidoId: z.number(),
        motoristaId: z.number(),
        caminhaId: z.number(),
        dataRota: z.date(),
        pontoPartida: z.string().min(1),
        pontoDestino: z.string().min(1),
        distanciaKm: z.string().optional(),
        tempoEstimadoMinutos: z.number().optional(),
        tempoRealMinutos: z.number().optional(),
        rotaGeometria: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(({ input }) => createRota(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        pedidoId: z.number().optional(),
        motoristaId: z.number().optional(),
        caminhaId: z.number().optional(),
        dataRota: z.date().optional(),
        pontoPartida: z.string().optional(),
        pontoDestino: z.string().optional(),
        distanciaKm: z.string().optional(),
        tempoEstimadoMinutos: z.number().optional(),
        tempoRealMinutos: z.number().optional(),
        rotaGeometria: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateRota(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteRota(input.id)),
  }),

  // ============ MANUTENÇÕES ============
  manutencoes: router({
    list: protectedProcedure.query(() => getManutencoes()),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getManutencaoById(input.id)),
    
    create: protectedProcedure
      .input(z.object({
        tipo: z.enum(["caminhao", "cacamba"]),
        tipoId: z.number(),
        descricao: z.string().min(1),
        dataPrevista: z.date().optional(),
        dataRealizada: z.date().optional(),
        custoReais: z.string().optional(),
        status: z.enum(["agendada", "realizada", "cancelada"]).default("agendada"),
      }))
      .mutation(({ input }) => createManutencao(input)),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        tipo: z.enum(["caminhao", "cacamba"]).optional(),
        tipoId: z.number().optional(),
        descricao: z.string().optional(),
        dataPrevista: z.date().optional(),
        dataRealizada: z.date().optional(),
        custoReais: z.string().optional(),
        status: z.enum(["agendada", "realizada", "cancelada"]).optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateManutencao(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteManutencao(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
