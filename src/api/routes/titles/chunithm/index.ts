import { Hono } from "hono";

import { AvatarRoutes } from "./avatar";
import { FavoritesRoutes } from "./favorites";
import { ChunithmKamaitachiRoutes } from "./kamaitachi";
import { ChunithmLeaderboardRoutes } from "./leaderboard";
import { MapIconRoutes } from "./mapicon";
import { ChunithmModsRoutes } from "./modifications";
import { NameplateRoutes } from "./nameplate";
import { ChunithmScorePlaylog } from "./playlog";
import { UserRatingFramesRoutes } from "./rating";
import { ChunithmReiwaRoutes } from "./reiwa";
import { RivalsRoutes } from "./rivals";
import { ChunithmSettingsRoutes } from "./settings";
import { ChunithmStaticMusic } from "./staticmusic";
import { SystemVoiceRoutes } from "./systemvoice";
import { ChunithmTeamsRoutes } from "./teams";
import { TrophyRoutes } from "./trophies";
import { UserBoxRoutes } from "./userbox";

export const AllChunithmRoutes = new Hono()
	.route("static", ChunithmStaticMusic)
	.route("profile", ChunithmScorePlaylog)
	.route("avatar", AvatarRoutes)
	.route("favorites", FavoritesRoutes)
	.route("kamaitachi", ChunithmKamaitachiRoutes)
	.route("leaderboard", ChunithmLeaderboardRoutes)
	.route("mapicon", MapIconRoutes)
	.route("nameplate", NameplateRoutes)
	.route("rating", UserRatingFramesRoutes)
	.route("reiwa", ChunithmReiwaRoutes)
	.route("rivals", RivalsRoutes)
	.route("cozynet", ChunithmSettingsRoutes)
	.route("systemvoice", SystemVoiceRoutes)
	.route("trophy", TrophyRoutes)
	.route("mods", ChunithmModsRoutes)
	.route("teams", ChunithmTeamsRoutes)
	.route("userbox", UserBoxRoutes);
