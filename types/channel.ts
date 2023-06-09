import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export default DefineType({
  title: "Channel",
  description: "Domain object for storing channel data",
  name: "Channel",
  type: Schema.types.object,
  properties: {
    id: {
      type: Schema.types.string,
      minLength: 3,
    },
    name: {
      type: Schema.types.string,
    },
  },
  required: ["id", "name"],
});

export type Channel = {
  id: string;
  name: string;
};
