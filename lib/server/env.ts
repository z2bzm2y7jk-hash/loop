import 'server-only';
import {z} from 'zod';

const serverEnvironmentSchema=z.object({
 DATABASE_URL:z.string().min(1).optional(),
 DB_HOST:z.string().min(1).optional(),
 DB_PORT:z.coerce.number().int().positive().optional(),
 DB_NAME:z.string().min(1).optional(),
 DB_USER:z.string().min(1).optional(),
 DB_PASSWORD:z.string().min(1).optional(),
 AUTH_SECRET:z.string().min(32).optional(),
 APP_ORIGIN:z.string().url().default('http://localhost:3000'),
 NODE_ENV:z.enum(['development','test','production']).default('development'),
});

export function serverEnvironment(){
 return serverEnvironmentSchema.parse({
  DATABASE_URL:process.env.DATABASE_URL,
  DB_HOST:process.env.DB_HOST,
  DB_PORT:process.env.DB_PORT,
  DB_NAME:process.env.DB_NAME,
  DB_USER:process.env.DB_USER,
  DB_PASSWORD:process.env.DB_PASSWORD,
  AUTH_SECRET:process.env.AUTH_SECRET,
  APP_ORIGIN:process.env.APP_ORIGIN,
  NODE_ENV:process.env.NODE_ENV,
 });
}

export function productionConfiguration(){
 const environment=serverEnvironment();
 const databaseConfigured=Boolean(environment.DATABASE_URL||(environment.DB_NAME&&environment.DB_USER&&environment.DB_PASSWORD));
 return {
  databaseConfigured,
  authConfigured:Boolean(environment.AUTH_SECRET),
  ready:environment.NODE_ENV!=='production'||Boolean(databaseConfigured&&environment.AUTH_SECRET),
 };
}
