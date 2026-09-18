import {roundRecap} from './recap';
import {dollars,Round} from './types';
export async function makeShareCard(round:Round):Promise<File>{
 const recap=roundRecap(round),canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 ctx.fillStyle='#263d2c';ctx.fillRect(0,0,1080,1350);
 ctx.fillStyle='#d1dfba';ctx.font='700 25px Arial,sans-serif';ctx.fillText('LOOP.  /  THE ROUND, ALL SQUARED.',72,98);
 ctx.fillStyle='#fff';ctx.font='72px Georgia,serif';wrap(ctx,round.course,72,210,940,82);
 ctx.fillStyle='#d4dfd1';ctx.font='29px Arial,sans-serif';ctx.fillText(`${recap.date} · ${round.holes} holes`,72,385);
 roundRect(ctx,72,435,936,160,22,'#e4eaca');ctx.fillStyle='#263d2c';ctx.font='700 23px Arial,sans-serif';ctx.fillText('WINNER',108,485);ctx.font='60px Georgia,serif';ctx.fillText(`${recap.winner.player.name}  ${dollars(recap.winner.balance)}`,108,556);
 ctx.font='32px Arial,sans-serif';let y=665;recap.ranked.forEach(item=>{ctx.fillStyle='#fff';ctx.fillText(item.player.name,80,y);ctx.textAlign='right';ctx.font='700 32px Arial,sans-serif';ctx.fillText(dollars(item.balance),1000,y);ctx.textAlign='left';ctx.strokeStyle='#ffffff48';ctx.beginPath();ctx.moveTo(80,y+20);ctx.lineTo(1000,y+20);ctx.stroke();ctx.font='32px Arial,sans-serif';y+=84});
 ctx.fillStyle='#d1dfba';ctx.font='700 23px Arial,sans-serif';ctx.fillText('BIGGEST MOMENT',80,1060);ctx.fillStyle='#fff';ctx.font='36px Georgia,serif';wrap(ctx,recap.biggestMoment,80,1120,920,48);
 ctx.strokeStyle='#ffffff48';ctx.beginPath();ctx.moveTo(80,1240);ctx.lineTo(1000,1240);ctx.stroke();ctx.font='34px Georgia,serif';ctx.fillText('Run it back next Saturday?',80,1300);ctx.textAlign='right';ctx.font='700 38px Arial,sans-serif';ctx.fillText('loop.',1000,1300);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Could not make share card')),'image/png'));return new File([blob],`loop-${round.course.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.png`,{type:'image/png'});
}
function roundRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function wrap(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,width:number,lineHeight:number){let line='';for(const word of value.split(' ')){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;line=word}else line=next}if(line)ctx.fillText(line,x,y)}
