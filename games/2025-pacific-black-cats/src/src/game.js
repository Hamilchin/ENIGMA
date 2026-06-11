    

//vec3 ROTY(vec3 v,float a){vec2 t=vec2(sin(a),cos(a));return vec3(t.y*v.x-t.x*v.z,v.y,t.x*v.x+t.y*v.z);}
//float id=float(gl_InstanceID);
//wpos=ROTY(wpos,id);
//if(mat==5.0){wpos.y=.0;vcol.a*=max(.0,.4+sin(wpos.z*100.0+time*.1));}

var vs=`
IN mat4 viewp;IN vec3 ceye;IN float time;IN vec4 color;IN float mat;IN float proj;
#ifdef INST
IN float scale;in vec4 offs;
#endif
out vec3 wpos;out vec3 lpos;out vec4 vcol;
float PI=${PI};
void main(){
wpos=pos;vcol=color;
#ifdef INST
wpos*=offs.w*scale;wpos+=offs.xyz;
#endif
wpos=(model*vec4(lpos=wpos,1.0)).xyz;
if(mat==2.){wpos.y=.01;vcol.xyz*=.0;}
if(mat==5.)wpos.y=.2;
gl_Position=viewp*vec4(wpos,1.0);
gl_PointSize=proj/gl_Position.w;
}
`,fs=`
in vec3 wpos;in vec3 lpos;in vec4 vcol;
IN vec3 ceye;IN float mat;IN float f;IN float time;
IN vec4 emis;IN vec4 bgcolor;IN vec4 color2;IN vec3 SUN;
#ifdef TEX
IN S2D tex;
#endif
void main(){
vec3 E=wpos-ceye;float dist=length(E);E/=dist;
vec4 C=vcol;vec3 N=-E;
if(mat==3.)N=normalize((model*vec4(normalize(cross(dFdx(lpos),dFdy(lpos))),.0)).xyz);
#ifdef TEX
C*=texture(tex,lpos.xz*.5+.5);if(C.a<.1)discard;
#endif
if(mat==1.){
C=E.y<.0?color2*(max(.15,SUN.y)):mix(emis,vcol,pow(clamp(E.y*10.,.0,1.),.4));
C+=max(.0,E.y*4.)*vec4(dot(SUN,E)>.9995?1.:.0);
C+=max(.0,E.y*4.)*vec4(dot(-SUN,E)>.9997?1.:.0);
}else{
if(mat==3.){C.xyz*=vec3((dot(SUN,N)*.8+.2)+bgcolor.xyz*.2+color2.xyz*max(0.,-N.y))*max(.0,SUN.y);C.xyz*=gl_FrontFacing?1.:.1;}
if(mat==5.)C.a*=(1.-(dist-f)/f)*abs(sin(lpos.y*1e3+time));
if(wpos.y<.0||(lpos.y<.0&&mat==4.))discard;
}
fragColor=C;
}
`,fx_fs=`in vec2 _uv;IN S2D tex;void main(){ fragColor=vec4(floor(texture(tex,_uv).xyz*32.0)/32.0,1.0); }`

//array helpers
var DEBUG=0,CX=0
var i,j,k,f,x,y,z,ox,oy,oz,s,u,v,tt
ARP.p=ARP.push;//ARP.m=ARP.map;ARP.c=ARP.concat;ARP.rand=function(){return this[RAND(this.length)|0]}
NSIN=(a)=>SIN(a*2*PI)
FOR=(n,f)=>{for(i=0;i<n;i++)f(i)}

//CANVAS HELPERS
let FCOLOR=(v)=>v?CX.strokeStyle=CX.fillStyle=v:0,
RECT=(x,y,w,h,c)=>{FCOLOR(c);CX.fillRect(x,y,w,h)},
CIRCLE=(x,y,r,c,f=1)=>{FCOLOR(c);CX.beginPath();CX.arc(x,y,r,0,2*PI);f?CX.fill():0},
SHAPE=(d,s)=>{CX.moveTo(d[0]*s,d[1]*s);d.map((v,i)=>i%2?0:CX.lineTo(d[i]*s,d[i+1]*s));CX.fill()}
TEXT=(m,x,y,c)=>{FCOLOR(c);CX.fillText(m,x,y)}

//palette
var SKY=[[.01,.01,.2],[.01,.01,.2],[.13,.25,.49],[.25,.4,.65],[.3,.5,.86]],SUN=V3()
var bgcolor=V3(4),hcolor=[1,1,1,1],seacolor=[0,.4,.53,1],fbo
var PLT=[[.5,.5,.5,1],[1,1,1,1],[0,0,0,1],[0,.4,.53,1],[.5,.4,.3,1],[.2,.6,.2,1],[.8,.8,.4,1],bgcolor,[1.0,0.1,0.1,.8]]
var NOW=0,PREV=0,HTIME=0,NTIME=0,GTIME=0,V4=[0,0,0,0],FTIME=288/4,DT=0
var PMESH//,WINSTS,WBUFF,
var model=M4(),UItex=0

INPUT(C)
INIT(C) //GL from here ******************
var sh=PROGRAM(vs,fs).uniforms({emis:V4}),
shI=PROGRAM(vs,fs,["INST"]).uniforms({scale:1}),
shT=PROGRAM(vs,fs,["TEX"]),
shFX=PROGRAM(quad_vs,fx_fs)
$.plane=PLANE()
$.cube=CUBE()
$.point=MESH({pos:V3()})
LOAD("pby",1)
LOAD("boat",1)
//LOAD("cube")
let XZY=(p)=>[p[0],p[2],p[1]]
$.engine=LAZO([0,2,0, 2,2,0, 3,5,0, 3.5,10,0, 3,15,0, 2,16,0, 2,15,0, .5,16,0, .5,17,0, 0,17.5,0],16,0,XZY)
//$.island=LAZO([0,0,0,-6,0,0],12,0,(p,i)=>[p[0]+RAND()*2*(1-i),p[1],p[2]+RAND()*2*(1-i)])
$.circle=LAZO([0,0,0,-1,0,0],24,0,XZY)
$.tpd=LAZO([.25,-1.5,0, .25,1.5,0, .2,1.6,0, 0,1.7,0],24,0,XZY)
//let V=[];for(i=0;i<32;i++)V.p(-NSIN(i/32+.25),-NSIN(i/32),0)
//$.sphere=LAZO(V,24,0,XZY)
V=[];FOR(16,(i)=>V.p(NSIN(i/16),NSIN(i/16+.25),0))
$.hx=MESH({pos:V})
$.rnd=MESH({pos:V3(1024*3).map(v=>RAND(1,-.5))})
//WBUFF=BUFFER(WINSTS=V3(1e3*4).map((v,i)=>(i%4)==3?RAND(40,20):(RAND(1e4,-5e3)*(i%4==1?0:1))),4)
PMESH=MESH({pos:V3(3<<14)})

//NOISETEX=TEX(640,480,(new UINT8(1228800)).map(v=>RAND(255))).p(0,NEAREST)

"WSADQE".split("").map(k=>KEYS[k]=0) //DEBUG

//player
var PLY=0,SCORE=0,raft,PMODEL=M4(),OBJS,VIEWM=0,SUS=1,ZOOM=0,SHK=0,IMP=0,MODE=0,UI,//LIFT,

CANVAS=(w,h)=>{let C=document.createElement("canvas");C.width=w;C.height=h;return C.getContext("2d")}

let WORLD={},SC=2<<10,MPOS=[0,0],ORIG=[1480,0,590],BLTS,PARTS,BIRDS;ADDZONE=(x,z,i)=>{
    CX=CANVAS(512,512)
    FCOLOR("#586");SHAPE($[i].slice(2),2);//CX.clip();FOR(1e3,(i)=>RECT(RAND(512),RAND(512),6,6,"#A86"))
    let o=WORLD[x+":"+z]={map:CX.canvas,x,z,tex:TEX(512,512,CX.canvas).p(0,NEAREST).p(1,NEAREST),px:CX.getImageData(0,0,512,512).data}
    V=[];FOR(2048,(i)=>{j=RAND(o.px.length/4)|0;o.px[j*4+1]>100?V.p((j%512)/512,0,((j/512)|0)/512,RAND(.5,1)*.001):0});o.inst=BUFFER(V,4)
},GENWORLD=()=>{
    //ADDZONE(-1,-1,0)
    ADDZONE(0,0,0)
}

FETCH("hon",(D)=>{$[0]=D;GENWORLD()})

//INFO: mesh,[x,y,z,scale],color=0,group=-1,primitive=4
PBY=()=>[["tpd",[-4.2,1.5,0,1],0,0],["tpd",[4.2,1.5,0,1],0,0],["pby",[0,-1,-10,1],0,0],["pby",[0,-1,-10,1],7,1,4],["engine",[2,2.8,-1,.2]],["engine",[-2,2.8,-1,.2,0]],["hx",[2,2.8,2,1.2],0,0,1],["hx",[-2,2.8,2,1.2],0,0,1]]
BOAT=()=>[["boat",[0,-5,-80,80],0,0],["cube",[0,15,-20,10],0,0],["cube",[0,12,-20,10.1],8,0,0]]
SUBM=()=>[["tpd",[0,-14,-40,40],0,0],["cube",[0,2,0,[.2,4,.2]],0,0]]
TPD=()=>[["tpd",[0,-1,0,1],0,0]]//torpedo
RFT=()=>[["cube",[0,-.8,0,1],6,0]]//raft
BLD=()=>[["cube",[0,0,0,[2,10,2]],0,0],["cube",[0,11,0,.1],8,0,0]]//base
SPDS=[20,.5,.2,1,.1,0]
ITEM=(m,t)=>({s:[5,70,20,1,1,1][t],t,m,pos:m.subarray(12,15),c:[PBY,BOAT,SUBM,TPD,RFT,BLD][t](),life:100,ang:0,spd:0,eng:t?.5:0,fuel:10,aim:[0,0,0],vel:V3(),f:V3(),r:V3(),u:V3(),cd:0,ammo:100,w:2}) //cd=cooldown

RESET=()=>{
    GTIME=0;HTIME=1e4;BLTS=[];PARTS=[]
    TRS(PMODEL,[ORIG[0]+200,0,ORIG[2]-120],[0,4.7,0])
    //TRS(PMODEL,[0,10,-1000],[0,0,0])
    PLY=ITEM(PMODEL,0)
    OBJS=[PLY]
    FOR(4,(i)=>OBJS.p(ITEM(TRS(0,[PLY.pos[0]+40*(i+1)-200,RAND(),PLY.pos[2]+30],[0,4.7,0]),0))) //PBYs
    FOR(4,(i)=>OBJS.p(ITEM(TRS(0,[RAND(1e3,-.8e4),0,RAND(6e3,-.8e4)]),1),ITEM(TRS(0,[RAND(1e4,1e2),0,RAND(2e3,.5e4)]),2))) //BOATS & SUBS
    OBJS.p(raft=ITEM(TRS(0,[.7e4,0,.2e4-RAND()*3e3]),4),ITEM(TRS(0,ORIG),5))//raft,building
    OBJS.p(ITEM(TRS(0,[0,0,0]),1),ITEM(TRS(0,[100,0,0]),2))//DEBUG
};RESET()

SHOOT=(p,v,a)=>{BLTS.length>=(1<<14)?BLTS.shift():0;BLTS.p({a,pos:V3(p),pos2:V3(p),t:10,vel:V3(v)});IMP=1;a.ammo--}
ADDP=(p,v,t=10)=>{PARTS.length>=(1<<14)?PARTS.shift():0;PARTS.p({pos:V3(p),t,vel:V3(v)})}
HIT=(a,b,d)=>{a.life-=d;a==PLY?SHK=.4:SCORE+=10;for(i=0;i<d;i++)ADDP(b.pos,NORM([RAND(10,-5),RAND(10),RAND(10,-5)],0,100));a.life<=0?CRASH(a):0}
KILL=(a)=>{OBJS=OBJS.filter(b=>b!=a)}
CRASH=(a)=>a.c.map(c=>c[2]=2,a.eng=a.life=0,a.cd=4)
TORP=(a)=>{i=ITEM(APPLYTRANS(M4(),a.m,a.c[--a.w][1]),3);i.vel.set(a.vel);i.eng=1;i.a=a;OBJS.p(i);}
NEXT=()=>{PLY=OBJS.find(v=>!v.t&&PLY!=v&&v.life>0);PLY?PMODEL=PLY.m:0}

//audio stuff
var ACX,ADEST,AVOL,ABUF,abeep,aeng,asea,ashoot,ahit

CHANNEL=(o,n)=>{
    var osc=ACX.createOscillator(),noise=ACX.createBufferSource(),filter=ACX.createBiquadFilter(),gain=ACX.createGain()
    osc.frequency.value=0;noise.buffer=ABUF;noise.loop=true;filter.frequency.value=1e4;gain.gain.value=0;
    osc.connect(filter);noise.connect(filter);filter.connect(gain);gain.connect(AVOL)
    var ch={osc,noise,filter,gain};
    ch.vol=(v)=>gain.gain.linearRampToValueAtTime(SAT(v),ACX.currentTime+.1)
    if(o)osc.start()
    if(n)noise.start()
    return ch;
}

AUDIO=()=>{//called to setup audio
    ACX=new AudioContext();ADEST=ACX.destination;AVOL=ACX.createGain()
    AVOL.gain.value=.5,AVOL.connect(ADEST)//main volume
    //create white noise
    var s=ACX.sampleRate;ABUF=ACX.createBuffer(1,2*s,s);ABUF.getChannelData(0).set(V3(2*s).map(RANDOM));
    //propeller
    aeng=CHANNEL(1,0);with(aeng){vol(.1);osc.frequency.value=60;osc.detune.value=80;filter.frequency.value=200;osc.type="sawtooth"}
    ashoot=CHANNEL(1,0);with(ashoot){osc.frequency.value=60}
    ahit=CHANNEL(1,1);
    abeep=CHANNEL(1,0);with(abeep){osc.frequency.value=1e3}

    
    //create white noise
    //var s=2*ACX.sampleRate;BUF=ACX.createBuffer(1,s,ACX.sampleRate),data=BUF.getChannelData(0);
    //for (var i=0;i<s;i++)data[i]=RANDOM()*2-1;
    //asea=CHANNEL(0,1),abeep=CHANNEL(1),asnk=CHANNEL(1),asonar=CHANNEL(0,1),ashake=CHANNEL(1),aalarm=CHANNEL(1)
    //asea.filter.Q.value=15
}



//main loop
var eye=V3([0,1,20]),target=V3([0,1,-1]),up=V3(),front=V3(),MX=0,MY=0,cell,
//ws = new WebSocket('wss://relay.js13kgames.com/pacific-black-cats')
//ws.onmessage=(v)=>console.log("MSG!!",v)

loop=()=>{
    requestAnimationFrame(loop)
    NOW=TIME()
    var dt=MIN(.1,NOW-PREV)*(KEYS.T?10:1);PREV=NOW;GTIME+=dt;HTIME+=dt*FTIME;NTIME=(HTIME/86400)%1 //time
    DT+=dt

    var W=C.width=BODY.offsetWidth,H=C.height=BODY.offsetHeight,_W=W>>1,_H=H>>1//_W=640,_H=480//
    if(!fbo||fbo.h!=_H||fbo.w!=_W){fbo=FBO(TEX(_W,_H).p(0,NEAREST));UI=CANVAS(_W,_H);UItex=TEX(_W,_H)}

    //skycolor
    f=NSIN(NTIME-.25)*.499+.5;
    i=(f*4)|0;f=(f*4)%1
    LERPV3(bgcolor,SKY[i],SKY[i+1],f)//sky color
    bgcolor[3]=1
    SCALE(hcolor,bgcolor,2)
    SUN.set([0,NSIN(NTIME-.25),NSIN(NTIME)])
    PLT[8][3]=SUN[1]<0?.8:0 //turn on lights

    //update audio
    if(ACX){
        aeng.vol((PLY?.eng??0)*.2);aeng.osc.frequency.value=30+40*(PLY?.eng??1)
        ashoot.vol(IMP/2);IMP*=.9;
        ahit.filter.frequency,value=ahit.osc.frequency.value=60+RAND(200);ahit.vol(SAT(SHK)*.7);
        abeep.vol(PLY?PLY.pos[1]<20&&PLY.spd>30&&(2*GTIME%1>.5?.1:0):0)
    }
    [sh,shT,shI].map(s=>s.uniforms({SUN,proj:0,time:GTIME})) //globals
    INIT(C)

    //prepare frame
    fbo.bind(1)
    CLEAR(bgcolor,1)
    GLSET(ZTEST,0)
    GLSET(CULL,0)

    if(!MODE){
        TRS(PMODEL,[1000-GTIME*10,100,100+GTIME*10],[MY*1e-4,-1.8+MX*1e-4,SIN(GTIME*1.2+i)*.02])
        target=ADD(V3(),PLY?.pos??ORIG,[0,2,0])
        //target=[PLY.pos[0],3,PLY.pos[2]]
        eye=ADD(V3(),target,[-10,-3.3,-10])
        up=[0,1,0]
    }else
    if(VIEWM>9||DEBUG){}else
    if(VIEWM>6)//third person
    {
        /*
                let t=[0,5,5],f=[[0,0,5],[0,0,-30],[-10,0,10],[-10,0,10]][VIEWM-3]
        MAT4xV3(eye,PMODEL,SUB(V3(),t,f))
        MAT4xV3(target,PMODEL,t)
        MAT4xV3(up,PMODEL,[0,1,0],0)
        LERPV3(eye,eye,CAM_EYE,.2)
        eye[1]=MAX(eye[1],1)
        target[1]=MAX(target[1],.5)
        */
        let v=[[[0,4,-17],[0,2,5]],[[0,4,-17],[0,2,5]],[[0,4,13],[0,2,-25]]][VIEWM-7]
        MAT4xV3(eye,PMODEL,v[0])
        MAT4xV3(target,PMODEL,v[1])
        MAT4xV3(up,PMODEL,[0,1,0],0)
        if(VIEWM==7)
            LERPV3(eye,CAM_EYE,eye,.1)
        eye[1]=MAX(eye[1],1)
        target[1]=MAX(target[1],.5)
    }
    else//cockpit
    {
        let drv=[.3,1.44,3.8],bck=[0,1.3,-3],c=[drv,drv,drv,bck,bck,[0,1,5.2],[.1,0,10]][VIEWM],f=[[0,-.22,1],[1,.1,-.2],[-1,.1,-.2],[-1,0,0],[1,0,0],[0,0,1],[0,0,1]][VIEWM],f2=V3(f)
        MAT4xV3(eye,PMODEL,c)
        if((ZOOM||VIEWM>2)&&VIEWM!=6){f2[1]+=(MY-_H/1.6)*-.001;ROTY(f2,f2,(MX-_W/2)*.002)}
        MAT4xV3(target,PMODEL,ADD(f2,c,f2))
        MAT4xV3(up,PMODEL,[0,1,0],0)
    }
    ZOOM=MOUSE.buttons&2&&!DEBUG&&MODE
    target[1]+=SIN(GTIME*1e2)*SAT(SHK)*.1;SHK*=.9;
    CAMERA(eye,target,up,ZOOM?20:65,_W/_H,.1,1e5)
    DRAW("cube",sh,{color:bgcolor,color2:seacolor,emis:hcolor,mat:1,model:TRS(model,eye,0,1000)})
    if(NTIME<.2||NTIME>.7)DRAW("rnd",sh,{color:[.6,.6,.5,1],mat:4},0)//stars

    GLSET(ZTEST,0)
    GLSET(CULL,0)
    BLENDFUNC("A")
    //DRAW("rnd",sh,{color:[1,1,1,1],mat:0,model:TMAT4(model,[FLOOR(PLY.pos[0]/100)*100-500,0,FLOOR(PLY.pos[2]/100)*100-500],0,10)},0)
    //*
    //SEA PARTICLES
    FOR(4,(i)=>{
        ox=FLOOR(eye[0]/(SC*2));oz=FLOOR(2*eye[2]/(SC*2))
        DRAW("rnd",sh,{color:[1,1,1,MAX(SUN[1],.0)*.5],f:SC,proj:1,mat:5,model:TRS(model,[(ox+i%2)*SC*2,0,(oz+FLOOR(i/2))*SC*2],0,SC*2)},0)//sea splash
        ox=FLOOR(eye[0]/1000);oz=FLOOR(eye[2]/1000)
        DRAW("rnd",sh,{color:[1,1,1,MAX(SUN[1],.0)*.3],proj:1,mat:5,f:500,model:TRS(model,[(ox+i%2)*1e3,0,(oz+FLOOR(i/2))*1e3],0,1e3)},0)
    })
    //*/

    GLSET(ZTEST,1)
    GLSET(BLEND,0)
    //BLENDFUNC("A")

    //world
    //for(i=-10;i<11;i++)for(j=-10;j<11;j++){
    //    ox=FLOOR(i-PLY.pos[0]/SC),oz=FLOOR(j-PLY.pos[2]/SC)
        ox=0,oz=0
        cell=WORLD[ox+":"+oz]
        if(cell){
            u={color:PLT[1],bgcolor:[1,1,1,1],mat:3,tex:cell.tex.bind(0),model:TRS(model,[(ox+.5)*SC,0,(oz+.5)*SC],0,SC/2)}
            DRAW("plane",shT,u);
            //DRAW("cube",shI,u,4,cell.inst.size/4,{offs:cell.inst});
            //BLENDFUNC("B")
            if(SUN[1]<.2)DRAW("point",shI,{model:TRS(0,[ox*SC,0,oz*SC],0,SC),color:[.8,.6,.3,1],proj:1,mat:5},0,cell.inst.size/4,{offs:cell.inst})//lights
            //GLSET(BLEND,0)
        }
    //}
    
    //DRAW("island",shI,{color:PLT[4],mat:0,model:IDM4,scale:1},4,1000,{offs:WBUFF})
    //DRAW("island",shI,{color:PLT[5],mat:0,model:IDM4,scale:.5},4,1000,{offs:WBUFF})

    
    GLSET(ZTEST)
    //BLENDFUNC("A")
    GLSET(BLEND)
    
    //scene objects (ships, planes)
    //sh.uniforms({bgcolor,color2:seacolor})
    for(i=0;i<OBJS.length;i++){
        let o=OBJS[i]
        for(j=0;j<o.c.length;j++){
            let p=o.c[j],d=p[1],t=p[4]??4;model=TRS(model,d,d[4],d[3],o.m)
            if(p[2]<0)continue
            GLSET(CULL,p[2]==7)
            DRAW(p[0],sh,{color:PLT[p[2]||0],color2:seacolor,mat:t!=4?0:3,model},t,1,0,p[3]??-1)
            //GLSET(CULL,1)
            DRAW(p[0],sh,{color:PLT[2],mat:2})//shadow
        }
    }

    //bullets
    gl.depthMask(false)
    PMESH.pos.update(BLTS.flatMap(b=>[Array.from(b.pos),Array.from(b.pos2)].flat()))
    PMESH[0]=BLTS.length*2
    DRAW(PMESH,sh,{mat:0,color:[10,10,0,1],model:IDM4},1)//render as line
    DRAW(PMESH,sh,{proj:1},0)//render also as points
    DRAW(PMESH,sh,{mat:2},1)//render as line

    PARTS.map((b,i)=>{ADD(b.pos,b.pos,b.vel,dt);ADD(b.vel,b.vel,[RAND(1,-.5)*.1,1,RAND(1,-.5)*.1],dt);SCALE(b.vel,b.vel,.999);b.t-=dt})
    PARTS.filter(b=>b.t>0&&b.pos[1]>0)//kill particles
    PMESH.pos.update(PARTS.flatMap(b=>[Array.from(b.pos)].flat()))
    PMESH[0]=PARTS.length
    DRAW(PMESH,sh,{mat:6,proj:PROJ_M4[5]*.2e4,color:[0,0,0,.1]},0)
    gl.depthMask(true)

    //clouds
    /*
    GLSET(CULL,0)
    DRAW("island",shI,{color:PLT[6],mat:3,model:TRS(model,[0,400,0],0,10),scale:.5},4,1000,{offs:WBUFF})
    */

    //DRAW("island",shI,{color:PLT[2],mat:0,model:TRS(model,[0,0,0],0,10),scale:.5},4,1000,{offs:WBUFF})

    //UI
    UI.canvas.width=_W//clear
    y,CX=UI
    DIAL=(msg,x,y,r,n=20,s=5,a=0,t=0)=>{
        CX.save();CX.translate(x,y)
        for(i=0;i<4;i++)CIRCLE(.8*r*[-1,-1,1,1][i],.8*r*[-1,1,1,-1][i],r*.1,"#111")
        CIRCLE(0,0,r+2,"#555")
        TEXT(msg,0,-r*1.2)
        CIRCLE(0,0,r,"#000")
        CX.rotate(a)
        FCOLOR("#0A4")
        for(i=0;i<n;++i){RECT(-1,r*.8,i%s?.5:2,4);CX.rotate(2*PI/n)}
        for(i=0,a;i<n;i+=s)TEXT(t==2?("NESW"[i/s]):(t==3&&!i?12:i),NSIN(i/n)*r/1.7,-NSIN(i/n+.25)*r/1.7+3)
        CX.restore();
    }    
    COMPASS=(x,y)=>{DIAL("COMPASS",x,y,30,20,5,(PLY?.ang??0)+SIN(GTIME)*.1,2);NEEDLE(x,y,20,0)}
    NEEDLE=(x,y,r,v,s=1,a=0)=>{
        CX.save();CX.translate(x,y)
        if(a&&GTIME*2%1<.5)CIRCLE(0,8,4,"#E33");FCOLOR("#0A4")
        CX.rotate(SAT(v+SIN(GTIME+x)*2e-3)*2*PI)
        RECT(-s,r*.3,s*2,-r*1.1)
        CIRCLE(0,0,2,"#4C8")
        //CIRCLE(0,0,r*.05)
        CX.restore()
    }
    CX.scale(1,-1);CX.translate(0,-_H)
    CX.textAlign="center"
    if(!MODE){
        CX.font="50px ARIAL"
        FOR(6,(i)=>TEXT("WWII PACIFIC",_W/2+i,_H/8,"#335"))
        CX.font="100px ARIAL"
        CX.scale(.5,1)
        FOR(6,(i)=>TEXT("BLACK CATS",(_W/2-i)*2,_H/8-i+100,!i?"#333":"#000"))
        CX.font="20px Courier New"
        CX.scale(2,1)
        CX.globalAlpha=SAT(GTIME-5)
        TEXT("click to start",_W/2,_H-100,"#aaa")
    }else if(VIEWM==12){//BRIEFING
        x=_W/2-320,y=20
        CX.textAlign="left"
        RECT(0,0,_W,_H,"#222")
        RECT(x,0,640,480,"#765")
        CX.font="20px Courier New";
        ["BRIEFING","**********","Sink Submarines (North)","Sink Transports (South East)","Rescue Pilots (Red Area in Map)"].map((v,i)=>TEXT(v,x+30,y+i*20,"#000"))
        if(MOUSE.buttons)VIEWM=0
    }else if(VIEWM==11&&PLY){//RADAR
        s=64
        RECT(0,0,_W,_H,"#222")
        COMPASS(50,50)
        CX.save();CX.translate(_W/2,_H/2);CX.rotate(PI)
        CIRCLE(0,0,200,"#000");CX.clip();
        RECT(-200,0,400,1,"#333");
        RECT(0,-200,1,400);
        CX.rotate(PLY.ang)
        OBJS.map(O=>O.t==1||(O.t==2&&O.pos[1]>1)?CIRCLE(O.pos[0]/s-PLY.pos[0]/s,O.pos[2]/s-PLY.pos[2]/s,3,"#3F3"):0)
        CX.rotate(GTIME*2);
        FOR(9,(i)=>{CX.globalAlpha=1-i/9;RECT(0,0,200,1,"#3F3");CX.rotate(-.01)})
        CX.restore()
    }
    else if(VIEWM==10&&PLY){//MAP
        let s=64,sr=SC/s
        if(MOUSE.buttons){MPOS[0]-=MOUSE.delta[0]/2;MPOS[1]-=MOUSE.delta[1]/2}
        RECT(0,0,_W,_H,"#146")
        //map
        FCOLOR("#669")
        CX.save();CX.translate(_W/2-MPOS[0]+.5,_H/2-MPOS[1]+.5);CX.rotate(PI)
        for(i=0;i<=10;i++)for(j=0;j<=10;j++)
        {
            let x=i-5,z=j-5
            CX.strokeRect(x*s,z*s,s,s)
            let cell=WORLD[FLOOR(x)+":"+FLOOR(z)]
            if(cell)CX.drawImage(cell.map,x*s,z*s,s,s)
        }
        //items
        for(var O of OBJS)!O.t||1?CIRCLE(O.pos[0]/sr,O.pos[2]/sr,2,O==PLY?"#FFF":"#888"):0
        CIRCLE(200,20,50,"red",0);CX.stroke()
        CX.restore()
        COMPASS(50,50)
    }
    else if(ZOOM||VIEWM==6){
        RECT(0,0,_W,_H,"#000")
        i=VIEWM==6?0:.1
        CX.save();CX.globalCompositeOperation="destination-out";
        CIRCLE(_W*(.5-i),_H/2,_H*.4);CIRCLE(_W*(.5+i),_H/2,_H*.4)
        CX.restore();
        if(!i){RECT(_W/2,0,1,_H);RECT(0,_H/2,_W,1)}
    }
    else if(VIEWM<3&&PLY){
        if(VIEWM==0&&PLY.life>0)
        {
            //DASH
            O=PLY
            CX.translate(_W/2-320,0)
            y=_H-60+SHK*20

            TEXT(O.ammo,40,y-80,"#AAA")
            DIAL("ALT",40,y,30,10,1)
            NEEDLE(40,y,30,(O.pos[1]/1e3)%1,1,O.spd>30&&O.pos[1]<20)
            NEEDLE(40,y,20,O.pos[1]/1e4)
            COMPASS(120,y)
            DIAL("FUEL",200,y,30,10,1)
            NEEDLE(200,y,30,O.fuel*.09,1,O.fuel<.1)
            
            DIAL("HORIZON",280,y,30,0,0)
            CX.save();CX.translate(280,y);CIRCLE(0,0,24,"#146");CX.clip();CX.rotate(-O.r[1]*PI/2);RECT(-40,O.f[1]*100,80,100,"#543");CX.restore();RECT(260,y-1,40,2,"#666")

            DIAL("HULL",360,y,30,100,10)
            NEEDLE(360,y,30,PLY.life*.009)
            DIAL("AIR SPEED",440,y,30,100,25)
            NEEDLE(440,y,30,O.spd*.01)
            //DIAL("LIFT",520,y,30,1)
            //NEEDLE(520,y,30,LIFT)
            y-=70
            //DIAL("RPM1",240,y,26,10,1)
            //NEEDLE(240,y,30,O.life/100)
            //DIAL("RPM2",320,y,26,10,1)
            //NEEDLE(320,y,30,O.life/100)
            DIAL("THROTTLE",400,y,26,10,1)
            NEEDLE(400,y,30,O.eng*.9)
            DIAL("TIME",480,y,26,12,3,0,3)
            //NEEDLE(480,y,24,(HTIME/60)%1,.5)//sec
            NEEDLE(480,y,28,(HTIME/3600)%1)//mins
            NEEDLE(480,y,20,(HTIME/43200)%1)//hours
        }
    }
    //if(!PLY)UI.textAlign="left";FCOLOR("white");UI.fillText(LIFT,20,20)
    UItex.update(UI.canvas)

    BLENDFUNC("A")
    GLSET(ZTEST,0)
    UItex.p(1,LINEAR).toVP() //draw UI

    fbo.bind(0)
    GLSET(BLEND,0)
    GLSET(CULL,1)
    MX=MOUSE.pos[0]/2//(MOUSE.pos[0]-VP_DATA[0])/2
    MY=MOUSE.pos[1]/2//(MOUSE.pos[1]-VP_DATA[1])/2
    fbo.tex.toVP(shFX)
    
    if(MOUSE.buttons){
        if(!ACX)AUDIO()//Enable audio
        if(!MODE){RESET();MODE=1;HTIME=5e4;VIEWM=12}
    }

    //physics
    if(PLY){
        //ws?.readyState?ws.send({pos:PLY.pos}):0        
        if(KEYS.C&&PLY.cd<0&&PLY.ammo){SHOOT(MAT4xV3(V3(),PLY.m,[0,.2,8]),SCALE(0,PLY.f,5000),PLY);PLY.cd=.25;SHK+=.02}
        //if(!DEBUG)
        "QEWSAD".split("").map((v,i)=>PLY.aim[(i/2)|0]+=(KEYS[v]?1:0)*dt*(i%2?-1:1))//yaw,pitch,roll
        PLY.eng=SAT(PLY.eng+.2*dt*((KEYS.R?1:0)+(KEYS.F?-1:0)-MOUSE.wheel*0.05))//throttle
        if(KEYS.Space||KEYS.T){PLY.aim[1]+=.1*PLY.f[1];PLY.aim[2]+=.1*PLY.r[1]}//stabilizer    
        if(raft&&PLY.spd<0.1&&DIST(raft.pos,PLY.pos)<70){KILL(raft);raft=0;SCORE+=100}
    }

    ONKEY=(e,k)=>{
        //if(e.type!="keydown")return
        if(k>=49&&k<=59)VIEWM=k-49
        else if(k==90&&PLY.w){TORP(PLY);SHK=.1}//throw torpedo
        else if(k==66)VIEWM=VIEWM==12?0:12//briefing
        else if(k==77)VIEWM=VIEWM==10?0:10//map
        else if(k==78)VIEWM=VIEWM==11?0:11//radar
        else if(k==27){RESET();MODE=0}
        //else if(k==27)DEBUG=!DEBUG
        else if(k==13)NEXT()
        else if(k>112&&k<124)return !0//allow F5 and F11
    }

    dt=.01
    j=(DT/dt)|0
    DT=DT%dt
    for(;j;j--){
        OBJS.map(o=>{
            if(o.t>4)return
            o.spd=LEN(o.vel)
            let m=o.m,eng=o.eng*SPDS[o.t]*(o.fuel&&o.life>0?1:0)*40,
            vdir=NORM(V3(),o.vel),frc=V3(),rot=dt*o.spd*.01,drag=.2*(o.pos[1]<2?2:1)
            NORM(MAT4xV3(o.f,m,[0,0,1],0))
            MAT4xV3(o.u,m,[0,1,0],0)
            MAT4xV3(o.r,m,[1,0,0],0)
            let lift=!o.t?POW(DOT(vdir,o.f),6):1
            //if(PLY==o)LIFT=lift
            ADD(o.pos,o.pos,o.vel,dt)//move before (euclidean)
            ADD(frc,frc,o.f,MAX(o.pos[1]>2?20:0,eng))//engine
            if(o.t!=3)ADD(frc,frc,vdir,-drag*lift*o.spd*o.spd)//drag
            if(!o.t){//PBYs
                o.c[0][2]=o.w>0?0:-1//torpedos refill
                o.c[1][2]=o.w>1?0:-1//torpedos refill
                ADD(frc,frc,o.u,o.spd*.6*lift)//lift
                if(o.life<2)o.aim[1]=-.1
            }
            //ADD(frc,frc,[0,.1*stall*(o.pos[1]>.5?-1:.5),0])//gravity
            ADD(frc,frc,[0,o.pos[1]>1?-50:.01,0])//gravity
            ADD(o.vel,o.vel,frc,dt)//apply force
            
            APPLYROT(o.m,o.m,o.aim[0]*rot/4,[0,1,0])
            APPLYROT(o.m,o.m,o.aim[1]*rot,[1,0,0])
            APPLYROT(o.m,o.m,o.aim[2]*-rot,[0,0,1])
            o.aim.map((v,i)=>o.aim[i]=v*.98)
            o.fuel=MAX(0,o.fuel-eng*1e-6*dt)
            if(o.pos[1]<-.1){
                if(o.vel[1]<-5)CRASH(o)
                o.pos[1]=-.1;o.vel[1]*=.1
            }//float
            o.pos[1] = MAX(-.1,o.pos[1])
            o.ang=ATAN2(o.f[0],o.f[2])//angle
            if(RAND()>.9&&(o.life<20))ADDP(o.pos,[RAND(4,-1),1,RAND(4,-1)])
            if(PLY&&PLY.life>0){
                u=DIST(o.pos,PLY.pos)
                if(o.t==1&&o.cd<0&&u<1500&&o.life>0){//BOAT AI
                    v=ADD(V3(),o.pos,[0,20,0])
                    tt=ADD(V3(),PLY.pos,PLY.vel,u*.001)
                    ADD(tt,tt,[RAND(1,-.5)*.5,5,RAND(1,-.5)*.5])
                    SUB(tt,tt,v)
                    if(tt[1]>.2&&o.ammo&&SUN[1]>0)SHOOT(v,tt,o)
                    if(!o.ammo){o.ammo=100;o.cd=10}
                    o.cd=.3
                }
            }
            if(o.t==3){//torpedo
                OBJS.map(o2=>{if(o.a!=o2&&o2.t!=3&&DIST(o.pos,o2.pos)<20){HIT(o2,o,100);KILL(o);}})//console.log("HIT",o2)
            }
            o.c.map(v=>v[0]=="hx"?v[1][4]=[0,0,GTIME*5]:0)//rotate helix
            //refuel & reammo
            if(!o.t&&o.spd<.1&&DIST(o.pos,ORIG)<1e3&&o.pos[1]<1){o.fuel=MIN(o.fuel+dt*.2,10);if(o.w<2&&o.cd<0){o.cd=5;o.w++}}
            o.cd-=dt
        })
        BLTS.map((b,i)=>{
            b.pos2.set(b.pos);ADD(b.pos,b.pos,b.vel,dt);ADD(b.vel,b.vel,[0,-10,0],dt);b.t-=dt
            //;b.pos[1]<0?ADDP(b.pos,[0,1,0]):0
            OBJS.map(o=>o!=b.a&&o.life>0&&DIST(b.pos,o.pos)<o.s?(HIT(o,b,1),b.t=0):0)//check collisions with bullet
        })
        BLTS=BLTS.filter(b=>b.t>0&&b.pos[1]>0)//kill
    }//step

    if(PLY&&PLY.life<=0&&PLY.cd<0)NEXT()
   

    /*/freecam
    if(DEBUG){
    let delta=[KEYS.D-KEYS.A,KEYS.E-KEYS.Q,KEYS.S-KEYS.W],speed=dt*-(KEYS.ShiftLeft?1000:100)
    ADD(eye,eye,delta,speed)
    ADD(target,target,delta,speed)
    SUB(front,target,eye)
    ROTY(front,front,MOUSE.delta[0]*.004)
    if(MOUSE.buttons){front[1]+=MOUSE.delta[1]*.002;ADD(target,eye,front)}
    }
    //*/

    END()
}

requestAnimationFrame(loop);//instead of loop()



/*
ONMOUSE=(e)=>{
    if(e.type=="mousedown") C.requestPointerLock()
}
*/

//</script>