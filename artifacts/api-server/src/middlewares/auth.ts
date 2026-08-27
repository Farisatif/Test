import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

type AuthenticatedRequest = Request & { userId?: string };

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.userId = userId;
  next();
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const role =
    (auth?.sessionClaims?.metadata as { role?: string } | undefined)?.role ??
    (auth?.sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;

  if (!auth?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  req.userId = auth.userId;
  next();
}