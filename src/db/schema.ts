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
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const contractsStatusEnum = pgEnum("contract_status", ["rascunho", "gerado", "assinado", "cancelado"]);
export const orcamentoStatusEnum = pgEnum("orcamento_status", [
  "rascunho",
  "enviado",
  "aprovado",
  "reprovado",
  "cancelado",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "vendedor", "viewer"]);

// Enums do PDV
export const posShiftStatusEnum = pgEnum("pos_shift_status", ["aberto", "fechado", "pausado"]);
export const posSaleStatusEnum = pgEnum("pos_sale_status", ["finalizada", "cancelada"]);
export const posPaymentMethodEnum = pgEnum("pos_payment_method", ["dinheiro", "pix", "credito", "debito", "carteira", "outro"]);
export const posCashEventTypeEnum = pgEnum("pos_cash_event_type", ["abertura", "fechamento", "sangria", "suprimento"]);

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
    size: varchar("size", { length: 100 }),
    category: varchar("category", { length: 100 }),
    unit: varchar("unit", { length: 30 }).notNull().default("un"),
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
    basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull().default("0"),
    stockQuantity: numeric("stock_quantity", { precision: 12, scale: 3 }).notNull().default("0"),
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

// ─── Embalagens de Produtos (SKUs) ───────────────────────────────────────────
export const productPackagings = pgTable(
  "product_packagings",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(), // ex: "1 Unidade", "Pacote com 100", "Caixa com 2500"
    conversionFactor: numeric("conversion_factor", { precision: 10, scale: 3 }).notNull().default("1"),
    barcode: varchar("barcode", { length: 100 }).unique(), // EAN
    costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0"),
    sellPrice: numeric("sell_price", { precision: 12, scale: 2 }).notNull().default("0"),
    isBase: boolean("is_base").notNull().default(false), // true if this is the base unit factor 1
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("pack_prod_idx").on(t.productId),
    index("pack_barcode_idx").on(t.barcode),
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
  packagings: many(productPackagings),
}));

export const productPackagingsRelations = relations(productPackagings, ({ one }) => ({
  product: one(products, { fields: [productPackagings.productId], references: [products.id] }),
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
    glassEffect: boolean("glass_effect").notNull().default(false),
    // ── Configurações do PDF ──────────────────────────────────────────────────
    pdfAccentColor: varchar("pdf_accent_color", { length: 20 }).default("#f59e0b"),
    pdfFooterText: text("pdf_footer_text").default(""),
    pdfValidityText: varchar("pdf_validity_text", { length: 200 }).default("Este orçamento é válido por 30 dias a partir da data de emissão."),
    pdfTermsText: text("pdf_terms_text").default(""),
    pdfShowLogo: boolean("pdf_show_logo").notNull().default(true),
    pdfShowCnpj: boolean("pdf_show_cnpj").notNull().default(true),
    pdfShowPhone: boolean("pdf_show_phone").notNull().default(true),
    pdfShowEmail: boolean("pdf_show_email").notNull().default(true),
    pdfShowAddress: boolean("pdf_show_address").notNull().default(true),
    pdfHeaderLayout: varchar("pdf_header_layout", { length: 20 }).notNull().default("logo-left"),
    // ── Configurações de Retenção de Documentos ───────────────────────────────
    contractsRetentionDays: integer("contracts_retention_days").notNull().default(30),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

// ─── Categorias de Produtos ──────────────────────────────────────────
export const productCategories = pgTable(
  "product_categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 20 }).default("#64748b"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("cat_name_idx").on(t.name)]
);

// ─── Unidades de Medida ──────────────────────────────────────────────────
export const productUnits = pgTable(
  "product_units",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 60 }).notNull(),
    abbreviation: varchar("abbreviation", { length: 20 }).notNull(),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("unit_abbr_idx").on(t.abbreviation)]
);

// ─── Enums Financeiros ────────────────────────────────────────────────────────
export const transactionTypeEnum = pgEnum("transaction_type", [
  "charge",      // cobrança/débito
  "payment",     // pagamento/abatimento
  "adjustment",  // ajuste manual
  "interest",    // juros
  "discount",    // desconto/perdão
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "aberta",
  "paga",
  "vencida",
  "cancelada",
]);

export const expenseStatusEnum = pgEnum("expense_status", [
  "pendente",
  "pago",
  "vencido",
]);

// ─── Conta Financeira do Cliente ─────────────────────────────────────────────
export const clientAccounts = pgTable(
  "client_accounts",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").notNull().references(() => clients.id).unique(),
    creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).notNull().default("0"),
    blocked: boolean("blocked").notNull().default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("ca_client_idx").on(t.clientId)]
);

// ─── Faturas ─────────────────────────────────────────────────────────────────
export const financialInvoices = pgTable(
  "financial_invoices",
  {
    id: serial("id").primaryKey(),
    numero: varchar("numero", { length: 30 }).notNull().unique(),
    clientId: integer("client_id").notNull().references(() => clients.id),
    periodStart: date("period_start"),
    periodEnd: date("period_end"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    status: invoiceStatusEnum("status").notNull().default("aberta"),
    dueDate: date("due_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("fin_inv_client_idx").on(t.clientId),
    index("fin_inv_status_idx").on(t.status),
  ]
);

// ─── Transações Financeiras ───────────────────────────────────────────────────
export const financialTransactions = pgTable(
  "financial_transactions",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id").notNull().references(() => clients.id),
    type: transactionTypeEnum("type").notNull(),
    category: varchar("category", { length: 60 }).notNull().default("outros"),
    description: text("description").notNull(),
    // Positivo = débito (cliente deve), Negativo = crédito (pagamento/desconto)
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 30 }),
    invoiceId: integer("invoice_id").references(() => financialInvoices.id),
    dueDate: timestamp("due_date"),
    paidAt: timestamp("paid_at"),
    createdBy: integer("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("fin_tx_client_idx").on(t.clientId),
    index("fin_tx_type_idx").on(t.type),
    index("fin_tx_created_idx").on(t.createdAt),
    index("fin_tx_invoice_idx").on(t.invoiceId),
  ]
);

// ─── Despesas (Contas a Pagar) ────────────────────────────────────────────────
export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    description: text("description").notNull(),
    category: varchar("category", { length: 60 }).notNull().default("outros"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    dueDate: date("due_date").notNull(),
    paidAt: date("paid_at"),
    status: expenseStatusEnum("status").notNull().default("pendente"),
    recurring: boolean("recurring").notNull().default(false),
    recurringInterval: varchar("recurring_interval", { length: 20 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("exp_status_idx").on(t.status),
    index("exp_due_idx").on(t.dueDate),
  ]
);

// ─── Log de Auditoria ─────────────────────────────────────────────────────────
export const auditLog = pgTable(
  "audit_log",
  {
    id: serial("id").primaryKey(),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: integer("entity_id"),
    userId: integer("user_id").references(() => users.id),
    details: text("details"), // JSON serializado
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)]
);

// ─── Relations Financeiras ────────────────────────────────────────────────────
export const clientAccountsRelations = relations(clientAccounts, ({ one }) => ({
  client: one(clients, { fields: [clientAccounts.clientId], references: [clients.id] }),
}));

export const financialInvoicesRelations = relations(financialInvoices, ({ one, many }) => ({
  client: one(clients, { fields: [financialInvoices.clientId], references: [clients.id] }),
  transactions: many(financialTransactions),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  client: one(clients, { fields: [financialTransactions.clientId], references: [clients.id] }),
  invoice: one(financialInvoices, { fields: [financialTransactions.invoiceId], references: [financialInvoices.id] }),
  createdByUser: one(users, { fields: [financialTransactions.createdBy], references: [users.id] }),
}));

// ─── PDV: Turnos de Caixa ───────────────────────────────────────────────────────
export const posShifts = pgTable(
  "pos_shifts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    status: posShiftStatusEnum("status").notNull().default("aberto"),
    openedAt: timestamp("opened_at").notNull().defaultNow(),
    closedAt: timestamp("closed_at"),
    initialCash: numeric("initial_cash", { precision: 12, scale: 2 }).notNull().default("0"),
    finalCashExpected: numeric("final_cash_expected", { precision: 12, scale: 2 }),
    finalCashReported: numeric("final_cash_reported", { precision: 12, scale: 2 }), // Fechamento Cego
    notes: text("notes"),
  },
  (t) => [
    index("pos_shift_user_idx").on(t.userId),
    index("pos_shift_status_idx").on(t.status),
  ]
);

// ─── PDV: Vendas / Cupons ──────────────────────────────────────────────────────
export const posSales = pgTable(
  "pos_sales",
  {
    id: serial("id").primaryKey(),
    shiftId: integer("shift_id").notNull().references(() => posShifts.id),
    clientId: integer("client_id").references(() => clients.id),
    cpfCnpj: varchar("cpf_cnpj", { length: 20 }), // Quando o cliente não é cadastrado
    status: posSaleStatusEnum("status").notNull().default("finalizada"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    syncedAt: timestamp("synced_at"), // Controle para modo offline
    offlineId: varchar("offline_id", { length: 100 }), // ID gerado no frontend offline (UUID)
  },
  (t) => [
    index("pos_sale_shift_idx").on(t.shiftId),
    index("pos_sale_created_idx").on(t.createdAt),
    index("pos_sale_offline_idx").on(t.offlineId),
  ]
);

// ─── PDV: Itens da Venda ──────────────────────────────────────────────────────
export const posSaleItems = pgTable(
  "pos_sale_items",
  {
    id: serial("id").primaryKey(),
    saleId: integer("sale_id").notNull().references(() => posSales.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull().references(() => products.id),
    packagingId: integer("packaging_id").references(() => productPackagings.id, { onDelete: "set null" }),
    quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull().default("1"),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  },
  (t) => [index("pos_sale_items_sale_idx").on(t.saleId)]
);

// ─── PDV: Pagamentos da Venda ──────────────────────────────────────────────────
export const posPayments = pgTable(
  "pos_payments",
  {
    id: serial("id").primaryKey(),
    saleId: integer("sale_id").notNull().references(() => posSales.id, { onDelete: "cascade" }),
    method: posPaymentMethodEnum("method").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("pos_payment_sale_idx").on(t.saleId)]
);

// ─── PDV: Eventos de Caixa (Sangria/Suprimento) ────────────────────────────────
export const posCashEvents = pgTable(
  "pos_cash_events",
  {
    id: serial("id").primaryKey(),
    shiftId: integer("shift_id").notNull().references(() => posShifts.id),
    type: posCashEventTypeEnum("type").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    authorizedBy: integer("authorized_by").references(() => users.id),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("pos_cash_events_shift_idx").on(t.shiftId)]
);

// ─── Relations PDV ────────────────────────────────────────────────────────────
export const posShiftsRelations = relations(posShifts, ({ one, many }) => ({
  user: one(users, { fields: [posShifts.userId], references: [users.id] }),
  sales: many(posSales),
  cashEvents: many(posCashEvents),
}));

export const posSalesRelations = relations(posSales, ({ one, many }) => ({
  shift: one(posShifts, { fields: [posSales.shiftId], references: [posShifts.id] }),
  client: one(clients, { fields: [posSales.clientId], references: [clients.id] }),
  items: many(posSaleItems),
  payments: many(posPayments),
}));

export const posSaleItemsRelations = relations(posSaleItems, ({ one }) => ({
  sale: one(posSales, { fields: [posSaleItems.saleId], references: [posSales.id] }),
  product: one(products, { fields: [posSaleItems.productId], references: [products.id] }),
  packaging: one(productPackagings, { fields: [posSaleItems.packagingId], references: [productPackagings.id] }),
}));

export const posPaymentsRelations = relations(posPayments, ({ one }) => ({
  sale: one(posSales, { fields: [posPayments.saleId], references: [posSales.id] }),
}));

export const posCashEventsRelations = relations(posCashEvents, ({ one }) => ({
  shift: one(posShifts, { fields: [posCashEvents.shiftId], references: [posShifts.id] }),
  authorizer: one(users, { fields: [posCashEvents.authorizedBy], references: [users.id] }),
}));

// ─── Documentos e Contratos ───────────────────────────────────────────────────
export const documentTemplates = pgTable(
  "document_templates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    fileUrl: text("file_url").notNull(),
    requiredTags: text("required_tags").notNull(), // JSON serializado de array de strings
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

export const contracts = pgTable(
  "contracts",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id").notNull().references(() => documentTemplates.id),
    clientId: integer("client_id").references(() => clients.id),
    status: contractsStatusEnum("status").notNull().default("gerado"),
    fileUrl: text("file_url"),
    data: text("data"), // JSON serializado
    createdBy: integer("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("contracts_template_idx").on(t.templateId),
    index("contracts_client_idx").on(t.clientId),
    index("contracts_status_idx").on(t.status),
  ]
);

export const documentTemplatesRelations = relations(documentTemplates, ({ many }) => ({
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  template: one(documentTemplates, { fields: [contracts.templateId], references: [documentTemplates.id] }),
  client: one(clients, { fields: [contracts.clientId], references: [clients.id] }),
  creator: one(users, { fields: [contracts.createdBy], references: [users.id] }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductPackaging = typeof productPackagings.$inferSelect;
export type NewProductPackaging = typeof productPackagings.$inferInsert;
export type Orcamento = typeof orcamentos.$inferSelect;
export type NewOrcamento = typeof orcamentos.$inferInsert;
export type OrcamentoItem = typeof orcamentoItems.$inferSelect;
export type NewOrcamentoItem = typeof orcamentoItems.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type NewSystemSettings = typeof systemSettings.$inferInsert;
export type ClientAccount = typeof clientAccounts.$inferSelect;
export type FinancialInvoice = typeof financialInvoices.$inferSelect;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

export type PosShift = typeof posShifts.$inferSelect;
export type PosSale = typeof posSales.$inferSelect;
export type PosSaleItem = typeof posSaleItems.$inferSelect;
export type PosPayment = typeof posPayments.$inferSelect;
export type PosCashEvent = typeof posCashEvents.$inferSelect;

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type NewDocumentTemplate = typeof documentTemplates.$inferInsert;
export type NewContract = typeof contracts.$inferInsert;

// ─── Templates de Etiquetas ───────────────────────────────────────────────────
export const labelTemplates = pgTable("label_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  width: numeric("width", { precision: 8, scale: 2 }).notNull().default("100"),
  height: numeric("height", { precision: 8, scale: 2 }).notNull().default("50"),
  type: varchar("type", { length: 20 }).notNull().default("PDF"), // ZPL | PDF
  tags: text("tags").notNull().default("[]"), // JSON serializado de array de strings
  zplCode: text("zpl_code"), // Para impressoras térmicas
  htmlCode: text("html_code"), // Para PDF / Print Normal
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type LabelTemplateType = typeof labelTemplates.$inferSelect;
export type NewLabelTemplateType = typeof labelTemplates.$inferInsert;

// ─── Kanban (Quadros, Colunas, Cartões) ───────────────────────────────────────
export const kanbanBoards = pgTable("kanban_boards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").default(""),
  category: varchar("category", { length: 100 }).default("Geral"),
  color: varchar("color", { length: 50 }).default("bg-fuchsia-500"),
  members: integer("members").default(1),
  visibility: varchar("visibility", { length: 20 }).default("public"), // public | private
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const kanbanColumns = pgTable("kanban_columns", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id").notNull().references(() => kanbanBoards.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  position: integer("position").notNull().default(0), // Order
  wipLimit: integer("wip_limit"), // Opcional
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const kanbanCards = pgTable("kanban_cards", {
  id: serial("id").primaryKey(),
  columnId: integer("column_id").notNull().references(() => kanbanColumns.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default(""),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  tags: text("tags").default("[]"), // Array stringificado
  dueDate: timestamp("due_date"),
  clientId: integer("client_id").references(() => clients.id),
  fileUrl: varchar("file_url", { length: 255 }),
  members: text("members").default("[]"), // Array de iniciais ou IDs
  isDone: boolean("is_done").default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const kanbanBoardsRelations = relations(kanbanBoards, ({ many }) => ({
  columns: many(kanbanColumns),
  boardMembers: many(kanbanBoardMembers),
}));

export const kanbanColumnsRelations = relations(kanbanColumns, ({ one, many }) => ({
  board: one(kanbanBoards, { fields: [kanbanColumns.boardId], references: [kanbanBoards.id] }),
  cards: many(kanbanCards),
}));

export const kanbanCardsRelations = relations(kanbanCards, ({ one }) => ({
  column: one(kanbanColumns, { fields: [kanbanCards.columnId], references: [kanbanColumns.id] }),
  client: one(clients, { fields: [kanbanCards.clientId], references: [clients.id] }),
}));

export const kanbanBoardMembers = pgTable("kanban_board_members", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id").notNull().references(() => kanbanBoards.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull().default("member"), // admin, member
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const kanbanBoardMembersRelations = relations(kanbanBoardMembers, ({ one }) => ({
  board: one(kanbanBoards, { fields: [kanbanBoardMembers.boardId], references: [kanbanBoards.id] }),
  user: one(users, { fields: [kanbanBoardMembers.userId], references: [users.id] }),
}));

export type KanbanBoard = typeof kanbanBoards.$inferSelect;
export type NewKanbanBoard = typeof kanbanBoards.$inferInsert;
export type KanbanColumn = typeof kanbanColumns.$inferSelect;
export type NewKanbanColumn = typeof kanbanColumns.$inferInsert;
export type KanbanCard = typeof kanbanCards.$inferSelect;
export type NewKanbanCard = typeof kanbanCards.$inferInsert;
