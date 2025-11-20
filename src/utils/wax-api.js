const axios = require('axios');

// Configure axios with better timeout and error handling
const axiosInstance = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

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
    const response = await axiosInstance.post(CURRENCY_BALANCE_URL, payload);

    console.log('WAXP RPC response status:', response.status);
    console.log(
      'WAXP RPC response data:',
      JSON.stringify(response.data, null, 2)
    );

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
    console.error('Error fetching WAX balance:');
    console.error('Error message:', error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error status:', error.response.status);
      console.error(
        'Error data:',
        JSON.stringify(error.response.data, null, 2)
      );
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error config:', error.config);
    }

    throw new Error('Failed to fetch WAX balance');
  }
}

// ---------------------------------------------
// Get KEIKI balance - FIXED VERSION
// ---------------------------------------------
async function getKeikiBalance(wallet) {
  // CORRECTED payload structure for get_table_rows
  const payload = {
    code: 'orchidtokens',
    scope: wallet,
    table: 'accounts',
    json: true,
    limit: 100
  };

  console.log('Fetching KEIKI balance from:', TABLE_ROWS_URL);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axiosInstance.post(TABLE_ROWS_URL, payload);

    console.log('KEIKI RPC response status:', response.status);
    console.log(
      'KEIKI RPC response data:',
      JSON.stringify(response.data, null, 2)
    );

    // CORRECTED response parsing
    const rows = response.data.rows || [];

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
    console.error('Error fetching KEIKI balance:');
    console.error('Error message:', error.message);

    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error(
        'Error data:',
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      console.error('No response received:', error.request);
    }

    throw new Error('Failed to fetch Keiki balance');
  }
}

module.exports = {
  getWaxBalance,
  getKeikiBalance
};
