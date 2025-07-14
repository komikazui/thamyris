import { Hono } from "hono";

import { db } from "@/api/db";
import { DB } from "@/api/types";
import { rethrowWithMessage } from "@/api/utils/error";

const ChunithmStaticMusic = new Hono().get("chuni_static_music", async (c) => {
  try {
    const { versions } = c.payload;
    const version = versions.chunithm_version;

    const results = await db.select<DB.ChuniStaticMusic>(
      `SELECT 
			m.songId,
			m.title,
			m.artist,
			m.jacketPath,
			m.genre,
			m.level,
			m.chartId,
			m.opt
		FROM 
			chuni_static_music m
		LEFT JOIN 
			chuni_static_opts o ON m.opt = o.id
		WHERE 
			m.version = ? AND o.isEnable = 1
		ORDER BY 
			m.id DESC`,
      [version]
    );
    return c.json(results);
  } catch (error) {
    throw rethrowWithMessage("Failed to get static music", error);
  }
});

export { ChunithmStaticMusic };
