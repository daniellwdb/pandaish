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
  ModalComponentData,
  ComponentType,
  ActionRowData,
  TextInputComponentData,
  Interaction,
  MessageActionRowComponentData,
  APIMessageActionRowComponent,
  JSONEncodable,
  InteractionType,
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

interface ComponentTypeValues {
  [ComponentType.ActionRow]: never;
  [ComponentType.Button]: never;
  [ComponentType.StringSelect]: string;
  [ComponentType.TextInput]: string;
  [ComponentType.UserSelect]: User;
  [ComponentType.RoleSelect]: Role;
  [ComponentType.MentionableSelect]: User | Role;
  [ComponentType.ChannelSelect]: Channel;
}

type NonJSONEncodableComponentData =
  | Exclude<
      MessageActionRowComponentData,
      JSONEncodable<APIMessageActionRowComponent>
    >
  | TextInputComponentData;

export type NonJSONEncodableComponent =
  | (Omit<ModalComponentData, "components"> & {
      components: ActionRowData<TextInputComponentData>[];
    })
  | {
      id: string;
      components: ActionRowData<NonJSONEncodableComponentData>[];
    };

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

type RequiredComponentCustomIdOrId<
  T extends Extract<
    NonJSONEncodableComponentData,
    { customId: string } | { id: string }
  >
> = T extends {
  required: true;
}
  ? T["customId"]
  : never;

type OptionalComponentCustomIdOrId<
  T extends Extract<
    NonJSONEncodableComponentData,
    { customId: string } | { id: string }
  >
> = T extends {
  required: true;
}
  ? never
  : T["customId"];

type CustomIdOrId<T> = T extends { customId: string }
  ? T["customId"]
  : T extends { id: string }
  ? T["id"]
  : never;

export type InferCommandComponentValues<T extends NonJSONEncodableComponent[]> =
  {
    [O in T[number] as CustomIdOrId<O>]: O;
  };

export type InferCommandComponentInputValues<
  T extends NonJSONEncodableComponent[]
> = {
  [C in T[number]["components"][number]["components"][number] as ComponentTypeValues[C["type"]] extends never
    ? never
    : RequiredComponentCustomIdOrId<
        Extract<C, { customId: string } | { id: string }>
      >]: ComponentTypeValues[C["type"]];
} & {
  [C in T[number]["components"][number]["components"][number] as ComponentTypeValues[C["type"]] extends never
    ? never
    : OptionalComponentCustomIdOrId<
        Extract<C, { customId: string } | { id: string }>
      >]?: ComponentTypeValues[C["type"]];
};

type ChatInputCommandExecuteProps<
  T extends Narrow<ApplicationCommandOptionData[]>,
  U extends Narrow<NonJSONEncodableComponent[]>
> = ([T] extends [never]
  ? {}
  : {
      options: InferCommandOptionValues<T>;
    }) &
  ([U] extends [never]
    ? {}
    : {
        components: InferCommandComponentValues<U>;
      });

type CommandOptions<
  T extends ApplicationCommandType,
  U extends Narrow<ApplicationCommandOptionData[]>,
  V extends Narrow<NonJSONEncodableComponent[]>
> = {
  execute: (
    arg: {
      interaction: ApplicationCommandTypeInteraction[T];
    } & ChatInputCommandExecuteProps<U, V>
  ) => Awaitable<void>;
} & (T extends ApplicationCommandType.ChatInput
  ? {
      options?: U;
      components?: V & NonJSONEncodableComponent[];
    } & ([V] extends [never]
      ? {}
      : {
          componentCallback: (arg: {
            interaction: Exclude<
              Interaction,
              { type: InteractionType.ApplicationCommand }
            >;
            componentInputValues: InferCommandComponentInputValues<V>;
          }) => Awaitable<void>;
        })
  : {});

export const createCommand = <
  T extends ApplicationCommandType,
  U extends Narrow<ApplicationCommandOptionData[]> = never,
  V extends Narrow<NonJSONEncodableComponent[]> = never
>(
  command: ApplicationCommandData & { type: T } & CommandOptions<T, U, V>
) => command;
