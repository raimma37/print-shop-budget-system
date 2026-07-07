import {
  pgTable,
  serial,
  text,
  varchar,
  numeric,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const orcamentoStatusEnum = pgEnum("orcamento_status", [
  "rascunho",
  "enviado",
  "aprovado",
  "reprovado",
  "cancelado",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "vendedor", "viewer"]);

// ─── Usuários ─────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("vendedor"),
    avatarInitials: varchar("avatar_initials", { length: 3 }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const clients = pgTable(
  "clients",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 200 }),
    phone: varchar("phone", { length: 30 }),
    cnpjCpf: varchar("cnpj_cpf", { length: 20 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    notes: text("notes"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("clients_name_idx").on(t.name),
    index("clients_email_idx").on(t.email),
    index("clients_active_idx").on(t.active),
  ]
);

// ─── Produtos / Serviços ──────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    unit: varchar("unit", { length: 30 }).notNull().default("un"),
    basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull().default("0"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_name_idx").on(t.name),
    index("products_category_idx").on(t.category),
    index("products_active_idx").on(t.active),
  ]
);

// ─── Orçamentos ───────────────────────────────────────────────────────────────
export const orcamentos = pgTable(
  "orcamentos",
  {
    id: serial("id").primaryKey(),
    numero: varchar("numero", { length: 30 }).notNull().unique(),
    clientId: integer("client_id").notNull().references(() => clients.id),
    userId: integer("user_id").notNull().references(() => users.id),
    status: orcamentoStatusEnum("status").notNull().default("rascunho"),
    validUntil: timestamp("valid_until"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("orc_status_idx").on(t.status),
    index("orc_client_idx").on(t.clientId),
    index("orc_user_idx").on(t.userId),
    index("orc_created_idx").on(t.createdAt),
  ]
);

// ─── Itens do Orçamento ───────────────────────────────────────────────────────
export const orcamentoItems = pgTable(
  "orcamento_items",
  {
    id: serial("id").primaryKey(),
    orcamentoId: integer("orcamento_id")
      .notNull()
      .references(() => orcamentos.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull().default("1"),
    unit: varchar("unit", { length: 30 }).notNull().default("un"),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 5, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("orc_items_orc_idx").on(t.orcamentoId)]
);

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  orcamentos: many(orcamentos),
  sessions: many(sessions),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  orcamentos: many(orcamentos),
}));

export const productsRelations = relations(products, ({ many }) => ({
  items: many(orcamentoItems),
}));

export const orcamentosRelations = relations(orcamentos, ({ one, many }) => ({
  client: one(clients, { fields: [orcamentos.clientId], references: [clients.id] }),
  user: one(users, { fields: [orcamentos.userId], references: [users.id] }),
  items: many(orcamentoItems),
}));

export const orcamentoItemsRelations = relations(orcamentoItems, ({ one }) => ({
  orcamento: one(orcamentos, { fields: [orcamentoItems.orcamentoId], references: [orcamentos.id] }),
  product: one(products, { fields: [orcamentoItems.productId], references: [products.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ─── Configurações do Sistema (White Label) ──────────────────────────────────
export const systemSettings = pgTable(
  "system_settings",
  {
    id: serial("id").primaryKey(),
    appName: varchar("app_name", { length: 100 }).notNull().default("GráfikaORC"),
    companyName: varchar("company_name", { length: 200 }).notNull().default("Gráfica São João"),
    cnpj: varchar("cnpj", { length: 20 }).default(""),
    phone: varchar("phone", { length: 30 }).default(""),
    email: varchar("email", { length: 200 }).default(""),
    address: text("address").default(""),
    logoUrl: text("logo_url").default(""),
    themeColor: varchar("theme_color", { length: 30 }).notNull().default("amber"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Orcamento = typeof orcamentos.$inferSelect;
export type NewOrcamento = typeof orcamentos.$inferInsert;
export type OrcamentoItem = typeof orcamentoItems.$inferSelect;
export type NewOrcamentoItem = typeof orcamentoItems.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;

