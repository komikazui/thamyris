import { Hono } from "hono";

import AvatarRoutes from "./avatar";
import MapiconRoutes from "./mapicon";
import NameplateRoutes from "./nameplate";
import SystemVoiceRoutes from "./systemvoice";
import TrophyRoutes from "./trophy";

export const UserBoxRoutes = new Hono()
	.route("avatar", AvatarRoutes)
	.route("nameplate", NameplateRoutes)
	.route("mapicon", MapiconRoutes)
	.route("systemvoice", SystemVoiceRoutes)
	.route("trophy", TrophyRoutes);
