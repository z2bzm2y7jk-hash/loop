import 'server-only';
import {drizzle} from 'drizzle-orm/mysql2';
import * as schema from './schema';
import {serverEnvironment} from '@/lib/server/env';

function configuredDatabase(url:string){
 return drizzle({connection:{uri:url,connectionLimit:8,waitForConnections:true,queueLimit:64,enableKeepAlive:true,keepAliveInitialDelay:0,connectTimeout:5000},schema,mode:'default'});
}

type DatabaseState={database:ReturnType<typeof configuredDatabase>};

const globalDatabase=globalThis as typeof globalThis&{loopDatabase?:DatabaseState};

function createDatabase():DatabaseState|null{
 const environment=serverEnvironment();
 let url=environment.DATABASE_URL;
 if(environment.DB_NAME&&environment.DB_USER&&environment.DB_PASSWORD){
  const host=environment.DB_HOST==='localhost'?'127.0.0.1':environment.DB_HOST??'127.0.0.1';
  const port=environment.DB_PORT??3306;
  url=`mysql://${encodeURIComponent(environment.DB_USER)}:${encodeURIComponent(environment.DB_PASSWORD)}@${host}:${port}/${encodeURIComponent(environment.DB_NAME)}`;
 }
 if(!url)return null;
 return {database:configuredDatabase(url)};
}

export function databaseState(){
 if(globalDatabase.loopDatabase)return globalDatabase.loopDatabase;
 const state=createDatabase();
 if(state)globalDatabase.loopDatabase=state;
 return state;
}

export async function databaseHealth(){
 const state=databaseState();
 if(!state)return {configured:false,reachable:false} as const;
 try{
  await state.database.$client.query('SELECT 1');
  return {configured:true,reachable:true} as const;
 }catch(error){
  const details=error as {code?:unknown;errno?:unknown;syscall?:unknown;address?:unknown;port?:unknown};
  console.error(JSON.stringify({event:'database_health_failed',code:details.code??'UNKNOWN',errno:details.errno??null,syscall:details.syscall??null,address:details.address??null,port:details.port??null}));
  return {configured:true,reachable:false} as const;
 }
}
