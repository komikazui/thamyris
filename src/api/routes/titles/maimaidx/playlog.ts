import { Hono } from "hono";

import { db } from "@/api/db";
import { DB } from "@/api/types";
import { rethrowWithMessage } from "@/api/utils/error";

const MaimaiDXPlaylogRoute = new Hono().get("playlog", async (c) => {
	try {
		const { userId, versions } = c.payload;
		const version = versions.maimaidx_version;

		const results = await db.select<DB.Mai2Playlog>(
			`
                WITH RankedScores AS (
                SELECT
                    mp.id,
                    mp.maxCombo,
                    mp.isClear,
                    mp.userPlayDate,
                    mp.achievement AS score,
                    mp.deluxscore,
                    mp.comboStatus,
                    mp.syncStatus,
                    msm.chartId,  
                    msm.title,
                    msm.difficulty,
                    msm.genre,
                    msm.artist,
                    IF(mp.achievement > LAG(mp.achievement, 1) OVER (ORDER BY mp.userPlayDate), 'Increase',
                    IF(mp.achievement < LAG(mp.achievement, 1) OVER (ORDER BY mp.userPlayDate), 'Decrease', 'Same')) AS score_change,
                    IF(mp.deluxscore > LAG(mp.deluxscore, 1) OVER (ORDER BY mp.userPlayDate), 'Increase',
                    IF(mp.deluxscore < LAG(mp.deluxscore, 1) OVER (ORDER BY mp.userPlayDate), 'Decrease', 'Same')) AS rating_change
                FROM
                    mai2_playlog mp
                    JOIN mai2_profile_detail pd ON mp.user = pd.user
                    JOIN mai2_static_music msm ON mp.musicId = msm.songId
                    AND mp.level = msm.chartId
                    AND msm.version = ?
                WHERE
                    mp.user = ? AND pd.version = ?
                )
                SELECT
                id,
                maxCombo,
                isClear,
                userPlayDate,
                score,
                deluxscore,
                comboStatus,
                syncStatus,
                chartId,  
                title,
                difficulty,
                genre,
                artist,
                score_change,
                rating_change
                FROM
                RankedScores
                ORDER BY
                userPlayDate DESC;
                `,
			[version, userId, version]
		);
		return c.json(results);
	} catch (error) {
		throw rethrowWithMessage("Failed to get score playlog", error);
	}
});

export { MaimaiDXPlaylogRoute };
