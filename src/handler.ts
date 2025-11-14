import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda';
import {
  DiscordInteraction,
  verifySignature,
  createResponse
} from './utils/discord';
import { getWaxBalance, getKeikiBalance } from './utils/wax-api';

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log('Event received:', JSON.stringify(event, null, 2));

  // Verify Discord signature
  const signature = event.headers['x-signature-ed25519'] || '';
  const timestamp = event.headers['x-signature-timestamp'] || '';
  const rawBody = event.body || '';

  if (!verifySignature(rawBody, signature, timestamp)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid signature' })
    };
  }

  try {
    const interaction: DiscordInteraction = JSON.parse(rawBody);

    // Handle ping
    if (interaction.type === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ type: 1 })
      };
    }

    // Handle slash commands
    if (interaction.type === 2) {
      const commandName = interaction.data?.name;

      switch (commandName) {
        case 'wax':
          return await handleWaxCommand(interaction);
        case 'keiki':
          return await handleKeikiCommand(interaction);
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
  } catch (error) {
    console.error('Error processing interaction:', error);
    return {
      statusCode: 500,
      body: JSON.stringify(
        createResponse('An error occurred while processing your request')
      )
    };
  }
}

async function handleWaxCommand(
  interaction: DiscordInteraction
): Promise<APIGatewayProxyResult> {
  const options = interaction.data?.options || [];
  const walletOption = options.find((opt: any) => opt.name === 'wallet');
  const wallet = walletOption?.value || 'amfr2.wam';

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

async function handleKeikiCommand(
  interaction: DiscordInteraction
): Promise<APIGatewayProxyResult> {
  const options = interaction.data?.options || [];
  const walletOption = options.find((opt: any) => opt.name === 'wallet');
  const wallet = walletOption?.value || 'amfr2.wam';

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
