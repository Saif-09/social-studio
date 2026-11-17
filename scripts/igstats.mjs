// Instagram stats for the last 25 posts (views, reach, likes, comments, shares, saves, avg watch).
// Token: $META_TOKEN, else ~/.config/reel-studio/meta-token (never printed).
// Account: IG_ID / PAGE_ID env (required). Usage: node igstats.mjs
import fs from 'fs'; import os from 'os';
const TF = [os.homedir() + '/.config/reel-studio/meta-token'].find((f) => fs.existsSync(f));
const TOKEN = (process.env.META_TOKEN || (TF ? fs.readFileSync(TF, 'utf8') : '')).trim();
if (!TOKEN) { console.log('No Meta token: see README (Secrets)'); process.exit(1); }
const G='https://graph.facebook.com/v27.0', IG=process.env.IG_ID, PAGE=process.env.PAGE_ID;
const j=async(u)=>{const r=await fetch(u);return r.json();};
const pages=await j(`${G}/me/accounts?fields=id,access_token&access_token=${TOKEN}`);
const tok=pages.data?.find(p=>p.id===PAGE)?.access_token; if(!tok){console.log('TOKEN ERR',JSON.stringify(pages.error));process.exit(1);}
const acct=await j(`${G}/${IG}?fields=followers_count,media_count&access_token=${tok}`); console.log('ACCOUNT',JSON.stringify(acct));
const r=await j(`${G}/${IG}/media?fields=id,caption,media_type,media_product_type,timestamp,like_count,comments_count&limit=25&access_token=${tok}`);
for(const m of r.data){
  const met=m.media_product_type==='REELS'?'views,reach,saved,shares,ig_reels_avg_watch_time':'views,reach,saved,shares';
  const ins=await j(`${G}/${m.id}/insights?metric=${met}&access_token=${tok}`);
  const v={}; (ins.data||[]).forEach(d=>v[d.name]=d.values?.[0]?.value);
  const ist=new Date(new Date(m.timestamp).getTime()+5.5*3600e3).toISOString().slice(5,16).replace('T',' ');
  console.log([ist+' IST',m.media_product_type,m.media_type,v.views??'-',v.reach??'-',m.like_count,m.comments_count,v.shares??'-',v.saved??'-',v.ig_reels_avg_watch_time?(Math.round(v.ig_reels_avg_watch_time/100)/10)+'s':'-',(m.caption||'').replace(/\s+/g,' ').slice(0,50)].join(' | '));
}
