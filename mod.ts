import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { Api } from "https://deno.land/x/grammy@v1.27.0/mod.ts";
import { rateLimit } from "./helper.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!
const ADMIN_ID = Deno.env.get("ADMIN_ID")!

const app = new Hono();
const kv = await Deno.openKv();
const api = new Api(BOT_TOKEN);


app.use("/*", cors());

app.get("/", (c) => {
  return c.text("Hello, World!");
});

app.post("/send", async (c) => {
  const token = c.req.raw.headers.get("token") as string;

  if (!(await rateLimit(c, token, kv))) {
    return c.json({ message: "too many requests" }, 429);
  }

  const body = await c.req.formData();

  await api.sendMessage(
    ADMIN_ID,
    `**new message:**\n${body.get("message")}`,
    { parse_mode: "Markdown" },
  );

  return c.json({ message: "ok" }, 200);
});

Deno.serve({ port: 3000 }, app.fetch);
