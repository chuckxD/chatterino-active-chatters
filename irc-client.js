require("dotenv").config();
const tmi = require("tmi.js");
const {
  TWITCH_OAUTH_USERNAME: username,
  TWITCH_OAUTH_PASSWORD: password,
  CHANNEL,
  TMI_CLIENT_CONNECTION,
} = process.env;

const IRC_ENABLED = TMI_CLIENT_CONNECTION.toLowerCase() === "true";

const channels = [].concat(CHANNEL);

module.exports = (async () => {
  const client = new tmi.Client({
    options: { debug: true },
    connection: {
      secure: true,
      reconnect: true,
    },
    identity: {
      username,
      password,
    },
    channels,
  });
  if (!IRC_ENABLED) {
    return
  }
  await client.connect();
  return client
})();

