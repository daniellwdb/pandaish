import { ApplicationCommandType, Colors } from "discord.js";
import { createCommand } from "../create-command.js";

export const pfpLookupCommand = createCommand(
  {
    type: ApplicationCommandType.User,
    name: "PFP Lookup",
  },
  async (interaction) => {
    await interaction.reply({
      embeds: [
        {
          color: Colors.Blue,
          title: `${interaction.targetUser.tag}'s profile picture`,
          description: `[Search with Google Lens](<https://lens.google.com/uploadbyurl?url=${interaction.targetUser.displayAvatarURL()}>)`,
          image: {
            url: interaction.targetUser.displayAvatarURL(),
            height: 512,
          },
        },
      ],
    });
  }
);
