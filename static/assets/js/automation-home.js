/**
 * ICT WEBWERK — ANIMATION SYSTEM v5
 * Per-breakpoint text configs, mobile mode, view-switch handling
 */
(function(){
'use strict';

/* ╔═══════════════════════════════════════════════════════════╗
   ║  TEXT VISIBILITY — PER-BREAKPOINT CONFIGS                ║
   ║  Tweak each breakpoint independently.                    ║
   ╚═══════════════════════════════════════════════════════════╝ */
const TEXT_DESKTOP = {  // > 1100px
    phaseHeights: [70, 65, 105, 90, 50],
    fadeInZone: 17, fadeOutZone: 12, slideDistance: 25,
};
const TEXT_TABLET = {   // 757px–1100px
    phaseHeights: [65, 60, 95, 60, 80],
    fadeInZone: 22, fadeOutZone: 14, slideDistance: 20,
};
const TEXT_MOBILE = {   // ≤756px
    phaseHeights: [55, 40, 60, 60, 85],
    fadeInZone: 25, fadeOutZone: 16, slideDistance: 15,
};

function getTextConfig() {
    if (S.W <= 756) return TEXT_MOBILE;
    if (S.W <= 1100) return TEXT_TABLET;
    return TEXT_DESKTOP;
}

/* ═══════════════════════════════════════════════════════════ */
const NODES = [
    {id:'schedule',label:'Schedule',sub:'Every day at 9:00',color:'#10b981',hdr:'#065f46',group:'trigger'},
    {id:'email',label:'Email Trigger',sub:'New email received',color:'#10b981',hdr:'#065f46',group:'trigger'},
    {id:'webhook',label:'Webhook',sub:'API call received',color:'#10b981',hdr:'#065f46',group:'trigger'},
    {id:'fetch',label:'Fetch Data',sub:'API / Database',color:'#3b82f6',hdr:'#1e3a5f',group:'process'},
    {id:'ai',label:'AI Analysis',sub:'GPT / Claude',color:'#8b5cf6',hdr:'#4c1d95',group:'ai'},
    {id:'report',label:'Send Report',sub:'Email summary',color:'#f97316',hdr:'#9a3412',group:'output'},
    {id:'post',label:'Post Update',sub:'Social media',color:'#f97316',hdr:'#9a3412',group:'output'},
    {id:'notify',label:'Notify Team',sub:'Slack / Teams',color:'#f97316',hdr:'#9a3412',group:'output'},
];
const I={};NODES.forEach((n,i)=>I[n.id]=i);
const CONNECTIONS=[
    {from:I.schedule,to:I.fetch},{from:I.email,to:I.fetch},{from:I.webhook,to:I.fetch},
    {from:I.fetch,to:I.ai},
    {from:I.ai,to:I.report},{from:I.ai,to:I.post},{from:I.ai,to:I.notify},
];
const HERO_IDS=[I.schedule,I.email,I.webhook,I.report,I.post,I.notify];
const PROCESS_IDS=[I.fetch,I.ai];

const NW=136,NH=64,NR=7,NHH=22;
// Mobile uses smaller nodes
function nw(){return S.W<=756?NW*.6:NW;}
function nh(){return S.W<=756?NH*.6:NH;}

const HERO_POS={
    [I.schedule]:{x:.08,y:.24},[I.email]:{x:.24,y:.56},[I.webhook]:{x:.13,y:.76},
    [I.report]:{x:.72,y:.22},[I.post]:{x:.83,y:.54},[I.notify]:{x:.66,y:.74},
};

const CAL={
    cols:5,days:['Mon','Tue','Wed','Thu','Fri'],times:['9:00','11:00','13:00','15:00'],
    place:{[I.schedule]:{col:0,row:0},[I.email]:{col:2,row:1},[I.webhook]:{col:4,row:2},
           [I.report]:{col:1,row:2},[I.post]:{col:3,row:0},[I.notify]:{col:4,row:3}},
};

const CLUSTER_POS={
    [I.schedule]:{x:.45,y:.20},[I.email]:{x:.45,y:.38},[I.webhook]:{x:.45,y:.56},
    [I.report]:{x:.75,y:.20},[I.post]:{x:.75,y:.38},[I.notify]:{x:.75,y:.56},
};
const CLUSTER_T={
    [I.schedule]:{s:.00,e:.40},[I.email]:{s:.08,e:.45},[I.webhook]:{s:.16,e:.50},
    [I.report]:{s:.30,e:.65},[I.post]:{s:.38,e:.70},[I.notify]:{s:.46,e:.75},
};

// Workflow positions per breakpoint
function WF(i){
    if(S.W<=756){
        // Mobile: columns spread wider, smaller nodes leave room for connections
        const positions={
            [I.schedule]:{x:.05,y:.14},[I.email]:{x:.05,y:.34},[I.webhook]:{x:.05,y:.54},
            [I.fetch]:{x:.38,y:.28},[I.ai]:{x:.38,y:.50},
            [I.report]:{x:.72,y:.14},[I.post]:{x:.72,y:.36},[I.notify]:{x:.72,y:.58},
        };
        return positions[i];
    }
    if(S.W<=1100){
        const positions={
            [I.schedule]:{x:.06,y:.22},[I.email]:{x:.06,y:.42},[I.webhook]:{x:.06,y:.62},
            [I.fetch]:{x:.30,y:.32},[I.ai]:{x:.52,y:.40},
            [I.report]:{x:.78,y:.20},[I.post]:{x:.78,y:.42},[I.notify]:{x:.78,y:.64},
        };
        return positions[i];
    }
    const positions={
        [I.schedule]:{x:.06,y:.18},[I.email]:{x:.06,y:.44},[I.webhook]:{x:.06,y:.70},
        [I.fetch]:{x:.30,y:.30},[I.ai]:{x:.52,y:.42},
        [I.report]:{x:.78,y:.16},[I.post]:{x:.78,y:.44},[I.notify]:{x:.78,y:.72},
    };
    return positions[i];
}

const ANIM_PHASES={
    0:{s:0.00,e:0.12},1:{s:0.12,e:0.25},2:{s:0.25,e:0.45},
    3:{s:0.45,e:0.75},4:{s:0.75,e:1.00},
};
// Mobile: skip calendar/cluster, merge phases 0+1 into one "float→workflow"
const ANIM_PHASES_MOBILE={
    0:{s:0.00,e:0.20},  // floating → gentle drift
    1:{s:0.20,e:0.50},  // workflow + connections
    2:{s:0.50,e:0.80},  // full picture + data flow
    3:{s:0.90,e:0.90},  // fade
};

function getAnimPhases(){return S.W<=756?ANIM_PHASES_MOBILE:ANIM_PHASES;}
function isMobile(){return S.W<=756;}

const DRIFT={speed:.0004,ax:20,ay:14};
const MOUSE={radius:220,strength:.04,ret:.015};

/* ═══════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════ */
const S={
    cvs:null,ctx:null,dpr:1,W:0,H:0,
    heroEl:null,scrollEl:null,overlayEl:null,phaseEls:[],
    mx:-9e3,my:-9e3,
    animPhase:-1,calP:0,clusterP:0,canvasOpacity:1,
    prevBreakpoint:'desktop', // track for view switching
    t:0,
    nx:[],ny:[],nvx:[],nvy:[],nop:[],nsc:[],nvis:[],nGlow:[],
    connDraw:[],connActive:[],
    particles:[],particlesActive:false,
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,lo,hi)=>Math.min(Math.max(v,lo),hi);
const easeIO=t=>t<.5?2*t*t:-1+(4-2*t)*t;
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function bezPt(a,b,c,d,t){const u=1-t;return{x:u*u*u*a.x+3*u*u*t*b.x+3*u*t*t*c.x+t*t*t*d.x,y:u*u*u*a.y+3*u*u*t*b.y+3*u*t*t*c.y+t*t*t*d.y};}

function currentBreakpoint(){
    if(S.W<=756)return'mobile';
    if(S.W<=1100)return'tablet';
    return'desktop';
}

/* ═══════════════════════════════════════════════════════════
   TEXT VISIBILITY
   ═══════════════════════════════════════════════════════════ */
function updateTextVisibility(){
    const cfg=getTextConfig();
    const vh=S.H;
    const fadeIn=cfg.fadeInZone/100*vh;
    const fadeOut=cfg.fadeOutZone/100*vh;
    S.phaseEls.forEach(el=>{
        const rect=el.getBoundingClientRect();
        const inner=el.querySelector('.phase-inner');
        if(!inner)return;
        const center=rect.top+rect.height/2;
        let opacity=1,slideY=0;
        if(center>vh-fadeIn){const t=clamp((vh-center)/fadeIn,0,1);opacity=t;slideY=(1-t)*cfg.slideDistance;}
        else if(center<fadeOut){const t=clamp(center/fadeOut,0,1);opacity=t;slideY=(1-t)*-cfg.slideDistance*.5;}
        inner.style.opacity=opacity;
        inner.style.transform=`translateY(${slideY}px)`;
    });
}

/* ═══════════════════════════════════════════════════════════
   APPLY LAYOUT — called on init and resize/breakpoint change
   ═══════════════════════════════════════════════════════════ */
function applyLayout(){
    const cfg=getTextConfig();
    let total=0;
    S.phaseEls.forEach((el,i)=>{
        const h=cfg.phaseHeights[i]||80;
        el.style.height=h+'vh';
        total+=h;
    });
    S.scrollEl.style.height=total+'vh';
}

/* ═══════════════════════════════════════════════════════════
   DRAWING — NODES
   ═══════════════════════════════════════════════════════════ */
function drawNode(c,i){
    if(!S.nvis[i]||S.nop[i]<.01)return;
    const n=NODES[i],x=S.nx[i],y=S.ny[i],sc=S.nsc[i];
    const w=nw()*sc,h=nh()*sc,r=NR*sc,hh=NHH*sc*(S.W<=756?.8:1),op=S.nop[i],gl=S.nGlow[i]||0;
    c.save();
    if(gl>.01){c.shadowColor=n.color;c.shadowBlur=18+gl*12;c.globalAlpha=gl*.45*op;
        roundRect(c,x-2,y-2,w+4,h+4,r+1);c.strokeStyle=n.color;c.lineWidth=2;c.stroke();c.shadowBlur=0;}
    c.shadowColor=n.color;c.shadowBlur=28;c.globalAlpha=.12*op;
    roundRect(c,x,y,w,h,r);c.fillStyle=n.color;c.fill();c.shadowBlur=0;
    c.globalAlpha=op;roundRect(c,x,y,w,h,r);
    c.fillStyle='#262640';c.strokeStyle=n.color;c.lineWidth=1.5*sc;c.fill();c.stroke();
    c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
    c.lineTo(x+w,y+hh);c.lineTo(x,y+hh);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);
    c.closePath();c.fillStyle=n.hdr;c.fill();
    c.beginPath();c.arc(x+14*sc,y+hh/2,3.5*sc,0,Math.PI*2);c.fillStyle=n.color;c.fill();
    const fs=S.W<=756?8.5:10;
    c.fillStyle='#f1f5f9';c.font=`600 ${Math.round(fs*sc)}px "DM Sans",sans-serif`;
    c.textAlign='center';c.fillText(n.label,x+w/2,y+hh/2+3.5*sc);
    c.fillStyle='#64748b';c.font=`400 ${Math.round((fs-1.5)*sc)}px "DM Sans",sans-serif`;
    c.fillText(n.sub,x+w/2,y+hh+(h-hh)/2+3*sc);
    c.fillStyle='#262640';c.strokeStyle='#4b5563';c.lineWidth=1.2*sc;
    c.beginPath();c.arc(x+w+1,y+h/2,3.5*sc,0,Math.PI*2);c.fill();c.stroke();
    c.beginPath();c.arc(x-1,y+h/2,3.5*sc,0,Math.PI*2);c.fill();c.stroke();
    c.restore();
}

/* ═══════════════════════════════════════════════════════════
   DRAWING — CONNECTIONS
   ═══════════════════════════════════════════════════════════ */
function connEP(ci){
    const cn=CONNECTIONS[ci],fi=cn.from,ti=cn.to;
    const w=nw(),h=nh();
    const x1=S.nx[fi]+w*S.nsc[fi]+1,y1=S.ny[fi]+h*S.nsc[fi]/2;
    const x2=S.nx[ti]-1,y2=S.ny[ti]+h*S.nsc[ti]/2;
    const mx=(x1+x2)/2;
    return{p0:{x:x1,y:y1},p1:{x:mx,y:y1},p2:{x:mx,y:y2},p3:{x:x2,y:y2}};
}
function drawConns(c){
    CONNECTIONS.forEach((cn,ci)=>{
        const d=S.connDraw[ci];if(d<.001)return;
        if(!S.nvis[cn.from]||!S.nvis[cn.to])return;
        const opF=S.nop[cn.from],opT=S.nop[cn.to];if(opF<.05||opT<.05)return;
        const ep=connEP(ci),act=S.connActive[ci];
        c.save();c.globalAlpha=Math.min(opF,opT)*.8;c.lineWidth=S.W<=756?1.8:2.5;
        if(act){const g=c.createLinearGradient(ep.p0.x,ep.p0.y,ep.p3.x,ep.p3.y);
            g.addColorStop(0,'#3b82f6');g.addColorStop(1,'#8b5cf6');c.strokeStyle=g;c.shadowColor='#3b82f6';c.shadowBlur=8;}
        else c.strokeStyle='#4b5563';
        c.beginPath();const steps=Math.floor(d*40);
        for(let s=0;s<=steps;s++){const t=s/40;const pt=bezPt(ep.p0,ep.p1,ep.p2,ep.p3,t);
            if(!s)c.moveTo(pt.x,pt.y);else c.lineTo(pt.x,pt.y);}
        c.stroke();c.restore();
    });
}

/* ═══════════════════════════════════════════════════════════
   DRAWING — CALENDAR (desktop/tablet only)
   ═══════════════════════════════════════════════════════════ */
function calM(){
    const rz=S.W*.40,zw=S.W-rz;
    const gw=Math.min(560,zw*.88),gh=Math.min(360,S.H*.52);
    const left=rz+(zw-gw)/2,top=(S.H-gh)/2;
    const colW=gw/CAL.cols,hdrH=40,rowH=(gh-hdrH)/CAL.times.length;
    return{left,top,gw,gh,colW,hdrH,rowH};
}
function calCell(col,row){const m=calM();return{x:m.left+m.colW*col+(m.colW-NW)/2,y:m.top+m.hdrH+m.rowH*row+(m.rowH-NH)/2};}
function drawCal(c,p){
    if(p<.01||isMobile())return; // skip on mobile
    const m=calM();c.save();c.globalAlpha=p*.92;
    roundRect(c,m.left-20,m.top-20,m.gw+40,m.gh+40,16);c.fillStyle='rgba(12,12,20,.92)';c.fill();
    c.strokeStyle='rgba(51,65,85,.35)';c.lineWidth=1;c.stroke();
    roundRect(c,m.left-20,m.top-20,m.gw+40,m.hdrH+10,16);c.fillStyle='rgba(8,10,22,.95)';c.fill();
    c.fillStyle='#e2e8f0';c.font='600 13px "DM Sans",sans-serif';c.textAlign='left';
    c.fillText('Your organized week',m.left+4,m.top+6);
    c.fillStyle='#475569';c.font='400 10px "DM Sans",sans-serif';
    c.fillText('Every task has its place and time',m.left+170,m.top+6);
    c.textAlign='center';c.font='700 10px "Space Mono",monospace';c.fillStyle='#94a3b8';
    for(let col=0;col<CAL.cols;col++)c.fillText(CAL.days[col],m.left+m.colW*col+m.colW/2,m.top+m.hdrH-6);
    c.textAlign='right';c.font='400 8px "Space Mono",monospace';c.fillStyle='#374151';
    for(let row=0;row<CAL.times.length;row++)c.fillText(CAL.times[row],m.left-8,m.top+m.hdrH+m.rowH*row+m.rowH/2+3);
    c.strokeStyle='rgba(51,65,85,.18)';c.lineWidth=.5;c.setLineDash([]);
    for(let col=1;col<CAL.cols;col++){c.beginPath();c.moveTo(m.left+m.colW*col,m.top+m.hdrH);c.lineTo(m.left+m.colW*col,m.top+m.gh);c.stroke();}
    for(let row=1;row<CAL.times.length;row++){c.beginPath();c.moveTo(m.left,m.top+m.hdrH+m.rowH*row);c.lineTo(m.left+m.gw,m.top+m.hdrH+m.rowH*row);c.stroke();}
    HERO_IDS.forEach(ni=>{const pl=CAL.place[ni];if(!pl)return;
        const cx=m.left+m.colW*pl.col+3,cy=m.top+m.hdrH+m.rowH*pl.row+3;
        c.globalAlpha=p*.07;roundRect(c,cx,cy,m.colW-6,m.rowH-6,5);c.fillStyle=NODES[ni].color;c.fill();c.globalAlpha=p*.92;});
    c.restore();
}

/* ═══════════════════════════════════════════════════════════
   DRAWING — HERO LINKS, PARTICLES
   ═══════════════════════════════════════════════════════════ */
function drawHeroLinks(c){
    const pairs=[[I.schedule,I.report],[I.email,I.post],[I.webhook,I.notify]];
    c.save();c.globalAlpha=.035;c.strokeStyle='#94a3b8';c.lineWidth=1;c.setLineDash([6,10]);
    pairs.forEach(([a,b])=>{const ax=S.nx[a]+nw(),ay=S.ny[a]+nh()/2,bx=S.nx[b],by=S.ny[b]+nh()/2;
        c.beginPath();c.moveTo(ax,ay);c.bezierCurveTo((ax+bx)/2,ay,(ax+bx)/2,by,bx,by);c.stroke();});
    c.restore();
}
function updatePart(dt){S.particles.forEach(p=>{if(!p.active)return;p.t+=dt*p.speed;
    if(p.t>1){p.active=false;return;}const ep=connEP(p.ci);const pt=bezPt(ep.p0,ep.p1,ep.p2,ep.p3,p.t);
    p.x=pt.x;p.y=pt.y;p.op=p.t<.1?p.t/.1:p.t>.85?(1-p.t)/.15:1;});}
function drawPart(c){S.particles.forEach(p=>{if(!p.active||p.op<.01)return;
    c.save();c.globalAlpha=p.op*.9;c.shadowColor=p.cl;c.shadowBlur=12;
    c.beginPath();c.arc(p.x,p.y,S.W<=756?3.5:5,0,Math.PI*2);c.fillStyle=p.cl;c.fill();c.restore();});}
function launchPart(){S.particles=[];
    [{ci:0,dl:0,cl:'#10b981'},{ci:1,dl:150,cl:'#10b981'},{ci:2,dl:300,cl:'#10b981'},
     {ci:3,dl:500,cl:'#3b82f6'},{ci:4,dl:800,cl:'#f97316'},{ci:5,dl:900,cl:'#f97316'},{ci:6,dl:1000,cl:'#f97316'}]
    .forEach(e=>setTimeout(()=>S.particles.push({ci:e.ci,t:0,speed:.0008,x:0,y:0,op:0,cl:e.cl,active:true}),e.dl));
    S.particlesActive=true;}

/* ═══════════════════════════════════════════════════════════
   SCROLL LOGIC
   ═══════════════════════════════════════════════════════════ */
function heroFrac(){const hH=S.heroEl?S.heroEl.offsetHeight:innerHeight;return clamp((pageYOffset||document.documentElement.scrollTop)/hH,0,1);}
function showP(){const el=S.scrollEl;if(!el)return 0;const hH=S.heroEl?S.heroEl.offsetHeight:0;return clamp(((pageYOffset||document.documentElement.scrollTop)-hH)/(el.offsetHeight-innerHeight),0,1);}
function animPhaseOf(p){const ph=getAnimPhases();for(const[k,v]of Object.entries(ph)){if(p>=v.s&&p<v.e)return+k;}return Object.keys(ph).length-1;}
function localP(phase,p){const v=getAnimPhases()[phase];if(!v)return 0;return clamp((p-v.s)/(v.e-v.s),0,1);}

/* ═══════════════════════════════════════════════════════════
   PHASE HANDLERS
   ═══════════════════════════════════════════════════════════ */
function setHeroOnly(){NODES.forEach((_,i)=>{S.nvis[i]=HERO_IDS.includes(i);S.nop[i]=S.nvis[i]?.55:0;S.nsc[i]=1;S.nGlow[i]=0;});}
function setAllVis(op){NODES.forEach((_,i)=>{S.nvis[i]=true;S.nop[i]=op;S.nsc[i]=1;});}

function enterAnimPhase(ph){
    S.animPhase=ph;
    if(isMobile()){
        // MOBILE phases
        switch(ph){
            case 0: setHeroOnly();S.connDraw.fill(0);S.connActive.fill(false);S.particlesActive=false;S.particles=[];S.nGlow.fill(0);break;
            case 1: // Workflow
                PROCESS_IDS.forEach(i=>{S.nvis[i]=true;S.nop[i]=0;S.nsc[i]=1;S.nGlow[i]=0;
                    S.nx[i]=WF(i).x*S.W;S.ny[i]=WF(i).y*S.H;});
                HERO_IDS.forEach(i=>{S.nvis[i]=true;S.nGlow[i]=0;});
                break;
            case 2: setAllVis(1);S.connDraw.fill(1);S.connActive.fill(true);if(!S.particlesActive)launchPart();break;
            case 3: break;
        }
    } else {
        // DESKTOP/TABLET phases
        switch(ph){
            case 0: setHeroOnly();S.connDraw.fill(0);S.connActive.fill(false);S.particlesActive=false;S.particles=[];S.nGlow.fill(0);break;
            case 1: setHeroOnly();break;
            case 2:
                PROCESS_IDS.forEach(i=>{S.nvis[i]=true;S.nop[i]=0;S.nsc[i]=1;S.nGlow[i]=0;
                    S.nx[i]=WF(i).x*S.W;S.ny[i]=WF(i).y*S.H;});
                HERO_IDS.forEach(i=>{S.nvis[i]=true;S.nGlow[i]=0;});
                break;
            case 3: setAllVis(1);S.connDraw.fill(1);S.connActive.fill(true);if(!S.particlesActive)launchPart();break;
            case 4: break;
        }
    }
}

/* ═══════════════════════════════════════════════════════════
   UPDATE
   ═══════════════════════════════════════════════════════════ */
let lastT=0;
function update(t){
    const dt=t-lastT;lastT=t;
    const hf=heroFrac();
    const sp=showP();
    const mob=isMobile();
    const baseNodeOp=mob?.35:.55; // dimmer on mobile

    // ── HERO ──
    if(hf<1){
        document.body.classList.add('hero-active');
        S.animPhase=-1;S.calP=0;S.clusterP=0;S.canvasOpacity=1;
        S.connDraw.fill(0);S.connActive.fill(false);
        S.particlesActive=false;S.particles=[];S.nGlow.fill(0);
        if(S.overlayEl)S.overlayEl.style.opacity=0;
        setHeroOnly();
        const content=S.heroEl?.querySelector('.hero-content');
        if(content){content.style.opacity=Math.max(0,1-hf*2.5);content.style.transform=`translateY(${hf*-50}px)`;}

        if(!mob){
            // Desktop/tablet: calendar fades in during hero scroll
            S.calP=clamp((hf-.15)/.7,0,1);
        }

        HERO_IDS.forEach(i=>{
            const hp=HERO_POS[i];
            const driftMul=1-hf;
            const dx=Math.sin(t*DRIFT.speed+i*1.4+.3)*DRIFT.ax*driftMul;
            const dy=Math.cos(t*DRIFT.speed*.7+i*.95+1.7)*DRIFT.ay*driftMul;
            const heroX=hp.x*S.W+dx,heroY=hp.y*S.H+dy;

            let tx,ty;
            if(mob){
                // Mobile: blend toward workflow positions directly
                const wp=WF(i);
                const blend=easeIO(clamp((hf-.1)/.8,0,1));
                tx=lerp(heroX,wp.x*S.W,blend);
                ty=lerp(heroY,wp.y*S.H,blend);
            } else {
                // Desktop/tablet: blend toward calendar
                const pl=CAL.place[i];
                const calTarget=pl?calCell(pl.col,pl.row):{x:heroX,y:heroY};
                const blend=easeIO(clamp((hf-.1)/.8,0,1));
                tx=lerp(heroX,calTarget.x,blend);
                ty=lerp(heroY,calTarget.y,blend);
            }

            // Mouse repulsion (desktop only)
            if(!mob){
                const mouseStr=(1-hf);
                const cx=S.nx[i]+nw()/2,cy=S.ny[i]+nh()/2;
                const ddx=cx-S.mx,ddy=cy-S.my,dist=Math.sqrt(ddx*ddx+ddy*ddy);
                if(dist<MOUSE.radius&&dist>0&&mouseStr>.01){
                    const f=(1-dist/MOUSE.radius)*MOUSE.strength*mouseStr;
                    const a=Math.atan2(ddy,ddx);
                    S.nvx[i]+=Math.cos(a)*f*MOUSE.radius;
                    S.nvy[i]+=Math.sin(a)*f*MOUSE.radius;
                }
            }
            S.nx[i]+=S.nvx[i];S.ny[i]+=S.nvy[i];
            const spring=lerp(MOUSE.ret,.08,hf);
            S.nx[i]+=(tx-S.nx[i])*spring;
            S.ny[i]+=(ty-S.ny[i])*spring;
            S.nvx[i]*=.94;S.nvy[i]*=.94;
            S.nop[i]=lerp(baseNodeOp,.85,hf);
        });
        return;
    }

    document.body.classList.remove('hero-active');

    // ── SHOWCASE ──
    const ph=animPhaseOf(sp);
    if(ph!==S.animPhase) enterAnimPhase(ph);
    const lp=localP(ph,sp);

    if(mob){
        // ── MOBILE ANIMATION ──
        switch(ph){
            case 0: // Gentle float, nodes drift to workflow positions
                HERO_IDS.forEach(i=>{const wp=WF(i);
                    S.nx[i]+=(wp.x*S.W-S.nx[i])*.06;S.ny[i]+=(wp.y*S.H-S.ny[i])*.06;
                    S.nop[i]+=(.5-S.nop[i])*.05;});
                break;
            case 1: { // Workflow builds
                const ease=.05;
                HERO_IDS.forEach(i=>{S.nx[i]+=(WF(i).x*S.W-S.nx[i])*ease;S.ny[i]+=(WF(i).y*S.H-S.ny[i])*ease;S.nop[i]+=(.7-S.nop[i])*ease;});
                PROCESS_IDS.forEach((ni,pi)=>{const f=clamp((lp-.1-pi*.1)/.25,0,1);S.nop[ni]+=(f*.7-S.nop[ni])*.06;});
                const cp=clamp((lp-.3)/.5,0,1);
                CONNECTIONS.forEach((_,ci)=>{S.connDraw[ci]=clamp((cp-ci*.04)*2.5,0,1);});
                S.connActive.fill(false);
                break;
            }
            case 2: // Full picture
                NODES.forEach((_,i)=>{if(!S.nvis[i])return;const wp=WF(i);if(!wp)return;
                    S.nx[i]+=(wp.x*S.W-S.nx[i])*.08;S.ny[i]+=(wp.y*S.H-S.ny[i])*.08;
                    S.nop[i]+=(.7-S.nop[i])*.06;
                    S.nGlow[i]+=(Math.sin(S.t*.002+i*.5)*.1+.15-S.nGlow[i])*.04;});
                S.connDraw.fill(1);
                S.canvasOpacity=Math.max(.05,1-clamp((lp-.5)/.5,0,1)*.95);
                break;
            case 3: // Fade
                S.canvasOpacity=Math.max(0,.05-lp*.1);
                NODES.forEach((_,i)=>{if(!S.nvis[i])return;const wp=WF(i);if(!wp)return;
                    S.nx[i]+=(wp.x*S.W-S.nx[i])*.08;S.ny[i]+=(wp.y*S.H-S.ny[i])*.08;});
                S.connDraw.fill(1);
                break;
        }
        // Mobile overlay
        if(S.overlayEl){
            let ov=0;
            if(ph===2)ov=clamp((lp-.4)/.6,0,1)*.8;
            else if(ph===3)ov=.8;
            S.overlayEl.style.opacity=ov;
        }
    } else {
        // ── DESKTOP/TABLET ANIMATION ──
        switch(ph){
            case 0:
                S.calP=1;
                HERO_IDS.forEach(i=>{const pl=CAL.place[i];if(!pl)return;const cell=calCell(pl.col,pl.row);
                    S.nx[i]+=(cell.x-S.nx[i])*.1;S.ny[i]+=(cell.y-S.ny[i])*.1;S.nop[i]=.85;});
                break;
            case 1: {
                S.clusterP=lp;S.calP=Math.max(0,1-lp*2.5);
                HERO_IDS.forEach(i=>{const ct=CLUSTER_T[i];const np=clamp((lp-ct.s)/(ct.e-ct.s),0,1);const e=easeIO(np);
                    const pl=CAL.place[i];if(!pl)return;const cell=calCell(pl.col,pl.row);const cl=CLUSTER_POS[i];
                    const tx=lerp(cell.x,cl.x*S.W,e),ty=lerp(cell.y,cl.y*S.H,e);
                    S.nx[i]+=(tx-S.nx[i])*.12;S.ny[i]+=(ty-S.ny[i])*.12;S.nop[i]+=(.9-S.nop[i])*.08;});
                break;
            }
            case 2: {
                S.calP=Math.max(0,1-lp*6);
                const ease=.05;
                HERO_IDS.forEach(i=>{S.nx[i]+=(WF(i).x*S.W-S.nx[i])*ease;S.ny[i]+=(WF(i).y*S.H-S.ny[i])*ease;S.nop[i]+=(.95-S.nop[i])*ease;});
                PROCESS_IDS.forEach((ni,pi)=>{const f=clamp((lp-.1-pi*.08)/.2,0,1);S.nop[ni]+=(f*.95-S.nop[ni])*.06;});
                const cp=clamp((lp-.3)/.5,0,1);
                CONNECTIONS.forEach((_,ci)=>{S.connDraw[ci]=clamp((cp-ci*.04)*2.5,0,1);});
                NODES.forEach((n,i)=>{let maxIn=0;CONNECTIONS.forEach((cn,ci)=>{if(cn.to===i)maxIn=Math.max(maxIn,S.connDraw[ci]);});
                    S.nGlow[i]+=(maxIn>.95?Math.sin(S.t*.004)*.3+.5:0-S.nGlow[i])*.06;});
                S.connActive.fill(false);
                break;
            }
            case 3:
                NODES.forEach((_,i)=>{if(!S.nvis[i])return;const wp=WF(i);if(!wp)return;
                    S.nx[i]+=(wp.x*S.W-S.nx[i])*.08;S.ny[i]+=(wp.y*S.H-S.ny[i])*.08;
                    S.nop[i]+=(1-S.nop[i])*.06;
                    S.nGlow[i]+=(Math.sin(S.t*.002+i*.5)*.15+.25-S.nGlow[i])*.04;});
                S.connDraw.fill(1);
                S.canvasOpacity=Math.max(.05,1-clamp((lp-.45)/.55,0,1)*.95);
                break;
            case 4:
                S.canvasOpacity=Math.max(0,.05-lp*.1);
                NODES.forEach((_,i)=>{if(!S.nvis[i])return;const wp=WF(i);if(!wp)return;
                    S.nx[i]+=(wp.x*S.W-S.nx[i])*.08;S.ny[i]+=(wp.y*S.H-S.ny[i])*.08;});
                S.connDraw.fill(1);
                break;
        }
        // Desktop overlay
        if(S.overlayEl){
            let ov=0;
            if(ph===3)ov=clamp((lp-.4)/.6,0,1)*.8;
            else if(ph===4)ov=.8;
            S.overlayEl.style.opacity=ov;
        }
    }

    if(S.particlesActive)updatePart(dt);
}

/* ═══════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════ */
function render(t){
    S.t=t;update(t);
    updateTextVisibility();
    const c=S.ctx,d=S.dpr;
    c.clearRect(0,0,S.W*d,S.H*d);c.save();c.scale(d,d);
    S.cvs.style.opacity=S.canvasOpacity;
    if(heroFrac()<1&&!isMobile())drawHeroLinks(c);
    if(S.calP>.01)drawCal(c,S.calP);
    drawConns(c);
    NODES.forEach((_,i)=>drawNode(c,i));
    if(S.particlesActive)drawPart(c);
    c.restore();
    requestAnimationFrame(render);
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
function init(){
    S.heroEl=document.getElementById('hero');
    S.scrollEl=document.getElementById('showcase-scroll');
    S.cvs=document.getElementById('main-canvas');
    S.overlayEl=document.getElementById('dark-overlay');
    S.phaseEls=Array.from(document.querySelectorAll('.phase'));
    if(!S.cvs)return;
    S.ctx=S.cvs.getContext('2d');S.dpr=devicePixelRatio||1;

    NODES.forEach((_,i)=>{S.nx[i]=0;S.ny[i]=0;S.nvx[i]=0;S.nvy[i]=0;S.nop[i]=0;S.nsc[i]=1;S.nvis[i]=false;S.nGlow[i]=0;});
    CONNECTIONS.forEach(()=>{S.connDraw.push(0);S.connActive.push(false);});

    S.prevBreakpoint=currentBreakpoint();
    applyLayout();

    function resize(){
        S.W=innerWidth;S.H=innerHeight;
        S.cvs.width=S.W*S.dpr;S.cvs.height=S.H*S.dpr;
        S.cvs.style.width=S.W+'px';S.cvs.style.height=S.H+'px';

        // Breakpoint change detection
        const bp=currentBreakpoint();
        if(bp!==S.prevBreakpoint){
            console.log(`📱 Breakpoint: ${S.prevBreakpoint} → ${bp}`);
            S.prevBreakpoint=bp;
            applyLayout();
            // Reset animation state so it re-enters correctly for new view
            S.animPhase=-1;
            S.calP=0;S.clusterP=0;S.canvasOpacity=1;
            S.connDraw.fill(0);S.connActive.fill(false);
            S.particlesActive=false;S.particles=[];S.nGlow.fill(0);
        }

        HERO_IDS.forEach(i=>{const hp=HERO_POS[i];
            if(heroFrac()<.1){S.nx[i]=hp.x*S.W;S.ny[i]=hp.y*S.H;}});
    }
    resize();
    addEventListener('resize',()=>{clearTimeout(S._rt);S._rt=setTimeout(resize,100);},{passive:true});
    addEventListener('mousemove',e=>{S.mx=e.clientX;S.my=e.clientY;});
    addEventListener('mouseleave',()=>{S.mx=-9e3;S.my=-9e3;});

    setTimeout(()=>{
        document.querySelectorAll('.hero-eyebrow,.hero-headline,.hero-sub,.hero-proof,.hero-actions').forEach(el=>{el.style.opacity='0';});
        anime({targets:'.hero-eyebrow',opacity:[0,1],translateY:[20,0],duration:700,delay:200,easing:'easeOutCubic'});
        anime({targets:'.hero-headline',opacity:[0,1],translateY:[40,0],duration:800,delay:400,easing:'easeOutCubic'});
        anime({targets:'.hero-sub',opacity:[0,1],translateY:[30,0],duration:700,delay:650,easing:'easeOutCubic'});
        anime({targets:'.hero-proof',opacity:[0,1],translateY:[20,0],duration:600,delay:800,easing:'easeOutCubic'});
        anime({targets:'.hero-actions',opacity:[0,1],translateY:[25,0],duration:700,delay:950,easing:'easeOutCubic'});
    },100);

    requestAnimationFrame(render);
    console.log('✅ Animation system ready');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();
