import { NextResponse } from "next/server";
import { db } from "@/db";
import { documentTemplates } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import PizZip from "pizzip";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;

    if (!file || !name) {
      return NextResponse.json({ error: "Arquivo e nome são obrigatórios." }, { status: 400 });
    }

    if (!file.name.endsWith(".docx")) {
      return NextResponse.json({ error: "Formato inválido. Envie um arquivo .docx" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extrair tags usando PizZip para ler o XML interno
    let tags: string[] = [];
    try {
      const zip = new PizZip(buffer);
      const docXml = zip.file("word/document.xml")?.asText() || "";
      // Limpar tags XML que podem estar quebrando as chaves { TAG }
      // O Word costuma colocar <w:t> no meio das chaves
      const cleanText = docXml.replace(/<[^>]+>/g, ""); 
      
      // Encontrar tudo entre {}
      const matches = cleanText.match(/\{([^}]+)\}/g);
      if (matches) {
        // Remover as chaves e limpar espaços extras
        tags = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, "").trim())));
      }
    } catch (e) {
      console.error("Erro ao fazer parse do DOCX:", e);
      return NextResponse.json({ error: "Erro ao ler o documento DOCX. Verifique se o arquivo é válido." }, { status: 400 });
    }

    // Criar diretório se não existir
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "templates");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // ignore se já existir
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const filepath = path.join(uploadsDir, filename);

    // Salvar arquivo
    await writeFile(filepath, buffer);

    // Salvar no BD
    const relativePath = `/uploads/templates/${filename}`;
    const [newTemplate] = await db
      .insert(documentTemplates)
      .values({
        name,
        fileUrl: relativePath,
        requiredTags: JSON.stringify(tags),
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      template: newTemplate,
      tagsCount: tags.length
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
