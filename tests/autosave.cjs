const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function harness(storage=new Map()){
 const nodes={},events={},timers=new Map();let now=0,nextTimer=0;
 const node=s=>nodes[s]||(nodes[s]={value:'',dataset:{},textContent:'',classList:{toggle(){}},addEventListener(t,f){this[t]=f},appendChild(){},focus(){},click(){},remove(){}});
 const context={crypto:require('node:crypto').webcrypto,TextEncoder,AbortController,btoa,Blob,URL,console,
  document:{visibilityState:'visible',querySelector:node,querySelectorAll:()=>[],createElement:()=>node('created'),body:{appendChild(){}},addEventListener(t,f){events[t]=f}},
  window:{addEventListener(t,f){events[t]=f}},navigator:{onLine:true},location:{reload(){}},confirm:()=>true,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  setTimeout:(f,ms)=>{const id=++nextTimer;timers.set(id,{f,due:now+ms});return id},clearTimeout:id=>timers.delete(id)};
 vm.createContext(context);vm.runInContext(source,context);
 const run=s=>vm.runInContext(s,context),flush=async()=>{for(let i=0;i<40;i++)await Promise.resolve()};
 const advance=async ms=>{now+=ms;let count=0;while(true){const due=[...timers].find(([,t])=>t.due<=now);if(!due)break;timers.delete(due[0]);due[1].f();await flush();if(++count>50)throw Error('timer loop')}};
 const start=()=>{node('#p1').value='Player 1';node('#p2').value='Player 2';node('#p3').value='Player 3';node('#courseInput').value='Test 🏌 course';node('#startHole').value='0';node('#startBtn').click()};
 const shot=()=>events.click({target:{closest:s=>s==='[data-shot]'?{dataset:{pi:'0',shot:'Fairway'}}:null}});
 return {context,node,events,timers,storage,run,advance,flush,start,shot};
}
{
 const h=harness();
 for(const [tee,yards] of [['blue',6277],['white',6027],['gold',5109],['red',4762]]){
  h.node('#coursePreset').value='meadows-'+tee;h.node('#coursePreset').change();
  assert.equal(h.node('#courseInput').readOnly,true);
  assert(h.node('#presetInfo').textContent.includes('2020'));
  h.start();assert.equal(h.run('state.course'),'The Meadows at Middlesex Golf Course');
  assert.equal(h.run('state.pars.reduce((a,b)=>a+b,0)'),70);
  assert.equal(h.run('state.yardages.reduce((a,b)=>a+b,0)'),yards);
  assert.equal(h.run('state.pars.length'),18);assert.equal(h.run('state.yardages.length'),18);
  assert.equal(h.run('state.pars[0]'),5);
  assert.equal(h.run('validateRoundFile(roundBackup()).tee'),tee[0].toUpperCase()+tee.slice(1));
  h.run('state.pars[0]=4');assert.equal(h.run("COURSE_PRESETS['meadows-"+tee+"'].pars[0]"),5);
 }
 h.node('#coursePreset').value='hopewell-blue';h.start();assert.equal(h.run('state.yardages[0]'),374);
 assert.equal(h.run('state.pars.reduce((a,b)=>a+b,0)'),72);
 h.node('#coursePreset').value='custom';h.node('#coursePreset').change();h.start();
 assert.equal(h.run('state.tee'),undefined);assert.equal(h.run('state.yardages'),undefined);
 console.log('PASS: Meadows four tee totals, preset selection, copied arrays, source dates, backup restore, Hopewell and custom reset.');
}
(async()=>{
 const h=harness(),files=new Map(),writes=[];let nextError=0,held=false,release;
 h.context.fetch=async(url,options)=>{
  if(!url.includes('/contents/'))return {ok:true,status:200,json:async()=>({permissions:{push:true}})};
  const filePath=url.split('/contents/')[1].split('?')[0];
  if(options.method!=='PUT'){const f=files.get(filePath);return f?{ok:true,status:200,json:async()=>({type:'file',sha:f.sha})}:{ok:false,status:404}}
  if(nextError){const status=nextError;nextError=0;return {ok:false,status}}
  const body=JSON.parse(options.body);assert.equal(body.branch,'round-data');
  if(held){held=false;await new Promise(resolve=>{release=resolve})}
  const backup=JSON.parse(Buffer.from(body.content,'base64').toString('utf8'));
  assert.equal(backup.round.course,'Test 🏌 course');
  assert(!JSON.stringify(backup).includes('mock-credential'));
  files.set(filePath,{sha:'sha-'+writes.length,backup});writes.push({filePath,body,backup});
  return {ok:true,status:body.sha?200:201,json:async()=>({})};
 };
 h.start();h.shot();assert.equal(h.run('hs(0)'),1);
 assert.equal(JSON.parse(h.storage.get('tournament-golf-tracker-v1')).players[0].holes[0].shots.length,1);
 const firstId=h.run('state.roundId');
 h.node('#githubToken').value='mock-credential';await h.node('#connectGithubBtn').click();assert.equal(h.node('#githubToken').value,'');
 await h.advance(0);assert.equal(writes.length,1);assert.equal(h.run('pendingCount()'),0);
 h.shot();await h.advance(10000);assert.equal(writes.length,1);
 h.shot();await h.advance(5000);assert.equal(writes.length,2);assert.equal(writes[1].backup.summary.players[0].totalScore,3);
 await h.advance(60000);assert.equal(writes.length,2,'clean rounds must not commit repeatedly');
 h.context.navigator.onLine=false;h.shot();h.start();h.shot();
 assert.equal(h.run('pendingCount()'),2,'old round must survive starting a new one while offline');
 const restarted=harness(h.storage);assert.equal(restarted.run('pendingCount()'),2);assert.equal(restarted.run('githubToken'),'');
 assert(![...h.storage.values()].join('').includes('mock-credential'));
 h.context.navigator.onLine=true;h.events.online();await h.advance(0);
 assert.equal(h.run('pendingCount()'),0);assert.equal(files.size,2);assert.equal(files.get(writes[0].filePath).backup.round.roundId,firstId);
 h.shot();held=true;const saving=h.run('saveRoundToGithub()');await h.flush();h.shot();release();await saving;
 assert.equal(h.run('pendingCount()'),1,'new edits during upload must remain queued');
 await h.advance(15000);assert.equal(h.run('pendingCount()'),0);
 h.shot();nextError=500;await h.advance(15000);assert.equal(h.run('pendingCount()'),1);assert(h.node('#githubStatus').textContent.includes('retry'));
 await h.advance(30000);assert.equal(h.run('pendingCount()'),0,'network failure must retry without another tap');
 h.shot();nextError=401;await h.advance(15000);assert.equal(h.run('githubPaused'),true);
 const before=writes.length;await h.advance(120000);assert.equal(writes.length,before,'invalid credentials must pause retries');
 await h.node('#saveGithubBtn').click();assert.equal(h.run('pendingCount()'),0);
 h.shot();h.context.document.visibilityState='hidden';h.events.visibilitychange();await h.flush();assert.equal(h.run('pendingCount()'),0);
 assert(h.node('#githubStatus').textContent.includes('All changes saved'));
 h.node('#disconnectGithubBtn').click();h.shot();await h.advance(60000);assert.equal(h.run('pendingCount()'),1);
 console.log('PASS: immediate local saves; automatic 15-second batching; Unicode data; separate rounds; durable offline queue; reconnect; edits during upload; retries; auth pause; hide flush; credential isolation.');
})().catch(e=>{console.error(e);process.exitCode=1});
