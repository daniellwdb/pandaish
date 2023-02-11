import convict from "convict";

export const config = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development"],
    default: "development",
    env: "NODE_ENV",
  },
  name: {
    doc: "The name of the application.",
    format: String,
    default: null,
    env: "npm_package_name",
  },
  discord: {
    testGuildId: {
      doc: "The ID of the guild used for testing.",
      format: String,
      default: null,
      env: "DISCORD_TEST_GUILD_ID",
    },
  },
  unsplashAccessKey: {
    doc: "The Unsplash API access key.",
    format: String,
    default: null,
    env: "UNSPLASH_ACCESS_KEY",
    sensitive: true,
  },
});

config.validate({ allowed: "strict" });
