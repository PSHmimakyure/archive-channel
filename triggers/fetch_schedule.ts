import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import ScheduledFetchWorkflow from "../workflows/scheduled_archive_update.ts";

const trigger: Trigger<typeof ScheduledFetchWorkflow.definition> = {
  type: TriggerTypes.Scheduled,
  name: "daily_schedule",
  workflow: `#/workflows/${ScheduledFetchWorkflow.definition.callback_id}`,
  schedule: {
    start_time: "2022-09-30T21:30:00Z", // UTC time. Must always begin in the future
    timezone: "UTC",
    frequency: {
      type: "daily",
      repeats_every: 1,
    },
  },
  inputs: {
    channel: {
      value: "UPDATE_ME_WITH_YOUR_TEST_CHANNEL_ID", // Inputs likely not necessary in a bot that scans all channels and messages them directly
    },
  },
};

export default trigger;
