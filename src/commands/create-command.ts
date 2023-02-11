import type {
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

type RequiredOptionName<T extends ApplicationCommandOptionData> = T extends {
  required: true;
}
  ? T["name"]
  : never;

type OptionalOptionName<T extends ApplicationCommandOptionData> = T extends {
  required: true;
}
  ? never
  : T["name"];

type OptionValue<T extends ApplicationCommandOptionData> = T extends
  | ApplicationCommandSubCommandData
  | ApplicationCommandSubGroupData
  ? T["options"] extends ApplicationCommandOptionData[]
    ? InferCommandOptions<T["options"]>
    : ApplicationCommandOptionTypeValues[T["type"]]
  : ApplicationCommandOptionTypeValues[T["type"]];

export type InferCommandOptions<T extends ApplicationCommandOptionData[]> = {
  [O in T[number] as RequiredOptionName<O>]: OptionValue<O>;
} & {
  [O in T[number] as OptionalOptionName<O>]?: OptionValue<O>;
};

interface CommandExecuteArgs<U extends ApplicationCommandOptionData[]> {
  [ApplicationCommandType.ChatInput]: [
    interaction: ChatInputCommandInteraction<"cached">,
    options: InferCommandOptions<U>
  ];
  [ApplicationCommandType.User]: [
    interaction: UserContextMenuCommandInteraction<"cached">
  ];
  [ApplicationCommandType.Message]: [
    MessageContextMenuCommandInteraction<"cached">
  ];
}

export const createCommand = <
  T extends ApplicationCommandType,
  U extends Narrow<ApplicationCommandOptionData[]>
>(
  command: {
    type: T;
  } & (T extends ApplicationCommandType.ChatInput
    ? ApplicationCommandData & { options: U }
    : ApplicationCommandData),
  execute: (...args: CommandExecuteArgs<U>[T]) => Awaitable<void>
) => ({ ...command, execute });
