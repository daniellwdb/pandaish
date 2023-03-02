import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { BULK_DELETE_LIMIT } from "./constants.js";
import { CommandError } from "../command-error.js";
import { createCommand } from "../create-command.js";

export const deleteMessagesAfterCommand = createCommand({
  type: ApplicationCommandType.Message,
  name: "Delete Messages After",
  defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
  execute: async ({ interaction }) => {
    const interactionMessage = await interaction.deferReply({
      fetchReply: true,
    });

    if (!interaction.channel) {
      throw new CommandError("Could not find interaction channel", {
        commandName: deleteMessagesAfterCommand.name,
      });
    }

    const messagesToDelete = await interaction.channel.messages.fetch({
      after: interaction.targetId,
    });

    const messagesWithoutInteractionMessage = messagesToDelete.filter(
      ({ id }) => id !== interactionMessage.id
    );

    if (messagesWithoutInteractionMessage.size >= BULK_DELETE_LIMIT) {
      return void interaction.followUp({
        content: "Cannot delete more than 100 messages",
        ephemeral: true,
      });
    }

    const deletedMessages = await interaction.channel.bulkDelete(
      messagesWithoutInteractionMessage
    );

    return void interaction.followUp(
      `Deleted ${deletedMessages.size} message(s)`
    );
  },
});
