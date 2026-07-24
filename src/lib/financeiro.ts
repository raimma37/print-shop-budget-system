import { db } from "@/db";
import { auditLog } from "@/db/schema";

const DEFAULT_USER_ID = 1;

export async function logAudit(
  action: string,
  entityType: string,
  entityId: number | null,
  details?: Record<string, unknown>,
  userId = DEFAULT_USER_ID
) {
  try {
    await db.insert(auditLog).values({
      action,
      entityType,
      entityId: entityId ?? undefined,
      userId,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `FAT-${y}${m}-${rand}`;
}
