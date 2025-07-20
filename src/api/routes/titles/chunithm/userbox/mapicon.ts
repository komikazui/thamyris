import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson, validateParams } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

interface MapiconItem {
	id: number;
	imagePath: string;
	label: string;
	locked: boolean;
}

async function getCurrentMapicon(userId: number, version: number): Promise<MapiconItem[]> {
	const result = await db.select<MapiconItem>(
		`
        SELECT 
          dsm.mapIconId AS id,
          dsm.imagePath,
          dsm.name AS label,
          CASE
              WHEN cii.user IS NULL THEN 1
              ELSE 0
          END AS locked
        FROM chuni_profile_data cpd
        JOIN daphnis_static_mapicon dsm 
            ON dsm.mapIconId = cpd.mapIconId
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = dsm.mapIconId 
          AND cii.user = ?
          AND cii.itemKind = 2
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

			const result = await getCurrentMapicon(userId, version);
			if (result.length === 0) {
				throw new HTTPException(404, {
					message: "Current mapicon not found",
				});
			}
			return c.json(result[0]);
		} catch (error) {
			throw rethrowWithMessage("Failed to get current mapicon", error);
		}
	})
	.post(
		"",
		validateJson(
			z.object({
				mapIconId: z.number().int().positive(),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;
				const { mapIconId } = await c.req.json();

				// Verify user owns the mapicon
				const ownership = await db.select(
					`SELECT 1 FROM chuni_item_item 
           WHERE user = ? AND itemId = ? AND itemKind = 2`,
					[userId, mapIconId]
				);

				if (ownership.length === 0) {
					throw new HTTPException(400, {
						message: "You don't own this mapicon",
					});
				}

				// Update profile
				await db.query(
					`UPDATE chuni_profile_data 
           SET mapIconId = ?
           WHERE user = ? AND version = ?`,
					[mapIconId, userId, version]
				);

				return c.json({ success: true });
			} catch (error) {
				throw rethrowWithMessage("Failed to update mapicon", error);
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

				let whereClause = "WHERE dsm.version = ?";
				const params = [version];

				if (locked === true) {
					whereClause += " AND cii.user IS NULL";
				} else if (locked === false) {
					whereClause += " AND cii.user IS NOT NULL";
				}

				const query = `
        SELECT
            dsm.mapIconId AS id,
            dsm.imagePath,
            dsm.name AS label,
            CASE
                WHEN cii.user IS NULL THEN 1
                ELSE 0
            END AS locked,
            CASE
                WHEN cpd.mapIconId = dsm.mapIconId THEN 1
                ELSE 0
            END AS equipped,
            COUNT(*) OVER() AS total_count
        FROM daphnis_static_mapicon dsm
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = dsm.mapIconId 
          AND cii.user = ?
          AND cii.itemKind = 2
        LEFT JOIN chuni_profile_data cpd 
            ON cpd.user = ? 
          AND cpd.version = ?
          AND cpd.mapIconId = dsm.mapIconId
        ${whereClause}
        ORDER BY 
            equipped DESC,
            locked ASC,
            dsm.sortName ASC,
            dsm.mapIconId ASC
        LIMIT ? OFFSET ?
      `;

				params.unshift(userId, userId, version);
				params.push(limit, offset);

				const items = await db.select<MapiconItem & { total_count: number }>(query, params);

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
				throw rethrowWithMessage("Failed to search mapicons", error);
			}
		}
	)
	.patch("unlock/:id", validateParams(z.object({ id: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
		try {
			const { userId } = c.payload;
			const { id } = c.req.param();

			// Add mapicon to user's inventory
			await db.query(
				`INSERT IGNORE INTO chuni_item_item (user, itemId, itemKind, stock, isValid)
           VALUES (?, ?, 2, 1, 1)`,
				[userId, id]
			);

			return c.json({ success: true });
		} catch (error) {
			throw rethrowWithMessage("Failed to unlock mapicon", error);
		}
	});

export default routes;
