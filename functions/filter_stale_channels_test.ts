import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import FilterStaleChannels from "./filter_stale_channels.ts";

const { createContext } = SlackFunctionTester("getUser");

Deno.test("Filter Stale Channels", async (t) => {
  mf.install(); // mock out calls to `fetch`

  // Create test values
  const inputs = {
    channels: [{ id: "123", name: "test" }, { id: "456", name: "ignore_me" }],
  };

  await t.step("Filter Snoozed Channels", async () => {
    const datastoreSuccessResponse = {
      ok: true,
      items: [
        { channel_id: "456", name: "ignore_me" },
      ],
    };

    mf.mock("POST@/api/apps.datastore.query", () => {
      return new Response(JSON.stringify(datastoreSuccessResponse));
    });

    const apiSuccessResponse = {
      ok: true,
    };

    mf.mock("POST@/api/conversations.join", (req: Request) => {
      assertEquals(req.url, "https://slack.com/api/conversations.join"); // verify request is made
      return new Response(JSON.stringify(apiSuccessResponse));
    });

    const historySuccessResponse = {
      ok: true,
      messages: [],
      has_more: false,
      pin_count: 0,
    };

    mf.mock("POST@/api/conversations.history", (req: Request) => {
      assertEquals(req.url, "https://slack.com/api/conversations.history");
      return new Response(JSON.stringify(historySuccessResponse));
    });

    // Inject test context
    const { outputs } = await FilterStaleChannels(createContext({ inputs }));

    // Assert success output
    assertEquals(outputs?.filtered_channels?.length, 1);
    assertEquals(outputs?.filtered_channels?.[0], inputs.channels[0]);
  });
});
