/* eslint-disable @typescript-eslint/ban-types */
import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  User,
  Channel,
  Role,
  Attachment,
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ApplicationCommandData,
  Awaitable,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
} from "discord.js";
import type { Narrow } from "../types.js";

interface ApplicationCommandOptionTypeValues {
  [ApplicationCommandOptionType.Subcommand]: ApplicationCommandSubCommandData[];
  [ApplicationCommandOptionType.SubcommandGroup]: ApplicationCommandSubGroupData[];
  [ApplicationCommandOptionType.String]: string;
  [ApplicationCommandOptionType.Integer]: bigint;
  [ApplicationCommandOptionType.Boolean]: boolean;
  [ApplicationCommandOptionType.User]: User;
  [ApplicationCommandOptionType.Channel]: Channel;
  [ApplicationCommandOptionType.Role]: Role;
  [ApplicationCommandOptionType.Mentionable]: User | Channel | Role;
  [ApplicationCommandOptionType.Number]: number;
  [ApplicationCommandOptionType.Attachment]: Attachment;
}

interface ApplicationCommandTypeInteraction {
  [ApplicationCommandType.ChatInput]: ChatInputCommandInteraction<"cached">;
  [ApplicationCommandType.User]: UserContextMenuCommandInteraction<"cached">;
  [ApplicationCommandType.Message]: MessageContextMenuCommandInteraction<"cached">;
}

type RequiredCommandOptionName<T extends ApplicationCommandOptionData> =
  T extends {
    required: true;
  }
    ? T["name"]
    : never;

type OptionalCommandOptionName<T extends ApplicationCommandOptionData> =
  T extends {
    required: true;
  }
    ? never
    : T["name"];

type CommandOptionValue<T extends ApplicationCommandOptionData> = T extends
  | ApplicationCommandSubCommandData
  | ApplicationCommandSubGroupData
  ? T["options"] extends ApplicationCommandOptionData[]
    ? InferCommandOptionValues<T["options"]>
    : ApplicationCommandOptionTypeValues[T["type"]]
  : ApplicationCommandOptionTypeValues[T["type"]];

export type InferCommandOptionValues<T extends ApplicationCommandOptionData[]> =
  {
    [O in T[number] as RequiredCommandOptionName<O>]: CommandOptionValue<O>;
  } & {
    [O in T[number] as OptionalCommandOptionName<O>]?: CommandOptionValue<O>;
  };

type ChatInputCommandExecuteProps<
  T extends Narrow<ApplicationCommandOptionData[]>
> = [T] extends [never]
  ? {}
  : {
      options: InferCommandOptionValues<T>;
    };

type CommandOptions<
  T extends ApplicationCommandType,
  U extends Narrow<ApplicationCommandOptionData[]>
> = {
  execute: (
    arg: {
      interaction: ApplicationCommandTypeInteraction[T];
    } & ChatInputCommandExecuteProps<U>
  ) => Awaitable<void>;
} & (T extends ApplicationCommandType.ChatInput
  ? {
      options?: U;
    }
  : {});

export const createCommand = <
  T extends ApplicationCommandType,
  U extends Narrow<ApplicationCommandOptionData[]> = never
>(
  command: ApplicationCommandData & { type: T } & CommandOptions<T, U>
) => command;
