// Generated with Shader Minifier 1.3.4 (https://github.com/laurentlb/Shader_Minifier/)
export const aCoords = 'i';
export const aCoords1 = 'D';
export const aDepth = 'm';
export const aLife = 'c';
export const aNormal = 'A';
export const aSize = 'a';
export const aTexCoord = 'B';
export const alpha = 'G';
export const fragColor = 'g';
export const fragDepth = 'v';
export const frameA = 'H';
export const frameB = 'I';
export const lightPovMvp = 't';
export const modelviewProjection = 'E';
export const normalMatrix = 'F';
export const outColor = 'u';
export const positionFromLightPov = 'e';
export const shadowMap = 'd';
export const uSampler = 's';
export const uViewProj = 'w';
export const u_viewDirectionProjectionInverse = 'C';
export const vDepth = 'f';
export const vLife = 'z';
export const vNormal = 'n';
export const vNormalMatrix = 'o';
export const vTexCoord = 'l';
export const v_position = 'y';

export const depth_fragment_glsl = `#version 300 es
precision highp float;
out float v;in float f;void main(){if(f>11.f)discard;v=gl_FragCoord.z;}`;

export const depth_vertex_glsl = `#version 300 es
precision highp float;
layout(location=2) in float m;layout(location=3) in vec4 i;uniform mat4 t;out float f;void main(){gl_Position=t*i;f=m;}`;

export const fragment_glsl = `#version 300 es
precision highp float;
in vec2 l;in float f;in vec3 n;in mat4 o;in vec4 e;uniform mediump sampler2DArray s;uniform mediump sampler2DShadow d;vec3 h=normalize(vec3(.3,.3,.2));vec4 x=vec4(.2,.2,.2,1);out vec4 u;float p(mediump sampler2DShadow f,vec4 v){float i=0.,n=1./4096.;for(int l=-1;l<=1;l++)for(int m=-1;m<=1;m++){vec2 e=vec2(l,m)*n;i+=texture(f,vec3(v.xy+e,v.z-.002));}return i/9.;}float p(float f,float i,float m){return 2.*i/(m+i-f*(m-i));}void main(){float v=p(d,e);vec3 m=normalize(mat3(o)*n);float i=max(dot(h,m),0.),t=f>14.?1.:mix(.2*i,i,v);vec3 a=t*vec3(1),z=a+x.xyz,y=clamp(z,vec3(.3),vec3(1));vec4 g=texture(s,vec3(l,f));float w=p(gl_FragCoord.z,1.,7e2),A=clamp(smoothstep(.4,1.,w),0.,.5);vec3 C=vec3(.3,.3,.5),c=mix(g.xyz*y,C,A);u=vec4(c,g.w);if(u.w<.2)discard;}`;

export const particle_fragment_glsl = `#version 300 es
precision highp float;
in float z,f;out vec4 g;uniform mediump sampler2DArray s;void main(){vec4 m=texture(s,vec3(gl_PointCoord,f));float v=m.w*z;if(v<.01)discard;g=vec4(m.xyz,v);}`;

export const particle_vertex_glsl = `#version 300 es
layout(location=0) in vec3 i;layout(location=1) in float a;layout(location=2) in float c;layout(location=3) in float m;uniform mat4 w;out float z,f;void main(){gl_Position=w*vec4(i,1);gl_PointSize=a;z=c;f=m;}`;

export const skybox_fragment_glsl = `#version 300 es
precision highp float;
uniform mediump sampler2D s;uniform mat4 C;in vec4 y;out vec4 u;void main(){vec4 m=C*y;vec3 v=normalize(m.xyz/m.w);float f=atan(v.x,v.z),n=asin(clamp(v.y,-1.,1.));vec2 i;i.x=f/6.28+.5;i.y=n/3.14+.5;u=texture(s,i);}`;

export const skybox_vertex_glsl = `#version 300 es
layout(location=0) in vec4 i;out vec4 y;void main(){y=i;gl_Position=i;gl_Position.z=1.;}`;

export const vertex_glsl = `#version 300 es
layout(location=0) in vec3 A;layout(location=1) in vec2 B;layout(location=2) in float m;layout(location=3) in vec3 i;layout(location=4) in vec3 D;uniform mat4 E,F,t;uniform float G;uniform int H,I;vec4 r[2];out vec2 l;out float f;out vec3 n;out mat4 o;out vec4 e;void main(){r[0]=vec4(i,1);r[1]=vec4(D,1);vec4 v=mix(r[H],r[I],G);gl_Position=E*v;l=B;f=m;n=A;o=F;e=t*v;}`;

