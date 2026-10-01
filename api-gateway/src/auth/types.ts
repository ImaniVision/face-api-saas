import type { Request } from 'express';

export interface Caller {
  sub: string;
  email?: string;
}

export interface AuthedRequest extends Request {
  user: Caller;
  /** Set when the caller authenticated with an API key (not a portal session). */
  apiKeyId?: string;
}
