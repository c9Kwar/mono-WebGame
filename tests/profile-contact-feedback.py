"""Compare identical 6s contact sequences; CDP timings cover the whole page, not GPU or mobile hardware."""
import argparse, asyncio, json, statistics, math
from pathlib import Path
from playwright.async_api import async_playwright

parser=argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:8082/')
parser.add_argument('--label',default='baseline')
parser.add_argument('--runs',type=int,default=3)
args=parser.parse_args()
out=Path('/tmp/mosslight-vfx-artifacts');out.mkdir(exist_ok=True)

SETUP="""() => {
 s.paused=false; s.vitality=100; s.heroHp=heroMaxHp(); s.rewardPending=false;
 boss=false; currentMob='slime'; phase='combat'; maxHp=hp=1e9;
 // The normal 100 ms game tick/render remains active. Isolate presentation
 // from automatic combat so both versions see precisely the same hit sequence.
 attackClock=enemyClock=-1000; s.effectsLite=false;
 showView('battle'); render();
} """
RUN="""() => new Promise(resolve => {
 const duration=6000, began=performance.now(); let last=began,nextOutgoing=0,nextIncoming=650,index=0,receivedIndex=0;
 const intervals=[], hits={outgoing:0,critical:0,received:0,blocked:0};
 let maxNodes=document.querySelectorAll('*').length,maxImpactNodes=0;
 function hit(amount, critical, received, blocked) {
   // Only the baseline jitter uses this local deterministic stream. Never
   // alter the simulation's global random stream across callbacks.
   const random=Math.random; let seed=13;
   Math.random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
   try { showImpact(amount,critical,received,blocked); } finally { Math.random=random; }
 }
 function frame(now) {
  const elapsed=now-began;
  intervals.push(now-last); last=now;
  if(elapsed>=nextOutgoing&&index<18) {
   const critical=index%4===3;hit(critical?42:21,critical,false,false);index++;
   hits.outgoing++;if(critical)hits.critical++;nextOutgoing=index*1000/3;
  }
  if(elapsed>=nextIncoming&&receivedIndex<5) {
   const blocked=receivedIndex%2===1;hit(blocked?7:18,false,true,blocked);
   receivedIndex++;hits.received++;if(blocked)hits.blocked++;nextIncoming=650+receivedIndex*1300;
  }
  maxImpactNodes=Math.max(maxImpactNodes,document.getElementById('impact-layer').querySelectorAll('*').length);
  if(intervals.length%30===0)maxNodes=Math.max(maxNodes,document.querySelectorAll('*').length);
  if(elapsed<duration)requestAnimationFrame(frame);
  else resolve({elapsed,intervals:intervals.slice(1),maxNodes,maxImpactNodes,hits,heroHp:s.heroHp,phase});
 }
 requestAnimationFrame(frame);
})"""

def quantile(nums,f):
 a=sorted(nums);return a[max(0,min(len(a)-1,math.ceil(f*len(a))-1))]

async def main():
 results=[]
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for device,viewport in [('desktop',{'width':1440,'height':1000}),('mobile',{'width':390,'height':844})]:
   for run in range(args.runs):
    context=await browser.new_context(viewport=viewport,device_scale_factor=1,is_mobile=device=='mobile',has_touch=device=='mobile',reduced_motion='no-preference')
    page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(args.url,wait_until='networkidle');await page.evaluate(SETUP)
    await page.wait_for_timeout(600)
    await page.locator('#arena').scroll_into_view_if_needed()
    if run==0:
     await page.screenshot(path=str(out/f'{args.label}-{device}-scene.png'),full_page=False)
     await page.evaluate("() => {showImpact(42,true,false,false);}")
     await page.wait_for_timeout(90)
     await page.locator('#arena').screenshot(path=str(out/f'{args.label}-{device}-critical.png'),animations='allow')
     await page.wait_for_timeout(1700)
    session=await context.new_cdp_session(page);await session.send('Performance.enable')
    before={m['name']:m['value'] for m in (await session.send('Performance.getMetrics'))['metrics']}
    perf=await page.evaluate(RUN)
    after={m['name']:m['value'] for m in (await session.send('Performance.getMetrics'))['metrics']}
    vals=perf.pop('intervals')
    perf.update(device=device,run=run+1,frames=len(vals),raf_p50_ms=round(statistics.median(vals),2),raf_p95_ms=round(quantile(vals,.95),2),raf_max_ms=round(max(vals),2),frames_over_33_ms=sum(v>33.4 for v in vals),errors=errors)
    for key in ['ScriptDuration','LayoutDuration','RecalcStyleDuration','TaskDuration']:
     perf[key+'_ms']=round((after[key]-before[key])*1000,2)
    results.append(perf);print(json.dumps(perf),flush=True)
    await context.close()
  await browser.close()
 data={'label':args.label,'url':args.url,'method':'Chromium headless, DPR 1, 6s, 18 outgoing (4 critical), 5 received (2 blocked); live 100ms simulation/render; attack clocks held away from auto hits; screenshots outside timing. CDP durations are whole page, not isolated VFX.','results':results}
 (out/f'{args.label}-perf.json').write_text(json.dumps(data,indent=2))

asyncio.run(main())
