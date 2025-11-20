const { verifyKey } = require('discord-interactions');

function verifySignature(rawBody, signature, timestamp) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!publicKey || !signature || !timestamp) {
    console.error('Missing DISCORD_PUBLIC_KEY, signature, or timestamp.');
    return false;
  }

  try {
    // verifyKey takes the raw body string and headers directly
    return verifyKey(rawBody, signature, timestamp, publicKey);
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

function createResponse(content, ephemeral = false) {
  return {
    type: 4, // ChannelMessageWithSource
    data: {
      content,
      flags: ephemeral ? 64 : 0
    }
  };
}

module.exports = {
  verifySignature,
  createResponse
};
