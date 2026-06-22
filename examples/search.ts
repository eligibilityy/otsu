import { createOsuClient, clientCredentials } from "../src/index.js";

const clientId = process.env.OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set OSU_CLIENT_ID and OSU_CLIENT_SECRET first.");
  process.exit(1);
}

const client = createOsuClient({
  auth: clientCredentials({
    clientId: Number(clientId),
    clientSecret,
    scopes: ["public"],
  }),
});

const query = process.argv.slice(2).filter((a) => !a.endsWith(".ts"))[0] ?? "freedom dive";

console.log(`Searching beatmapsets for "${query}"…\n`);

const result = await client.beatmapsets.search({
  q: query,
  sort: "ranked_desc",
});

console.log(`Found ${result.total} results (showing ${result.beatmapsets.length}):\n`);

for (const [i, set] of result.beatmapsets.entries()) {
  console.log(
    `${i + 1}. ${set.artist} - ${set.title} [${set.status}] (${set.favourite_count} favs)`,
  );
}

if (result.cursor_string) {
  console.log("\nMore results available — use searchAll() to auto-paginate:");
  console.log('  for await (const set of client.beatmapsets.searchAll({ q: "..." })) { … }');
}
