import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import FetchWorkflow from "../workflows/fetch_archive_ready_channels.ts";
/**
 * Use a trigger like this to manually test your workflow during development
 */
const fetchShortcutTrigger: Trigger<typeof FetchWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Fetch Archive Ready Channels",
  description: "Fetch 5 channels that have not had messages posted in 6 months",
  workflow: `#/workflows/${FetchWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default fetchShortcutTrigger;
