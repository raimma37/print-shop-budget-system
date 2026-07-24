import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = path.extname(file.name);
    // Create a safe filename
    const filename = `${uuidv4()}${extension}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "kanban");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/kanban/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Erro no upload do arquivo:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
