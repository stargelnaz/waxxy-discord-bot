const axios = require('axios');

const WAX_RPC_URL = process.env.WAX_RPC_URL || 'https://wax.greymass.com';

async function getWaxBalance(wallet) {
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

    const rows =
      (response.data && response.data.result && response.data.result.rows) ||
      [];
    const balances = [];

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
    console.error(
      'Error fetching WAX balance:',
      error?.response?.data || error.message || error
    );
    throw new Error('Failed to fetch WAX balance');
  }
}

async function getKeikiBalance(wallet) {
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

    const rows =
      (response.data && response.data.result && response.data.result.rows) ||
      [];

    for (const row of rows) {
      if (row.balance) {
        const [amount, symbol] = row.balance.split(' ');
        if (symbol === 'KEIKI') {
          return {
            contract: 'orchidtokens',
            symbol: symbol,
            // handle 4 decimal places as in your TS version
            balance: (parseFloat(amount) / 10000).toString()
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
    console.error(
      'Error fetching Keiki balance:',
      error?.response?.data || error.message || error
    );
    throw new Error('Failed to fetch Keiki balance');
  }
}

module.exports = {
  getWaxBalance,
  getKeikiBalance
};
