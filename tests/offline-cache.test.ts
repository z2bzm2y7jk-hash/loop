import {describe,expect,it} from 'vitest';
import {clearOfflineAccount,readOfflineAccount,readOfflineSnapshot,rememberOfflineAccount,writeOfflineSnapshot} from '../lib/offline-cache';
import {defaultProductData} from '../lib/product-model';
import {newRound} from '../lib/demo';
import type {Account} from '../lib/account';

function memoryStorage(){const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value)},removeItem:(key:string)=>{data.delete(key)}}}
const account:Account={id:'golfer-1',email:'golfer@example.com',displayName:'Jordan Taylor',emailVerified:false,handicap:18,preferences:{defaultHoles:18,defaultWager:5,homeCourse:'',distanceUnit:'yards',color:'#d9e4d2'}};

describe('offline recovery cache',()=>{
 it('restores an unsynced round and its product data',()=>{const storage=memoryStorage(),round=newRound(),productData=defaultProductData();round.results=[{scores:[4,5,4,6],greenie:null,sandies:[],dots:[],snake:null}];expect(writeOfflineSnapshot(storage,'golfer-1',{activeRound:round,history:[],productData,revision:3,pendingSync:true,savedAt:'2026-09-29T12:00:00.000Z'})).toBe(true);expect(readOfflineSnapshot(storage,'golfer-1')).toMatchObject({activeRound:{id:round.id,results:round.results},revision:3,pendingSync:true,source:'cache'})});
 it('keeps legacy cache keys readable',()=>{const storage=memoryStorage(),round=newRound(),product=defaultProductData();storage.setItem('loop-cache-golfer-1',JSON.stringify({round,history:[],product}));expect(readOfflineSnapshot(storage,'golfer-1')).toMatchObject({activeRound:{id:round.id},pendingSync:false})});
 it('treats a cached account from before verification as unverified',()=>{const storage=memoryStorage();storage.setItem('loop-last-account',JSON.stringify({...account,emailVerified:undefined}));expect(readOfflineAccount(storage)?.emailVerified).toBe(false)});
 it('rejects malformed cached data',()=>{const storage=memoryStorage();storage.setItem('loop-cache-golfer-1','{"history":"nope"}');expect(readOfflineSnapshot(storage,'golfer-1')).toBeNull()});
 it('remembers and clears the last account with its golf cache',()=>{const storage=memoryStorage();rememberOfflineAccount(storage,account);writeOfflineSnapshot(storage,account.id,{activeRound:null,history:[],productData:defaultProductData(),revision:0,pendingSync:false,savedAt:'2026-09-29T12:00:00.000Z'});expect(readOfflineAccount(storage)).toEqual(account);clearOfflineAccount(storage,account.id);expect(readOfflineAccount(storage)).toBeNull();expect(readOfflineSnapshot(storage,account.id)).toBeNull()});
});
