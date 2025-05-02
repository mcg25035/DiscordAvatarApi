require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const avatarCache = new Map();
const requestQueue = [];
let isProcessingQueue = false;
const RATE_LIMIT_DELAY = 1000; // 1 request per second
const CACHE_EXPIRATION_TIME = 12 * 60 * 60 * 1000; // 12 hours

let botReady = false;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  botReady = true;
});

async function getAvatarUrl(userId) {
  if (!botReady) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    if (!botReady) {
      console.error('Discord bot not ready');
      return null;
    }
  }

  // Check cache
  if (avatarCache.has(userId)) {
    const cachedData = avatarCache.get(userId);
    if (cachedData.expirationTime > Date.now()) {
      return cachedData.avatarUrl;
    } else {
      avatarCache.delete(userId);
    }
  }

  // Rate limiting
  await addToQueue(userId);

  return avatarCache.get(userId)?.avatarUrl || null;
}

async function addToQueue(userId) {
  return new Promise((resolve) => {
    requestQueue.push({ userId, resolve });
    if (!isProcessingQueue) {
      processQueue();
    }
  });
}

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const { userId, resolve } = requestQueue.shift();

    console.log(`Sending request to Discord for user ID: ${userId}`);

    try {
      const user = await client.users.fetch(userId);
      const avatarUrl = user.avatarURL({ format: 'png', dynamic: true });

      avatarCache.set(userId, {
        avatarUrl,
        expirationTime: Date.now() + CACHE_EXPIRATION_TIME,
      });
      resolve(avatarUrl);
    } catch (error) {
      console.error(error);
      resolve(null);
    }

    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
  }

  isProcessingQueue = false;
}

client.login(process.env.DISCORD_TOKEN);

module.exports = { getAvatarUrl };
