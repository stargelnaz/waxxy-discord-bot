const nacl = require('tweetnacl');

function verifySignature(rawBody, signature, timestamp) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!publicKey || !signature || !timestamp) {
    console.error('Missing signature verification fields.');
    return false;
  }

  const message = Buffer.from(timestamp + rawBody);
  const sig = Buffer.from(signature, 'hex');
  const key = Buffer.from(publicKey, 'hex');

  try {
    return nacl.sign.detached.verify(message, sig, key);
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
      flags: ephemeral ? 64 : 0 // 64 = ephemeral messages
    }
  };
}

module.exports = {
  verifySignature,
  createResponse
};
