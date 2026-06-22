import { createOsuClient, clientCredentials, Ruleset } from "../src/index.js";

const clientId = process.env.OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Missing credentials. Set OSU_CLIENT_ID and OSU_CLIENT_SECRET, then run:\n" +
      "  npm run example",
  );
  process.exit(1);
}

const client = createOsuClient({
  auth: clientCredentials({
    clientId: Number(clientId),
    clientSecret,
    scopes: ["public"],
  }),
  debug: true,
});

// tsx puts the script path in argv[2], so the username is argv[3]+
const cliArgs = process.argv.slice(2).filter((arg) => !arg.endsWith(".ts"));
const username = cliArgs[0] ?? "@peppy";

console.log(`Fetching user ${username}…\n`);

const user = await client.users.get(username, { mode: Ruleset.Osu });

console.log("User:", {
  id: user.id,
  username: user.username,
  country: user.country_code,
  pp: user.statistics?.pp,
  global_rank: user.statistics?.global_rank,
});

console.log("\nFetching top 5 scores…\n");

const scores = await client.users.getScores(user.id, {
  type: "best",
  mode: Ruleset.Osu,
  limit: 5,
});

function formatAccuracy(accuracy: number): string {
  return (accuracy * 100).toFixed(2).padStart(5, "0");
}

for (const [i, score] of scores.entries()) {
  console.log(
    `${i + 1}. ${score.pp?.toFixed(0) ?? "?"}pp — ${formatAccuracy(score.accuracy)}% — ${score.mods.join("") || "NM"}`,
  );
}
