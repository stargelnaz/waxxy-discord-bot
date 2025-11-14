import { createHmac, timingSafeEqual } from 'crypto';

export interface DiscordInteraction {
  type: number;
  token: string;
  member?: any;
  user?: any;
  id: string;
  data?: {
    name: string;
    options?: any[];
  };
}

export interface DiscordResponse {
  type: number;
  data?: {
    content: string;
    flags?: number;
  };
}

export function verifySignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const publicKey = process.env.DISCORD_PUBLIC_KEY!;
  const message = timestamp + rawBody;
  const hmac = createHmac('sha256', publicKey);
  hmac.update(message);
  const digest = hmac.digest('hex');

  return timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(digest, 'hex')
  );
}

export function createResponse(
  content: string,
  ephemeral: boolean = false
): DiscordResponse {
  return {
    type: 4,
    data: {
      content,
      flags: ephemeral ? 64 : 0
    }
  };
}
