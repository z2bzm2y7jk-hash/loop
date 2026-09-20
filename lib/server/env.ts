import 'server-only';
import {z} from 'zod';

const serverEnvironmentSchema=z.object({
 DATABASE_URL:z.string().min(1).optional(),
 AUTH_SECRET:z.string().min(32).optional(),
 APP_ORIGIN:z.string().url().default('http://localhost:3000'),
 NODE_ENV:z.enum(['development','test','production']).default('development'),
});

export function serverEnvironment(){
 return serverEnvironmentSchema.parse({
  DATABASE_URL:process.env.DATABASE_URL,
  AUTH_SECRET:process.env.AUTH_SECRET,
  APP_ORIGIN:process.env.APP_ORIGIN,
  NODE_ENV:process.env.NODE_ENV,
 });
}

export function productionConfiguration(){
 const environment=serverEnvironment();
 return {
  databaseConfigured:Boolean(environment.DATABASE_URL),
  authConfigured:Boolean(environment.AUTH_SECRET),
  ready:environment.NODE_ENV!=='production'||Boolean(environment.DATABASE_URL&&environment.AUTH_SECRET),
 };
}
