import type {NextConfig} from 'next';
const developmentEval=process.env.NODE_ENV==='development'?" 'unsafe-eval'":'';
const securityHeaders=[
 {key:'Content-Security-Policy',value:`default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${developmentEval}; connect-src 'self'; manifest-src 'self'; upgrade-insecure-requests`},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=(self), payment=()'},
 {key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'},
];
const config:NextConfig={devIndicators:false,output:'standalone',poweredByHeader:false,reactStrictMode:true,async headers(){return [{source:'/:path*',headers:securityHeaders}]}};
export default config;
