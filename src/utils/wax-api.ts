import axios from 'axios';

const WAX_RPC_URL = process.env.WAX_RPC_URL || 'https://wax.greymass.com';

export interface WaxBalance {
  contract: string;
  symbol: string;
  balance: string;
}

export async function getWaxBalance(wallet: string): Promise<WaxBalance[]> {
  try {
    const response = await axios.post(WAX_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'post',
      params: [
        {
          code: 'eosio.token',
          scope: 'eosio.token',
          table: 'accounts',
          json: true,
          limit: 100,
          lower_bound: wallet,
          upper_bound: wallet
        }
      ]
    });

    const rows = response.data?.result?.rows || [];
    const balances: WaxBalance[] = [];

    for (const row of rows) {
      if (row.balance) {
        const [amount, symbol] = row.balance.split(' ');
        balances.push({
          contract: 'eosio.token',
          symbol: symbol,
          balance: amount
        });
      }
    }

    return balances;
  } catch (error) {
    console.error('Error fetching WAX balance:', error);
    throw new Error('Failed to fetch WAX balance');
  }
}

export async function getKeikiBalance(wallet: string): Promise<WaxBalance> {
  try {
    const response = await axios.post(WAX_RPC_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'post',
      params: [
        {
          code: 'orchidtokens',
          scope: wallet,
          table: 'accounts',
          json: true,
          limit: 100
        }
      ]
    });

    const rows = response.data?.result?.rows || [];

    for (const row of rows) {
      if (row.balance) {
        const [amount, symbol] = row.balance.split(' ');
        if (symbol === 'KEIKI') {
          return {
            contract: 'orchidtokens',
            symbol: symbol,
            balance: (parseFloat(amount) / 10000).toString() // Handle 4 decimal places
          };
        }
      }
    }

    return {
      contract: 'orchidtokens',
      symbol: 'KEIKI',
      balance: '0'
    };
  } catch (error) {
    console.error('Error fetching Keiki balance:', error);
    throw new Error('Failed to fetch Keiki balance');
  }
}
