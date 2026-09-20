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
 const {DATABASE_URL}=serverEnvironment();
 if(!DATABASE_URL)return null;
 return {database:configuredDatabase(DATABASE_URL)};
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
 }catch{
  return {configured:true,reachable:false} as const;
 }
}
