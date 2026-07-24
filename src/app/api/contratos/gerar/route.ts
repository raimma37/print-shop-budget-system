import { NextResponse } from "next/server";
import { db } from "@/db";
import { documentTemplates, contracts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { templateId, variables } = data;

    if (!templateId) {
      return NextResponse.json({ error: "ID do template é obrigatório." }, { status: 400 });
    }

    // 1. Carregar Template do BD
    const [template] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, templateId));
    
    if (!template) {
      return NextResponse.json({ error: "Template não encontrado." }, { status: 404 });
    }

    // 2. Ler arquivo DOCX base
    const templatePath = path.join(process.cwd(), "public", template.fileUrl);
    const content = await readFile(templatePath);

    // 3. Preparar Variáveis (Processador Lógico)
    const dataAtual = new Date();
    
    // Converter "07" para "Julho", etc
    const mesExtenso = format(dataAtual, "MMMM", { locale: ptBR });
    const mesFormatado = mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1);

    const mergedVariables = {
      ...variables,
      // Datas Automáticas Injetadas (Sobrescrevem se existirem no form, ou providenciam se faltarem)
      DIA: format(dataAtual, "dd"),
      MES: mesFormatado,
      ANO: format(dataAtual, "yyyy"),
      DATA_ATUAL: format(dataAtual, "dd/MM/yyyy"),
      DATA_EXTENSA: `${format(dataAtual, "dd")} de ${mesFormatado} de ${format(dataAtual, "yyyy")}`,
      LOCAL_E_DATA: `Belém - PA, ${format(dataAtual, "dd")} de ${mesFormatado} de ${format(dataAtual, "yyyy")}`
    };

    // 4. Executar Engine de Mesclagem
    const zip = new PizZip(content);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter() {
        return ""; // Se a tag não existir no JSON, retorna vazio
      }
    });

    doc.render(mergedVariables);

    const buf = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // 5. Salvar o novo arquivo
    const outputDir = path.join(process.cwd(), "public", "uploads", "contracts");
    try {
      await mkdir(outputDir, { recursive: true });
    } catch (e) {
      // Ignore
    }

    // Tentar extrair um identificador (ex: Nome do Locador, Cliente) das variáveis
    let identificador = "";
    const chavesPossiveis = ["LOCADOR", "NOME", "CONTRATANTE", "CLIENTE", "LOCATARIO", "LOCATÁRIO"];
    
    // Procura nas chaves em UPPERCASE ou normal
    for (const key of Object.keys(variables)) {
      if (chavesPossiveis.includes(key.toUpperCase()) && variables[key]) {
        identificador = variables[key].toString().trim();
        break;
      }
    }
    
    // Se não achou por chaves comuns, pega o primeiro valor de texto (provavelmente o primeiro campo preenchido, como um nome)
    if (!identificador && Object.keys(variables).length > 0) {
       const primeiroValor = Object.values(variables).find(v => typeof v === 'string' && v.length > 2 && v.length < 50);
       if (primeiroValor) {
           identificador = primeiroValor.toString().trim();
       }
    }

    const safeTemplateName = template.name.replace(/[^a-zA-Z0-9]/g, "_");
    const safeIdentificador = identificador ? "_" + identificador.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_") : "";
    
    const outputFilename = `${safeTemplateName}${safeIdentificador}-${Date.now()}.docx`;
    const outputPath = path.join(outputDir, outputFilename);
    const relativeUrl = `/uploads/contracts/${outputFilename}`;

    await writeFile(outputPath, buf);

    // 6. Salvar no Banco
    const [newContract] = await db
      .insert(contracts)
      .values({
        templateId: template.id,
        status: "gerado",
        fileUrl: relativeUrl,
        data: JSON.stringify(mergedVariables),
        createdBy: 1, // Fixando para simplificar. Na vida real pegamos do session Auth
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      fileUrl: relativeUrl,
      contract: newContract
    });

  } catch (error: any) {
    console.error("Erro na geração do contrato:", error);
    return NextResponse.json({ error: "Erro ao gerar o contrato: " + error.message }, { status: 500 });
  }
}
