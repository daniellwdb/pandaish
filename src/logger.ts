import { pino } from "pino";
import { config } from "./config.js";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const logger = pino({ name: config.get("name")! });
