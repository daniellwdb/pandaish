import { Events } from "discord.js";
import * as commands from "../../commands/index.js";
import { config } from "../../config.js";
import { logger } from "../../logger.js";
import { createEvent } from "../create-event.js";

export const readyEvent = createEvent({
  event: Events.ClientReady,
  callback: async (client) => {
    if (config.get("env") !== "production") {
      const testGuild = await client.guilds.fetch(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        config.get("discord.testGuildId")!
      );

      const deployedCommands = await testGuild.commands.set(
        Object.values(commands)
      );

      logger.info(`🚀 Deployed ${deployedCommands.size} commands.`);
    } else {
      const deployedCommands = await client.application.commands.set(
        Object.values(commands)
      );

      logger.info(`🚀 Deployed ${deployedCommands.size} commands.`);
    }

    logger.info(
      `🤖 ${client.user.username} is ready and listening to ${client.listeners.length} events.`
    );
  },
});
