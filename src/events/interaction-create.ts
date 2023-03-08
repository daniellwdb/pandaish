import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  ApplicationCommandType,
  codeBlock,
  CommandInteractionOption,
  Events,
} from "discord.js";
import { createEvent } from "./create-event.js";
import type { InferCommandOptionValues } from "../commands/create-command.js";
import * as commands from "../commands/index.js";
import { logger } from "../logger.js";

const transformCommandOptions = (
  options: ReadonlyArray<CommandInteractionOption<"cached">>
) =>
  options.reduce((previousValue, option) => {
    if (
      option.type === ApplicationCommandOptionType.Subcommand ||
      option.type === ApplicationCommandOptionType.SubcommandGroup
    ) {
      previousValue[option.name] = transformCommandOptions(
        option.options ?? []
      ) as unknown as
        | ApplicationCommandSubCommandData[]
        | ApplicationCommandSubGroupData[];
    }

    if (
      option.type === ApplicationCommandOptionType.String ||
      option.type === ApplicationCommandOptionType.Boolean ||
      option.type === ApplicationCommandOptionType.Number
    ) {
      previousValue[option.name] = option.value;
    }

    if (option.type === ApplicationCommandOptionType.Integer) {
      previousValue[option.name] = option.value
        ? BigInt(option.value)
        : undefined;
    }

    if (option.type === ApplicationCommandOptionType.User) {
      previousValue[option.name] = option.user;
    }

    if (option.type === ApplicationCommandOptionType.Channel) {
      previousValue[option.name] = option.channel;
    }

    if (option.type === ApplicationCommandOptionType.Role) {
      previousValue[option.name] = option.role;
    }

    if (option.type === ApplicationCommandOptionType.Mentionable) {
      previousValue[option.name] = option.user ?? option.channel ?? option.role;
    }

    if (option.type === ApplicationCommandOptionType.Attachment) {
      previousValue[option.name] = option.attachment;
    }

    return previousValue;
  }, {} as InferCommandOptionValues<ApplicationCommandOptionData[]>);

export const interactionCreateEvent = createEvent({
  event: Events.InteractionCreate,
  callback: async (interaction) => {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isContextMenuCommand()
    ) {
      return;
    }

    if (!interaction.inCachedGuild()) {
      return;
    }

    const command = Object.values(commands).find(
      ({ name }) => name === interaction.commandName
    );

    if (!command) {
      throw new Error("Could not find command");
    }

    if (!interaction.channel) {
      throw new Error("Could not find interaction channel");
    }

    if (command.defaultMemberPermissions) {
      const clientAsGuildMember = await interaction.guild.members.fetchMe();

      const missingPermissions = clientAsGuildMember
        .permissionsIn(interaction.channel)
        .missing(command.defaultMemberPermissions);

      if (missingPermissions.length) {
        return void interaction.reply(
          `I am missing permissions to run this command:\n${missingPermissions
            .map((permission) => `- ${permission.split(/(?=[A-Z])/).join(" ")}`)
            .join("\n")}`
        );
      }
    }

    try {
      if (
        interaction.isChatInputCommand() &&
        command.type === ApplicationCommandType.ChatInput
      ) {
        await command.execute({
          interaction,
          // These properties cannot be used by the type definition of `execute` when `options` / `components` do not exist
          // So it's fine to fall back to an empty object
          options: transformCommandOptions(command.options ?? []),
        });
      }

      if (
        interaction.isUserContextMenuCommand() &&
        command.type === ApplicationCommandType.User
      ) {
        await command.execute({ interaction });
      }

      if (
        interaction.isMessageContextMenuCommand() &&
        command.type === ApplicationCommandType.Message
      ) {
        await command.execute({ interaction });
      }
    } catch (error) {
      if (error instanceof Error) {
        await interaction.editReply({
          content: `Error:\n${codeBlock(error.message)}`,
          components: [],
        });

        return logger.error(error);
      }
    }
  },
});
