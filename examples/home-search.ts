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

const query = process.argv.slice(2).filter((a) => !a.endsWith(".ts"))[0] ?? "peppy";

console.log(`Searching for "${query}"…\n`);

const result = await client.home.search({ query, mode: "all" });

if (result.user) {
  console.log(`Users (${result.user.total} total, showing ${result.user.data.length}):`);
  for (const user of result.user.data) {
    console.log(`  @${user.username} (${user.country_code})`);
  }
}

if (result.wiki_page) {
  console.log(
    `\nWiki pages (${result.wiki_page.total} total, showing ${result.wiki_page.data.length}):`,
  );
  for (const page of result.wiki_page.data) {
    console.log(`  ${page.title} — /wiki/${page.path}`);
  }
}
