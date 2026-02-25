import { createDbClient } from '@horo/db';
import { config } from '../config';

export const db = createDbClient(config.database.url);
