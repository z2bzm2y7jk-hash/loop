import {defineConfig} from 'drizzle-kit';

export default defineConfig({
 schema:'./lib/server/db/schema.ts',
 out:'./drizzle',
 dialect:'mysql',
 strict:true,
 verbose:true,
 dbCredentials:{url:process.env.DATABASE_URL??'mysql://loop_user:local_only@localhost:3306/loop_golf'},
});
