import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
/**
 *  This is the table definition for the table that
 *  holds the snooze entries. Primary key: "id".
 *  A status column could be helpful in an automatic workflow
 *  that flags channels
 */
export const SnoozeDatastore = DefineDatastore({
  name: "snooze_events",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel_id: {
      type: Schema.types.string,
    },
    created_at: {
      type: Schema.types.string,
    },
  },
});
