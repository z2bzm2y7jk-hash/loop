import 'server-only';
import nodemailer from 'nodemailer';
import {serverEnvironment} from '@/lib/server/env';

function configuration(){
 const environment=serverEnvironment();
 if(!environment.SMTP_HOST||!environment.SMTP_USER||!environment.SMTP_PASSWORD||!environment.SMTP_FROM)return null;
 return {environment,port:environment.SMTP_PORT??465};
}

export function emailDeliveryReady(){return Boolean(configuration())}

function safe(value:string){return value.replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]??character))}

async function send(to:string,subject:string,text:string,html:string){
 const config=configuration();
 if(!config)return false;
 const transport=nodemailer.createTransport({host:config.environment.SMTP_HOST,port:config.port,secure:config.port===465,auth:{user:config.environment.SMTP_USER,pass:config.environment.SMTP_PASSWORD}});
 await transport.sendMail({from:config.environment.SMTP_FROM,to,subject,text,html});
 return true;
}

export async function sendPasswordResetEmail(input:{email:string;displayName:string;token:string}){
 const url=new URL('/reset-password',serverEnvironment().APP_ORIGIN);url.searchParams.set('token',input.token);
 const name=safe(input.displayName),href=url.toString();
 return send(input.email,'Reset your Loop password',`Hi ${input.displayName},\n\nUse this secure link within 30 minutes to choose a new Loop password:\n${href}\n\nIf you did not request this, you can ignore this email.`,
  `<p>Hi ${name},</p><p>Use this secure link within 30 minutes to choose a new Loop password:</p><p><a href="${safe(href)}">Reset my password</a></p><p>If you did not request this, you can ignore this email.</p>`);
}

export async function sendVerificationEmail(input:{email:string;displayName:string;token:string}){
 const url=new URL('/verify-email',serverEnvironment().APP_ORIGIN);url.searchParams.set('token',input.token);
 const name=safe(input.displayName),href=url.toString();
 return send(input.email,'Verify your Loop email',`Hi ${input.displayName},\n\nConfirm that this email belongs to you:\n${href}\n\nThis link expires in 24 hours.`,
  `<p>Hi ${name},</p><p>Confirm that this email belongs to you:</p><p><a href="${safe(href)}">Verify my email</a></p><p>This link expires in 24 hours.</p>`);
}

export async function sendSupportNotification(input:{reference:string;email:string;category:string;message:string}){
 const to=serverEnvironment().SUPPORT_EMAIL;
 if(!to)return false;
 return send(to,`Loop support request ${input.reference}`,`From: ${input.email}\nCategory: ${input.category}\nReference: ${input.reference}\n\n${input.message}`,
  `<p><strong>From:</strong> ${safe(input.email)}<br><strong>Category:</strong> ${safe(input.category)}<br><strong>Reference:</strong> ${safe(input.reference)}</p><p>${safe(input.message).replace(/\n/g,'<br>')}</p>`);
}
