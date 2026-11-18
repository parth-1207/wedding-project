import { getStore } from "@netlify/blobs";
// Runs every day at 03:00 UTC (8:30 AM IST). Emails owners + couple via Resend.
export default async () => {
  const S = JSON.parse((await getStore("wedding").get("state")) || "null");
  if (!S) return;
  const today = new Date().toISOString().slice(0, 10);
  const days = (d) => Math.round((new Date(d) - new Date(today)) / 864e5);
  const when = (t) => { const n = days(t.due); return n < 0 ? `OVERDUE by ${-n}d` : n === 0 ? "due TODAY" : `due in ${n}d`; };
  const line = (t) => `• [${t.fn}] ${t.title} (${t.owner || "unassigned"}) - ${when(t)}`;
  const open = S.tasks.filter((t) => t.status !== "done" && t.due).sort((a, b) => a.due.localeCompare(b.due));
  const team = {};
  (S.team || "").split("\n").forEach((l) => { const [n, e] = l.split(",").map((x) => x.trim()); if (n && e) team[n.toLowerCase()] = e; });
  const send = (to, subject, text) => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Netlify.env.get("RESEND_API_KEY")}`, "content-type": "application/json" },
    body: JSON.stringify({ from: Netlify.env.get("FROM_EMAIL"), to, subject, text }),
  });
  const done = S.tasks.filter((t) => t.status === "done").length;
  const couple = (S.couple.emails || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (couple.length) await send(couple, `Wedding update: ${open.filter((t) => days(t.due) < 0).length} overdue, ${open.length} open`,
    `${done}/${S.tasks.length} tasks done.\n\n` + (open.map(line).join("\n") || "All clear!"));
  for (const [name, email] of Object.entries(team)) {
    const mine = open.filter((t) => (t.owner || "").toLowerCase() === name && days(t.due) <= 7);
    if (mine.length) await send([email], `Your wedding tasks for today (${mine.length})`, mine.map(line).join("\n"));
  }
};
export const config = { schedule: "0 3 * * *" };
