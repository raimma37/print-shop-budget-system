import "dotenv/config";
import { db } from "./index";
import { users, clients, products, orcamentos, orcamentoItems } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Users ──────────────────────────────────────────────────────────────────
  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@grafika.com")).limit(1);
  if (existingAdmin.length > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("grafika123", 12);

  const [admin, vendedor1, vendedor2] = await db.insert(users).values([
    {
      name: "Admin Gráfica",
      email: "admin@grafika.com",
      passwordHash,
      role: "admin",
      avatarInitials: "AG",
      active: true,
    },
    {
      name: "Carlos Silva",
      email: "carlos@grafika.com",
      passwordHash,
      role: "vendedor",
      avatarInitials: "CS",
      active: true,
    },
    {
      name: "Fernanda Lima",
      email: "fernanda@grafika.com",
      passwordHash,
      role: "vendedor",
      avatarInitials: "FL",
      active: true,
    },
  ]).returning();

  console.log("✅ Users created");

  // ─── Clients ────────────────────────────────────────────────────────────────
  const insertedClients = await db.insert(clients).values([
    {
      name: "Construtora Horizonte Ltda",
      email: "compras@horizonte.com.br",
      phone: "(11) 3456-7890",
      cnpjCpf: "12.345.678/0001-90",
      address: "Av. Paulista, 1500 – Sala 304",
      city: "São Paulo",
      state: "SP",
      notes: "Preferência por entrega expressa.",
    },
    {
      name: "Supermercado BomPreço",
      email: "marketing@bompreco.com.br",
      phone: "(21) 2890-1234",
      cnpjCpf: "23.456.789/0001-01",
      address: "Rua das Flores, 200",
      city: "Rio de Janeiro",
      state: "RJ",
    },
    {
      name: "Clínica Vida Saudável",
      email: "recepcao@vidasaudavel.med.br",
      phone: "(31) 3322-5566",
      cnpjCpf: "34.567.890/0001-12",
      address: "Rua Saúde, 45",
      city: "Belo Horizonte",
      state: "MG",
    },
    {
      name: "Escola Futuro Brilhante",
      email: "diretoria@futurobrilhante.edu.br",
      phone: "(41) 3111-2222",
      cnpjCpf: "45.678.901/0001-23",
      address: "Av. Educação, 1000",
      city: "Curitiba",
      state: "PR",
    },
    {
      name: "Academia Power Fit",
      email: "secretaria@powerfit.com.br",
      phone: "(51) 3000-4444",
      cnpjCpf: "56.789.012/0001-34",
      address: "Rua do Esporte, 300",
      city: "Porto Alegre",
      state: "RS",
    },
    {
      name: "Restaurante Sabor Mineiro",
      email: "contato@sabormineiro.com.br",
      phone: "(34) 3210-5678",
      cnpjCpf: "67.890.123/0001-45",
      address: "Praça Central, 10",
      city: "Uberlândia",
      state: "MG",
    },
    {
      name: "Farmácia Saúde Total",
      email: "gerencia@saudetotal.com",
      phone: "(85) 3222-9999",
      cnpjCpf: "78.901.234/0001-56",
      address: "Av. Beira Mar, 500",
      city: "Fortaleza",
      state: "CE",
    },
    {
      name: "João Pedro Almeida",
      email: "joao.almeida@gmail.com",
      phone: "(11) 98765-4321",
      cnpjCpf: "123.456.789-00",
      city: "São Paulo",
      state: "SP",
      notes: "Cliente autônomo – gráfico designer.",
    },
  ]).returning();

  console.log("✅ Clients created");

  // ─── Products ────────────────────────────────────────────────────────────────
  const insertedProducts = await db.insert(products).values([
    { name: "Banner Lona 440g", description: "Impressão em lona 440g com acabamento em ilhós", category: "Banners & Lonas", unit: "m²", basePrice: "45.00" },
    { name: "Faixa Lona 440g", description: "Faixa em lona 440g, impressão digital UV", category: "Banners & Lonas", unit: "m²", basePrice: "40.00" },
    { name: "Adesivo Vinil Recortado", description: "Adesivo em vinil plotado recortado", category: "Adesivos & Vinil", unit: "m²", basePrice: "55.00" },
    { name: "Adesivo Vinil Impresso", description: "Adesivo em vinil com impressão digital", category: "Adesivos & Vinil", unit: "m²", basePrice: "65.00" },
    { name: "Placa ACM 3mm", description: "Placa em ACM 3mm com impressão UV", category: "Placas & Painéis", unit: "m²", basePrice: "180.00" },
    { name: "Placa PVC 3mm", description: "Placa em PVC 3mm com impressão digital", category: "Placas & Painéis", unit: "m²", basePrice: "80.00" },
    { name: "Placa Forex 5mm", description: "Placa em Forex 5mm com impressão UV", category: "Placas & Painéis", unit: "m²", basePrice: "120.00" },
    { name: "Letreiro em Acrílico", description: "Letras e letreiro em acrílico recortado e iluminado", category: "Letreiros & Fachadas", unit: "un", basePrice: "350.00" },
    { name: "Totem Personalizado", description: "Totem de comunicação com impressão personalizada", category: "Totens & Displays", unit: "un", basePrice: "480.00" },
    { name: "Display de Chão", description: "Display de chão em PVC com pé de metal", category: "Totens & Displays", unit: "un", basePrice: "220.00" },
    { name: "Cartão de Visita", description: "Cartão de visita 4x4 em couchê 300g – 1000 un", category: "Papelaria", unit: "mil", basePrice: "85.00" },
    { name: "Flyer A5", description: "Flyer A5 em couchê 115g – 4x4 – 1000 un", category: "Papelaria", unit: "mil", basePrice: "120.00" },
    { name: "Folder A4 dobrado", description: "Folder A4 dobrado em couchê 150g – 4x4", category: "Papelaria", unit: "mil", basePrice: "280.00" },
    { name: "Roll-Up 85x200", description: "Roll-up 85x200cm com suporte e case", category: "Totens & Displays", unit: "un", basePrice: "290.00" },
    { name: "Backdrop/Painel Pop-Up", description: "Painel pop-up tensionado 3x2m com impressão", category: "Banners & Lonas", unit: "un", basePrice: "850.00" },
    { name: "Instalação", description: "Serviço de instalação de materiais no local", category: "Serviços", unit: "h", basePrice: "120.00" },
    { name: "Arte e Criação", description: "Criação de arte e layout para peças gráficas", category: "Serviços", unit: "h", basePrice: "150.00" },
    { name: "Envelopamento de Veículo", description: "Envelopamento total ou parcial de veículo", category: "Adesivos & Vinil", unit: "un", basePrice: "1200.00" },
  ]).returning();

  console.log("✅ Products created");

  // ─── Orcamentos ─────────────────────────────────────────────────────────────
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fifteenDaysLater = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const orc1 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0001",
    clientId: insertedClients[0].id,
    userId: admin.id,
    status: "aprovado",
    validUntil: thirtyDaysLater,
    subtotal: "4500.00",
    discount: "225.00",
    total: "4275.00",
    notes: "Entregar na obra até sexta-feira.",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc1[0].id,
      productId: insertedProducts[0].id,
      description: "Banner Lona 440g – Construtora Horizonte",
      quantity: "20",
      unit: "m²",
      unitPrice: "45.00",
      discount: "0",
      total: "900.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc1[0].id,
      productId: insertedProducts[4].id,
      description: "Placa ACM 3mm – Fachada principal",
      quantity: "20",
      unit: "m²",
      unitPrice: "180.00",
      discount: "5",
      total: "3420.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc1[0].id,
      productId: insertedProducts[15].id,
      description: "Instalação no local",
      quantity: "2",
      unit: "h",
      unitPrice: "120.00",
      discount: "0",
      total: "240.00",
      sortOrder: 3,
    },
  ]);

  const orc2 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0002",
    clientId: insertedClients[1].id,
    userId: vendedor1.id,
    status: "enviado",
    validUntil: fifteenDaysLater,
    subtotal: "2400.00",
    discount: "0",
    total: "2400.00",
    notes: "Arte a ser aprovada antes da impressão.",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc2[0].id,
      productId: insertedProducts[11].id,
      description: "Flyer A5 – Promoção de verão",
      quantity: "10",
      unit: "mil",
      unitPrice: "120.00",
      discount: "0",
      total: "1200.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc2[0].id,
      productId: insertedProducts[1].id,
      description: "Faixa lona para entrada da loja",
      quantity: "15",
      unit: "m²",
      unitPrice: "40.00",
      discount: "0",
      total: "600.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc2[0].id,
      productId: insertedProducts[9].id,
      description: "Display de chão – PDV",
      quantity: "2",
      unit: "un",
      unitPrice: "220.00",
      discount: "0",
      total: "440.00",
      sortOrder: 3,
    },
    {
      orcamentoId: orc2[0].id,
      productId: insertedProducts[16].id,
      description: "Arte e criação dos materiais",
      quantity: "1",
      unit: "h",
      unitPrice: "160.00",
      discount: "0",
      total: "160.00",
      sortOrder: 4,
    },
  ]);

  const orc3 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0003",
    clientId: insertedClients[2].id,
    userId: vendedor2.id,
    status: "aprovado",
    validUntil: thirtyDaysLater,
    subtotal: "1680.00",
    discount: "168.00",
    total: "1512.00",
    notes: "Placa para recepção e painel externo.",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc3[0].id,
      productId: insertedProducts[5].id,
      description: "Placa PVC 3mm – Recepção",
      quantity: "8",
      unit: "m²",
      unitPrice: "80.00",
      discount: "10",
      total: "576.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc3[0].id,
      productId: insertedProducts[6].id,
      description: "Placa Forex 5mm – Painel externo",
      quantity: "8",
      unit: "m²",
      unitPrice: "120.00",
      discount: "10",
      total: "864.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc3[0].id,
      productId: insertedProducts[15].id,
      description: "Instalação",
      quantity: "2",
      unit: "h",
      unitPrice: "120.00",
      discount: "10",
      total: "216.00",
      sortOrder: 3,
    },
  ]);

  const orc4 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0004",
    clientId: insertedClients[3].id,
    userId: vendedor1.id,
    status: "rascunho",
    validUntil: thirtyDaysLater,
    subtotal: "3200.00",
    discount: "0",
    total: "3200.00",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc4[0].id,
      productId: insertedProducts[13].id,
      description: "Roll-Up para eventos",
      quantity: "4",
      unit: "un",
      unitPrice: "290.00",
      discount: "0",
      total: "1160.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc4[0].id,
      productId: insertedProducts[14].id,
      description: "Backdrop 3x2m",
      quantity: "2",
      unit: "un",
      unitPrice: "850.00",
      discount: "0",
      total: "1700.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc4[0].id,
      productId: insertedProducts[16].id,
      description: "Arte personalizada",
      quantity: "2",
      unit: "h",
      unitPrice: "170.00",
      discount: "0",
      total: "340.00",
      sortOrder: 3,
    },
  ]);

  const orc5 = await db.insert(orcamentos).values({
    numero: "ORC-202412-0089",
    clientId: insertedClients[4].id,
    userId: admin.id,
    status: "reprovado",
    validUntil: threeDaysAgo,
    subtotal: "980.00",
    discount: "0",
    total: "980.00",
    notes: "Cliente optou por outra solução.",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc5[0].id,
      productId: insertedProducts[2].id,
      description: "Adesivo vinil recortado – Logo",
      quantity: "10",
      unit: "m²",
      unitPrice: "55.00",
      discount: "0",
      total: "550.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc5[0].id,
      productId: insertedProducts[3].id,
      description: "Adesivo vinil impresso – parede",
      quantity: "6",
      unit: "m²",
      unitPrice: "65.00",
      discount: "0",
      total: "390.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc5[0].id,
      productId: insertedProducts[16].id,
      description: "Arte",
      quantity: "0.27",
      unit: "h",
      unitPrice: "150.00",
      discount: "0",
      total: "40.00",
      sortOrder: 3,
    },
  ]);

  const orc6 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0005",
    clientId: insertedClients[5].id,
    userId: vendedor2.id,
    status: "enviado",
    validUntil: fifteenDaysLater,
    subtotal: "6240.00",
    discount: "624.00",
    total: "5616.00",
    notes: "Envelopamento + placas internas.",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc6[0].id,
      productId: insertedProducts[17].id,
      description: "Envelopamento veículo de entrega",
      quantity: "1",
      unit: "un",
      unitPrice: "1200.00",
      discount: "10",
      total: "1080.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc6[0].id,
      productId: insertedProducts[4].id,
      description: "Placa ACM fachada restaurante",
      quantity: "25",
      unit: "m²",
      unitPrice: "180.00",
      discount: "10",
      total: "4050.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc6[0].id,
      productId: insertedProducts[15].id,
      description: "Instalação completa",
      quantity: "4",
      unit: "h",
      unitPrice: "120.00",
      discount: "10",
      total: "432.00",
      sortOrder: 3,
    },
    {
      orcamentoId: orc6[0].id,
      productId: insertedProducts[16].id,
      description: "Arte e diagramação",
      quantity: "1",
      unit: "h",
      unitPrice: "150.00",
      discount: "10",
      total: "135.00",
      sortOrder: 4,
    },
  ]);

  const orc7 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0006",
    clientId: insertedClients[6].id,
    userId: vendedor1.id,
    status: "aprovado",
    validUntil: thirtyDaysLater,
    subtotal: "1870.00",
    discount: "0",
    total: "1870.00",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc7[0].id,
      productId: insertedProducts[7].id,
      description: "Letreiro em Acrílico – Fachada",
      quantity: "3",
      unit: "un",
      unitPrice: "350.00",
      discount: "0",
      total: "1050.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc7[0].id,
      productId: insertedProducts[2].id,
      description: "Adesivos recortados para vitrine",
      quantity: "8",
      unit: "m²",
      unitPrice: "55.00",
      discount: "0",
      total: "440.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc7[0].id,
      productId: insertedProducts[9].id,
      description: "Display de chão",
      quantity: "1",
      unit: "un",
      unitPrice: "220.00",
      discount: "0",
      total: "220.00",
      sortOrder: 3,
    },
    {
      orcamentoId: orc7[0].id,
      productId: insertedProducts[16].id,
      description: "Arte",
      quantity: "1",
      unit: "h",
      unitPrice: "160.00",
      discount: "0",
      total: "160.00",
      sortOrder: 4,
    },
  ]);

  const orc8 = await db.insert(orcamentos).values({
    numero: "ORC-202501-0007",
    clientId: insertedClients[7].id,
    userId: vendedor2.id,
    status: "rascunho",
    validUntil: thirtyDaysLater,
    subtotal: "750.00",
    discount: "0",
    total: "750.00",
  }).returning();

  await db.insert(orcamentoItems).values([
    {
      orcamentoId: orc8[0].id,
      productId: insertedProducts[10].id,
      description: "Cartão de visita 4x4",
      quantity: "5",
      unit: "mil",
      unitPrice: "85.00",
      discount: "0",
      total: "425.00",
      sortOrder: 1,
    },
    {
      orcamentoId: orc8[0].id,
      productId: insertedProducts[12].id,
      description: "Folder A4 dobrado",
      quantity: "1",
      unit: "mil",
      unitPrice: "280.00",
      discount: "0",
      total: "280.00",
      sortOrder: 2,
    },
    {
      orcamentoId: orc8[0].id,
      productId: insertedProducts[16].id,
      description: "Arte",
      quantity: "0.3",
      unit: "h",
      unitPrice: "150.00",
      discount: "0",
      total: "45.00",
      sortOrder: 3,
    },
  ]);

  console.log("✅ Orçamentos created");
  console.log("🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   admin@grafika.com  / grafika123  (Admin)");
  console.log("   carlos@grafika.com / grafika123  (Vendedor)");
  console.log("   fernanda@grafika.com / grafika123 (Vendedor)");
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
