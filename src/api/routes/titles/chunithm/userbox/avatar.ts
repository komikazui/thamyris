import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { db } from "@/api/db";
import { validateJson, validateParams } from "@/api/middleware/validator";
import { rethrowWithMessage } from "@/api/utils/error";

enum AvatarSlot {
	BACK = "back",
	FACE = "face",
	HEAD = "head",
	ITEM = "item",
	SKIN = "skin",
	WEAR = "wear",
}

interface AvatarItem {
	id: number;
	imagePath: string;
	label: string;
	slot: AvatarSlot;
	locked: boolean;
}
const validAvatarItemId = z.number().gte(0).optional();

async function getCurrentAvatarItems(userId: number, version: number): Promise<AvatarItem[]> {
	const result = await db.select<AvatarItem>(
		`
        SELECT 
          csa.avatarAccessoryId AS id,
          csa.texturePath       AS imagePath,
          csa.name              AS label,
          CASE csa.category
              WHEN 1 THEN 'wear'
              WHEN 2 THEN 'head'
              WHEN 3 THEN 'face'
              WHEN 4 THEN 'skin'
              WHEN 5 THEN 'item'
              WHEN 7 THEN 'back'
          END               AS slot,
          CASE
              WHEN cii.user IS NULL THEN 1
              ELSE 0
          END AS locked
        FROM chuni_static_avatar csa
        LEFT JOIN chuni_item_item cii 
            ON cii.itemId = csa.avatarAccessoryId 
          AND cii.user = ?
        JOIN chuni_profile_data cpd 
            ON cpd.user = ? 
          AND cpd.version = ?
        WHERE csa.version = ?
          AND (
            (csa.category = 1 AND csa.avatarAccessoryId = cpd.avatarWear) OR
            (csa.category = 2 AND csa.avatarAccessoryId = cpd.avatarHead) OR
            (csa.category = 3 AND csa.avatarAccessoryId = cpd.avatarFace) OR
            (csa.category = 4 AND csa.avatarAccessoryId = cpd.avatarSkin) OR
            (csa.category = 5 AND csa.avatarAccessoryId = cpd.avatarItem) OR
            (csa.category = 7 AND csa.avatarAccessoryId = cpd.avatarBack)
          )
        ORDER BY csa.category
      `,
		[userId, userId, version, version]
	);
	return result;
}

const routes = new Hono()
	.get("", async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const result = await getCurrentAvatarItems(userId, version);
			if (result.length === 0) {
				throw new HTTPException(404, {
					message: "Current avatar not found",
				});
			}
			return c.json(result);
		} catch (error) {
			throw rethrowWithMessage("Failed to get current avatar", error);
		}
	})
	.post(
		"",
		validateJson(
			z.object({
				[AvatarSlot.BACK]: validAvatarItemId,
				[AvatarSlot.FACE]: validAvatarItemId,
				[AvatarSlot.HEAD]: validAvatarItemId,
				[AvatarSlot.ITEM]: validAvatarItemId,
				[AvatarSlot.SKIN]: validAvatarItemId,
				[AvatarSlot.WEAR]: validAvatarItemId,
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;
				const { back, face, head, item, skin, wear } = await c.req.json();

				// Validate able to update
				const itemIds = [back, face, head, item, skin, wear].filter((id) => id !== undefined);
				if (itemIds.length === 0) {
					throw new HTTPException(400, {
						message: "At least one avatar item must be provided",
					});
				}

				const items = await db.select<AvatarItem>(
					`
          SELECT id
          FROM chuni_static_avatar
          WHERE avatarAccessoryId IN (?)
            AND version = ?
        `,
					[itemIds, version]
				);
				if (items.length !== itemIds.length) {
					throw new HTTPException(400, {
						message: "Invalid avatar item IDs",
					});
				}

				const result = await db.query(
					`
          UPDATE chuni_profile_data
          SET
              avatarBack = ?,
              avatarFace = ?,
              avatarHead = ?,
              avatarItem = ?,
              avatarSkin = ?,
              avatarWear = ?
          WHERE user = ?
            AND version = ?
        `,
					[back, face, head, item, skin, wear, userId, version]
				);

				if (result.affectedRows === 0) {
					throw new HTTPException(404);
				}

				// Return the updated current avatar items
				const updatedAvatar = await getCurrentAvatarItems(userId, version);
				return c.json(updatedAvatar);
			} catch (error) {
				throw rethrowWithMessage("Failed to update avatar", error);
			}
		}
	)
	.post(
		"search",
		validateJson(
			z.object({
				filter: z.object({
					slot: z.array(z.nativeEnum(AvatarSlot)),
					locked: z.boolean().nullable(),
				}),
				pagination: z.object({
					page: z.number().int().min(1).default(1),
					limit: z.number().int().min(1).max(100).default(20),
				}),
			})
		),
		async (c) => {
			try {
				const { userId, versions } = c.payload;
				const version = versions.chunithm_version;

				const { filter, pagination } = await c.req.json();
				const { slot, locked } = filter;
				const { page, limit } = pagination;

				const offset = (page - 1) * limit;

				const query = `
        SELECT
            csa.avatarAccessoryId AS id,
            csa.texturePath       AS imageId,
            csa.name              AS label,
            CASE csa.category
                WHEN 1 THEN 'wear'
                WHEN 2 THEN 'head'
                WHEN 3 THEN 'face'
                WHEN 4 THEN 'skin'
                WHEN 5 THEN 'item'
                WHEN 6 THEN 'back'
            END               AS slot,
            CASE
                WHEN cii.user IS NULL THEN 1
                ELSE 0
            END AS locked,
            CASE
                WHEN (csa.category = 1 AND cpd.avatarWear = csa.avatarAccessoryId) OR
                     (csa.category = 2 AND cpd.avatarHead = csa.avatarAccessoryId) OR
                     (csa.category = 3 AND cpd.avatarFace = csa.avatarAccessoryId) OR
                     (csa.category = 4 AND cpd.avatarSkin = csa.avatarAccessoryId) OR
                     (csa.category = 5 AND cpd.avatarItem = csa.avatarAccessoryId) OR
                     (csa.category = 7 AND cpd.avatarBack = csa.avatarAccessoryId)
                THEN 0
                ELSE 1
            END AS sort_current
        FROM chuni_static_avatar csa
        LEFT JOIN chuni_item_item cii 
           ON cii.itemId = csa.avatarAccessoryId 
          AND cii.user = ?
        LEFT JOIN chuni_profile_data cpd 
           ON cpd.user = ? 
          AND cpd.version = ?
        WHERE csa.version = ?
          AND (
            csa.category IN (?)
            ${locked !== null ? `AND (cii.user IS ${locked ? "NULL" : "NOT NULL"})` : ""}
          )
        ORDER BY sort_current, locked, csa.avatarAccessoryId
        LIMIT ? OFFSET ?
      `;

				// Map category numbers to slot names for the IN clause
				const categoryMap: Record<string, number> = {
					wear: 1,
					head: 2,
					face: 3,
					skin: 4,
					item: 5,
					back: 7,
				};
				const categoryNumbers = slot.map((s: AvatarSlot) => categoryMap[s]);

				const items = await db.select<AvatarItem & { sort_current: number }>(query, [
					userId,
					userId,
					version,
					version,
					categoryNumbers,
					limit,
					offset,
				]);

				// remove the sort_current property from the response
				if (items.length === 0) {
					return c.json([]);
				}
				// Return items with the sort_current property removed
				return c.json(items.map(({ sort_current, ...item }) => item));
			} catch (error) {
				throw rethrowWithMessage("Failed to search avatar items", error);
			}
		}
	)
	.patch("unlock/:id", validateParams(z.object({ id: validAvatarItemId })), async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const { id } = c.req.param();

			// Validate item id
			const item = await db.select<AvatarItem>(
				`
        SELECT avatarAccessoryId
        FROM chuni_static_avatar
        WHERE avatarAccessoryId = ?
          AND version = ?
      `,
				[id, version]
			);
			if (item.length === 0) {
				throw new HTTPException(404, {
					message: "Avatar item not found",
				});
			}
			await db.query(
				`
        INSERT INTO chuni_item_item (user, itemId, version)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE user = user
      `,
				[userId, id, version]
			);
			return c.status(200);
		} catch (error) {
			throw rethrowWithMessage("Failed to unlock avatar item", error);
		}
	})
	.get(":id", validateParams(z.object({ id: validAvatarItemId })), async (c) => {
		try {
			const { userId, versions } = c.payload;
			const version = versions.chunithm_version;

			const { id } = c.req.param();
			/**
			 * Artemis category values
			 * WEAR = 1
			 * HEAD = 2
			 * FACE = 3
			 * SKIN = 4
			 * ITEM = 5
			 * FRONT = 6
			 * BACK = 7
			 */
			const item = await db.select<AvatarItem>(
				`
        SELECT
            csa.avatarAccessoryId AS id,
            csa.texturePath       AS imageId,
            csa.name              AS label,
            CASE csa.category
                WHEN 1 THEN 'wear'
                WHEN 2 THEN 'head'
                WHEN 3 THEN 'face'
                WHEN 4 THEN 'skin'
                WHEN 5 THEN 'item'
                WHEN 6 THEN 'back'
            END               AS slot,
            CASE
                WHEN cii.user IS NULL THEN 1
                ELSE 0
            END AS locked
        FROM chuni_static_avatar csa
        LEFT JOIN chuni_item_item cii 
           ON cii.itemId = csa.avatarAccessoryId 
          AND cii.user = ?
        WHERE csa.avatarAccessoryId = ?
          AND csa.version = ?
      `,
				[userId, id, version]
			);
			if (item.length === 0) {
				throw new HTTPException(404, {
					message: "Avatar item not found",
				});
			}
			return c.json(item[0]);
		} catch (error) {
			throw rethrowWithMessage("Failed to get avatar item", error);
		}
	});

export default routes;
