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
const ScheduledArchiveUpdate = DefineWorkflow({
  callback_id: "scheduled_archive_update",
  title: "ScheduledArchiveUpdate",
  description:
    "Fetch 5 channels that have not had messages posted in 6 months on a regular schedule",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["channel"],
  },
});

const getAllChannelsStep = ScheduledArchiveUpdate.addStep(
  GetChannelsDefinition,
  {},
);

const filterChannelsStep = ScheduledArchiveUpdate.addStep(
  FilterStaleChannelsDefinition,
  {
    channels: getAllChannelsStep.outputs.channels,
  },
);

const generateMessageStep = ScheduledArchiveUpdate.addStep(
  GenerateMessageBlocksDefinition,
  {
    channels: filterChannelsStep.outputs.filtered_channels,
  },
);

ScheduledArchiveUpdate.addStep(PostBlockMessageDefinition, {
  channel_id: ScheduledArchiveUpdate.inputs.channel,
  blockString: generateMessageStep.outputs.blockString,
});

export default ScheduledArchiveUpdate;
