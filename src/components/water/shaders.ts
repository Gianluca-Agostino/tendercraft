export const TRAIL_LEN = 16;

export const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

export const FRAG = `
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
