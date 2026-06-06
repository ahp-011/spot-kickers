// ════════════════════════════════════════════════════════════
//  PENALTY KICK — simple: you shoot, the keeper tries to save.
//  Plain HTML5 Canvas, vanilla JS, zero dependencies.
// ════════════════════════════════════════════════════════════

// ─────────── CONFIG — tune the feel here ───────────
const CFG = {
  totalShots:   5,
  ballSpeed:    1.7,    // higher = faster ball flight
  shakeMag:     10,     // screen shake on goal
  // Patrolling keeper — slides left/right; save depends on its position
  keeperPatrolRange: 0.20,  // how far the keeper roams (fraction of goal width, each side)
  keeperPatrolSpeed: 1.1,   // patrol sweep speed (lower = slower / easier)
  keeperReach:       0.26,  // how wide an area the keeper can dive-save (fraction of goal width)
  keeperTopBonus:    0.82,  // reach multiplier for high shots (<1 = top corners are harder to save)
  keeperWrongGuess:  0.0,   // chance keeper fumbles a reachable ball (0 = glove always matches outcome)
  goalDiveShort:     0.35,  // on a GOAL, keeper dives only this fraction of its reach (clear visible gap)
  // Swipe-to-aim controls
  swipeSensX:   1.5,    // horizontal aim sensitivity (drag px → goal px)
  powerSpan:    0.34,   // up-swipe of this fraction of screen height = full power
  curveScale:   1.0,    // how strongly a curved swipe bends the ball
  curveMax:     0.20,   // max bend as fraction of screen width
  overThresh:   1.2,    // power above this sails over the bar (miss)
  minSwipe:     22,     // px; shorter than this is ignored (teaches the swipe)
  // Cinematic finish
  slowmoScale:  0.42,   // time scale during the final kick
  finalZoom:    1.5,    // camera zoom on the final kick
  // Goalkeeper kit (cartoon — black & yellow)
  gkShirt:  '#1f2330',
  gkTrim:   '#ffd23f',
  gkSkin:   '#f0c39b',
  skin:     '#f0c39b',
  ink:      '#1a1f33',   // cartoon outline colour
  // Bright daytime scene palette
  sky1:'#bfe9ff', sky2:'#8fd2f2',
  grass1:'#6fcb53', grass2:'#5cc043',
  line:'#f3fff0',
};

// ─────────── TEAMS — World Cup 2026 nations ───────────
// shirt = jersey, shorts = shorts, accent = vivid UI colour, num = shirt back colour
const TEAMS = [
  { abbr:'ARG', name:'Argentina',    flag:'🇦🇷', shirt:'#75aadb', shorts:'#2a3b6b', accent:'#75aadb' },
  { abbr:'BRA', name:'Brazil',       flag:'🇧🇷', shirt:'#ffdf00', shorts:'#1d4ed8', accent:'#fcd116' },
  { abbr:'FRA', name:'France',       flag:'🇫🇷', shirt:'#1e3a8a', shorts:'#ffffff', accent:'#3a8bff' },
  { abbr:'ENG', name:'England',      flag:'🏴', shirt:'#f4f6fb', shorts:'#16225a', accent:'#e63946' },
  { abbr:'ESP', name:'Spain',        flag:'🇪🇸', shirt:'#c60b1e', shorts:'#16225a', accent:'#e63946' },
  { abbr:'POR', name:'Portugal',     flag:'🇵🇹', shirt:'#b8121b', shorts:'#0b6b2e', accent:'#e63946' },
  { abbr:'GER', name:'Germany',      flag:'🇩🇪', shirt:'#f4f6fb', shorts:'#1a1a1a', accent:'#d4af37' },
  { abbr:'NED', name:'Netherlands',  flag:'🇳🇱', shirt:'#f36c21', shorts:'#16225a', accent:'#f36c21' },
  { abbr:'ITA', name:'Italy',        flag:'🇮🇹', shirt:'#1e63b3', shorts:'#f4f6fb', accent:'#3a8bff' },
  { abbr:'BEL', name:'Belgium',      flag:'🇧🇪', shirt:'#b8121b', shorts:'#1a1a1a', accent:'#e63946' },
  { abbr:'CRO', name:'Croatia',      flag:'🇭🇷', shirt:'#e63946', shorts:'#16225a', accent:'#ff3b5c' },
  { abbr:'URU', name:'Uruguay',      flag:'🇺🇾', shirt:'#5aa9e6', shorts:'#1a1a1a', accent:'#5aa9e6' },
  { abbr:'USA', name:'USA',          flag:'🇺🇸', shirt:'#f4f6fb', shorts:'#16225a', accent:'#3a8bff' },
  { abbr:'MEX', name:'Mexico',       flag:'🇲🇽', shirt:'#0b6b2e', shorts:'#f4f6fb', accent:'#19c37d' },
  { abbr:'CAN', name:'Canada',       flag:'🇨🇦', shirt:'#e63946', shorts:'#f4f6fb', accent:'#ff3b5c' },
  { abbr:'JPN', name:'Japan',        flag:'🇯🇵', shirt:'#1b3a8f', shorts:'#16225a', accent:'#3a8bff' },
  { abbr:'KOR', name:'South Korea',  flag:'🇰🇷', shirt:'#e63946', shorts:'#16225a', accent:'#ff3b5c' },
  { abbr:'AUS', name:'Australia',    flag:'🇦🇺', shirt:'#f6c500', shorts:'#0b6b2e', accent:'#f6c500' },
  { abbr:'MAR', name:'Morocco',      flag:'🇲🇦', shirt:'#b8121b', shorts:'#0b6b2e', accent:'#e63946' },
  { abbr:'SEN', name:'Senegal',      flag:'🇸🇳', shirt:'#f4f6fb', shorts:'#0b6b2e', accent:'#19c37d' },
  { abbr:'NGA', name:'Nigeria',      flag:'🇳🇬', shirt:'#0b8a3e', shorts:'#f4f6fb', accent:'#19c37d' },
  { abbr:'GHA', name:'Ghana',        flag:'🇬🇭', shirt:'#f4f6fb', shorts:'#b8121b', accent:'#e63946' },
  { abbr:'CMR', name:'Cameroon',     flag:'🇨🇲', shirt:'#0b6b2e', shorts:'#b8121b', accent:'#19c37d' },
  { abbr:'SUI', name:'Switzerland',  flag:'🇨🇭', shirt:'#d52b1e', shorts:'#f4f6fb', accent:'#e63946' },
  { abbr:'DEN', name:'Denmark',      flag:'🇩🇰', shirt:'#c60b1e', shorts:'#f4f6fb', accent:'#e63946' },
  { abbr:'COL', name:'Colombia',     flag:'🇨🇴', shirt:'#ffcd00', shorts:'#1b3a8f', accent:'#fcd116' },
  { abbr:'ECU', name:'Ecuador',      flag:'🇪🇨', shirt:'#ffd200', shorts:'#16225a', accent:'#fcd116' },
  { abbr:'KSA', name:'Saudi Arabia', flag:'🇸🇦', shirt:'#0b8a3e', shorts:'#0b6b2e', accent:'#19c37d' },
  { abbr:'POL', name:'Poland',       flag:'🇵🇱', shirt:'#f4f6fb', shorts:'#b8121b', accent:'#e63946' },
  { abbr:'EGY', name:'Egypt',        flag:'🇪🇬', shirt:'#b8121b', shorts:'#f4f6fb', accent:'#e63946' },
  { abbr:'IRN', name:'Iran',         flag:'🇮🇷', shirt:'#f4f6fb', shorts:'#b8121b', accent:'#e63946' },
  { abbr:'NOR', name:'Norway',       flag:'🇳🇴', shirt:'#ba0c2f', shorts:'#16225a', accent:'#e63946' },
];

// ─────────── AUDIO (synthesized, no files) ───────────
let AC = null;
const audio = () => (AC ||= new (window.AudioContext || window.webkitAudioContext)());
function sfxKick(){ try{
  const ac=audio(), b=ac.createBuffer(1,ac.sampleRate*0.1,ac.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++){const t=i/ac.sampleRate; d[i]=(Math.random()*2-1)*Math.exp(-t*45)*0.7+Math.sin(2*Math.PI*110*t)*Math.exp(-t*30)*0.4;}
  const s=ac.createBufferSource(); s.buffer=b; const g=ac.createGain();
  g.gain.setValueAtTime(0.9,ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.1);
  s.connect(g); g.connect(ac.destination); s.start();
}catch(e){} }
function sfxCrowd(goal){ try{
  const ac=audio(), dur=goal?1.6:0.5, b=ac.createBuffer(1,ac.sampleRate*dur,ac.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++){const t=i/ac.sampleRate; const env=goal?Math.min(t*7,1)*Math.exp(-t*0.7):Math.min(t*10,1)*Math.exp(-t*4);
    d[i]=(Math.random()*2-1)*env*0.3;}
  const s=ac.createBufferSource(); s.buffer=b; const g=ac.createGain();
  g.gain.value=goal?0.5:0.22; s.connect(g); g.connect(ac.destination); s.start();
}catch(e){} }
function sfxWhistle(){ try{
  const ac=audio(), o=ac.createOscillator(), g=ac.createGain();
  o.type='sine'; o.frequency.setValueAtTime(2300,ac.currentTime); o.frequency.linearRampToValueAtTime(2150,ac.currentTime+0.15);
  g.gain.setValueAtTime(0.25,ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.2);
  o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+0.2);
}catch(e){} }
function sfxNet(){ try{           // net swish on a goal
  const ac=audio(), b=ac.createBuffer(1,ac.sampleRate*0.25,ac.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++){const t=i/ac.sampleRate; d[i]=(Math.random()*2-1)*Math.exp(-t*14)*0.5;}
  const s=ac.createBufferSource(); s.buffer=b;
  const f=ac.createBiquadFilter(); f.type='highpass'; f.frequency.value=2500;
  const g=ac.createGain(); g.gain.value=0.5;
  s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
}catch(e){} }
function sfxWhoosh(){ try{        // ball sails wide/over
  const ac=audio(), o=ac.createOscillator(), g=ac.createGain();
  o.type='sawtooth'; o.frequency.setValueAtTime(700,ac.currentTime); o.frequency.exponentialRampToValueAtTime(180,ac.currentTime+0.3);
  g.gain.setValueAtTime(0.0001,ac.currentTime); g.gain.linearRampToValueAtTime(0.12,ac.currentTime+0.05); g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.32);
  const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=1200;
  o.connect(f); f.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+0.34);
}catch(e){} }

// ─────────── COMMENTARY ───────────
const GOAL_LINES=['TOP BINS! 🔥','WHAT A STRIKE!','UNSTOPPABLE!','GOLAZO! ⚽','IN OFF THE POST!','CLINICAL FINISH!','SENSATIONAL!','SENDS HIM THE WRONG WAY!'];
const SAVE_LINES=['DENIED! 🧤','HUGE SAVE!','NO WAY THROUGH!','KEEPER SAYS NO!','GREAT HANDS!','READ IT PERFECTLY!'];
const MISS_LINES=['SKIED IT! 😬','WAY OFF!','OFF TARGET!','OUCH…','THAT\'S IN THE STANDS!'];
const pickLine=a=>a[Math.floor(Math.random()*a.length)];

// ─────────── STATE ───────────
const S = {
  team: TEAMS[0],
  accent: TEAMS[0].accent,
  phase:'menu',
  kickAnim:0,      // 0..1 kicker leg swing on shoot
  kPatrol:0, kBaseX:0, kDiveX:0,  // keeper patrol phase, patrol pos, dive target (px offset)
  shot:0,          // current shot index (0-based)
  goals:0,
  results:[],      // 'goal' | 'miss'
  state:'aim',     // aim | flying | done
  // ball
  bx:0,by:0, tx:0,ty:0, anim:0, ballR:12, curve:0, flightSpeed:1.7,
  _outcome:'goal',  // goal | save | miss
  // keeper
  kx:0, kTarget:0, kLunge:0, kBob:0, keeperCele:0,
  // swipe aim
  aiming:false, sx:0, sy:0, ax:0, ay:0, swipePts:[], aim:null,
  // camera
  zoom:1, zoomTarget:1, camFX:0, camFY:0, timeScale:1, timeScaleTarget:1,
  // replay
  bestGoal:null, replay:false,
  // fx
  shake:0, ripple:0, particles:[],
  raf:null, last:0,
};

// ─────────── DOM ───────────
const $ = id => document.getElementById(id);
const screens = { menu:$('screen-menu'), game:$('screen-game'), end:$('screen-end') };
const canvas = $('canvas'); const ctx = canvas.getContext('2d');
const hintEl = $('hint'); const flash = $('flash'); const flashText = $('flash-text');

function show(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); }

// ─────────── MENU: team grid ───────────
function loadPreferredTeam(){
  try{ const saved=localStorage.getItem('wc26-team');
    const t=TEAMS.find(x=>x.abbr===saved); if(t) return t; }catch(e){}
  return TEAMS[0];
}
function buildTeamGrid(){
  const grid=$('team-grid'); grid.innerHTML='';
  TEAMS.forEach(t=>{
    const b=document.createElement('button');
    b.className='team-btn'+(t.abbr===S.team.abbr?' active':'');
    b.style.setProperty('--tc', t.accent);
    b.innerHTML=`<span class="tb-flag">${t.flag}</span><span class="tb-abbr">${t.abbr}</span>`;
    b.addEventListener('click', ()=>selectTeam(t, b));
    grid.appendChild(b);
    if(t.abbr===S.team.abbr) setTimeout(()=>b.scrollIntoView({block:'nearest'}),0);
  });
}
function selectTeam(t, btn){
  S.team=t; S.accent=t.accent;
  try{ localStorage.setItem('wc26-team', t.abbr); }catch(e){}
  document.documentElement.style.setProperty('--accent', t.accent);
  document.querySelectorAll('.team-btn').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  $('tc-flag').textContent=t.flag;
  $('tc-name').textContent=t.name;
}
// restore preferred country on load
S.team = loadPreferredTeam(); S.accent = S.team.accent;
document.documentElement.style.setProperty('--accent', S.accent);
$('tc-flag').textContent = S.team.flag;
$('tc-name').textContent = S.team.name;
buildTeamGrid();
$('btn-play').addEventListener('click', start);
$('btn-again').addEventListener('click', start);
$('btn-menu').addEventListener('click', ()=>{ stopLoop(); show('menu'); });

// ─────────── CANVAS SIZE (full-bleed, all phones) ───────────
function resize(){
  const sg = $('screen-game');
  const w = sg.clientWidth  || window.innerWidth;
  const h = sg.clientHeight || window.innerHeight;
  // drawing buffer == CSS size (game logic uses canvas.width/height as logical px)
  canvas.width  = Math.floor(w);
  canvas.height = Math.floor(h);
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
}
function onViewportChange(){ if(S.phase!=='menu'){ resize(); render(); } }
window.addEventListener('resize', onViewportChange);
window.addEventListener('orientationchange', ()=>setTimeout(onViewportChange, 120));
if(window.visualViewport) window.visualViewport.addEventListener('resize', onViewportChange);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ if(S.phase!=='menu') resize(); });

// ─────────── GAME FLOW ───────────
function start(){
  audio(); // unlock audio on user gesture
  S.phase='game'; S.shot=0; S.goals=0; S.results=[]; S.particles=[];
  S.bestGoal=null; S.replay=false;
  S.zoom=1; S.zoomTarget=1; S.timeScale=1; S.timeScaleTarget=1;
  document.documentElement.style.setProperty('--accent', S.team.accent);
  $('you-flag').textContent=S.team.flag; $('you-name').textContent=S.team.name;
  show('game'); resize(); updateHUD();
  // keeper idles during the intro; taps ignored until kickoff finishes
  S.state='intro';
  S.kx=0; S.kBaseX=0; S.bx=canvas.width/2; S.by=spotY(); S.ballR=Math.max(12,canvas.width*0.022);
  stopLoop(); S.last=performance.now(); S.raf=requestAnimationFrame(loop);

  // chosen-country flag flourish, then start play
  playKickoffFlag(S.team, ()=>{
    sfxWhistle();
    hintEl.classList.remove('hide'); hintEl.textContent='Swipe to aim — flick to curve it!';
    setTimeout(()=>hintEl.classList.add('hide'), 3000);
    newShot();
  });
}

function playKickoffFlag(team, done){
  const el=$('kickoff'), f=$('kickoff-flag'), n=$('kickoff-name');
  f.textContent=team.flag; n.textContent=team.name;
  el.classList.remove('hidden');
  // re-trigger the CSS animations
  el.style.animation='none'; void el.offsetWidth; el.style.animation='';
  clearTimeout(S._koTimer);
  S._koTimer=setTimeout(()=>{ el.classList.add('hidden'); done&&done(); }, 1500);
}

function newShot(){
  S.state='aim';
  S.anim=0; S.ballR=Math.max(12, canvas.width*0.022);
  S.bx=canvas.width/2; S.by=spotY();
  S.kx=0; S.kTarget=0; S.kLunge=0;
  S.kPatrol=Math.random()*Math.PI*2; S.kBaseX=0; S.kDiveX=0;
  S.ripple=0; S.kickAnim=0;
  S.curve=0; S.over=false; S.wide=false; S.keeperCele=0;
  S.aim=null; S.aiming=false; S.zoomTarget=1; S.timeScaleTarget=1;
  updateHUD();
}
function spotY(){ return canvas.height*0.66; }   // penalty-spot / ball start Y

function shoot(aim){
  if(S.state!=='aim') return;
  const g=goal(), W=canvas.width;
  S.tx=aim.tx; S.ty=aim.ty; S.curve=aim.curve; S.power=aim.power; S.over=aim.over; S.wide=aim.wide;
  S.flightSpeed=CFG.ballSpeed*(0.85+aim.power*0.45);     // harder swipe = faster ball
  S.state='flying'; S.anim=0; S.kickAnim=0.0001; S.ballR0=S.ballR;
  hintEl.classList.add('hide');
  sfxKick();

  if(aim.over || aim.wide){
    // ball misses on its own — keeper stays put
    S._outcome='miss'; S.kDiveX=S.kBaseX; S.kTarget=0;
  } else {
    // save depends on the keeper's CURRENT (patrol) position vs. where the ball goes
    const ballOff=S.tx-W/2, keeperOff=S.kBaseX;
    let reach=CFG.keeperReach*g.w;
    if(S.ty < g.y+g.h*0.42) reach*=CFG.keeperTopBonus;
    const saved=(Math.abs(ballOff-keeperOff)<=reach) && (Math.random()>=CFG.keeperWrongGuess);
    const maxDive=g.w*0.42, dir=Math.sign(ballOff-keeperOff)||1;
    if(saved){
      S._outcome='save';
      S.kDiveX=clamp(ballOff,-maxDive,maxDive);
      S.saveX=S.tx; S.saveY=S.ty;
      S.reboundX=clamp(S.tx+dir*W*0.18, g.x-W*0.05, g.x+g.w+W*0.05);
      S.reboundY=spotY()*0.95;
    } else {
      S._outcome='goal';
      S.kDiveX=clamp(keeperOff-dir*maxDive*0.7,-maxDive,maxDive);  // commits the wrong way
    }
    S.kTarget=clamp((S.kDiveX-keeperOff)/(g.w*0.30),-1,1);
  }

  // cinematic slow-mo + zoom on the final kick of the round
  if(!S.replay && S.shot===CFG.totalShots-1) startCinematic();
}

function startCinematic(){
  const g=goal();
  S.camFX=canvas.width/2; S.camFY=g.y+g.h*0.5;
  S.zoomTarget=CFG.finalZoom; S.timeScaleTarget=CFG.slowmoScale;
}
function endCinematic(){ S.zoomTarget=1; S.timeScaleTarget=1; }

function resolve(){
  S.state='done';

  // replay mode: celebrate the goal again, then return to the end screen
  if(S.replay){
    S.ripple=1.2; S.shake=CFG.shakeMag; spawnParticles(S.tx,S.ty); spawnSideConfetti();
    showFlash('GOAL!', 'REPLAY ⚽', '#2ecc55'); sfxCrowd(true); sfxNet(); vibrate([60,40,120]);
    setTimeout(()=>{ hideFlash(); endCinematic(); S.replay=false; S.phase='end'; stopLoop(); show('end'); }, 1800);
    return;
  }

  const o=S._outcome;
  if(o==='goal'){
    S.goals++; S.results.push('goal');
    S.ripple=1.2; S.shake=CFG.shakeMag; spawnParticles(S.tx,S.ty); spawnSideConfetti();
    showFlash('GOAL!', pickLine(GOAL_LINES), '#2ecc55'); sfxCrowd(true); sfxNet();
    vibrate([60,40,120]);
    captureBestGoal();
  } else if(o==='save'){
    S.results.push('miss'); S.keeperCele=0.0001;
    spawnPuff(S.saveX, S.saveY); S.shake=CFG.shakeMag*0.4;
    showFlash('SAVED!', pickLine(SAVE_LINES), '#e8413a'); sfxCrowd(false);
    vibrate(35);
  } else { // miss (over/wide)
    S.results.push('miss'); S.shake=CFG.shakeMag*0.3;
    showFlash(S.over?'OVER!':'WIDE!', pickLine(MISS_LINES), '#ffb020'); sfxWhoosh();
    vibrate(20);
  }
  updateHUD();
  S.shot++;
  const wait=(S.timeScaleTarget<1)?2300:1500;   // linger on the cinematic final kick
  setTimeout(()=>{
    hideFlash(); endCinematic();
    if(S.shot>=CFG.totalShots) end();
    else newShot();
  }, wait);
}

// remember the prettiest goal (corner + height + curve) for the replay
function captureBestGoal(){
  const g=goal();
  const corner=Math.abs(S.tx-canvas.width/2)/(g.w/2);
  const high=1-(S.ty-g.y)/g.h;
  const score=corner*1.2 + high + Math.abs(S.curve)/(canvas.width*0.08);
  if(!S.bestGoal || score>S.bestGoal.score){
    S.bestGoal={ score, tx:S.tx, ty:S.ty, curve:S.curve, power:S.power, kBaseX:S.kBaseX };
  }
}

function end(){
  S.phase='end'; stopLoop();
  const g=S.goals, total=CFG.totalShots, saves=total-g;
  $('end-num').textContent=`${g} / ${total}`;
  let emoji,title,msg,col;
  if(g===total){ emoji='🏆'; title='PERFECT!'; msg=`${S.team.name} scored every penalty!`; col='#2ecc55'; }
  else if(g>saves){ emoji='🎉'; title='YOU WIN!'; msg=`You beat the keeper — ${g} of ${total} scored!`; col='#2ecc55'; }
  else if(g===saves){ emoji='😬'; title='SO CLOSE'; msg=`The keeper matched you — ${g} of ${total}.`; col='#ffd23f'; }
  else { emoji='🧤'; title='KEEPER WINS'; msg=`The keeper saved too many — only ${g} of ${total}.`; col='#e8413a'; }
  $('end-emoji').textContent=emoji; $('end-title').textContent=title; $('end-msg').textContent=msg;
  document.getElementById('end-title').style.color = col;
  $('btn-replay').classList.toggle('hidden', !S.bestGoal);
  show('end');
}

// re-play the prettiest goal of the round in slow-mo with a zoom
function replayBest(){
  if(!S.bestGoal) return;
  const b=S.bestGoal, g=goal(), maxDive=g.w*0.42;
  S.phase='game'; show('game'); resize();
  S.replay=true; S.state='flying'; S.anim=0; S.kickAnim=0.0001; S.particles=[];
  S._outcome='goal';
  S.tx=b.tx; S.ty=b.ty; S.curve=b.curve; S.power=b.power;
  S.flightSpeed=CFG.ballSpeed*(0.85+b.power*0.45);
  S.bx=canvas.width/2; S.by=spotY(); S.ballR=Math.max(12,canvas.width*0.022); S.ballR0=S.ballR;
  S.kBaseX=b.kBaseX; S.kx=b.kBaseX; S.kLunge=0; S.keeperCele=0;
  const dir=Math.sign((b.tx-canvas.width/2)-b.kBaseX)||1;
  S.kDiveX=clamp(b.kBaseX-dir*maxDive*0.7,-maxDive,maxDive);
  S.kTarget=clamp((S.kDiveX-b.kBaseX)/(g.w*0.30),-1,1);
  startCinematic();
  stopLoop(); S.last=performance.now(); S.raf=requestAnimationFrame(loop);
}
$('btn-replay').addEventListener('click', replayBest);

// ─────────── HUD (scoreboard dot rows) ───────────
function renderDots(el, results, isYou){
  el.innerHTML='';
  for(let i=0;i<CFG.totalShots;i++){
    const d=document.createElement('div');
    let cls='sb-dot';
    if(results[i]==='goal') cls+=' goal';
    else if(results[i]==='miss') cls+=' miss';
    else if(isYou && i===S.shot && S.phase==='game') cls+=' current';  // your next kick
    d.className=cls;
    el.appendChild(d);
  }
}
function updateHUD(){
  renderDots($('you-dots'), S.results, true);
  $('sb-goal-num').textContent = S.goals;
}
function showFlash(t,sub,c){ flashText.textContent=t; flashText.style.color=c;
  const se=$('flash-sub'); se.textContent=sub||'';
  flash.classList.remove('hidden');
  flashText.style.animation='none'; void flashText.offsetWidth; flashText.style.animation='';
  se.style.animation='none'; void se.offsetWidth; se.style.animation=''; }
function hideFlash(){ flash.classList.add('hidden'); }

// ─────────── INPUT (swipe to aim, flick to curve) ───────────
function pt(e){ const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
canvas.addEventListener('pointerdown', e=>{
  if(S.state!=='aim') return;
  e.preventDefault();
  const p=pt(e); S.aiming=true; S.sx=p.x; S.sy=p.y; S.ax=p.x; S.ay=p.y;
  S.swipePts=[{x:p.x,y:p.y}];
  try{ canvas.setPointerCapture(e.pointerId); }catch(_){}
  hintEl.classList.add('hide');
});
canvas.addEventListener('pointermove', e=>{
  if(!S.aiming) return;
  const p=pt(e); S.ax=p.x; S.ay=p.y;
  S.swipePts.push({x:p.x,y:p.y});
  if(S.swipePts.length>40) S.swipePts.shift();
  S.aim=computeAim();
});
function endAim(e){
  if(!S.aiming) return; S.aiming=false;
  const dist=Math.hypot(S.ax-S.sx, S.ay-S.sy);
  S.aim=computeAim();
  if(dist<CFG.minSwipe || !S.aim.valid){
    // too small / not an up-swipe — show a nudge, don't shoot
    hintEl.classList.remove('hide'); hintEl.textContent='Swipe up toward the goal — flick to curve!';
    S.aim=null; return;
  }
  shoot(S.aim);
  S.aim=null;
}
canvas.addEventListener('pointerup', endAim);
canvas.addEventListener('pointercancel', ()=>{ S.aiming=false; S.aim=null; });

// turn the current swipe into an aim {tx,ty,power,curve,over,wide,valid}
function computeAim(){
  const g=goal(), W=canvas.width, H=canvas.height;
  const vx=S.ax-S.sx, vy=S.ay-S.sy;
  const power=clamp(-vy/(H*CFG.powerSpan), 0, 1.35);     // up-swipe length
  const rawX=W/2 + vx*CFG.swipeSensX;
  let ty=lerp(g.y+g.h*0.86, g.y+g.h*0.08, clamp(power,0,1));
  let over=false, wide=false;
  if(power>CFG.overThresh){ over=true; ty=g.y - g.h*0.14; }
  if(rawX < g.x - g.w*0.04 || rawX > g.x+g.w+g.w*0.04) wide=true;
  const tx=clamp(rawX, g.x - g.w*0.12, g.x+g.w+g.w*0.12);
  const curve=clamp(swipeBow(), -W*CFG.curveMax, W*CFG.curveMax) * CFG.curveScale;
  return { tx, ty, power, curve, over, wide, valid: power>0.08 && vy<0 };
}
// horizontal "bow" of the swipe path → curve amount
function swipeBow(){
  const p=S.swipePts; if(p.length<4) return 0;
  const a=p[0], b=p[p.length-1], m=p[Math.floor(p.length/2)];
  return m.x - (a.x+b.x)/2;
}

// ─────────── GEOMETRY ───────────
function goal(){
  const W=canvas.width,H=canvas.height;
  const gw=Math.min(W*0.46, H*0.80), gh=gw*0.46;
  return {x:(W-gw)/2, y:H*0.16, w:gw, h:gh};
}

// ─────────── PARTICLES ───────────
function spawnParticles(x,y){
  const cols=['#FFD700','#ff3b5c','#19c37d','#3a8bff','#fff','#ffb020'];
  for(let i=0;i<46;i++){const a=Math.random()*Math.PI*2,sp=2+Math.random()*6;
    S.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,life:1,dec:0.018+Math.random()*0.02,r:3+Math.random()*4,c:cols[Math.floor(Math.random()*cols.length)]});}
}
// confetti cannons firing inward from the left and right edges
function spawnSideConfetti(){
  const W=canvas.width, H=canvas.height;
  const cols=['#e23b3b','#2a6cf0','#1fb24a','#ffd23f','#ff7a5c','#19c6d6','#ffffff'];
  const burst=(ox,oy,dir)=>{           // dir: +1 = aim right, -1 = aim left
    for(let i=0;i<44;i++){
      const sp=9+Math.random()*10;
      const a=0.16+Math.random()*0.6;   // angle from vertical, fanned inward
      S.particles.push({
        x:ox, y:oy,
        vx:Math.sin(a)*sp*dir, vy:-Math.cos(a)*sp,
        life:1, dec:0.009+Math.random()*0.011,
        shape:'rect', w:4+Math.random()*4, h:7+Math.random()*6,
        rot:Math.random()*7, spin:(Math.random()-0.5)*0.4,
        c:cols[Math.floor(Math.random()*cols.length)],
      });
    }
  };
  burst(W*0.01, H*0.74, 1);    // left cannon → inward
  burst(W*0.99, H*0.74, -1);   // right cannon → inward
}

function spawnPuff(x,y){
  const cols=['#ffffff','#e9edf5','#cfd6e2','#ffd23f'];
  for(let i=0;i<18;i++){const a=Math.random()*Math.PI*2,sp=1+Math.random()*4;
    S.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1,life:1,dec:0.03+Math.random()*0.03,r:3+Math.random()*4,c:cols[i%cols.length]});}
}

// ─────────── LOOP ───────────
function stopLoop(){ if(S.raf){cancelAnimationFrame(S.raf); S.raf=null;} }
function loop(ts){
  const real=Math.min((ts-S.last)/1000,0.05); S.last=ts;
  // ease camera + slow-mo with real (unscaled) time
  S.zoom += (S.zoomTarget-S.zoom)*Math.min(1,real*6);
  S.timeScale += (S.timeScaleTarget-S.timeScale)*Math.min(1,real*6);
  const dt = real * S.timeScale;     // slow-mo scales gameplay time only
  update(dt); render();
  S.raf=requestAnimationFrame(loop);
}

function update(dt){
  // keeper idle bob
  S.kBob += dt*4;
  // kicker leg swing
  if(S.kickAnim>0 && S.kickAnim<1) S.kickAnim=Math.min(1,S.kickAnim+dt*4);
  // ball flight
  if(S.state==='flying'){
    S.anim += dt*S.flightSpeed;
    if(S.anim>=1){ S.anim=1; resolve(); }
    const W=canvas.width, R0=S.ballR0||canvas.width*0.022, sy=spotY();
    const curveOff = S.curve*Math.sin(Math.PI*Math.min(S.anim,1));   // bends mid-flight
    if(S._outcome==='save'){
      const tc=0.62;
      if(S.anim<=tc){
        const t=ease(S.anim/tc);
        S.bx=lerp(W/2,S.saveX,t)+curveOff; S.by=lerp(sy,S.saveY,t);
        S.ballR=lerp(R0,R0*0.55,t);
      } else {
        const t=ease((S.anim-tc)/(1-tc));
        S.bx=lerp(S.saveX,S.reboundX,t); S.by=lerp(S.saveY,S.reboundY,t);
        S.ballR=lerp(R0*0.55,R0*1.0,t);
      }
      S.kLunge=Math.min(1, S.anim/tc);
    } else {
      // GOAL or MISS: ball flies to its target (curving on the way)
      const t=ease(S.anim);
      S.bx=lerp(W/2,S.tx,t)+curveOff; S.by=lerp(sy,S.ty,t);
      S.ballR=lerp(R0, R0*(S._outcome==='miss'?0.38:0.5), t);
      S.kLunge=Math.min(1, S.anim*1.25);
    }
  }
  if(S.state==='done'){
    S.kLunge=Math.min(1, S.kLunge+dt*2);
    if(S._outcome==='save') S.keeperCele=Math.min(1, S.keeperCele+dt*1.8);  // keeper celebrates
  }
  // live aim recompute (keeper may have moved since pointermove)
  if(S.aiming) S.aim=computeAim();
  // keeper x position
  const g=goal();
  if(S.state==='aim'){
    // patrol slowly left/right
    S.kPatrol += dt*CFG.keeperPatrolSpeed;
    S.kBaseX = Math.sin(S.kPatrol)*CFG.keeperPatrolRange*g.w;
    S.kx = S.kBaseX;
  } else {
    // dive from wherever it was patrolling toward the ball
    S.kx = lerp(S.kBaseX, S.kDiveX, ease(S.kLunge));
  }
  // fx decay
  if(S.shake>0) S.shake=Math.max(0,S.shake-dt*40);
  if(S.ripple>0) S.ripple=Math.max(0,S.ripple-dt*1.6);
  for(let i=S.particles.length-1;i>=0;i--){const p=S.particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.vx*=0.99;if(p.spin)p.rot=(p.rot||0)+p.spin;p.life-=p.dec;if(p.life<=0)S.particles.splice(i,1);}
}

// ─────────── RENDER (bright cartoon stadium) ───────────
function render(){
  const W=canvas.width,H=canvas.height;
  ctx.save();
  if(S.shake>0) ctx.translate((Math.random()-0.5)*S.shake,(Math.random()-0.5)*S.shake);
  if(S.zoom>1.001){ ctx.translate(S.camFX,S.camFY); ctx.scale(S.zoom,S.zoom); ctx.translate(-S.camFX,-S.camFY); }

  drawSky(W,H);
  drawStands(W,H);
  drawField(W,H);
  drawGoal(W,H);
  drawKeeper(W,H);
  drawBall();          // ball is in front of keeper, behind kicker
  drawKicker(W,H);
  if(S.aiming && S.aim) drawAimPreview();
  for(const p of S.particles){
    ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,p.life)); ctx.fillStyle=p.c;
    if(p.shape==='rect'){ ctx.translate(p.x,p.y); ctx.rotate(p.rot||0); ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); }
    else { ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,7); ctx.fill(); }
    ctx.restore();
  }
  ctx.restore();
}

// dotted predicted trajectory + target crosshair while aiming
function drawAimPreview(){
  const a=S.aim, W=canvas.width, sy=spotY();
  const bad=a.over||a.wide;
  const col = bad ? 'rgba(232,65,58,.95)' : 'rgba(255,255,255,.95)';
  ctx.save();
  ctx.strokeStyle=col; ctx.lineWidth=Math.max(2.5,W*0.007); ctx.lineCap='round';
  ctx.setLineDash([W*0.018, W*0.024]);
  ctx.beginPath();
  for(let i=0;i<=22;i++){ const t=i/22, e=ease(t);
    const x=lerp(W/2,a.tx,e)+a.curve*Math.sin(Math.PI*t), y=lerp(sy,a.ty,e);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y); }
  ctx.stroke(); ctx.setLineDash([]);
  // target crosshair
  const r=W*0.026;
  ctx.beginPath(); ctx.arc(a.tx,a.ty,r,0,7); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(a.tx-r*1.5,a.ty); ctx.lineTo(a.tx+r*1.5,a.ty);
  ctx.moveTo(a.tx,a.ty-r*1.5); ctx.lineTo(a.tx,a.ty+r*1.5); ctx.stroke();
  ctx.restore();
}

// outline helper: fill then dark stroke (cartoon look)
function ol(fill, lw){ ctx.fillStyle=fill; ctx.fill(); ctx.lineWidth=lw||3; ctx.strokeStyle=CFG.ink; ctx.stroke(); }

function drawSky(W,H){
  const sky=ctx.createLinearGradient(0,0,0,H*0.34);
  sky.addColorStop(0,CFG.sky1); sky.addColorStop(1,CFG.sky2);
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H*0.34);
}

function drawStands(W,H){
  const top=H*0.05, h=H*0.20, bot=top+h;
  // crowd band (teal with speckle)
  ctx.fillStyle='#2a8fa0'; ctx.fillRect(0,top,W,h*0.7);
  ctx.save(); ctx.globalAlpha=0.5;
  for(let i=0;i<W*h/420;i++){
    ctx.fillStyle=['#e8e8e8','#ffd23f','#ff7a5c','#7fd0e0','#ffffff'][i%5];
    ctx.fillRect(Math.random()*W, top+Math.random()*h*0.66, 3, 3);
  }
  ctx.restore();
  // coloured billboard strip (red/cyan | yellow/green) like reference
  const by=bot-h*0.32, bh=h*0.32;
  const segs=[['#e23b3b',0,0.22],['#19c6d6',0.22,0.40],['#2a8fa0',0.40,0.60],['#ffd23f',0.60,0.78],['#3fbf57',0.78,1]];
  segs.forEach(([c,a,b])=>{ ctx.fillStyle=c; ctx.fillRect(W*a,by,W*(b-a),bh); });
  // white roof line + barrier
  ctx.fillStyle='#f2f6fa'; ctx.fillRect(0,top-H*0.012,W,H*0.012);
  ctx.fillStyle='rgba(255,255,255,.85)'; ctx.fillRect(0,bot-2,W,3);
}

function drawField(W,H){
  const top=H*0.25;
  // base grass
  ctx.fillStyle=CFG.grass1; ctx.fillRect(0,top,W,H-top);
  // perspective mowing stripes (taller toward bottom)
  let y=top, i=0;
  while(y<H){
    const band=(H-top)*(0.05+0.045*((y-top)/(H-top)))+6;
    if(i%2===0){ ctx.fillStyle=CFG.grass2; ctx.fillRect(0,y,W,band); }
    y+=band; i++;
  }
  // soft top shadow under stands
  const sh=ctx.createLinearGradient(0,top,0,top+H*0.05);
  sh.addColorStop(0,'rgba(0,0,0,.18)'); sh.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=sh; ctx.fillRect(0,top,W,H*0.05);

  // ── markings (white, perspective penalty box) ──
  const g=goal();
  const lineY=g.y+g.h;            // goal-line level
  ctx.strokeStyle=CFG.line; ctx.lineWidth=Math.max(3,W*0.004); ctx.lineJoin='round';
  // goal line
  ctx.beginPath(); ctx.moveTo(0,lineY); ctx.lineTo(W,lineY); ctx.stroke();
  // 6-yard box (trapezoid)
  const sixTop=lineY, sixBot=lineY+(H-lineY)*0.30;
  ctx.beginPath();
  ctx.moveTo(W*0.5-g.w*0.34, sixTop); ctx.lineTo(W*0.5-g.w*0.5, sixBot);
  ctx.lineTo(W*0.5+g.w*0.5, sixBot);  ctx.lineTo(W*0.5+g.w*0.34, sixTop);
  ctx.stroke();
  // penalty box (bigger trapezoid)
  const boxBot=lineY+(H-lineY)*0.78;
  ctx.beginPath();
  ctx.moveTo(W*0.5-g.w*0.62, sixTop); ctx.lineTo(W*0.5-g.w*1.05, boxBot);
  ctx.lineTo(W*0.5+g.w*1.05, boxBot);  ctx.lineTo(W*0.5+g.w*0.62, sixTop);
  ctx.stroke();
  // penalty spot + arc
  const sy=spotY();
  ctx.fillStyle=CFG.line; ctx.beginPath(); ctx.arc(W/2,sy,Math.max(3,W*0.006),0,7); ctx.fill();
  ctx.beginPath(); ctx.arc(W/2,sy,g.w*0.34,Math.PI*1.18,Math.PI*1.82); ctx.stroke();
}

function drawGoal(W,H){
  const g=goal();
  const post=Math.max(5,W*0.008);
  const depth=g.h*0.34;     // perspective depth of the net (receding up)
  // back frame (smaller, offset up)
  const bx=g.x+g.w*0.10, bw=g.w*0.80, by=g.y-depth*0.0, btop=g.y-depth;
  // ── netting ──
  ctx.save();
  // back panel
  ctx.fillStyle='rgba(245,250,255,.10)';
  ctx.fillRect(g.x, btop, g.w, g.h+depth*0.0);
  // mesh helper with ripple bulge
  const bulge=(x,y)=>{ if(S.ripple<=0) return [x,y];
    const dx=x-S.tx,dy=y-S.ty,d=Math.hypot(dx,dy),r=g.w*0.26;
    if(d>r) return [x,y]; return [x,y+(1-d/r)*S.ripple*18]; };
  ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=1;
  const cols=14, rows=8;
  for(let c=0;c<=cols;c++){const x=g.x+g.w*c/cols;ctx.beginPath();for(let r=0;r<=rows;r++){const[px,py]=bulge(x,g.y+g.h*r/rows);r?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
  for(let r=0;r<=rows;r++){const y=g.y+g.h*r/rows;ctx.beginPath();for(let c=0;c<=cols;c++){const[px,py]=bulge(g.x+g.w*c/cols,y);c?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
  // top netting (receding) — diagonal lines from crossbar to back
  ctx.strokeStyle='rgba(255,255,255,.3)';
  for(let c=0;c<=cols;c++){const x=g.x+g.w*c/cols;ctx.beginPath();ctx.moveTo(x,g.y);ctx.lineTo(bx+bw*c/cols,btop);ctx.stroke();}
  ctx.beginPath(); ctx.moveTo(bx,btop); ctx.lineTo(bx+bw,btop); ctx.stroke();
  ctx.restore();
  // ── posts + crossbar (white, rounded) ──
  ctx.fillStyle='#ffffff'; ctx.strokeStyle='rgba(0,0,0,.18)'; ctx.lineWidth=1.5;
  // left post, right post, crossbar
  roundRectPath(g.x-post/2, g.y, post, g.h+post/2, post*0.4); ctx.fill(); ctx.stroke();
  roundRectPath(g.x+g.w-post/2, g.y, post, g.h+post/2, post*0.4); ctx.fill(); ctx.stroke();
  roundRectPath(g.x-post/2, g.y-post/2, g.w+post, post, post*0.4); ctx.fill(); ctx.stroke();
}
function roundRectPath(x,y,w,h,r){ ctx.beginPath(); ctx.roundRect(x,y,w,h,r); }

function drawKeeper(W,H){
  const g=goal();
  const u=g.w*0.07;                       // unit scale (keeper size relative to goal)
  const baseX=W/2 + S.kx;
  const baseY=g.y+g.h+u*0.2;              // stand on the goal line

  // ── celebration: pops up with arms aloft after a save ──
  if(S.state==='done' && S._outcome==='save' && S.keeperCele>0){
    const c=ease(Math.min(1,S.keeperCele));
    const jump=Math.abs(Math.sin(S.keeperCele*Math.PI*2))*u*1.1*c;
    const hy=-u*3.5 - c*u*0.5;
    ctx.save();
    ctx.translate(baseX, baseY-jump);
    ctx.lineJoin='round'; ctx.lineCap='round';
    ctx.fillStyle='rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0,u*0.3+jump,u*2.2,u*0.55,0,0,7); ctx.fill();
    // arms up in a V
    ctx.lineWidth=u*0.85; ctx.strokeStyle=CFG.gkShirt;
    ctx.beginPath(); ctx.moveTo(-u*0.9,-u*2.3); ctx.lineTo(-u*1.7,hy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( u*0.9,-u*2.3); ctx.lineTo( u*1.7,hy); ctx.stroke();
    [[-u*1.7,hy],[u*1.7,hy]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,u*0.55,0,7);ol(CFG.gkTrim,2);});
    // body
    ctx.beginPath(); ctx.roundRect(-u*1.1,-u*2.7,u*2.2,u*3.0,u*0.6); ol(CFG.gkShirt,3);
    ctx.fillStyle=CFG.gkTrim; ctx.fillRect(-u*1.1,-u*1.5,u*2.2,u*0.4);
    // legs
    ctx.lineWidth=u*0.85; ctx.strokeStyle=CFG.gkShirt;
    ctx.beginPath(); ctx.moveTo(-u*0.5,u*0.2); ctx.lineTo(-u*0.6,u*1.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( u*0.5,u*0.2); ctx.lineTo( u*0.6,u*1.7); ctx.stroke();
    // head
    ctx.beginPath(); ctx.arc(0,-u*3.4,u*0.85,0,7); ol(CFG.gkSkin,3);
    ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(0,-u*3.7,u*0.86,Math.PI,0,false); ctx.fill();
    ctx.restore();
    return;
  }

  const lunge=ease(S.kLunge);
  const dir=S.kTarget;                    // -1..1 dive direction
  const tilt=dir*lunge*1.15;              // rotate toward horizontal when diving
  const bob=S.state==='aim'?Math.sin(S.kBob)*u*0.12:0;

  ctx.save();
  ctx.translate(baseX, baseY+bob);
  // shadow on ground (stays flat)
  ctx.save(); ctx.setTransform(ctx.getTransform());
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0,u*0.3,u*2.4,u*0.6,0,0,7); ctx.fill();
  ctx.restore();
  ctx.rotate(tilt);
  ctx.lineJoin='round'; ctx.lineCap='round';

  // arms: ready stance hangs out to the sides; stretch out modestly when diving
  // (kept short so the glove never visually reaches a ball ruled a GOAL)
  const sh=u*0.9;                          // shoulder x
  const hx=u*1.4 + lunge*u*0.7;            // hand x (spreads when diving)
  const hy=lerp(-u*1.2, -u*3.1, lunge);    // hand y (rises when diving)
  ctx.lineWidth=u*0.85; ctx.strokeStyle=CFG.gkShirt; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-sh,-u*2.4); ctx.lineTo(-hx,hy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( sh,-u*2.4); ctx.lineTo( hx,hy); ctx.stroke();
  // gloves
  [[-hx,hy],[hx,hy]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,u*0.55,0,7);ol(CFG.gkTrim,2);});
  // body
  ctx.beginPath(); ctx.roundRect(-u*1.1,-u*2.7,u*2.2,u*3.0,u*0.6); ol(CFG.gkShirt,3);
  // yellow trim
  ctx.fillStyle=CFG.gkTrim; ctx.fillRect(-u*1.1,-u*1.5,u*2.2,u*0.4);
  // legs
  ctx.lineWidth=u*0.85; ctx.strokeStyle=CFG.gkShirt;
  ctx.beginPath(); ctx.moveTo(-u*0.5,u*0.2); ctx.lineTo(-u*0.7,u*1.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( u*0.5,u*0.2); ctx.lineTo( u*0.7+Math.abs(dir)*lunge*u,u*1.7); ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(0,-u*3.4,u*0.85,0,7); ol(CFG.gkSkin,3);
  ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(0,-u*3.7,u*0.86,Math.PI,0,false); ctx.fill();
  ctx.restore();
}

function drawKicker(W,H){
  const t=S.team;
  const u=Math.min(W,H)*0.034;            // kicker unit scale
  const cx=W*0.5, feetY=H*0.92;
  const k=S.kickAnim;
  const swing=k>0?Math.sin(Math.min(k,1)*Math.PI):0;
  const lift=swing*u*1.4, lean=swing*u*0.5;

  ctx.save();
  ctx.translate(cx+lean, feetY-lean*0.4);
  ctx.lineJoin='round'; ctx.lineCap='round';
  // shadow
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0,u*0.4,u*2.2,u*0.55,0,0,7); ctx.fill();

  // legs (behind shorts) — planted + kicking
  ctx.lineWidth=u*0.95;
  ctx.strokeStyle=t.shorts;
  ctx.beginPath(); ctx.moveTo(-u*0.6,-u*2.4); ctx.lineTo(-u*0.75,-u*0.2); ctx.stroke();         // planted thigh+shin (shorts/skin combined simplified)
  ctx.strokeStyle=CFG.skin;
  ctx.beginPath(); ctx.moveTo(-u*0.75,-u*1.0); ctx.lineTo(-u*0.8,u*0.1); ctx.stroke();
  // kicking leg lifts
  ctx.strokeStyle=t.shorts;
  ctx.beginPath(); ctx.moveTo(u*0.6,-u*2.4); ctx.lineTo(u*0.85,-u*0.6-lift); ctx.stroke();
  ctx.strokeStyle=CFG.skin;
  ctx.beginPath(); ctx.moveTo(u*0.85,-u*1.2-lift*0.6); ctx.lineTo(u*0.95,-u*0.1-lift); ctx.stroke();
  // boots
  ctx.fillStyle='#222';
  ctx.beginPath(); ctx.ellipse(-u*0.8,u*0.15,u*0.5,u*0.28,0,0,7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(u*0.95,-u*0.05-lift,u*0.5,u*0.28,0,0,7); ctx.fill();

  // shorts
  ctx.beginPath(); ctx.roundRect(-u*1.15,-u*2.9,u*2.3,u*1.1,u*0.4); ol(t.shorts,3);
  // shirt (back)
  ctx.beginPath(); ctx.roundRect(-u*1.3,-u*5.4,u*2.6,u*2.7,u*0.6); ol(t.shirt,3);
  // sleeves/arms
  ctx.lineWidth=u*0.85; ctx.strokeStyle=t.shirt;
  ctx.beginPath(); ctx.moveTo(-u*1.2,-u*5.0); ctx.lineTo(-u*2.0+swing*u*0.4,-u*3.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( u*1.2,-u*5.0); ctx.lineTo( u*2.0-swing*u*0.4,-u*3.6); ctx.stroke();
  ctx.strokeStyle=CFG.skin;
  ctx.beginPath(); ctx.moveTo(-u*2.0+swing*u*0.4,-u*3.6); ctx.lineTo(-u*2.2+swing*u*0.4,-u*3.0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo( u*2.0-swing*u*0.4,-u*3.6); ctx.lineTo( u*2.2-swing*u*0.4,-u*3.0); ctx.stroke();
  // number
  ctx.fillStyle=contrast(t.shirt); ctx.font=`900 ${u*1.5}px 'Luckiest Guy', system-ui`;
  ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('10',0,-u*4.0);
  // neck + head (back) + hair
  ctx.fillStyle=CFG.skin; ctx.fillRect(-u*0.35,-u*5.7,u*0.7,u*0.5);
  ctx.beginPath(); ctx.arc(0,-u*6.3,u*0.95,0,7); ol(CFG.skin,3);
  ctx.fillStyle='#5a3a22'; ctx.beginPath(); ctx.arc(0,-u*6.5,u*0.98,Math.PI*0.92,Math.PI*0.08,false); ctx.fill();
  ctx.restore();
}

// Adidas "Trionda" — FIFA World Cup 2026 official ball (white + red/blue/green pinwheel)
function drawBall(){
  const sy=spotY(), r=S.ballR, x=S.bx, y=S.by;
  ctx.save();
  // shadow on ground
  ctx.fillStyle='rgba(0,0,0,.25)';
  ctx.beginPath(); ctx.ellipse(x, sy+r*0.5, r*1.1, r*0.4, 0,0,7); ctx.fill();

  // white base + outline
  ctx.beginPath(); ctx.arc(x,y,r,0,7); ol('#ffffff', Math.max(2,r*0.14));

  // three coloured "waves" inside (clipped to the ball), rolling as it moves
  ctx.save();
  ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.clip();
  ctx.translate(x,y);
  ctx.rotate((x+y)*0.03);                 // roll
  const cols=['#e23b3b','#2a6cf0','#1fb24a'];   // red, blue, green (host nations)
  for(let k=0;k<3;k++){
    ctx.rotate(Math.PI*2/3);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.quadraticCurveTo( r*0.15,-r*0.95,  r*0.92,-r*0.52);
    ctx.quadraticCurveTo( r*1.12, r*0.05,  r*0.36, r*0.42);
    ctx.quadraticCurveTo( r*0.18, r*0.22,  0,0);
    ctx.closePath();
    ctx.fillStyle=cols[k]; ctx.fill();
  }
  // tiny dark centre + yellow speck (trionda accent)
  ctx.beginPath(); ctx.arc(0,0,r*0.12,0,7); ctx.fillStyle='#1a1f33'; ctx.fill();
  ctx.restore();

  // crisp outline over the clip edge
  ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.lineWidth=Math.max(2,r*0.12); ctx.strokeStyle=CFG.ink; ctx.stroke();
  // glossy highlight
  ctx.beginPath(); ctx.arc(x-r*0.32,y-r*0.34,r*0.22,0,7); ctx.fillStyle='rgba(255,255,255,.55)'; ctx.fill();
  ctx.restore();
}

// ─────────── UTIL ───────────
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>1-Math.pow(1-t,3);
function vibrate(pattern){ try{ if(navigator.vibrate) navigator.vibrate(pattern); }catch(e){} }
function contrast(hex){
  const c=hex.replace('#',''); const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
  return (0.299*r+0.587*g+0.114*b)>150 ? '#1a1a1a' : '#f4f6fb';
}

// init
show('menu');
