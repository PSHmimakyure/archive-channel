import { KnownBlock } from "https://cdn.skypack.dev/@slack/types?dts";
import { Channel } from "../types/channel.ts";

// These are the individual message blocks for outputting a channel to the user
export default (channel: Channel): KnownBlock[] => [
  {
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Channel Name*: ${channel.name}`,
      },
    ],
  },
  {
    type: "actions",
    block_id: `action_block_${channel.id}`,
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Archive Channel",
        },
        action_id: "archive_channel",
        value: channel.id,
        style: "primary",
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Ignore",
        },
        action_id: "ignore_channel",
        value: channel.id,
        style: "primary",
      },
    ],
  },
  {
    type: "divider",
  },
];
