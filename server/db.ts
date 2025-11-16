import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  Motorista, motoristas, InsertMotorista,
  Caminhao, caminhoes, InsertCaminhao,
  Cliente, clientes, InsertCliente,
  Cacamba, cacambas, InsertCacamba,
  Pedido, pedidos, InsertPedido,
  Transacao, transacoes, InsertTransacao,
  Rota, rotas, InsertRota,
  Manutencao, manutencoes, InsertManutencao,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USERS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ MOTORISTAS ============
export async function createMotorista(data: InsertMotorista) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(motoristas).values(data);
  return result;
}

export async function getMotoristas() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(motoristas).orderBy(desc(motoristas.createdAt));
}

export async function getMotoristaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(motoristas).where(eq(motoristas.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateMotorista(id: number, data: Partial<InsertMotorista>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(motoristas).set(data).where(eq(motoristas.id, id));
}

export async function deleteMotorista(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(motoristas).where(eq(motoristas.id, id));
}

// ============ CAMINHÕES ============
export async function createCaminhao(data: InsertCaminhao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(caminhoes).values(data);
}

export async function getCaminhoes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(caminhoes).orderBy(desc(caminhoes.createdAt));
}

export async function getCaminhaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(caminhoes).where(eq(caminhoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCaminhao(id: number, data: Partial<InsertCaminhao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(caminhoes).set(data).where(eq(caminhoes.id, id));
}

export async function deleteCaminhao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(caminhoes).where(eq(caminhoes.id, id));
}

// ============ CLIENTES ============
export async function createCliente(data: InsertCliente) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(clientes).values(data);
}

export async function getClientes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clientes).orderBy(desc(clientes.createdAt));
}

export async function getClienteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCliente(id: number, data: Partial<InsertCliente>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(clientes).set(data).where(eq(clientes.id, id));
}

export async function deleteCliente(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(clientes).where(eq(clientes.id, id));
}

// ============ CAÇAMBAS ============
export async function createCacamba(data: InsertCacamba) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(cacambas).values(data);
}

export async function getCacambas() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cacambas).orderBy(desc(cacambas.createdAt));
}

export async function getCacambaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(cacambas).where(eq(cacambas.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCacamba(id: number, data: Partial<InsertCacamba>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(cacambas).set(data).where(eq(cacambas.id, id));
}

export async function deleteCacamba(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(cacambas).where(eq(cacambas.id, id));
}

// ============ PEDIDOS ============
export async function createPedido(data: InsertPedido) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(pedidos).values(data);
}

export async function getPedidos() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(pedidos).orderBy(desc(pedidos.createdAt));
}

export async function getPedidoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePedido(id: number, data: Partial<InsertPedido>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(pedidos).set(data).where(eq(pedidos.id, id));
}

export async function deletePedido(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(pedidos).where(eq(pedidos.id, id));
}

// ============ TRANSAÇÕES ============
export async function createTransacao(data: InsertTransacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(transacoes).values(data);
}

export async function getTransacoes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transacoes).orderBy(desc(transacoes.dataTransacao));
}

export async function getTransacoesByPeriod(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(transacoes).where(
    and(
      gte(transacoes.dataTransacao, startDate),
      lte(transacoes.dataTransacao, endDate)
    )
  ).orderBy(desc(transacoes.dataTransacao));
}

export async function getTransacaoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(transacoes).where(eq(transacoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTransacao(id: number, data: Partial<InsertTransacao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(transacoes).set(data).where(eq(transacoes.id, id));
}

export async function deleteTransacao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(transacoes).where(eq(transacoes.id, id));
}

// ============ ROTAS ============
export async function createRota(data: InsertRota) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(rotas).values(data);
}

export async function getRotas() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(rotas).orderBy(desc(rotas.dataRota));
}

export async function getRotaById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(rotas).where(eq(rotas.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateRota(id: number, data: Partial<InsertRota>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(rotas).set(data).where(eq(rotas.id, id));
}

export async function deleteRota(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(rotas).where(eq(rotas.id, id));
}

// ============ MANUTENÇÕES ============
export async function createManutencao(data: InsertManutencao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(manutencoes).values(data);
}

export async function getManutencoes() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(manutencoes).orderBy(desc(manutencoes.dataPrevista));
}

export async function getManutencaoById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(manutencoes).where(eq(manutencoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateManutencao(id: number, data: Partial<InsertManutencao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(manutencoes).set(data).where(eq(manutencoes.id, id));
}

export async function deleteManutencao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(manutencoes).where(eq(manutencoes.id, id));
}
