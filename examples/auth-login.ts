import {
  createOsuClient,
  authorizationCode,
  fileTokenStore,
  createAuthCallbackServer,
  generateOAuthState,
  buildAuthorizeUrl,
  Ruleset,
} from "../src/index.js";

const clientId = process.env.OSU_CLIENT_ID;
const clientSecret = process.env.OSU_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Set OSU_CLIENT_ID and OSU_CLIENT_SECRET first.");
  process.exit(1);
}

const tokenPath = process.env.OSU_TOKEN_PATH ?? ".osu-tokens.json";
const store = fileTokenStore(tokenPath);

const callback = await createAuthCallbackServer({ port: 3914 });

const auth = authorizationCode({
  clientId: Number(clientId),
  clientSecret,
  redirectUri: callback.redirectUri,
  scopes: ["public", "identify"],
  store,
});

const client = createOsuClient({ auth });

async function login(): Promise<void> {
  const url = auth.getAuthorizeUrl({ state: generateOAuthState() });
  console.log("Open this URL in your browser and approve access:\n");
  console.log(url);
  console.log("\nWaiting for callback…\n");

  const code = await callback.waitForCode();
  await auth.exchangeCode(code);
  await callback.close();
  console.log(`Tokens saved to ${tokenPath}\n`);
}

try {
  await client.me.get({ mode: Ruleset.Osu });
} catch {
  await login();
}

const me = await client.me.get({ mode: Ruleset.Osu });
console.log("Authenticated user:", {
  id: me.id,
  username: me.username,
  pp: me.statistics?.pp,
  global_rank: me.statistics?.global_rank,
});

// Show authorize URL helper (for web apps that handle their own callback):
console.log("\nFor web apps, build the URL yourself:");
console.log(
  buildAuthorizeUrl(Number(clientId), {
    redirectUri: "https://your-app.com/callback",
    scopes: ["public", "identify"],
    state: "csrf-token",
  }),
);
