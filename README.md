# Waxy Discord Bot

A serverless Discord bot for WAX blockchain interactions, deployed on AWS Lambda.

## Features

- `/wax` - Get WAX balance for any wallet
- `/keiki` - Get Keiki token balance

## Setup Instructions

### Prerequisites

1. Node.js 18+
2. AWS CLI configured
3. Discord Developer Account
4. Serverless Framework

### Environment Variables

Create a `.env` file with:

```env
DISCORD_APPLICATION_ID=your_app_id
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_BOT_TOKEN=your_bot_token
WAX_RPC_URL=https://wax.greymass.com
```
