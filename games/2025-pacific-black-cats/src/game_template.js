    
var vs=`
IN mat4 model;
IN mat4 viewp;
IN vec3 ceye;
IN float time;
IN vec4 color;
#ifdef INST
IN float scale;
in vec4 offs;
#endif
out vec3 wpos;
out vec4 vcol;
vec3 ROTY(vec3 v,float a){vec2 t=vec2(sin(a),cos(a));return vec3(t.y*v.x-t.x*v.z,v.y,t.x*v.x+t.y*v.z);}
float PI=${PI};
void main(){
wpos=pos;
vcol=color;
float id=float(gl_InstanceID);
#ifdef INST
wpos=ROTY(wpos,id);
wpos*=offs.w*scale;
wpos+=offs.xyz;
vcol.xyz+=vec3(sin(wpos.y*0.2+wpos.z*0.3+wpos.x*0.1+cos(wpos.x*0.1)*0.5))*0.1;
#endif
wpos=(model*vec4(wpos,1.0)).xyz;
gl_PointSize=(sin(float(gl_VertexID))*0.5+1.2);
gl_Position=viewp*vec4(wpos,1.0);
}
`,fs=`
in vec3 wpos;
in vec4 vcol;
IN vec3 ceye;
IN vec3 cfront;
IN float time;
IN float mat;
IN vec4 emis;
void main(){
vec3 L=vec3(0,1,0);
vec3 E=wpos-ceye;
float dist = length(E);
E/=dist;
#ifdef POINTS
vec3 N=-E;
#else
vec3 N=NORM(cross(dFdx(wpos),dFdy(wpos)));
#endif
vec4 C=vec4(N,1.0);
#ifndef POINTS
#else
C.a /= dist*1.2;
#endif
fragColor=C;
}
`

//array helpers
var DEBUG=0
var i=0,j=0,k=0,ox,oy,oz
ARP.p=ARP.push;//ARP.m=ARP.map;ARP.c=ARP.concat;ARP.rand=function(){return this[RAND(this.length)|0]}

SIM=(p,t,s)=>{
    l=p.length/3
    for(var i=0,l2=t.length;i<l2;i+=3)t.p(t[i]+l,t[i+2]+l,t[i+1]+l)
    p.p(...p.map((a,i)=>a*s[i%3]))
}
FETCH=(u,f)=>fetch(u).then((r)=>r.arrayBuffer()).then(f)
LOAD=(url,X,Y,Z,f)=>FETCH(url+".xbin",(a)=>{
        var dataI=new Int8Array(a),dataU=new UINT8(a)
        var pos=[],tris=0,l=dataU[0]
        for(var i=1;i<=l*3;i+=3)
            pos.p(dataI[i]/127,dataU[i+2]/255-0.5,dataI[i+1]/127)
        tris=Array.from(dataU.subarray(l*3+2))
        if(X)SIM(pos,tris,[-1,1,1])
        //if(Y)SIM(pos,tris,[1,-1,1])//not used in this game
        //if(Z)SIM(pos,tris,[1,1,-1])
        var m=meshes[url]=MESH({pos,tris})
        //if(f)f(m,url)
    })

//palette
var fcolor=[.2,.5,.8,1],scolor=[1.04,.06,.07,1],fbo
var NOW=0,PREV=0,GTIME=0,V4=[0,0,0,0],INTRO=1

INPUT(C)
INIT(C)
sh=PROGRAM(vs,fs).uniforms({emis:V4})
meshes.plane=PLANE()
LOAD("head",1)
NSIN=(a)=>SIN(a*2*PI)

var SEED=30;
HASH3D=(x,y,z)=>{x=50*FRACT(x*0.3183099+0.71);y=50*FRACT(y*0.3183099+0.113);z=50*FRACT(z*0.3183099-0.247);return -1+2*FRACT(1.375986*SEED+x*y*z*(x+y+z));}
NOISE3D=(x,y,z)=>{let ix=FLOOR(x),iy=FLOOR(y),iz=FLOOR(z);let fx=FRACT(x),fy=FRACT(y),fz=FRACT(z);let ux=fx*fx*(3-2*fx);return LERP( LERP(LERP(HASH3D(ix,iy,iz),HASH3D(ix+1,iy,iz),ux),LERP(HASH3D(ix,iy+1,iz),HASH3D(ix+1,iy+1,iz),ux),fy*fy*(3-2*fy)), LERP(LERP(HASH3D(ix,iy,iz+1),HASH3D(ix+1,iy,iz+1),ux),LERP(HASH3D(ix,iy+1,iz+1),HASH3D(ix+1,iy+1,iz+1),ux),fy*fy*(3-2*fy)), fz*fz*(3-2*fz))}


//player 
var HMODEL=M4(),AMODEL=M4(),UItex=0,totarget=V3()
var PLY=0,level=0,P

NEWCANVAS=()=>document.createElement("canvas").getContext("2d")
var INRANGE=(v,min,max)=>v>=min&&v<max

RESET=()=>{
    PLY={pos:V3(),ang:0,vel:V3(),},P=PLY.pos
    GTIME=0;
}
RESET()

//audio stuff
var ACX,ADEST,AVOL,abeep

CHANNEL=(o,n)=>{
    var osc=ACX.createOscillator(),noise=ACX.createBufferSource(),filter=ACX.createBiquadFilter(),gain=ACX.createGain()
    osc.frequency.value=0;noise.buffer=BUF;noise.loop=true;filter.frequency.value=10000;gain.gain.value=0;
    osc.connect(gain);noise.connect(filter);filter.connect(gain);gain.connect(AVOL)
    var ch={osc,noise,filter,gain};
    ch.volume=(v)=>gain.gain.linearRampToValueAtTime(SAT(v),ACX.currentTime+0.1)
    ch.freq=(v)=>osc.frequency.value=v
    if(o)osc.start()
    if(n)noise.start()
    return ch;
}

STARTAUDIO=()=>{
    ACX=new AudioContext();ADEST=ACX.destination;AVOL=ACX.createGain()
    AVOL.gain.value=.5,AVOL.connect(ADEST)//main volume
    //create white noise
    //var s=2*ACX.sampleRate;BUF=ACX.createBuffer(1,s,ACX.sampleRate),data=BUF.getChannelData(0);
    //for (var i=0;i<s;i++)data[i]=RANDOM()*2-1;
    //asea=CHANNEL(0,1),abeep=CHANNEL(1),asnk=CHANNEL(1),asonar=CHANNEL(0,1),ashake=CHANNEL(1),aalarm=CHANNEL(1)
    //asea.filter.Q.value=15
}

//main loop
var eye=V3(),target=V3(),front=V3(),IMP=V3()
CAM_EYE.set([180,5,-250])
loop=()=>{
    requestAnimationFrame(loop)
    NOW=TIME()
    var dt=MIN(0.1,NOW-PREV);PREV=NOW
    var W=C.width=BODY.offsetWidth,H=C.height=BODY.offsetHeight,_W=W>>2,_H=H>>2
    
    GTIME+=dt

    //audio
    if(ACX){
    }

    INIT(C)
    CLEAR(scolor,1)

    CAMERA([10,1,10],[0,0,0],[0,1,0],60,W/H,0.1,1000)

    GLSET(ZTEST)
    GLSET(CULL,0)
    GLSET(BLEND,0)
    BLENDFUNC("A")

    //floor
    DRAW("plane",sh,{color:fcolor,model:TRS(HMODEL,[0,0,0],0,10)})

    END()

    if(MOUSE.buttons&&!ACX){INTRO=0;GTIME=0;STARTAUDIO()};
}

requestAnimationFrame(loop);//instead of loop()

/*
ONMOUSE=(e)=>{
    if(e.type=="mousedown") C.requestPointerLock()
}
*/

//</script>