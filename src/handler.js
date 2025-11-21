const https = require('https');
const { verifySignature, createResponse } = require('./utils/discord');
const { getWaxBalance, getKeikiBalance } = require('./utils/wax-api');

async function handler(event, context) {
  console.log('Event received:', JSON.stringify(event, null, 2));

  // Verify Discord signature
  const signature =
    event.headers['x-signature-ed25519'] ||
    event.headers['X-Signature-Ed25519'] ||
    '';
  const timestamp =
    event.headers['x-signature-timestamp'] ||
    event.headers['X-Signature-Timestamp'] ||
    '';
  const rawBody = event.body || '';

  const ok = verifySignature(rawBody, signature, timestamp);
  console.log('Signature valid?', ok);

  if (!ok) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  let interaction;
  try {
    interaction = JSON.parse(rawBody);
  } catch (err) {
    console.error('Failed to parse interaction body:', err);
    return {
      statusCode: 400,
      body: JSON.stringify(createResponse('Invalid interaction payload'))
    };
  }

  // Handle ping
  if (interaction.type === 1) {
    return {
      statusCode: 200,
      body: JSON.stringify({ type: 1 })
    };
  }

  // Handle slash commands
  if (interaction.type === 2) {
    const commandName = interaction.data && interaction.data.name;

    switch (commandName) {
      case 'wax':
        return await handleWaxCommand(interaction);
      case 'keiki':
        return await handleKeikiCommand(interaction);
      case 'guide-test': // renamed slash command
        return await handleGuideCommand(interaction);
      case 'guides':
        return await handleGuidesCommand(interaction);
      case 'beasts':
        return await handleBeastsCommand(interaction);
      case 'vehicles':
        return await handleVehiclesCommand(interaction);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify(createResponse('Unknown command'))
        };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify(createResponse('Unknown interaction type'))
  };
}

async function handleWaxCommand(interaction) {
  const options = (interaction.data && interaction.data.options) || [];
  const walletOption = options.find((opt) => opt.name === 'wallet');
  const wallet = (walletOption && walletOption.value) || 'amfr2.wam';

  try {
    const balances = await getWaxBalance(wallet);
    const waxBalance = balances.find((b) => b.symbol === 'WAXP') || {
      balance: '0',
      symbol: 'WAXP'
    };

    const response = createResponse(
      `💰 **WAX Balance for ${wallet}**\n` +
        `WAXP: ${parseFloat(waxBalance.balance).toFixed(4)}`
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error in wax command:', error);
    return {
      statusCode: 200,
      body: JSON.stringify(
        createResponse(
          '❌ Failed to fetch WAX balance. Please try again later.'
        )
      )
    };
  }
}

async function handleKeikiCommand(interaction) {
  const options = (interaction.data && interaction.data.options) || [];
  const walletOption = options.find((opt) => opt.name === 'wallet');
  const wallet = (walletOption && walletOption.value) || 'amfr2.wam';

  try {
    const keikiBalance = await getKeikiBalance(wallet);

    const response = createResponse(
      `🌺 **Keiki Balance for ${wallet}**\n` +
        `KEIKI: ${parseFloat(keikiBalance.balance).toFixed(4)}`
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error in keiki command:', error);
    return {
      statusCode: 200,
      body: JSON.stringify(
        createResponse(
          '❌ Failed to fetch Keiki balance. Please try again later.'
        )
      )
    };
  }
}

/**
 * Simple HTTPS GET helper returning parsed JSON.
 */
function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Check if a wallet owns at least one Drylands Guide.
 * Collection: orchidhunter
 * Template ID: 758752
 */
async function checkDrylandsGuideOwnership(wallet) {
  const baseUrl = 'https://wax.api.atomicassets.io/atomicassets/v1/assets';
  const url =
    `${baseUrl}?collection_name=orchidhunter` +
    `&template_id=758752` +
    `&owner=${encodeURIComponent(wallet)}` +
    `&limit=1`;

  const result = await httpGetJson(url);
  const assets = (result && result.data) || [];
  return Array.isArray(assets) && assets.length > 0;
}

async function handleGuideCommand(interaction) {
  const options = (interaction.data && interaction.data.options) || [];
  const walletOption = options.find((opt) => opt.name === 'wallet');
  const wallet = (walletOption && walletOption.value) || 'amfr2.wam';

  try {
    const hasGuide = await checkDrylandsGuideOwnership(wallet);

    if (hasGuide) {
      const response = createResponse(
        `🌿 Wallet **${wallet}** owns at least one **Drylands Guide** (template \`758752\`).`
      );

      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    }

    // If they don't own it, give them a market link for that template
    const marketUrl =
      'https://wax.atomichub.io/market?collection_name=orchidhunter&template_id=758752#sales';

    const response = {
      type: 4,
      data: {
        content:
          `❌ Wallet **${wallet}** does not currently own a **Drylands Guide**.\n` +
          `You can look for one on AtomicHub:\n${marketUrl}`
      }
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error in guide command:', error);
    return {
      statusCode: 200,
      body: JSON.stringify(
        createResponse(
          '❌ Failed to check Drylands Guide ownership. Please try again later.'
        )
      )
    };
  }
}

// Helper to build AtomicHub embed responses
function buildMarketResponse(schema, label, emoji) {
  const url = `https://wax.atomichub.io/market?collection_name=orchidhunter&schema_name=${schema}#sales`;

  const response = {
    type: 4, // channel message with source
    data: {
      content: `${emoji} You do not have any ${label.toLowerCase()} registered. To purchase, use the link below.`,
      embeds: [
        {
          title: `Buy ${label} on AtomicHub`,
          description: `Click here to view ${label.toLowerCase()} on AtomicHub.`,
          url
        }
      ]
    }
  };

  return {
    statusCode: 200,
    body: JSON.stringify(response)
  };
}

async function handleGuidesCommand(interaction) {
  return buildMarketResponse('guides', 'Guides', '👤');
}

async function handleBeastsCommand(interaction) {
  return buildMarketResponse('beasts', 'Beasts', '🐺');
}

async function handleVehiclesCommand(interaction) {
  return buildMarketResponse('vehicles', 'Vehicles', '🚣🏾‍♀️');
}

exports.handler = handler;
