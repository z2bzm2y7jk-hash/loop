import type {Account} from './account';
import type {ProductData} from './product-model';
import type {Round} from './types';

type StorageLike=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
type StoredSnapshot={activeRound?:Round|null;round?:Round|null;history:Round[];productData?:ProductData;product?:ProductData;revision?:number;pendingSync?:boolean;savedAt?:string};

export type OfflineSnapshot={activeRound:Round|null;history:Round[];productData:ProductData;revision:number;source:'cache';pendingSync:boolean};

export function readOfflineSnapshot(storage:StorageLike,accountId:string):OfflineSnapshot|null{
 try{
  const raw=storage.getItem(`loop-cache-${accountId}`);if(!raw)return null;
  const cached=JSON.parse(raw) as StoredSnapshot;
  if(!Array.isArray(cached.history))return null;
  const productData=cached.productData??cached.product;
  if(!productData||productData.version!==1)return null;
  return {activeRound:cached.activeRound??cached.round??null,history:cached.history,productData,revision:cached.revision??0,source:'cache',pendingSync:cached.pendingSync===true};
 }catch{return null}
}

export function writeOfflineSnapshot(storage:StorageLike,accountId:string,snapshot:{activeRound:Round|null;history:Round[];productData:ProductData;revision:number;pendingSync:boolean;savedAt:string}){
 try{storage.setItem(`loop-cache-${accountId}`,JSON.stringify(snapshot));return true}catch{return false}
}

export function rememberOfflineAccount(storage:StorageLike,account:Account){try{storage.setItem('loop-last-account',JSON.stringify(account));return true}catch{return false}}
export function readOfflineAccount(storage:StorageLike):Account|null{try{const value=JSON.parse(storage.getItem('loop-last-account')??'null') as Account|null;return value?.id&&value.email&&value.displayName?{...value,emailVerified:value.emailVerified===true}:null}catch{return null}}
export function clearOfflineAccount(storage:StorageLike,accountId:string){try{storage.removeItem(`loop-cache-${accountId}`);storage.removeItem('loop-last-account')}catch{}}
