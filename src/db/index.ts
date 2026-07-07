import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Neon serverless driver — otimizado para edge e serverless (sem pool persistente)
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
