import { Client, Events, GatewayIntentBits } from "discord.js";
import * as events from "./events/index.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

Object.values(events).forEach(({ event, callback }) =>
  client[event === Events.ClientReady ? "once" : "on"](
    event,
    callback as never // ⚠️ https://github.com/microsoft/TypeScript/issues/30581
  )
);

client.login();
