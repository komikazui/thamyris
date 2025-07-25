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
					dst.trophyId as id,
					dst.name as label,
					dst.imagePath,
					CASE 
						WHEN cii.itemId IS NOT NULL THEN 0
						ELSE 1 
					END as locked
				FROM daphnis_static_trophy dst
				INNER JOIN chuni_profile_data cpd ON cpd.user = ? AND cpd.trophyId = dst.trophyId
				LEFT JOIN chuni_item_item cii ON cii.user = cpd.user AND cii.itemId = dst.trophyId AND cii.itemKind = 3
				WHERE cpd.version = ? AND dst.version = ?
				LIMIT 1
				`,
				[userId, version, version]
			);

			if (result.length === 0) {
				return c.json({
					id: 0,
					label: "Default",
					imagePath: "CHU_UI_Trophy_000000.png",
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
						WHERE user = ? AND itemId = ? AND itemKind = 3
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
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;

				const { filter } = await c.req.json();
				const { locked } = filter;

				let additionalWhere = "";
				const params = [userId, userId, version, version];

				if (locked === true) {
					additionalWhere = " AND cii.user IS NULL AND dst.trophyId != 0";
				} else if (locked === false) {
					additionalWhere = " AND (cii.user IS NOT NULL OR dst.trophyId = 0)";
				}

				const query = `
					SELECT
						dst.trophyId as id,
						dst.name AS label,
						dst.imagePath,
						CASE
							WHEN cii.user IS NULL AND dst.trophyId != 0 THEN 1
							ELSE 0
						END AS locked,
						CASE
							WHEN cpd.trophyId = dst.trophyId THEN 1
							ELSE 0
						END AS equipped,
						COUNT(*) OVER() AS total_count
					FROM daphnis_static_trophy dst
					LEFT JOIN chuni_item_item cii 
						ON cii.itemId = dst.trophyId 
						AND cii.user = ?
						AND cii.itemKind = 3
					LEFT JOIN chuni_profile_data cpd 
						ON cpd.user = ? 
						AND cpd.version = ?
						AND cpd.trophyId = dst.trophyId
					WHERE dst.version = ?${additionalWhere}
					ORDER BY 
						equipped DESC,
						locked ASC,
						dst.name ASC,
						dst.trophyId ASC
				`;

				const items = await db.select<TrophyItem & { total_count: number }>(query, params);

				const totalCount = items.length > 0 ? items[0].total_count : 0;

				return c.json({
					items: items.map(({ total_count, ...item }) => item),
					total: totalCount,
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
				VALUES (?, ?, 3, 1, 1)`,
				[userId, id]
			);

			return c.json({ success: true });
		} catch (error) {
			throw rethrowWithMessage("Failed to unlock trophy", error);
		}
	});

export default routes;