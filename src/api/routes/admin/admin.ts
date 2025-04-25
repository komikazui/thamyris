import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "@/api/db";
import { UserRole } from "@/api/types/enums";
import { rethrowWithMessage } from "@/api/utils/error";
import { validateJson } from "@/api/middleware/validator";
import { z } from "zod";

const AdminRoutes = new Hono()
.get("/roles", async (c) => {
    try {
      const { userId, permissions } = c.payload;
      
      if (!userId) {
        throw new HTTPException(403);
      }
      
      const roles = {
        hasAdminPerms: permissions === UserRole.Admin,
        hasSpecialPerms: permissions === UserRole.Special,
        hasDownloadPerms: permissions === UserRole.Downloads
      };
      
      return c.json(roles);
    } catch (error) {
      throw rethrowWithMessage("Failed to check user roles", error);
    }
  })

  .get("/user/roles", async (c) => {
    try {
      const { userId } = c.payload
      if (!userId) {
        throw new HTTPException(400, { message: "Missing userId" });
      }
  
      const roles = await db.query(
        `SELECT \`key\`, value FROM daphnis_user_option WHERE user = ?`,
        [userId]
      );
  
      const roleMap: Record<string, number> = {};
      for (const row of roles) {
        roleMap[row.key] = row.value;
      }
  
      return c.json({ roles: roleMap });
    } catch (error) {
      throw rethrowWithMessage("Failed to get user roles", error);
    }
  })



  .post(
    "/user/role/update",
    validateJson(z.object({
        userId: z.number().min(1),
        role: z.enum(['upload', 'download', 'special']),
        value: z.number().min(0).max(1) 
    })),
    async (c) => {
        try {
            const { userId: adminId, permissions } = c.payload;
            const { userId, role, value } = await c.req.json();

            if (!adminId || permissions !== UserRole.Admin) {
                throw new HTTPException(403);
            }

            const roleKeys: Record<string, string> = {
                'upload': 'has_upload',
                'download': 'has_download',
                'special': 'has_special',
                'none': 'none'
            };

            const roleKey = roleKeys[role];
            if (!roleKey) {
                throw new HTTPException(400, { message: "Invalid role specified" });
            }

            // Try to update the option first
            const result = await db.update(
                `UPDATE daphnis_user_option 
                SET value = ? 
                WHERE user = ? AND \`key\` = ?`,
                [value, userId, roleKey]
            );

            if (result.affectedRows === 0) {
                // If no row was updated, insert a new option
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
  )


	.post("/keychip/generate", async (c) => {
		try {
			const { userId, permissions } = c.payload;

			const body = await c.req.json();
			const { arcade_nickname, name, game, namcopcbid, aimecard } = body;

			if (!userId || permissions !== UserRole.Admin) {
				throw new HTTPException(403);
			}

			const existingArcade = await db.query(
				`SELECT id 
				FROM arcade 
				WHERE name = ? 
				AND nickname = ?`,
				[name, arcade_nickname]
			);

			if (existingArcade[0]) {
				throw new HTTPException(400);
			}

			// Generate serial ID based on game type
			const serialId = game === "SDEW" ? namcopcbid : aimecard;
			if (!serialId) {
				throw new HTTPException(400);
			}

			const existingMachine = await db.query(
				`SELECT id 
				FROM machine 
				WHERE serial = ?`,
				[serialId]
			);

			if (existingMachine[0]) {
				throw new HTTPException(400);
			}

			// Create new arcade
			const result = await db.query(
				`INSERT INTO arcade (name, nickname) 
				VALUES (?, ?)`,
				[name, arcade_nickname]
			);

			const arcadeId = result.insertId;

			await db.query(
				`INSERT INTO arcade_owner (user, arcade, permissions) 
				VALUES (?, ?, ?)`,
				[userId, arcadeId, 1]
			);

			await db.query(
				`INSERT INTO machine (arcade, serial, game) 
				VALUES (?, ?, ?)`,
				[arcadeId, serialId, game === "SDEW" ? game : null]
			);

			return c.json({ success: true, arcadeId });
		} catch (error) {
			throw rethrowWithMessage("Failed to generate keychip", error);
		}
	});

export { AdminRoutes };
