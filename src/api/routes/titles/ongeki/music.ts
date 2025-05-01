import { Hono } from "hono";

import { db } from "@/api/db";
import { DB } from "@/api/types";
import { rethrowWithMessage } from "@/api/utils/error";

const OngekiStaticMusic = new Hono().get("music", async (c) => {
	try {
		const { versions } = c.payload;
		const version = versions.ongeki_version;

		const results = await db.select<DB.OngekiStaticMusic>(
			`SELECT id, songId, chartId, title, level, artist, genre, jacketPath
       FROM ongeki_static_music
       	 WHERE version = ? AND jacketPath IS NOT NULL
				 ORDER BY id DESC`,
			[version]
		);
		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to get static music", error);
	}
});
export { OngekiStaticMusic };
