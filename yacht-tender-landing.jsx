import { useState, useEffect, useRef, useCallback } from "react";

const GOLD = "#C9A96E";
const GOLD_LIGHT = "#D4BC8A";
const DARK = "#0A0E14";
const CREAM = "#F5F0E8";
const TRAIL_LEN = 16;

/* ═══════════════════════════════════════════
   WATER SHADER (unchanged)
   ═══════════════════════════════════════════ */
const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;
const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_trail[${TRAIL_LEN}];
uniform float u_trailAge[${TRAIL_LEN}];
uniform int u_trailLen;
#define PI 3.14159265
float waveHeight(vec2 p,float t){
  float h=0.;
  h+=sin(dot(vec2(.6,.8),p)*.8+t*.6)*.12;
  h+=sin(dot(vec2(-.7,.5),p)*1.+t*.5)*.09;
  h+=sin(dot(vec2(.9,.3),p)*2.2+t*1.1)*.045;
  h+=sin(dot(vec2(-.4,.9),p)*2.8+t*1.3)*.035;
  h+=sin(dot(vec2(.5,-.7),p)*3.1+t*.9)*.03;
  h+=sin(dot(vec2(.8,-.5),p)*5.5+t*2.)*.015;
  h+=sin(dot(vec2(-.6,-.8),p)*6.2+t*2.3)*.012;
  h+=sin(dot(vec2(.3,.95),p)*7.8+t*2.7)*.008;
  h+=sin(dot(vec2(-.9,.1),p)*9.+t*3.)*.006;
  h+=sin(dot(vec2(.7,.7),p)*14.+t*3.5)*.003;
  h+=sin(dot(vec2(-.5,.85),p)*18.+t*4.)*.002;
  return h;
}
float mouseWake(vec2 wp,float aspect,float t){
  float h=0.;
  for(int i=0;i<${TRAIL_LEN};i++){
    if(i>=u_trailLen)break;
    vec2 trailUV=u_trail[i];
    if(trailUV.x<-0.5)continue;
    float age=u_trailAge[i];
    if(age>2.)continue;
    vec2 trailWorld=(trailUV-0.5)*vec2(aspect,1.)*6.;
    vec2 diff=wp-trailWorld;
    float dist=length(diff);
    float fade=exp(-age*3.5);
    float ripple=sin(dist*65.-age*14.)*exp(-dist*12.)*fade;
    float push=exp(-dist*dist*200.)*exp(-age*4.)*.06;
    h+=ripple*.04-push;
  }
  return h;
}
float totalHeight(vec2 wp,float aspect,float t){return waveHeight(wp,t)+mouseWake(wp,aspect,t);}
vec3 calcNormal(vec2 wp,float aspect,float t){
  float e=.01;
  float hC=totalHeight(wp,aspect,t);
  float hR=totalHeight(wp+vec2(e,0.),aspect,t);
  float hU=totalHeight(wp+vec2(0.,e),aspect,t);
  return normalize(vec3(-(hR-hC)/e,1.,-(hU-hC)/e));
}
float hash1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float smoothNoise(vec2 p){
  vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);
  float a=hash1(i),b=hash1(i+vec2(1,0)),c=hash1(i+vec2(0,1)),d=hash1(i+vec2(1,1));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
float causticLayer(vec2 uv,float t){
  vec2 warp=vec2(smoothNoise(uv*1.8+t*.12),smoothNoise(uv*1.8+vec2(5.2,1.3)+t*.1));
  vec2 w=uv+warp*.6;
  float c=(sin(w.x*5.+w.y*3.+t*.4)*.5+.5)*(sin(w.x*3.-w.y*5.5+t*.35)*.5+.5)*(sin((w.x+w.y)*4.-t*.3)*.5+.5);
  return pow(c,.35);
}
float caustics(vec2 uv,float t){return causticLayer(uv,t)*.6+causticLayer(uv*1.5+vec2(3.7,1.2),t*.8+5.)*.4;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float aspect=u_resolution.x/u_resolution.y;
  float t=u_time;
  vec2 wp=(uv-.5)*vec2(aspect,1.)*6.;
  float height=totalHeight(wp,aspect,t);
  vec3 normal=calcNormal(wp,aspect,t);
  vec3 viewDir=normalize(vec3(0.,1.,-.15));
  vec3 sunDir=normalize(vec3(.4,.8,.5));
  vec3 sunColor=vec3(1.,.95,.85);
  float cosT=max(dot(normal,viewDir),0.);
  float fresnel=.02+.98*pow(1.-cosT,5.);
  vec3 refractDir=refract(-viewDir,normal,1./1.33);
  vec2 refractWP=wp+refractDir.xz*.8;
  float depthVar=sin(refractWP.x*.5+t*.1)*.1+sin(refractWP.y*.4-t*.08)*.1;
  vec3 deepW=vec3(0.,.04,.09),midW=vec3(0.,.08,.18),shallowW=vec3(0.,.14,.28);
  float df=.5+depthVar+height*2.;
  vec3 waterCol=mix(deepW,midW,smoothstep(0.,.5,df));
  waterCol=mix(waterCol,shallowW,smoothstep(.5,1.,df));
  float caust=caustics(refractWP,t);
  waterCol+=vec3(.04,.16,.28)*caust*.5;
  float sss=pow(max(dot(viewDir,-refractDir),0.),4.);
  waterCol+=vec3(0.,.06,.12)*sss;
  vec3 halfV=normalize(sunDir+viewDir);
  float spec=pow(max(dot(normal,halfV),0.),256.);
  float specSoft=pow(max(dot(normal,halfV),0.),32.);
  float glitter=pow(max(dot(normal,halfV),0.),800.);
  vec3 specular=sunColor*(spec*2.+specSoft*.15+glitter*4.);
  vec3 reflDir=reflect(-viewDir,normal);
  float skyG=reflDir.y*.5+.5;
  vec3 skyCol=mix(vec3(.02,.06,.12),vec3(.05,.12,.22),skyG);
  vec3 col=mix(waterCol,skyCol,fresnel*.6)+specular;
  col=mix(col,vec3(.35,.45,.52),smoothstep(.08,.14,height)*.12);
  col+=vec3(.005,.01,.02);
  float vig=1.-smoothstep(.5,1.5,length(uv-.5)*1.8);
  col*=vig*.8+.2;
  col=col/(col+.8);col=pow(col,vec3(.95));
  gl_FragColor=vec4(col,1.);
}`;

function WaterCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const trailRef = useRef([]);
  const startTime = useRef(Date.now());
  const lastPush = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    function compile(src, type) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
      return s;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(VERT, gl.VERTEX_SHADER));
    gl.attachShader(prog, compile(FRAG, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = { time: gl.getUniformLocation(prog, "u_time"), resolution: gl.getUniformLocation(prog, "u_resolution"), trailLen: gl.getUniformLocation(prog, "u_trailLen"), trail: [], trailAge: [] };
    for (let i = 0; i < TRAIL_LEN; i++) { u.trail.push(gl.getUniformLocation(prog, `u_trail[${i}]`)); u.trailAge.push(gl.getUniformLocation(prog, `u_trailAge[${i}]`)); }

    const resize = () => { const d = Math.min(devicePixelRatio||1,2); canvas.width=innerWidth*d; canvas.height=innerHeight*d; canvas.style.width=innerWidth+"px"; canvas.style.height=innerHeight+"px"; gl.viewport(0,0,canvas.width,canvas.height); };
    resize(); addEventListener("resize", resize);

    const onMove = (e) => { const cx=e.touches?e.touches[0].clientX:e.clientX, cy=e.touches?e.touches[0].clientY:e.clientY; const now=Date.now(); if(now-lastPush.current>14){ trailRef.current.unshift({x:cx/innerWidth,y:1-cy/innerHeight,t:(now-startTime.current)/1000}); if(trailRef.current.length>TRAIL_LEN)trailRef.current.pop(); lastPush.current=now; }};
    addEventListener("mousemove", onMove); addEventListener("touchmove", onMove, {passive:true});

    function render() {
      const now = (Date.now()-startTime.current)/1000;
      gl.uniform1f(u.time, now); gl.uniform2f(u.resolution, canvas.width, canvas.height);
      trailRef.current = trailRef.current.filter(p=>(now-p.t)<2);
      const trail=trailRef.current, len=Math.min(trail.length,TRAIL_LEN);
      gl.uniform1i(u.trailLen, len);
      for(let i=0;i<TRAIL_LEN;i++){ if(i<len){gl.uniform2f(u.trail[i],trail[i].x,trail[i].y);gl.uniform1f(u.trailAge[i],now-trail[i].t);}else{gl.uniform2f(u.trail[i],-1,-1);gl.uniform1f(u.trailAge[i],99);}}
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      animRef.current=requestAnimationFrame(render);
    }
    animRef.current=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(animRef.current);removeEventListener("resize",resize);removeEventListener("mousemove",onMove);removeEventListener("touchmove",onMove);};
  }, []);

  return <canvas ref={canvasRef} style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:0}}/>;
}

/* ═══════════════════════════════════════════
   CONFIGURATOR MODAL
   ═══════════════════════════════════════════ */
function Configurator({ open, onClose }) {
  const [step, setStep] = useState("upload"); // upload | analyzing | results
  const [image, setImage] = useState(null); // { dataUrl, base64, mediaType }
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const reset = () => { setStep("upload"); setImage(null); setAnalysis(null); setError(null); };

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type;
      setImage({ dataUrl, base64, mediaType });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const analyze = useCallback(async () => {
    if (!image) return;
    setStep("analyzing"); setError(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.base64 } },
              { type: "text", text: `You are a luxury yacht design expert. Analyze this yacht image and respond ONLY with a JSON object (no markdown, no backticks, no preamble). The JSON must have exactly these fields:

{
  "yacht_name": "Identified model or best guess, e.g. 'Azimut Grande 35 Metri'",
  "design_style": "2-3 word style label, e.g. 'Italian Minimalist', 'British Classic', 'Scandinavian Modern'",
  "style_description": "One sentence describing the overall design philosophy",
  "colors": [
    {"hex": "#XXXXXX", "name": "Color name", "usage": "Where on the yacht"}
  ],
  "materials": ["material1", "material2"],
  "hull_character": "One sentence about hull lines and shape",
  "tender_prompt": "A detailed 2-3 sentence prompt for an AI image generator to create a matching tender/dinghy that harmonizes with this yacht's design language. Include specific colors (hex codes), materials, hull shape, and style cues. The prompt should start with: A photorealistic render of a luxury yacht tender..."
}

Return 3-5 colors. Be specific and detailed.` }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed);
      setStep("results");
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
      setStep("upload");
    }
  }, [image]);

  if (!open) return null;

  const modalBg = { position: "fixed", inset: 0, zIndex: 200, background: "rgba(5,8,14,0.92)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" };

  const closeBtn = (
    <button onClick={() => { onClose(); setTimeout(reset, 400); }} style={{
      position: "absolute", top: 24, right: 24, background: "none", border: "1px solid rgba(201,169,110,0.2)",
      color: CREAM, width: 44, height: 44, borderRadius: 12, cursor: "pointer", fontSize: 18,
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
      transition: "border-color 0.3s",
    }}
      onMouseEnter={e => e.target.style.borderColor = GOLD}
      onMouseLeave={e => e.target.style.borderColor = "rgba(201,169,110,0.2)"}
    >✕</button>
  );

  /* ── UPLOAD STEP ── */
  if (step === "upload") {
    return (
      <div style={modalBg}>
        {closeBtn}
        <div style={{ maxWidth: 600, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD, marginBottom: 16, fontWeight: 500 }}>Step 1</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, color: CREAM, margin: "0 0 12px" }}>
            Upload Your <span style={{ fontStyle: "italic", color: GOLD }}>Yacht</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.45)", marginBottom: 40, lineHeight: 1.6 }}>
            Share a photo and our AI will analyze the design DNA
          </p>

          {error && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#e55", marginBottom: 20 }}>{error}</div>}

          {!image ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? GOLD : "rgba(201,169,110,0.25)"}`,
                borderRadius: 20, padding: "64px 40px", cursor: "pointer",
                background: dragOver ? "rgba(201,169,110,0.04)" : "rgba(12,28,52,0.3)",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.6 }}>🛥️</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: CREAM, marginBottom: 8 }}>
                Drop your yacht photo here
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.35)" }}>
                or click to browse — JPG, PNG, WebP
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div>
              <div style={{
                borderRadius: 16, overflow: "hidden", marginBottom: 28,
                border: "1px solid rgba(201,169,110,0.15)", maxHeight: 360,
                display: "flex", justifyContent: "center", background: "rgba(0,0,0,0.3)",
              }}>
                <img src={image.dataUrl} alt="Yacht" style={{ maxWidth: "100%", maxHeight: 360, objectFit: "contain" }} />
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={reset} style={{
                  background: "transparent", border: "1px solid rgba(201,169,110,0.2)",
                  color: GOLD_LIGHT, padding: "14px 32px", borderRadius: 10,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                }}>Change Photo</button>
                <button onClick={analyze} style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                  border: "none", color: DARK, padding: "14px 36px", borderRadius: 10,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                  boxShadow: "0 6px 28px rgba(201,169,110,0.3)",
                }}>Analyze Design →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── ANALYZING STEP ── */
  if (step === "analyzing") {
    return (
      <div style={modalBg}>
        {closeBtn}
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", margin: "0 auto 28px",
            border: `2px solid ${GOLD}`, borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 400, color: CREAM, margin: "0 0 12px" }}>
            Analyzing Design DNA...
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.4)" }}>
            Extracting colors, materials, hull lines, and style language
          </p>
        </div>
      </div>
    );
  }

  /* ── RESULTS STEP ── */
  if (step === "results" && analysis) {
    const a = analysis;
    return (
      <div style={{ ...modalBg, alignItems: "flex-start", padding: "80px 24px 40px" }}>
        {closeBtn}
        <div style={{ maxWidth: 900, width: "100%", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD, marginBottom: 12, fontWeight: 500 }}>Analysis Complete</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 400, color: CREAM, margin: 0 }}>
              {a.yacht_name || "Your Yacht"}
            </h2>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.45)", marginTop: 8 }}>
              {a.design_style}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
            {/* Uploaded image */}
            <div style={{
              background: "linear-gradient(145deg, rgba(12,28,52,0.7), rgba(8,18,35,0.82))",
              borderRadius: 16, overflow: "hidden", border: "1px solid rgba(201,169,110,0.12)",
            }}>
              <img src={image.dataUrl} alt="Yacht" style={{ width: "100%", height: 220, objectFit: "cover" }} />
              <div style={{ padding: "16px 20px" }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 4 }}>Source</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: CREAM }}>{a.yacht_name || "Uploaded Yacht"}</div>
              </div>
            </div>

            {/* Style analysis */}
            <div style={{
              background: "linear-gradient(145deg, rgba(12,28,52,0.7), rgba(8,18,35,0.82))",
              borderRadius: 16, padding: "28px 24px", border: "1px solid rgba(201,169,110,0.12)",
              display: "flex", flexDirection: "column", gap: 20,
            }}>
              {/* Colors */}
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Color Palette</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(a.colors || []).map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "6px 10px" }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: c.hex, border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: CREAM }}>{c.name}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)" }}>{c.hex}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>Materials</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(a.materials || []).map((m, i) => (
                    <span key={i} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: CREAM,
                      background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.15)",
                      borderRadius: 6, padding: "5px 12px",
                    }}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Hull */}
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Hull Character</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.55)", lineHeight: 1.6 }}>{a.hull_character}</div>
              </div>

              {/* Style */}
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Design Philosophy</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.55)", lineHeight: 1.6 }}>{a.style_description}</div>
              </div>
            </div>
          </div>

          {/* Tender prompt */}
          <div style={{
            background: "linear-gradient(145deg, rgba(12,28,52,0.7), rgba(8,18,35,0.82))",
            borderRadius: 16, padding: "28px 24px", border: "1px solid rgba(201,169,110,0.12)", marginBottom: 32,
          }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Generated Tender Prompt</div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.6)", lineHeight: 1.75,
              background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "16px 20px",
              border: "1px solid rgba(201,169,110,0.06)",
            }}>
              {a.tender_prompt}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.3)", marginTop: 12, fontStyle: "italic" }}>
              This prompt will be sent to the image generation engine (Flux/DALL-E) to create photorealistic renders.
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", paddingBottom: 40 }}>
            <button onClick={reset} style={{
              background: "transparent", border: "1px solid rgba(201,169,110,0.2)",
              color: GOLD_LIGHT, padding: "14px 32px", borderRadius: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            }}>Try Another Yacht</button>
            <button style={{
              background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
              border: "none", color: DARK, padding: "14px 36px", borderRadius: 10,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              boxShadow: "0 6px 28px rgba(201,169,110,0.3)", opacity: 0.5,
            }} disabled>Generate Renders (Coming Soon)</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════ */
function FloatingCard({ children, delay = 0, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 600 + delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? `translateY(0) scale(${hovered ? 1.02 : 1})` : "translateY(50px) scale(0.96)",
      transition: "opacity 0.9s ease, transform 0.5s cubic-bezier(0.23,1,0.32,1)",
      animation: visible ? `bob 5s ease-in-out ${index * 1.1}s infinite` : "none",
      background: hovered ? "linear-gradient(145deg, rgba(12,28,52,0.85), rgba(8,18,35,0.92))" : "linear-gradient(145deg, rgba(12,28,52,0.7), rgba(8,18,35,0.82))",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: `1px solid ${hovered ? "rgba(201,169,110,0.5)" : "rgba(201,169,110,0.12)"}`,
      borderRadius: 18, padding: "36px 32px", position: "relative", overflow: "hidden", cursor: "default",
      boxShadow: hovered ? "0 32px 80px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.4)",
    }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, rgba(0,60,100,0.12), transparent)", pointerEvents: "none", animation: `reflPulse 5s ease-in-out ${index * 0.6}s infinite` }}/>
      <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.3), transparent)" }}/>
      {children}
    </div>
  );
}

function FeatureIcon({ children }) {
  return <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.04))", border: "1px solid rgba(201,169,110,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 22 }}>{children}</div>;
}

function Nav({ onConfigure }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(scrollY > 40); addEventListener("scroll", h); return () => removeEventListener("scroll", h); }, []);
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 48px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", background: scrolled ? "rgba(10,14,20,0.9)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(201,169,110,0.08)" : "none", transition: "all 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M16 4L28 12V24L16 28L4 24V12L16 4Z" stroke={GOLD} strokeWidth="1.5" fill="none"/><path d="M7 18C11 14 21 14 25 18" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><path d="M9 21C13 18 19 18 23 21" stroke={GOLD} strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 600, color: CREAM, letterSpacing: "0.06em" }}>TENDER<span style={{ color: GOLD }}>CRAFT</span></span>
      </div>
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {["Collection", "Experience", "Atelier", "Contact"].map(item => (
          <a key={item} href="#" style={{ color: "rgba(245,240,232,0.6)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, letterSpacing: "0.14em", textTransform: "uppercase", transition: "color 0.3s" }}
            onMouseEnter={e => e.target.style.color = GOLD} onMouseLeave={e => e.target.style.color = "rgba(245,240,232,0.6)"}>{item}</a>
        ))}
        <button onClick={onConfigure} style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, border: "none", color: DARK, padding: "10px 24px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>Configure</button>
      </div>
    </nav>
  );
}

function Hero({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);
  return (
    <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center" }}>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 1.2s cubic-bezier(0.23,1,0.32,1)" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD, marginBottom: 28, fontWeight: 500 }}>AI-Powered Yacht Tender Design</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 400, color: CREAM, lineHeight: 1.05, margin: "0 0 28px", maxWidth: 900 }}>
          Your Yacht.<br/><span style={{ fontStyle: "italic", color: GOLD }}>Your Tender.</span>
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(245,240,232,0.55)", maxWidth: 520, margin: "0 auto 52px", lineHeight: 1.75, fontWeight: 300 }}>
          Generate bespoke tender renders that perfectly match your yacht's design language. Powered by artificial intelligence.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onStart} style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, border: "none", color: DARK, padding: "17px 44px", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 8px 36px rgba(201,169,110,0.3)" }}>Start Designing</button>
          <button style={{ background: "transparent", border: "1px solid rgba(201,169,110,0.25)", color: GOLD_LIGHT, padding: "17px 44px", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>View Gallery</button>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "fadeFloat 2.5s ease-in-out infinite" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(245,240,232,0.25)" }}>Explore</span>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(201,169,110,0.3), transparent)" }}/>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    { num: "01", icon: "⛵", title: "Upload Your Yacht", desc: "Share a photo of your yacht or select from our curated catalogue of the world's finest vessels." },
    { num: "02", icon: "✦", title: "AI Style Analysis", desc: "Our AI deconstructs the design DNA — hull lines, color palette, material finishes, and aesthetic philosophy." },
    { num: "03", icon: "◈", title: "Generate Renders", desc: "Receive photorealistic tender renders that harmonize perfectly with your yacht's signature style." },
    { num: "04", icon: "⬡", title: "Refine & Perfect", desc: "Iterate on every detail — from upholstery tones to hull geometry — until perfection is achieved." },
  ];
  return (
    <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 120px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD, marginBottom: 16, fontWeight: 500 }}>The Process</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 400, color: CREAM, margin: 0 }}>From Vision to <span style={{ fontStyle: "italic" }}>Reality</span></h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(255px, 1fr))", gap: 22 }}>
        {steps.map((s, i) => (
          <FloatingCard key={s.num} delay={i * 150} index={i}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 300, color: "rgba(201,169,110,0.07)", position: "absolute", top: 14, right: 22 }}>{s.num}</div>
            <FeatureIcon>{s.icon}</FeatureIcon>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 500, color: CREAM, margin: "0 0 10px" }}>{s.title}</h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "rgba(245,240,232,0.45)", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
          </FloatingCard>
        ))}
      </div>
    </section>
  );
}

function ShowcaseSection() {
  const yachts = [
    { name: "Azimut Grande", style: "Italian Elegance", colors: ["#2C3E50", "#C9A96E", "#1A1A2E"] },
    { name: "Benetti Oasis", style: "Modern Minimalism", colors: ["#F5F0E8", "#0B1623", "#8B7355"] },
    { name: "Ferretti 1000", style: "Sportive Luxury", colors: ["#1E3A5F", "#C0C0C0", "#8B0000"] },
  ];
  return (
    <section style={{ position: "relative", zIndex: 1, padding: "40px 24px 120px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD, marginBottom: 16, fontWeight: 500 }}>Showcase</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 400, color: CREAM, margin: 0 }}>Matched <span style={{ fontStyle: "italic" }}>Perfection</span></h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 24 }}>
        {yachts.map((y, i) => (
          <FloatingCard key={y.name} delay={i * 200} index={i + 4}>
            <div style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 24, background: `linear-gradient(135deg, ${y.colors[0]}CC, ${y.colors[2]}CC)`, position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.04)" }}>
              <svg viewBox="0 0 400 200" style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "80%", opacity: 0.6 }}>
                <path d="M60 140 Q80 100 160 95 Q240 90 320 100 Q360 105 380 120 L380 145 Q320 155 200 158 Q80 155 60 145Z" fill={y.colors[1]} opacity="0.5"/>
                <path d="M140 95 L160 55 L170 55 L175 95" fill="none" stroke={y.colors[1]} strokeWidth="2" opacity="0.4"/>
              </svg>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%)", animation: `cardShimmer 5s ease-in-out ${i * 1.5}s infinite` }}/>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 500, color: CREAM, margin: "0 0 5px" }}>{y.name}</h3>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, color: GOLD, letterSpacing: "0.12em" }}>{y.style}</span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {y.colors.map((c, ci) => <div key={ci} style={{ width: 17, height: 17, borderRadius: "50%", background: c, border: "2px solid rgba(255,255,255,0.12)" }}/>)}
              </div>
            </div>
          </FloatingCard>
        ))}
      </div>
    </section>
  );
}

function CTASection({ onStart }) {
  return (
    <section style={{ position: "relative", zIndex: 1, padding: "80px 24px 120px", maxWidth: 700, margin: "0 auto" }}>
      <FloatingCard delay={0} index={8}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD, marginBottom: 20, fontWeight: 500 }}>Begin Your Journey</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, color: CREAM, margin: "0 0 16px", lineHeight: 1.25 }}>
            Ready to Design Your<br/><span style={{ fontStyle: "italic", color: GOLD }}>Perfect Tender?</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, color: "rgba(245,240,232,0.45)", lineHeight: 1.75, margin: "0 0 36px", fontWeight: 300 }}>
            Upload your yacht and let our AI craft a tender that's unmistakably yours. No two designs are ever the same.
          </p>
          <button onClick={onStart} style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, border: "none", color: DARK, padding: "18px 52px", borderRadius: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 8px 40px rgba(201,169,110,0.35)" }}>Configure Now</button>
        </div>
      </FloatingCard>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(201,169,110,0.08)", padding: "40px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.25)" }}>© 2026 TenderCraft — AI-Powered Yacht Tender Design</span>
      <div style={{ display: "flex", gap: 24 }}>
        {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.25)", textDecoration: "none" }}>{l}</a>)}
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const openConfig = useCallback(() => setConfigOpen(true), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0A0E14;overflow-x:hidden;-webkit-font-smoothing:antialiased}
        ::selection{background:rgba(201,169,110,0.3);color:#F5F0E8}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes reflPulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes cardShimmer{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
        @keyframes fadeFloat{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:.7;transform:translateY(6px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0A0E14}
        ::-webkit-scrollbar-thumb{background:rgba(201,169,110,0.15);border-radius:3px}
      `}</style>
      <WaterCanvas/>
      <Nav onConfigure={openConfig}/>
      <Hero onStart={openConfig}/>
      <ProcessSection/>
      <ShowcaseSection/>
      <CTASection onStart={openConfig}/>
      <Footer/>
      <Configurator open={configOpen} onClose={() => setConfigOpen(false)}/>
    </>
  );
}
