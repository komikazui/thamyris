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
        JOIN daphnis_static_map_icon dsm 
            ON dsm.mapIconId = cpd.mapIconId
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = dsm.mapIconId 
          AND cii.user = ?
          AND cii.itemKind = 8
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
					`
					SELECT 1 FROM chuni_item_item 
           			WHERE user = ? 
					  AND itemId = ? 
					  AND itemKind = 8
					`,
					[userId, mapIconId]
				);

				if (ownership.length === 0) {
					throw new HTTPException(400, {
						message: "You don't own this mapicon",
					});
				}

				// Update profile
				await db.query(
					`
						UPDATE chuni_profile_data 
						SET mapIconId = ? 
						WHERE user = ? 
						  AND version = ?
					`,
					[userId, mapIconId, version]
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
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;

				const { filter } = await c.req.json();
				const { locked } = filter;

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
					FROM daphnis_static_map_icon dsm
					LEFT JOIN chuni_item_item cii 
						ON cii.itemId = dsm.mapIconId 
					AND cii.user = ?
					AND cii.itemKind = 8
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
				`;

				params.unshift(userId, userId, version);

				const items = await db.select<MapiconItem & { total_count: number }>(query, params);

				const totalCount = items.length > 0 ? items[0].total_count : 0;

				return c.json({
					items: items.map(({ total_count, ...item }) => item),
					total: totalCount,
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

			console.log("Unlocking mapicon for user:", userId, "mapIconId:", id);
			// Add mapicon to user's inventory
			await db.query(
				`
					INSERT INTO chuni_item_item (user, itemId, itemKind, stock, isValid)
           			VALUES (?, ?, 8, 1, 1)
					ON DUPLICATE KEY UPDATE user = user
				`,
				[userId, id]
			);

			return c.json({ success: true });
		} catch (error) {
			throw rethrowWithMessage("Failed to unlock mapicon", error);
		}
	});

export default routes;
