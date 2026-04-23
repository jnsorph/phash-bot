/**
 * Redis client initialization using ioredis.
 * Author: Jonas Pape, 2026
 */

import Redis from 'ioredis';
import { env } from '#@/config/env';

export const redis = new (Redis as any)(env.REDIS_URL);
