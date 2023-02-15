import {
  ApplicationCommandType,
  codeBlock,
  ComponentType,
  TextInputStyle,
} from "discord.js";
import { config } from "../../config.js";
import { CommandError } from "../command-error.js";
import { createCommand } from "../create-command.js";

export const feedbackCommand = createCommand({
  type: ApplicationCommandType.ChatInput,
  name: "feedback",
  description: "Request a new feature, submit a bug or leave your thoughts",
  components: [
    {
      customId: "feedbackModal",
      title: "Feedback",
      components: [
        {
          type: ComponentType.ActionRow,
          components: [
            {
              customId: "feedbackModalInput",
              label: "Please describe as many details as possible",
              type: ComponentType.TextInput,
              style: TextInputStyle.Paragraph,
              minLength: 20,
              required: true,
            },
          ],
        },
      ],
    },
  ],
  execute: async ({ interaction, components }) => {
    await interaction.showModal(components.feedbackModal);
  },
  componentCallback: async ({ interaction, componentInputValues }) => {
    if (!interaction.isModalSubmit() || !interaction.guild) {
      throw new CommandError(
        "Received the wrong interaction or interaction did not happen in a guild",
        {
          commandName: feedbackCommand.name,
        }
      );
    }

    const feedbackChannel = await interaction.client.channels.fetch(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      config.get("discord.feedbackChannelId")!
    );

    if (!feedbackChannel || !feedbackChannel.isTextBased()) {
      throw new CommandError("Could not find feedback channel", {
        commandName: feedbackCommand.name,
      });
    }

    await feedbackChannel.send(
      `Feedback from **${interaction.user.tag}** (sent from **${
        interaction.guild.name
      })**\n${codeBlock(componentInputValues.feedbackModalInput)}`
    );

    await interaction.reply(
      "Thank you for your feedback. The owner of the bot will try to contact you if there are any questions"
    );
  },
});
