export type GuestInvite={kind:'round'|'event';id:string;token:string};

export function inviteFromHash(hash:string):GuestInvite|null{
 const params=new URLSearchParams(hash.replace(/^#/,''));
 const eventId=params.get('event'),eventToken=params.get('eventToken');
 if(eventId&&eventToken)return {kind:'event',id:eventId,token:eventToken};
 const roundId=params.get('round'),token=params.get('token');
 return roundId&&token?{kind:'round',id:roundId,token}:null;
}
