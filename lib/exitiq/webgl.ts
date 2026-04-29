// Domain-warped FBM fluid background — dual theme (dark / cream)

export interface WebGLControls {
  cleanup: () => void
  setConf: (v: number) => void
  setLightMode: (v: boolean) => void
}

export function setupWebGL(canvas: HTMLCanvasElement): WebGLControls {
  const glRaw = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" })
  if (!glRaw) return { cleanup: () => {}, setConf: () => {}, setLightMode: () => {} }
  const gl: WebGLRenderingContext = glRaw

  const vs = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`
  const fs = `
    precision mediump float;
    uniform float T;
    uniform vec2  R;
    uniform float C;
    uniform float LM;
    uniform vec2  MX;

    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){
      vec2 i=floor(p),f=fract(p);
      f=f*f*(3.-2.*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0.,a=.5;
      for(int i=0;i<5;i++){v+=a*n(p);p=p*2.1+vec2(3.7,1.9);a*=.5;}
      return v;
    }

    void main(){
      vec2 uv=gl_FragCoord.xy/R;
      vec2 st=vec2(uv.x*R.x/R.y, uv.y);
      vec2 t=vec2(T*.07, T*.055);
      vec2 mx=(MX-.5)*vec2(.08,.06);
      st+=mx;

      vec2 q=vec2(fbm(st*1.4+t), fbm(st*1.4+vec2(5.2,1.3)+t*.9));
      vec2 r=vec2(fbm(st+2.*q+vec2(1.7,9.2)+t*.7), fbm(st+2.*q+vec2(8.3,2.8)+t*.6));
      float f=fbm(st+2.8*r+t*.4);

      vec3 base=vec3(.047,.039,.035);
      vec3 darkCol=mix(base, vec3(.08,.28,.22), smoothstep(.2,.75,f)*.8);
      darkCol=mix(darkCol, vec3(.20,.15,.35), smoothstep(.45,.9,f)*.65);
      darkCol=mix(darkCol, vec3(.08,.18,.36), smoothstep(.6,1.,f)*.5);
      darkCol=mix(darkCol, vec3(.28,.14,.10), smoothstep(.75,1.,f)*.35);
      darkCol+=fbm(st*4.+t)*.022;
      darkCol=mix(darkCol, darkCol+vec3(.07,.03,-.03)*C, C);
      darkCol*=1.+C*.22;

      vec3 creamBase=vec3(.949,.941,.922);
      vec3 creamCol=creamBase;
      creamCol=mix(creamCol, vec3(.86,.84,.93), smoothstep(.3,.68,f)*.22);
      creamCol=mix(creamCol, vec3(.97,.90,.84), smoothstep(.5,.85,f)*.18);
      creamCol=mix(creamCol, vec3(.87,.94,.90), smoothstep(.6,1.,f)*.14);
      creamCol=mix(creamCol, vec3(.94,.89,.82), smoothstep(.7,1.,f)*.18);
      creamCol+=fbm(st*3.+t)*.012;
      creamCol=mix(creamCol, creamCol+vec3(.02,.01,-.01)*C, C*.5);

      vec3 col=mix(darkCol, creamCol, LM);

      vec2 vg=uv*2.-1.;
      float darkVig=1.-dot(vg,vg)*(.42-.18*C);
      float creamVig=1.-dot(vg,vg)*(.12-.04*C);
      float vig=mix(darkVig, creamVig, LM);
      col*=vig;

      vec2 mDist=uv-MX;
      float spot=exp(-dot(mDist,mDist)*18.);
      vec3 darkSpot=vec3(.18,.32,.26)*spot*.06*(1.+C*.5);
      vec3 creamSpot=vec3(.06,.16,.10)*spot*.04;
      col+=mix(darkSpot, creamSpot, LM);

      gl_FragColor=vec4(col,1.);
    }`

  function makeShader(type: number, src: string): WebGLShader {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return s
  }

  const prog = gl.createProgram()!
  gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, vs))
  gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog)
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "p")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const uT = gl.getUniformLocation(prog, "T")
  const uR = gl.getUniformLocation(prog, "R")
  const uC = gl.getUniformLocation(prog, "C")
  const uLM = gl.getUniformLocation(prog, "LM")
  const uMX = gl.getUniformLocation(prog, "MX")

  let mouseX = 0.5,
    mouseY = 0.5,
    targetMX = 0.5,
    targetMY = 0.5
  let currentLM = 0,
    targetLM = 0

  const onMouse = (e: MouseEvent) => {
    targetMX = e.clientX / window.innerWidth
    targetMY = 1 - e.clientY / window.innerHeight
  }
  window.addEventListener("mousemove", onMouse)

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uR, canvas.width, canvas.height)
  }
  resize()
  window.addEventListener("resize", resize)

  gl.uniform1f(uC, 0)
  gl.uniform1f(uLM, 0)
  gl.uniform2f(uMX, 0.5, 0.5)

  let raf: number
  const t0 = performance.now()

  const loop = () => {
    mouseX += (targetMX - mouseX) * 0.04
    mouseY += (targetMY - mouseY) * 0.04
    currentLM += (targetLM - currentLM) * 0.035
    gl.uniform1f(uT, (performance.now() - t0) / 1000)
    gl.uniform2f(uMX, mouseX, mouseY)
    gl.uniform1f(uLM, currentLM)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    raf = requestAnimationFrame(loop)
  }
  loop()

  return {
    cleanup: () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouse)
    },
    setConf: (v: number) => {
      gl.uniform1f(uC, Math.min(Math.max(v, 0), 1))
    },
    setLightMode: (v: boolean) => {
      targetLM = v ? 1 : 0
    },
  }
}
