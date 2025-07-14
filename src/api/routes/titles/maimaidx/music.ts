import { Hono } from "hono";

import { db } from "@/api/db";
import { DB } from "@/api/types";
import { rethrowWithMessage } from "@/api/utils/error";

const MaimaiDXStaticMusic = new Hono().get("music", async (c) => {
  try {
    const { versions } = c.payload;
    const version = versions.maimaidx_version;

    const results = await db.select<DB.Mai2StaticMusic>(
      `SELECT id, songId, chartId, title, level, artist, genre, jacketPath  
             FROM mai2_static_music
             WHERE version = ?`,
      [version]
    );
    return c.json(results);
  } catch (error) {
    throw rethrowWithMessage("Failed to get static music", error);
  }
});

export { MaimaiDXStaticMusic };
