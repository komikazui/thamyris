import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "@/api/db";
import { UserRole } from "@/api/types/enums";
import { rethrowWithMessage } from "@/api/utils/error";
import { validateJson } from "@/api/middleware/validator";
import { z } from "zod";

enum PermissionType {
  Upload = "has_upload",
  Download = "has_download",
  Special = "has_special"
}

enum PermissionValue {
  Disabled = 0,
  Enabled = 1
}

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
      const userId = c.payload.userId;
      if (!userId) throw new HTTPException(403);

      const rows = await db.select<{ key: string; value: number }>(
        "SELECT `key`, value FROM daphnis_user_option WHERE user = ? AND `key` IN ('has_upload', 'has_download', 'has_special')",
        [userId]
      );

      // Initialize with default values (all disabled)
      const roles = {
        upload: PermissionValue.Disabled,
        download: PermissionValue.Disabled,
        special: PermissionValue.Disabled
      };

      // Assign the actual values from database
      for (const row of rows) {
        if (row.key === PermissionType.Upload) roles.upload = row.value;
        if (row.key === PermissionType.Download) roles.download = row.value;
        if (row.key === PermissionType.Special) roles.special = row.value;
      }

      return c.json(roles);
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

        const roles: Record<string, PermissionType> = {
          "upload": PermissionType.Upload,
          "download": PermissionType.Download,
          "special": PermissionType.Special,
        };

        const permissionKey = roles[role];
        if (!permissionKey) {
          throw new HTTPException(400, { message: "Invalid role specified" });
        }

        if (value !== PermissionValue.Disabled && value !== PermissionValue.Enabled) {
          throw new HTTPException(400, { message: "Invalid permission value" });
        }

        const result = await db.update(
          `UPDATE daphnis_user_option
           SET value = ?
           WHERE user = ? AND \`key\` = ?`,
          [value, userId, permissionKey]
        );

        if (result.affectedRows === 0) {
          await db.query(
            `INSERT INTO daphnis_user_option (user, \`key\`, value)
             VALUES (?, ?, ?)`,
            [userId, permissionKey, value]
          );
        }

        return c.json({ success: true });
      } catch (error) {
        throw rethrowWithMessage("Failed to update user role", error);
      }
    }
  );

export { UserRoutes};