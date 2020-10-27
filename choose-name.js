require("dotenv").config();
const { format: formatDateTime, subHours, subMinutes } = require("date-fns");
const fs = require("fs");
const ircClient = require("./irc-client");

const {
  CHATTERINO_CHANNELS_LOG_PATH: logPath,
  CHANNEL: chan,
  TMI_CLIENT_CONNECTION,
  DEBUG,
} = process.env;

const CONSOLE_LOGGING = DEBUG.toLowerCase() === "true";

const EXCLUDE_CHATTERS = [
  "nightbot",
  "moobot",
  "markov_chain_bot",
  "sumbot_",
  "poopthefirst",
  "danitko",
];

const poop = () => console.info(`poop xd`);

module.exports = (async () => {
  try {
    const dts = new Date();
    const logDate = formatDateTime(dts, "yyyy-MM-dd");
    const logFile = `${logPath}/${chan}/${chan}-${logDate}.log`;

    const currentDts = formatDateTime(dts, "HH:mm:ss").split(":");
    const prevHourDts = formatDateTime(subHours(dts, 1), "HH:mm:ss").split(":");

    // [(" + currentDts[0] + "|" + prevHourDts[0] + "){2}:[0-9]{2}:[0-9]{2}]s{2}w+
    // const re = new RegExp(
    //   "",
    //   "g"
    // );
    const re = new RegExp(
      "\\[[" +
        currentDts[0] +
        "|" +
        prevHourDts[0] +
        "]{2}\\:[0-9]{2}\\:[0-9]{2}\\]\\s{2}\\w+",
      "g"
    );

    // console.info(`RegEx match: `, re);

    let out = "",
      sayMessageFull = "",
      sayMessageSubstring = "",
      chatters = [];

    const stream = fs.createReadStream(logFile);
    stream.on("data", (buffer) => (out += buffer.toString().match(re)));
    stream.on("end", () => {
      const parseChatters = out.split(",").map((x) => x.split(/\s{2}/));
      parseChatters.forEach(([_, chatter]) => {
        if (typeof chatter === "undefined") {
          return;
        }

        const c = chatter.replace(/\[[\:\d]+\]$/, "").trim();
        if (!chatters.includes(c) && !EXCLUDE_CHATTERS.includes(c)) {
          // console.log(c)
          chatters = chatters.concat(c);
        }
      });
      sayMessageFull = `!choose ${chatters.join(" ")}`;
      // truncate our last chatter PepeHands
      sayMessageSubstring = sayMessageFull
        .substring(0, 499) // automod character limit(?)
        .split(" ")
        .slice(0, -1)
        .join(" ");

      CONSOLE_LOGGING &&
        console.info(
          `about ${chatters.length} active chatters this past hour\n\n${sayMessageFull}\n\nsayMessageFull character length: ${sayMessageFull.length}\n\n`
        );
      CONSOLE_LOGGING && console.info(sayMessageSubstring);
      // return sayMessageSubstring;
    });
  } catch (err) {
    CONSOLE_LOGGING && console.error(err);
    throw err;
  }
})();
