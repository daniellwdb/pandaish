import type { Awaitable, ClientEvents } from "discord.js";

export const createEvent = <T extends keyof ClientEvents>(event: {
  event: T;
  callback: (...args: ClientEvents[T]) => Awaitable<void>;
}) => event;
