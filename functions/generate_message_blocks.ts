import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { KnownBlock } from "https://cdn.skypack.dev/@slack/types?dts";
import StaleChannelsView from "../views/stale_channels.ts";
import ChannelType from "../types/channel.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const GenerateMessageBlocksDefinition = DefineFunction({
  callback_id: "generate_message_blocks",
  title: "Generate block message",
  description: "Generate the block kit message formatted for each Channel Id",
  source_file: "functions/generate_message_blocks.ts",
  input_parameters: {
    properties: {
      channels: {
        type: Schema.types.array,
        description: "The list of Channel IDs accessible by the app token",
        items: {
          type: ChannelType,
        },
      },
    },
    required: ["channels"],
  },
  output_parameters: {
    properties: {
      blockString: {
        type: Schema.types.string,
        description:
          "The stringified block message generated off the channel IDs",
      },
    },
    required: ["blockString"],
  },
});

export default SlackFunction(
  GenerateMessageBlocksDefinition,
  ({ inputs }) => {
    let message: KnownBlock[] = [{
      type: "header",
      text: {
        type: "plain_text",
        text: `Please review the list of Channels ready for Archive: `,
      },
    }];

    inputs.channels.forEach((channel) => {
      message = message.concat(StaleChannelsView(channel));
    });

    return { outputs: { blockString: JSON.stringify(message) } };
  },
);
