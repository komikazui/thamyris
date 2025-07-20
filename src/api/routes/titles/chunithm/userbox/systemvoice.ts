import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson, validateParams } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

interface SystemVoiceItem {
	id: number;
	label: string;
	imagePath: string;
	locked: boolean;
}

const SearchRequestSchema = z.object({
	filter: z.object({
		locked: z.boolean().nullable(),
	}),
	pagination: z.object({
		page: z.number().min(1),
		limit: z.number().min(1).max(100),
	}),
});

const EquipRequestSchema = z.object({
	systemVoiceId: z.number(),
});

async function getCurrentSystemVoice(userId: number, version: number): Promise<SystemVoiceItem | null> {
	const result = await db.select<SystemVoiceItem>(
		`
		SELECT DISTINCT
			csv.id,
			csv.str as label,
			CASE 
				WHEN csv.netOpenName IS NOT NULL AND csv.netOpenName != '' 
				THEN csv.netOpenName 
				ELSE CONCAT('CHU_UI_SystemVoice_', LPAD(csv.id, 6, '0'))
			END as imagePath,
			CASE 
				WHEN usp.systemVoiceId IS NOT NULL THEN 0
				ELSE 1 
			END as locked
		FROM chuni_static_systemvoice csv
		INNER JOIN chuni_profile_data cpd ON cpd.user = ? AND cpd.systemVoiceId = csv.id
		LEFT JOIN chuni_user_systemvoice_possession usp ON usp.user = cpd.user AND usp.systemVoiceId = csv.id
		WHERE cpd.version = ? 
		LIMIT 1
		`,
		[userId, version]
	);

	return result.length > 0 ? result[0] : null;
}

const routes = new Hono()
	// Get current equipped systemvoice
	.get("", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const result = await getCurrentSystemVoice(userId, version);
			if (!result) {
				// Return default system voice if none found
				return c.json({
					id: 1,
					label: "Default",
					imagePath: "CHU_UI_SystemVoice_000001",
					locked: false,
				});
			}

			return c.json(result);
		} catch (error) {
			throw rethrowWithMessage("Failed to fetch current systemvoice", error);
		}
	})

	// Equip systemvoice
	.post("", validateJson(EquipRequestSchema), async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;
			const { systemVoiceId } = await c.req.json();

			// Check if user owns this systemvoice (ID 1 is always available)
			if (systemVoiceId !== 1) {
				const ownershipResult = await db.select(
					`
					SELECT 1
					FROM chuni_user_systemvoice_possession
					WHERE user = ? AND systemVoiceId = ?
					`,
					[userId, systemVoiceId]
				);

				if (ownershipResult.length === 0) {
					throw new HTTPException(403, {
						message: "You don't own this systemvoice",
					});
				}
			}

			// Update profile with new systemvoice
			const result = await db.update(
				`
				UPDATE chuni_profile_data 
				SET systemVoiceId = ?
				WHERE user = ? AND version = ?
				`,
				[systemVoiceId, userId, version]
			);

			if (result.affectedRows === 0) {
				throw new HTTPException(404, {
					message: "Profile not found",
				});
			}

			// Return updated systemvoice
			const updatedSystemVoice = await getCurrentSystemVoice(userId, version);
			return c.json(updatedSystemVoice);
		} catch (error) {
			throw rethrowWithMessage("Failed to equip systemvoice", error);
		}
	})

	// Search systemvoices
	.post("search", validateJson(SearchRequestSchema), async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;
			const { filter, pagination } = await c.req.json();

			const offset = (pagination.page - 1) * pagination.limit;

			let whereClause = "WHERE 1=1";
			const params: any[] = [userId];

			if (filter.locked === true) {
				whereClause += " AND usp.systemVoiceId IS NULL AND csv.id != 1";
			} else if (filter.locked === false) {
				whereClause += " AND (usp.systemVoiceId IS NOT NULL OR csv.id = 1)";
			}

			// Get total count
			const countResult = await db.select<{ total: number }>(
				`
				SELECT COUNT(DISTINCT csv.id) as total
				FROM chuni_static_systemvoice csv
				LEFT JOIN chuni_user_systemvoice_possession usp ON usp.user = ? AND usp.systemVoiceId = csv.id
				${whereClause}
				`,
				params
			);

			const total = countResult.length > 0 ? countResult[0].total : 0;

			// Get paginated results
			const results = await db.select<SystemVoiceItem & { sort_current: number; total_count: number }>(
				`
				SELECT DISTINCT
					csv.id,
					csv.str as label,
					CASE 
						WHEN csv.netOpenName IS NOT NULL AND csv.netOpenName != '' 
						THEN csv.netOpenName 
						ELSE CONCAT('CHU_UI_SystemVoice_', LPAD(csv.id, 6, '0'))
					END as imagePath,
					CASE 
						WHEN usp.systemVoiceId IS NOT NULL OR csv.id = 1 THEN 0
						ELSE 1
					END as locked,
					CASE 
						WHEN cpd.systemVoiceId = csv.id THEN 0
						ELSE 1
					END as sort_current,
					COUNT(*) OVER() as total_count
				FROM chuni_static_systemvoice csv
				LEFT JOIN chuni_user_systemvoice_possession usp ON usp.user = ? AND usp.systemVoiceId = csv.id
				LEFT JOIN chuni_profile_data cpd ON cpd.user = ? AND cpd.version = ?
				${whereClause}
				ORDER BY 
					sort_current ASC,
					locked ASC,
					csv.sortName ASC,
					csv.id ASC
				LIMIT ? OFFSET ?
				`,
				[...params, userId, version, pagination.limit, offset]
			);

			const items = results.map(({ sort_current, total_count, ...item }) => ({
				...item,
				locked: Boolean(item.locked),
			}));

			const totalPages = Math.ceil(total / pagination.limit);

			return c.json({
				items,
				pagination: {
					page: pagination.page,
					limit: pagination.limit,
					total,
					totalPages,
					hasNext: pagination.page < totalPages,
					hasPrev: pagination.page > 1,
				},
			});
		} catch (error) {
			throw rethrowWithMessage("Failed to search systemvoices", error);
		}
	})

	// Unlock systemvoice
	.patch(
		"unlock/:id",
		validateParams(
			z.object({
				id: z
					.string()
					.transform((val) => parseInt(val))
					.refine((val) => !isNaN(val), {
						message: "Invalid systemvoice ID",
					}),
			})
		),
		async (c) => {
			try {
				const { userId } = c.payload;
				const { id } = c.req.param();

				// Check if systemvoice exists
				const systemvoiceResult = await db.select(
					`
				SELECT id FROM chuni_static_systemvoice WHERE id = ?
				`,
					[id]
				);

				if (systemvoiceResult.length === 0) {
					throw new HTTPException(404, {
						message: "Systemvoice not found",
					});
				}

				// Check if already owned
				const ownershipResult = await db.select(
					`
				SELECT 1 FROM chuni_user_systemvoice_possession WHERE user = ? AND systemVoiceId = ?
				`,
					[userId, id]
				);

				if (ownershipResult.length > 0) {
					throw new HTTPException(400, {
						message: "You already own this systemvoice",
					});
				}

				// Add to user's possession
				await db.query(
					`
				INSERT INTO chuni_user_systemvoice_possession (user, systemVoiceId)
				VALUES (?, ?)
				`,
					[userId, id]
				);

				return c.json({ message: "Systemvoice unlocked successfully" });
			} catch (error) {
				throw rethrowWithMessage("Failed to unlock systemvoice", error);
			}
		}
	);

export default routes;
