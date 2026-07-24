import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("file");

    if (!fileUrl) {
      return new NextResponse("File parameter is missing", { status: 400 });
    }

    // Secure the path to prevent directory traversal
    const safePath = path.normalize(fileUrl).replace(/^(\.\.[\/\\])+/, '');
    
    // Check if it's within the uploads directory
    if (!safePath.startsWith("\\uploads") && !safePath.startsWith("/uploads")) {
      return new NextResponse("Unauthorized file path", { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", safePath);
    
    const fileBuffer = await readFile(filePath);

    const filename = path.basename(filePath);

    // Convert Buffer to Uint8Array to prevent Next.js from mangling binary data
    const uint8Array = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

    return new Response(uint8Array, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  } catch (error: any) {
    console.error("Error downloading file:", error);
    return new NextResponse("File not found or error occurred", { status: 404 });
  }
}
