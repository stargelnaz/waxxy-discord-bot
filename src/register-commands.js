const axios = require('axios');
require('dotenv').config();

const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
  console.error(
    'Missing DISCORD_APPLICATION_ID or DISCORD_BOT_TOKEN in environment.'
  );
  process.exit(1);
}

const commands = [
  {
    name: 'wax',
    description: 'Get WAX balance for a wallet',
    options: [
      {
        type: 3, // STRING
        name: 'wallet',
        description: 'WAX wallet address (default: amfr2.wam)',
        required: false
      }
    ]
  },
  {
    name: 'keiki',
    description: 'Get Keiki token balance',
    options: [
      {
        type: 3, // STRING
        name: 'wallet',
        description: 'WAX wallet address (default: amfr2.wam)',
        required: false
      }
    ]
  },
  {
    name: 'guide-test',
    description: 'Check if a wallet owns the Drylands Guide NFT',
    options: [
      {
        type: 3, // STRING
        name: 'wallet',
        description: 'WAX wallet address (default: amfr2.wam)',
        required: false
      }
    ]
  },
  {
    name: 'guides',
    description: 'Show Orchid Hunter guides on AtomicHub'
  },
  {
    name: 'beasts',
    description: 'Show Orchid Hunter beasts on AtomicHub'
  },
  {
    name: 'vehicles',
    description: 'Show Orchid Hunter vehicles on AtomicHub'
  }
];

async function registerCommands() {
  try {
    // Bulk overwrite global application commands
    const url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;

    const headers = {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    };

    // One PUT with the full array instead of many POSTs
    const response = await axios.put(url, commands, { headers });

    console.log('Registered commands successfully:');
    console.log(response.data.map((c) => c.name));
  } catch (error) {
    console.error(
      'Error registering commands:',
      error.response?.data || error.message
    );
  }
}

registerCommands();
