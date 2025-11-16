import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: pgEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Motoristas
export const motoristas = pgTable("motoristas", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  cnh: varchar("cnh", { length: 20 }),
  cnhValidade: timestamp("cnhValidade"),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  status: pgEnum("status", ["ativo", "inativo", "afastado"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Motorista = typeof motoristas.$inferSelect;
export type InsertMotorista = typeof motoristas.$inferInsert;

// Caminhões
export const caminhoes = pgTable("caminhoes", {
  id: serial("id").primaryKey(),
  placa: varchar("placa", { length: 10 }).notNull().unique(),
  marca: varchar("marca", { length: 100 }).notNull(),
  modelo: varchar("modelo", { length: 100 }).notNull(),
  ano: int("ano").notNull(),
  capacidadeToneladas: numeric("capacidadeToneladas", { precision: 10, scale: 2 }),
  crlv: varchar("crlv", { length: 50 }),
  crlvValidade: timestamp("crlvValidade"),
  seguroValidade: timestamp("seguroValidade"),
  inspecaoTecnicaValidade: timestamp("inspecaoTecnicaValidade"),
  status: pgEnum("status", ["operacional", "manutencao", "inativo"]).default("operacional").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Caminhao = typeof caminhoes.$inferSelect;
export type InsertCaminhao = typeof caminhoes.$inferInsert;

// Clientes
export const clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  razaoSocial: varchar("razaoSocial", { length: 255 }).notNull(),
  cnpjCpf: varchar("cnpjCpf", { length: 20 }).notNull().unique(),
  contato: varchar("contato", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  tipoCliente: pgEnum("tipoCliente", ["pf", "pj"]).notNull(),
  limiteCreditoReais: numeric("limiteCreditoReais", { precision: 12, scale: 2 }).default("0"),
  saldoDevedorReais: numeric("saldoDevedorReais", { precision: 12, scale: 2 }).default("0"),
  status: pgEnum("status", ["ativo", "inativo", "bloqueado"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Cliente = typeof clientes.$inferSelect;
export type InsertCliente = typeof clientes.$inferInsert;

// Caçambas
export const cacambas = pgTable("cacambas", {
  id: serial("id").primaryKey(),
  identificacao: varchar("identificacao", { length: 50 }).notNull().unique(),
  tamanho: varchar("tamanho", { length: 50 }).notNull(), // Ex: "6m³", "8m³", "10m³"
  capacidadeToneladas: numeric("capacidadeToneladas", { precision: 10, scale: 2 }),
  tipoMaterial: varchar("tipoMaterial", { length: 100 }), // Ex: "entulho", "sucata", "areia"
  localizacaoAtual: text("localizacaoAtual"),
  statusDisponibilidade: pgEnum("statusDisponibilidade", ["disponivel", "alugada", "manutencao", "inativa"]).default("disponivel").notNull(),
  dataAquisicao: timestamp("dataAquisicao"),
  valorAquisicaoReais: numeric("valorAquisicaoReais", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Cacamba = typeof cacambas.$inferSelect;
export type InsertCacamba = typeof cacambas.$inferInsert;

// Pedidos
export const pedidos = pgTable("pedidos", {
  id: serial("id").primaryKey(),
  numeroPedido: varchar("numeroPedido", { length: 50 }).notNull().unique(),
  clienteId: int("clienteId").notNull(),
  cacambaId: int("cacambaId").notNull(),
  motoristaId: int("motoristaId"),
  caminhaId: int("caminhaId"),
  localEntrega: text("localEntrega").notNull(),
  dataEntrega: timestamp("dataEntrega").notNull(),
  dataRetirada: timestamp("dataRetirada"),
  prazoVencimentoRetirada: timestamp("prazoVencimentoRetirada").notNull(),
  valorLocacaoReais: numeric("valorLocacaoReais", { precision: 12, scale: 2 }).notNull(),
  observacoes: text("observacoes"),
  status: pgEnum("status", ["pendente", "em_andamento", "entregue", "retirado", "faturado", "cancelado"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type InsertPedido = typeof pedidos.$inferInsert;

// Transações (Receitas e Despesas)
export const transacoes = pgTable("transacoes", {
  id: serial("id").primaryKey(),
  tipo: pgEnum("tipo", ["receita", "despesa"]).notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(), // Ex: "locacao", "multa", "manutencao", "combustivel"
  descricao: text("descricao").notNull(),
  valorReais: numeric("valorReais", { precision: 12, scale: 2 }).notNull(),
  pedidoId: int("pedidoId"), // Opcional, para receitas associadas a pedidos
  dataTransacao: timestamp("dataTransacao").notNull(),
  dataRecebimentoPagamento: timestamp("dataRecebimentoPagamento"),
  formaPagamento: varchar("formaPagamento", { length: 50 }), // Ex: "dinheiro", "cartao", "transferencia"
  comprovante: text("comprovante"), // URL do comprovante se houver
  status: pgEnum("status", ["pendente", "pago", "cancelado"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Transacao = typeof transacoes.$inferSelect;
export type InsertTransacao = typeof transacoes.$inferInsert;

// Rotas (Histórico de rotas executadas)
export const rotas = pgTable("rotas", {
  id: serial("id").primaryKey(),
  pedidoId: int("pedidoId").notNull(),
  motoristaId: int("motoristaId").notNull(),
  caminhaId: int("caminhaId").notNull(),
  dataRota: timestamp("dataRota").notNull(),
  pontoPartida: text("pontoPartida").notNull(),
  pontoDestino: text("pontoDestino").notNull(),
  distanciaKm: numeric("distanciaKm", { precision: 10, scale: 2 }),
  tempoEstimadoMinutos: int("tempoEstimadoMinutos"),
  tempoRealMinutos: int("tempoRealMinutos"),
  rotaGeometria: text("rotaGeometria"), // Armazenar coordenadas da rota em JSON
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Rota = typeof rotas.$inferSelect;
export type InsertRota = typeof rotas.$inferInsert;

// Manutenções
export const manutencoes = pgTable("manutencoes", {
  id: serial("id").primaryKey(),
  tipo: pgEnum("tipo", ["caminhao", "cacamba"]).notNull(),
  tipoId: int("tipoId").notNull(), // ID do caminhão ou caçamba
  descricao: text("descricao").notNull(),
  dataPrevista: timestamp("dataPrevista"),
  dataRealizada: timestamp("dataRealizada"),
  custoReais: numeric("custoReais", { precision: 12, scale: 2 }),
  status: pgEnum("status", ["agendada", "realizada", "cancelada"]).default("agendada").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Manutencao = typeof manutencoes.$inferSelect;
export type InsertManutencao = typeof manutencoes.$inferInsert;
