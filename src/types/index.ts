import { InferResponseType } from "hono";

import { api } from "@/utils";

export type User = InferResponseType<typeof api.users.verify.$post>;



