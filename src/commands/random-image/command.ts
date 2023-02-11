/* eslint-disable camelcase */
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Colors,
  PermissionFlagsBits,
} from "discord.js";
import { createApi } from "unsplash-js";
import { config } from "../../config.js";
import { logger } from "../../logger.js";
import { createCommand } from "../create-command.js";

const unsplash = createApi({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  accessKey: config.get("unsplashAccessKey")!,
  fetch,
  apiUrl: "https://api.unsplash.com/",
});

export const randomImageCommand = createCommand(
  {
    type: ApplicationCommandType.ChatInput,
    name: "random-image",
    description: "Receive a random image",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "query",
        description: "Search term",
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: "hide",
        description: "Whether or not the image should only be visible for you",
      },
    ],
    defaultMemberPermissions: [PermissionFlagsBits.EmbedLinks],
  },
  async (interaction, options) => {
    await interaction.deferReply({ ephemeral: options.hide ?? false });

    const randomPhoto = await unsplash.photos.getRandom({
      query: options.query,
      contentFilter: "high",
    });

    if (randomPhoto.type === "error") {
      logger.error(randomPhoto.errors);

      throw new Error("Something went wrong");
    }

    if (Array.isArray(randomPhoto.response)) {
      throw new Error("Unsplash returned an array of photos");
    }

    const urlSearchParams = new URLSearchParams({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      utm_source: config.get("name")!,
      utm_medium: "referral",
    });

    await interaction.followUp({
      embeds: [
        {
          color: Colors.Blue,
          author: {
            icon_url: randomPhoto.response.user.profile_image.small,
            name: `Photo by ${randomPhoto.response.user.name}`,
            url: `${randomPhoto.response.user.links.html}?${urlSearchParams}`,
          },
          description: `Powered by [Unsplash](https://unsplash.com/?${urlSearchParams})`,
          image: {
            url: randomPhoto.response.urls.regular,
          },
          footer: {
            text:
              randomPhoto.response.description ??
              randomPhoto.response.alt_description ??
              "No description available.",
          },
        },
      ],
    });
  }
);
