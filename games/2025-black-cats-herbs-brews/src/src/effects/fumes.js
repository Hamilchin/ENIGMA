export const makeFumesShader = (r,g,b) => {
    return `#version 300 es
#define oct 5
precision highp float;uniform float v;uniform vec2 f;in vec2 m;out vec4 o;float n(vec2 v){return fract(sin(dot(v.xy,vec2(1,300)))*43758.5453123);}float t(vec2 v){vec2 m=floor(v);v=fract(v);float f=n(m),x=n(m+vec2(1,0));v=v*v*(3.-2.*v);return mix(f,x,v.x)+(n(m+vec2(0,1))-f)*v.y*(1.-v.x)+(n(m+vec2(1))-x)*v.x*v.y;}float x(vec2 v){float m=0.,x=.4;for(int f=0;f<oct;f++)m+=x*t(v),v*=2.,x*=.4;return m;}void main(){vec2 e=m.xy;e.x*=f.x/f.y;float n=mix(e.y*.2+.1,e.y*1.2+.9,x(e));e=vec2(e.x,e.y-v*.2)*9.;float i=x(e),d=.9*x(e+i+v)-.5,D=.9*x(vec2(i,d));i=x(vec2(d,i));o=vec4(mix(vec3(0),vec3(${r/255},${g/255},${b/255}),i+.5)+vec3(i-n),.5);}`;
}

export class WebGLHandler {
  vertexShaderSource = `#version 300 es
precision mediump float;const vec2 e[6]=vec2[6](vec2(-1),vec2(1,-1),vec2(-1,1),vec2(-1,1),vec2(1,-1),vec2(1));out vec2 m;void main(){m=e[gl_VertexID];gl_Position=vec4(e[gl_VertexID],0,1);}`;

  constructor(canvas, fragmentShaderSource) {
    this.cn = canvas;
    this.gl = canvas.getContext("webgl2");
    this.gl.colorMask(true, true, true, false);
    this.startTime = Date.now();
    this.program = this.gl.createProgram();
    this.compileShader(this.vertexShaderSource, this.gl.VERTEX_SHADER);
    this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
    this.gl.linkProgram(this.program);
    this.gl.useProgram(this.program);

    this.timeLocation = this.gl.getUniformLocation(this.program, "v");
    this.resolutionLocation = this.gl.getUniformLocation(this.program, "f");

    this.render();
  }

  compileShader(source, type) {
    let shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      return null;
    }
    return this.gl.attachShader(this.program, shader);
  }

  render = () => {
    this.gl.uniform1f(this.timeLocation, (Date.now() - this.startTime) / 1000);
    this.gl.uniform2fv(this.resolutionLocation, [
      this.cn.width,
      this.cn.height
    ]);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(this.render);
  };
}

