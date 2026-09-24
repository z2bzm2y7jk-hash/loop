import {drizzle} from 'drizzle-orm/mysql2';
import {migrate} from 'drizzle-orm/mysql2/migrator';
import {createPool} from 'mysql2/promise';

function databaseUrl(){
 const {DB_HOST,DB_PORT,DB_NAME,DB_USER,DB_PASSWORD,DATABASE_URL}=process.env;
 if(DB_NAME&&DB_USER&&DB_PASSWORD){
  const host=DB_HOST==='localhost'?'127.0.0.1':DB_HOST??'127.0.0.1';
  const port=DB_PORT??'3306';
  return `mysql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@${host}:${port}/${encodeURIComponent(DB_NAME)}`;
 }
 return DATABASE_URL;
}

const url=databaseUrl();

if(!url){
 console.log('Database migrations skipped: no production database is configured.');
 process.exit(0);
}

const pool=createPool({uri:url,connectionLimit:1,connectTimeout:10000});

try{
 await migrate(drizzle(pool),{migrationsFolder:'./drizzle'});
 console.log('Database migrations completed.');
}finally{
 await pool.end();
}
