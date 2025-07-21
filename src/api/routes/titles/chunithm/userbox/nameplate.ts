import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson, validateParams } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

interface NameplateItem {
	id: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

async function getCurrentNameplate(userId: number, version: number): Promise<NameplateItem[]> {
	const result = await db.select<NameplateItem>(
		`
        SELECT 
          dsn.nameplateId AS id,
          dsn.imagePath,
          dsn.name AS label,
          CASE
              WHEN cii.user IS NULL THEN 1
              ELSE 0
          END AS locked
        FROM chuni_profile_data cpd
        JOIN daphnis_static_nameplate dsn 
            ON dsn.nameplateId = cpd.nameplateId
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = dsn.nameplateId 
          AND cii.user = ?
          AND cii.itemKind = 1
        WHERE cpd.user = ? 
          AND cpd.version = ?
      `,
		[userId, userId, version]
	);
	return result;
}

const routes = new Hono()
	.get("", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const result = await getCurrentNameplate(userId, version);
			if (result.length === 0) {
				throw new HTTPException(404, {
					message: "Current nameplate not found",
				});
			}
			return c.json(result[0]);
		} catch (error) {
			throw rethrowWithMessage("Failed to get current nameplate", error);
		}
	})
	.post(
		"",
		validateJson(
			z.object({
				nameplateId: z.number().int().positive(),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;
				const { nameplateId } = await c.req.json();

				// Verify user owns the nameplate
				const ownership = await db.select(
					`SELECT 1 FROM chuni_item_item 
           WHERE user = ? AND itemId = ? AND itemKind = 1`,
					[userId, nameplateId]
				);

				if (ownership.length === 0) {
					throw new HTTPException(400, {
						message: "You don't own this nameplate",
					});
				}

				// Update profile
				await db.query(
					`UPDATE chuni_profile_data 
           SET nameplateId = ?
           WHERE user = ? AND version = ?`,
					[nameplateId, userId, version]
				);

				return c.json({ success: true });
			} catch (error) {
				throw rethrowWithMessage("Failed to update nameplate", error);
			}
		}
	)
	.post(
		"search",
		validateJson(
			z.object({
				filter: z.object({
					locked: z.boolean().nullable(),
				}),
				pagination: z.object({
					page: z.number().int().min(1).default(1),
					limit: z.number().int().min(1).max(100).default(18),
				}),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;

				const { filter, pagination } = await c.req.json();
				const { locked } = filter;
				const { page, limit } = pagination;

				const offset = (page - 1) * limit;

				let whereClause = "WHERE dsn.version = ?";
				const params = [version];

				if (locked === true) {
					whereClause += " AND cii.user IS NULL";
				} else if (locked === false) {
					whereClause += " AND cii.user IS NOT NULL";
				}

				const query = `
        SELECT
            dsn.nameplateId AS id,
            dsn.imagePath,
            dsn.name AS label,
            CASE
                WHEN cii.user IS NULL THEN 1
                ELSE 0
            END AS locked,
            CASE
                WHEN cpd.nameplateId = dsn.nameplateId THEN 1
                ELSE 0
            END AS equipped,
            COUNT(*) OVER() AS total_count
        FROM daphnis_static_nameplate dsn
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = dsn.nameplateId 
          AND cii.user = ?
          AND cii.itemKind = 1
        LEFT JOIN chuni_profile_data cpd 
            ON cpd.user = ? 
          AND cpd.version = ?
          AND cpd.nameplateId = dsn.nameplateId
        ${whereClause}
        ORDER BY 
            equipped DESC,
            locked ASC,
            dsn.sortName ASC,
            dsn.nameplateId ASC
        LIMIT ? OFFSET ?
      `;

				params.unshift(userId, userId, version);
				params.push(limit, offset);

				const items = await db.select<NameplateItem & { total_count: number }>(query, params);

				const totalCount = items.length > 0 ? items[0].total_count : 0;
				const totalPages = Math.ceil(totalCount / limit);

				return c.json({
					items: items.map(({ total_count, ...item }) => item),
					pagination: {
						page,
						limit,
						total: totalCount,
						totalPages,
						hasNext: page < totalPages,
						hasPrev: page > 1,
					},
				});
			} catch (error) {
				throw rethrowWithMessage("Failed to search nameplates", error);
			}
		}
	)
	.patch("unlock/:id", validateParams(z.object({ id: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
		try {
			const { userId } = c.payload;
			const { id } = c.req.param();

			// Add nameplate to user's inventory
			await db.query(
				`INSERT IGNORE INTO chuni_item_item (user, itemId, itemKind, stock, isValid)
           VALUES (?, ?, 1, 1, 1)`,
				[userId, id]
			);

			return c.json({ success: true });
		} catch (error) {
			throw rethrowWithMessage("Failed to unlock nameplate", error);
		}
	});

export default routes;
