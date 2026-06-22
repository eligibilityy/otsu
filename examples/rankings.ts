import { createOsuClient, clientCredentials, Ruleset } from "../src/index.js";

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

const country = process.argv.slice(2).filter((a) => !a.endsWith(".ts"))[0];

const result = await client.rankings.get(Ruleset.Osu, "performance", {
  ...(country !== undefined ? { country } : {}),
});

console.log(`Top ${result.ranking.length} players${country ? ` in ${country}` : " globally"}:\n`);

for (const [i, entry] of result.ranking.entries()) {
  console.log(
    `#${entry.global_rank} ${entry.user.username} (${entry.user.country_code}) — ${entry.pp.toFixed(0)}pp`,
  );
}

console.log(`\n~${result.total.toLocaleString()} ranked players total`);
