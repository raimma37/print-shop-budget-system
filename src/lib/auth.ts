import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined. Please set it in your .env file.");
  }
  return new TextEncoder().encode(secret);
};

const COOKIE_NAME = "grafika_session";
const SESSION_DURATION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.insert(sessions).values({ id: sessionId, userId, expiresAt });

  const token = await new SignJWT({ sessionId, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .setIssuedAt()
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession(): Promise<{ userId: number; name: string; email: string; role: string; avatarInitials: string | null } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getJwtSecret());
    const sessionId = payload.sessionId as string;

    const [row] = await db
      .select({
        userId: sessions.userId,
        expiresAt: sessions.expiresAt,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarInitials: users.avatarInitials,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!row) return null;

    return {
      userId: row.userId,
      name: row.name,
      email: row.email,
      role: row.role,
      avatarInitials: row.avatarInitials,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const { payload } = await jwtVerify(token, getJwtSecret());
      const sessionId = payload.sessionId as string;
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
  } catch {
    // ignore errors on logout
  }
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(role: "admin" | "vendedor" | "viewer") {
  const session = await requireAuth();
  const hierarchy: Record<string, number> = { viewer: 0, vendedor: 1, admin: 2 };
  if ((hierarchy[session.role] ?? -1) < (hierarchy[role] ?? 99)) {
    throw new Error("Forbidden");
  }
  return session;
}
