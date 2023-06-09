import { Manifest } from "deno-slack-sdk/mod.ts";
import FetchArchivableChannelsWorkflow from "./workflows/fetch_archive_ready_channels.ts";
import ScheduledFetchWorkflow from "./workflows/scheduled_archive_update.ts";
import Channel from "./types/channel.ts";
import { SnoozeDatastore } from "./datastores/snooze_events.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "channel-archive",
  description:
    "An app that searches for channels that have not been utilized in over 6 months",
  icon: "assets/icon.jpg",
  datastores: [SnoozeDatastore],
  workflows: [FetchArchivableChannelsWorkflow, ScheduledFetchWorkflow],
  outgoingDomains: ["cdn.skypack.dev"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "channels:join",
    "channels:manage",
    "channels:read",
    "channels:history",
    "groups:read",
    "groups:history",
    "mpim:read",
    "mpim:history",
    "im:read",
    "im:history",
    "datastore:read",
    "datastore:write",
  ],
  types: [Channel],
});
