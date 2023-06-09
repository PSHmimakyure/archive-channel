import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import ChannelType from "../types/channel.ts";
import { Channel } from "../types/channel.ts";
import { SnoozeDatastore } from "../datastores/snooze_events.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const FilterStaleChannelsDefinition = DefineFunction({
  callback_id: "filter_stale_channels",
  title: "Filter Stale Channels",
  description:
    "Filter out any channels that have received messages within the last 6 months",
  source_file: "functions/filter_stale_channels.ts",
  input_parameters: {
    properties: {
      channels: {
        type: Schema.types.array,
        description: "The list of Channel IDs to filter",
        items: {
          type: ChannelType,
        },
      },
    },
    required: ["channels"],
  },
  output_parameters: {
    properties: {
      filtered_channels: {
        type: Schema.types.array,
        description: "The list of stale Channel IDs",
        items: {
          type: ChannelType,
        },
      },
    },
    required: [],
  },
});

export default SlackFunction(
  FilterStaleChannelsDefinition,
  async ({ client, inputs }) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // Use whether a "last_read_id" parameter is returned in the results to assume whether there are more pages. The "last_read_id" value can be sent as a "cursor" to return records after it
    // https://api.slack.com/automation/datastores#query_multiple
    const snoozeResults = await client.apps.datastore.query({
      datastore: SnoozeDatastore.name,
      expression: "#created_at > :one_week_ago",
      expression_attributes: { "#created_at": "created_at" },
      expression_values: { ":one_week_ago": oneWeekAgo.toISOString() },
      limit: 1000,
    });
    if (!snoozeResults.ok) {
      return {
        error: snoozeResults.error || "Error finding timeblocks for user",
      };
    }

    // Removes snoozed channels
    const attendedChannels = inputs.channels.filter((c) =>
      !snoozeResults.items.some((i) => i.channel_id == c.id)
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const messagelessChannels: Channel[] = [];

    for (const channel of attendedChannels) {
      // No negative to running this multiple times for the same channel
      const joinResponse = await client.conversations.join({
        channel: channel.id,
      });
      if (!joinResponse.ok) throw new Error(joinResponse.error);

      const resp = await client.conversations.history({
        channel: channel.id,
        inclusive: true,
        latest: sixMonthsAgo,
        limit: 1,
      });

      if (!resp.ok) {
        return {
          error: resp.error!,
        };
      }

      // Add channel to list if it has no messages in the last six months
      if (!resp.messages || resp.messages.length == 0) {
        messagelessChannels.push(
          <Channel> { id: channel.id, name: channel.name },
        );

        if (messagelessChannels.length == 5) {
          break;
        }
      }
    }

    return { outputs: { filtered_channels: messagelessChannels } };
  },
);
