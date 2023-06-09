import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SnoozeDatastore } from "../datastores/snooze_events.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const PostBlockMessageDefinition = DefineFunction({
  callback_id: "post_block_message",
  title: "Post a block kit message",
  description: "Post a block kit message",
  source_file: "functions/post_block_message.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      blockString: {
        type: Schema.types.string,
        description: "The stringified blocks",
      },
    },
    required: ["channel_id", "blockString"],
  },
});

export default SlackFunction(
  PostBlockMessageDefinition,
  async ({ inputs, client }) => {
    const blocks = JSON.parse(inputs.blockString);
    const resp = await client.chat.postMessage({
      channel: inputs.channel_id,
      blocks: blocks,
    });

    if (!resp.ok) {
      return {
        error: resp.error!,
      };
    }

    return {
      completed: false,
    };
  },
).addBlockActionsHandler(
  ["archive_channel"],
  async ({ body, client, action }) => {
    let conversationResponse = await client.conversations.join({
      channel: action.value,
    });
    if (!conversationResponse.ok) throw new Error(conversationResponse.error);

    conversationResponse = await client.conversations.archive({
      channel: action.value,
    });
    if (!conversationResponse.ok) throw new Error(conversationResponse.error);

    const result_message = [];
    result_message.push({
      type: "header",
      text: {
        type: "plain_text",
        text: `Result:`,
      },
    });

    if (body.channel) {
      await client.chat.postMessage({
        channel: body.channel.id,
        text: `${action.value} has been Archived!`,
      });
    }
  },
).addBlockActionsHandler(
  ["ignore_channel"],
  async ({ body, client, action }) => {
    const now = new Date().toISOString();

    const putResult = await client.apps.datastore.put({
      datastore: SnoozeDatastore.name,
      item: {
        id: `${action.value}#${now}`,
        channel_id: action.value,
        created_at: now,
      },
    });
    if (!putResult.ok) throw new Error(putResult.error);
    const result_message = [];
    result_message.push({
      type: "header",
      text: {
        type: "plain_text",
        text: `Result:`,
      },
    });

    if (body.channel) {
      await client.chat.postMessage({
        channel: body.channel.id,
        text: `${action.value} has been Ignored for one week.`,
      });
    }
  },
);
