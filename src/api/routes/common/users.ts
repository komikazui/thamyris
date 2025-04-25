import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "@/api/db";
import { UserRole } from "@/api/types/enums";
import { rethrowWithMessage } from "@/api/utils/error";
import { validateJson } from "@/api/middleware/validator";
import { z } from "zod";

const UserRoutes = new Hono().post("/verify", async (c) => {
	// The JWT middleware will have already verified the token
	// and added the payload to the context
	return c.json(c.payload);
})


  .post(
	"/role/update",
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
export { UserRoutes };
