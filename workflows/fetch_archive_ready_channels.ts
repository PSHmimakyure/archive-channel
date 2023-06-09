import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetChannelsDefinition } from "../functions/get_accessible_channels.ts";
import { FilterStaleChannelsDefinition } from "../functions/filter_stale_channels.ts";
import { GenerateMessageBlocksDefinition } from "../functions/generate_message_blocks.ts";
import { PostBlockMessageDefinition } from "../functions/post_block_message.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const FetchArchivableChannelsWorkflow = DefineWorkflow({
  callback_id: "fetch_channels",
  title: "Fetch Archive Ready Channels",
  description: "Fetch 5 channels that have not had messages posted in 6 months",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

/**
 * For collecting input from users, we recommend the
 * built-in OpenForm function as a first step.
 * https://api.slack.com/automation/functions#open-a-form
 */
const inputForm = FetchArchivableChannelsWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Send message to channel",
    interactivity: FetchArchivableChannelsWorkflow.inputs.interactivity,
    submit_label: "Send message",
    fields: {
      elements: [{
        name: "channel",
        title: "Channel to send message to",
        type: Schema.slack.types.channel_id,
        default: FetchArchivableChannelsWorkflow.inputs.channel,
      }],
      required: ["channel"],
    },
  },
);

const getAllChannelsStep = FetchArchivableChannelsWorkflow.addStep(
  GetChannelsDefinition,
  {},
);

const filterChannelsStep = FetchArchivableChannelsWorkflow.addStep(
  FilterStaleChannelsDefinition,
  {
    channels: getAllChannelsStep.outputs.channels,
  },
);

const generateMessageStep = FetchArchivableChannelsWorkflow.addStep(
  GenerateMessageBlocksDefinition,
  {
    channels: filterChannelsStep.outputs.filtered_channels,
  },
);

FetchArchivableChannelsWorkflow.addStep(PostBlockMessageDefinition, {
  channel_id: inputForm.outputs.fields.channel,
  blockString: generateMessageStep.outputs.blockString,
});

export default FetchArchivableChannelsWorkflow;
