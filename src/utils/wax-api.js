const axios = require('axios');

// Base URL, fallback to Greymass
const BASE_URL = process.env.WAX_RPC_URL || 'https://wax.greymass.com';

// WAXP uses get_currency_balance
const CURRENCY_BALANCE_URL = BASE_URL + '/v1/chain/get_currency_balance';

// KEIKI uses get_table_rows
const TABLE_ROWS_URL = BASE_URL + '/v1/chain/get_table_rows';

console.log('WAX RPC base URL:', BASE_URL);
console.log('WAX WAXP balance endpoint:', CURRENCY_BALANCE_URL);
console.log('WAX table rows endpoint:', TABLE_ROWS_URL);

// ---------------------------------------------
// Get WAXP balance
// ---------------------------------------------
async function getWaxBalance(wallet) {
  const payload = {
    code: 'eosio.token',
    account: wallet,
    symbol: 'WAXP'
  };

  console.log('Fetching WAXP balance from:', CURRENCY_BALANCE_URL);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(CURRENCY_BALANCE_URL, payload);

    console.log('WAXP RPC response:', JSON.stringify(response.data, null, 2));

    const arr = response.data || [];

    if (!Array.isArray(arr) || arr.length === 0) {
      return [{ symbol: 'WAXP', balance: '0' }];
    }

    // Response looks like: ["123.4567 WAXP"]
    const [amount, symbol] = arr[0].split(' ');

    return [
      {
        symbol,
        balance: amount,
        contract: 'eosio.token'
      }
    ];
  } catch (error) {
    console.error(
      'Error fetching WAX balance:',
      error?.response?.data || error.message || error
    );
    throw new Error('Failed to fetch WAX balance');
  }
}

// ---------------------------------------------
// Get KEIKI balance
// ---------------------------------------------
async function getKeikiBalance(wallet) {
  const payload = {
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
  };

  console.log('Fetching KEIKI balance from:', TABLE_ROWS_URL);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(TABLE_ROWS_URL, payload);

    console.log('KEIKI RPC response:', JSON.stringify(response.data, null, 2));

    const rows =
      (response.data && response.data.result && response.data.result.rows) ||
      [];

    for (const row of rows) {
      if (!row.balance) continue;

      const [amount, symbol] = row.balance.split(' ');
      if (symbol === 'KEIKI') {
        return {
          contract: 'orchidtokens',
          symbol: 'KEIKI',
          balance: parseFloat(amount).toString()
        };
      }
    }

    return {
      contract: 'orchidtokens',
      symbol: 'KEIKI',
      balance: '0'
    };
  } catch (error) {
    console.error(
      'Error fetching KEIKI balance:',
      error?.response?.data || error.message || error
    );
    throw new Error('Failed to fetch Keiki balance');
  }
}

module.exports = {
  getWaxBalance,
  getKeikiBalance
};
