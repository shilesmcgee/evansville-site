export default async (req, context) => {
  const feeds = [
    "https://news.google.com/rss/search?q=evansville%20police%20officer&hl=en-US&gl=US&ceid=US:en",
    "https://news.google.com/rss/search?q=%22Evansville%22%20%22police%20officer%22&hl=en-US&gl=US&ceid=US:en"
  ];
  function unwrap(href){try{const u=new URL(href);const d=u.searchParams.get('url');return d?decodeURIComponent(d):href}catch{return href}}
  function parse(xml){const items=[];const blocks=xml.split(/<item>/i).slice(1);for(const b of blocks){const c=b.split("</item>")[0];const get=t=>(c.match(new RegExp(`<${t}[^>]*>([\s\S]*?)</${t}>`,"i"))||[])[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/gs,"$1").trim()||"";const title=get("title");const link=unwrap(get("link"));const pubDate=get("pubDate");const source=get("source");if(title&&link)items.push({title,link,pubDate,source})}return items}
  async function fetchOne(u){const r=await fetch(u,{headers:{"user-agent":"Mozilla/5.0"}});if(!r.ok)throw new Error("HTTP "+r.status);return parse(await r.text())}
  try{
    const sets=await Promise.allSettled(feeds.map(fetchOne));
    const seen=new Set(), out=[];
    for(const r of sets){if(r.status!=="fulfilled")continue;for(const it of r.value.slice(0,50)){const k=(it.link||"")+"|"+(it.title||"");if(!seen.has(k)){seen.add(k);out.push(it)}}}
    out.sort((a,b)=>new Date(b.pubDate||0)-new Date(a.pubDate||0));
    return new Response(JSON.stringify({items:out.slice(0,150)}),{headers:{"content-type":"application/json","cache-control":"public, max-age=300","access-control-allow-origin":"*"}});
  }catch(e){
    return new Response(JSON.stringify({error:e.message,items:[]}),{status:502,headers:{"content-type":"application/json","access-control-allow-origin":"*"}});
  }
};