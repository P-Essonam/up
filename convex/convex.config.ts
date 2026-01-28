// convex/convex.config.ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import crons from "@convex-dev/crons/convex.config.js";

const app = defineApp();
app.use(agent);
app.use(crons);

export default app;