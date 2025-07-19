import { Hono } from "hono";

import AvatarRoutes from "./avatar";

export const UserBoxRoutes = new Hono().route("avatar", AvatarRoutes);
// .route("map", MapRoutes)
// .route("plate", NameplateRoutes)
// .route("voice", SystemVoiceRoutes)
// .route("trophy", TrophyRoutes);
