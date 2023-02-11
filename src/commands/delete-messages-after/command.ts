import { ApplicationCommandType, PermissionFlagsBits } from "discord.js";
import { createCommand } from "../create-command.js";

const BULK_DELETE_LIMIT = 100;

export const deleteMessagesAfterCommand = createCommand(
  {
    type: ApplicationCommandType.Message,
    name: "Delete Messages After",
    defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
  },
  async (interaction) => {
    const interactionMessage = await interaction.deferReply({
      fetchReply: true,
    });

    if (!interaction.channel) {
      throw new Error("No interaction channel");
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
  }
);
