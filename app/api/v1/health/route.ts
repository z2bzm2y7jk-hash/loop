import {NextResponse} from 'next/server';
import {databaseHealth} from '@/lib/server/db/client';
import {productionConfiguration} from '@/lib/server/env';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
 const configuration=productionConfiguration();
 const database=await databaseHealth();
 const healthy=configuration.ready&&database.configured&&database.reachable;
 return NextResponse.json({
  status:healthy?'ok':'degraded',
  service:'loop-web',
  checks:{database:database.reachable?'ok':database.configured?'unreachable':'not_configured',authentication:configuration.authConfigured?'configured':'not_configured'},
  timestamp:new Date().toISOString(),
 },{status:healthy?200:503,headers:{'Cache-Control':'no-store'}});
}
