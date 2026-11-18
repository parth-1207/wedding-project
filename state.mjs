import { getStore } from "@netlify/blobs";
// Shared database: one JSON document in Netlify Blobs, protected by a passcode.
export default async (req) => {
  if (req.headers.get("x-key") !== Netlify.env.get("APP_PASSCODE"))
    return new Response("Unauthorized", { status: 401 });
  const store = getStore("wedding");
  if (req.method === "POST") { await store.set("state", await req.text()); return new Response("ok"); }
  return new Response((await store.get("state")) || "null", { headers: { "content-type": "application/json" } });
};
export const config = { path: "/api/state" };
