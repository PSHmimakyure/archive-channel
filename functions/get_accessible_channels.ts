import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import ChannelType from "../types/channel.ts";
import { Channel } from "../types/channel.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const GetChannelsDefinition = DefineFunction({
  callback_id: "get_accessible_channels",
  title: "Get workspace channel ID",
  description:
    "Get the Channel IDs in the workspace that the App token can access",
  source_file: "functions/get_accessible_channels.ts",
  output_parameters: {
    properties: {
      channels: {
        type: Schema.types.array,
        description: "The list of Channels accessible by the app token",
        items: {
          type: ChannelType,
        },
      },
    },
    required: ["channels"],
  },
});

export default SlackFunction(
  GetChannelsDefinition,
  async ({ client, team_id }) => {
    // admin.conversations.search can see private conversations but won't be available until admin scopes are released. ETA Feb 2023
    const resp = await client.conversations.list({
      team_id: team_id,
      exclude_archived: true,
    });

    if (!resp.ok) {
      return {
        error: resp.error!,
      };
    }

    // Removes channels that do not have names.
    // deno-lint-ignore no-explicit-any
    const multipartyChannels = resp.channels.filter((c: any) => {
      if (c.name) {
        return true;
      }
      return false;
    });

    //Uses channel info for list to create new Channel objects.
    // deno-lint-ignore no-explicit-any
    const channels = multipartyChannels.map((c: any) =>
      <Channel> { id: c.id, name: c.name }
    );

    return { outputs: { channels } };
  },
);
