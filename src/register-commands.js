const axios = require('axios');
require('dotenv').config(); // <-- make sure this is here

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
  }
];

async function registerCommands() {
  try {
    const url = `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`;

    const headers = {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    };

    for (const command of commands) {
      const response = await axios.post(url, command, { headers });
      console.log(`Registered command: ${command.name}`);
      console.log('Response:', response.data);
    }

    console.log('All commands registered successfully!');
  } catch (error) {
    console.error(
      'Error registering commands:',
      error.response?.data || error.message
    );
  }
}

registerCommands();
