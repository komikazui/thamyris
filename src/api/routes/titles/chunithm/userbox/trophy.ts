import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson, validateParams } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

interface TrophyItem {
	id: number;
	label: string;
	imagePath: string;
	locked: boolean;
	equipped: boolean;
}

const routes = new Hono()
	.get("", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const result = await db.select(
				`
				SELECT DISTINCT
					cst.trophyId as id,
					cst.name as label,
					CONCAT('CHU_UI_Trophy_', LPAD(cst.trophyId, 6, '0')) as imagePath,
					CASE 
						WHEN cii.itemId IS NOT NULL THEN 0
						ELSE 1 
					END as locked
				FROM chuni_static_trophy cst
				INNER JOIN chuni_profile_data cpd ON cpd.user = ? AND cpd.trophyId = cst.trophyId
				LEFT JOIN chuni_item_item cii ON cii.user = cpd.user AND cii.itemId = cst.trophyId AND cii.itemKind = 7
				WHERE cpd.version = ?
				LIMIT 1
			`,
				[userId, version]
			);

			if (result.length === 0) {
				return c.json({
					id: 0,
					label: "Default",
					imagePath: "CHU_UI_Trophy_000000",
					locked: false,
				});
			}

			return c.json(result[0]);
		} catch (error) {
			throw rethrowWithMessage("Failed to get current trophy", error);
		}
	})

	.post(
		"",
		validateJson(
			z.object({
				trophyId: z.number().int().min(0),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;
				const { trophyId } = await c.req.json();

				// Check if user owns this trophy (trophy ID 0 is always owned - means no trophy)
				if (trophyId !== 0) {
					const ownership = await db.select(
						`
						SELECT 1 FROM chuni_item_item
						WHERE user = ? AND itemId = ? AND itemKind = 7
					`,
						[userId, trophyId]
					);

					if (ownership.length === 0) {
						throw new HTTPException(400, {
							message: "You don't own this trophy",
						});
					}
				}

				// Update profile
				await db.query(
					`
					UPDATE chuni_profile_data 
					SET trophyId = ?
					WHERE user = ? AND version = ?
				`,
					[trophyId, userId, version]
				);

				return c.json({ success: true });
			} catch (error) {
				throw rethrowWithMessage("Failed to update trophy", error);
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

				let whereClause = "WHERE 1=1";
				const params = [];

				if (locked === true) {
					whereClause += " AND cii.user IS NULL AND cst.trophyId != 0";
				} else if (locked === false) {
					whereClause += " AND (cii.user IS NOT NULL OR cst.trophyId = 0)";
				}

				const query = `
					SELECT
						cst.trophyId as id,
						cst.name AS label,
						CONCAT('CHU_UI_Trophy_', LPAD(cst.trophyId, 6, '0')) as imagePath,
						CASE
							WHEN cii.user IS NULL AND cst.trophyId != 0 THEN 1
							ELSE 0
						END AS locked,
						CASE
							WHEN cpd.trophyId = cst.trophyId THEN 1
							ELSE 0
						END AS equipped,
						COUNT(*) OVER() AS total_count
					FROM chuni_static_trophy cst
					LEFT JOIN chuni_item_item cii 
						ON cii.itemId = cst.trophyId 
						AND cii.user = ?
						AND cii.itemKind = 7
					LEFT JOIN chuni_profile_data cpd 
						ON cpd.user = ? 
						AND cpd.version = ?
						AND cpd.trophyId = cst.trophyId
					${whereClause}
					ORDER BY 
						equipped DESC,
						locked ASC,
						cst.str ASC,
						cst.trophyId ASC
					LIMIT ? OFFSET ?
				`;

				params.unshift(userId, userId, version);
				params.push(limit, offset);

				const items = await db.select<TrophyItem & { total_count: number }>(query, params);

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
				throw rethrowWithMessage("Failed to search trophies", error);
			}
		}
	)

	.patch("unlock/:id", validateParams(z.object({ id: z.string().regex(/^\d+$/).transform(Number) })), async (c) => {
		try {
			const { userId } = c.payload;
			const { id } = c.req.param();

			// Add trophy to user's inventory
			await db.query(
				`INSERT IGNORE INTO chuni_item_item (user, itemId, itemKind, stock, isValid)
				VALUES (?, ?, 7, 1, 1)`,
				[userId, id]
			);

			return c.json({ success: true });
		} catch (error) {
			throw rethrowWithMessage("Failed to unlock trophy", error);
		}
	});

export default routes;
