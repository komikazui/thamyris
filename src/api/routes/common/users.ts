import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "@/api/db";
import { UserRole } from "@/api/types/enums";
import { rethrowWithMessage } from "@/api/utils/error";
import { validateJson } from "@/api/middleware/validator";
import { z } from "zod";

const UserRoutes = new Hono()
  .post("/verify", async (c) => {
    try {
      return c.json(c.payload);
    } catch (error) {
      throw rethrowWithMessage("Failed to verify user", error);
    }
  })


  .get("/roles", async (c) => {
	try {
	  const { userId } = c.payload;
	  if (!userId) throw new HTTPException(403);
  
	  const rows = await db.select<{ key: string; value: number }>(
		"SELECT `key`, value FROM daphnis_user_option WHERE user = ? AND `key` IN ('has_upload', 'has_download', 'has_special')",
		[userId]
	  );
  
	  // Default all roles to false
	  const roles = { upload: false, download: false, special: false };
	  for (const row of rows) {
		if (row.key === "has_upload" && row.value === 1) roles.upload = true;
		if (row.key === "has_download" && row.value === 1) roles.download = true;
		if (row.key === "has_special" && row.value === 1) roles.special = true;
	  }
  
	  return c.json({ userId, roles });
	} catch (error) {
	  throw rethrowWithMessage("Failed to get user roles", error);
	}
  })
  .post(
    "/role/update",
    validateJson(
      z.object({
        userId: z.number().min(1),
        role: z.enum(["upload", "download", "special"]),
        value: z.number().min(0).max(1),
      })
    ),
    async (c) => {
      try {
        const { userId: adminId, permissions } = c.payload;
        const { userId, role, value } = await c.req.json();

        if (!adminId || permissions !== UserRole.Admin) {
          throw new HTTPException(403);
        }

        const roleKeys: Record<string, string> = {
          upload: "has_upload",
          download: "has_download",
          special: "has_special",
        };

        const roleKey = roleKeys[role];
        if (!roleKey) {
          throw new HTTPException(400, { message: "Invalid role specified" });
        }

        const result = await db.update(
          `UPDATE daphnis_user_option 
          SET value = ? 
          WHERE user = ? AND \`key\` = ?`,
          [value, userId, roleKey]
        );

        if (result.affectedRows === 0) {
          await db.query(
            `INSERT INTO daphnis_user_option (user, \`key\`, value) 
            VALUES (?, ?, ?)`,
            [userId, roleKey, value]
          );
        }

        return c.json({ success: true });
      } catch (error) {
        throw rethrowWithMessage("Failed to update user role", error);
      }
    }
  );

export { UserRoutes };
