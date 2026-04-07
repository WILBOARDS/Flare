import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load env from monorepo root
config({ path: join(__dirname, '..', '..', '..', '..', '.env') });

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'typeorm_migrations',
});
