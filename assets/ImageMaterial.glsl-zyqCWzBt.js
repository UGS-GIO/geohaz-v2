import{xD as I,xE as $,xF as O,eA as l,xG as c,xH as S,xI as b,xJ as A,xK as D,xL as p,r5 as P,xM as C,xN as u,xO as w,_ as N,xP as R,jF as x,ao as i,xQ as o,kS as m,xR as V,xS as M,xT as F,xU as L,xV as U,xW as j,xX as z,xY as B,xZ as G,x_ as W,x$ as H,y0 as k,y1 as Q,y2 as q,y3 as J,kp as _,y4 as g,y5 as K,y6 as X,y7 as Y,y8 as Z,y9 as ee,wv as te,ya as ae,yb as se,l3 as re,yc as ie}from"./index-67svOC1w.js";function E(a){const e=new I,{vertex:t,fragment:s}=e;return $(t,a),e.include(O,a),e.attributes.add(l.POSITION,"vec3"),e.attributes.add(l.UV0,"vec2"),a.perspectiveInterpolation&&e.attributes.add(l.PERSPECTIVEDIVIDE,"float"),e.varyings.add("vpos","vec3"),a.multipassEnabled&&e.varyings.add("depth","float"),t.code.add(c`
    void main(void) {
      vpos = position;
      ${a.multipassEnabled?"depth = (view * vec4(vpos, 1.0)).z;":""}
      vTexCoord = uv0;
      gl_Position = transformPosition(proj, view, vpos);

      ${a.perspectiveInterpolation?"gl_Position *= perspectiveDivide;":""}
    }
  `),e.include(S,a),e.include(b,a),s.uniforms.add(new A("tex",n=>n.texture),new D("opacity",n=>n.opacity)),e.varyings.add("vTexCoord","vec2"),a.output===p.Alpha?s.code.add(c`
    void main() {
      discardBySlice(vpos);
      ${a.multipassEnabled?"terrainDepthTest(depth);":""}

      float alpha = texture(tex, vTexCoord).a * opacity;
      if (alpha  < ${c.float(P)}) {
        discard;
      }

      fragColor = vec4(alpha);
    }
    `):(s.include(C),s.code.add(c`
    void main() {
      discardBySlice(vpos);
      ${a.multipassEnabled?"terrainDepthTest(depth);":""}
      fragColor = texture(tex, vTexCoord) * opacity;

      if (fragColor.a < ${c.float(P)}) {
        discard;
      }

      fragColor = highlightSlice(fragColor, vpos);
      ${a.transparencyPassType===u.Color?"fragColor = premultiplyAlpha(fragColor);":""}
    }
    `)),e}const oe=Object.freeze(Object.defineProperty({__proto__:null,build:E},Symbol.toStringTag,{value:"Module"}));class y extends V{initializeProgram(e){return new M(e.rctx,y.shader.get().build(this.configuration),T)}_setPipelineState(e,t){const s=this.configuration,n=e===u.NONE,d=e===u.FrontFace;return F({blending:s.output!==p.Color&&s.output!==p.Alpha||!s.transparent?null:n?ne:L(e),culling:U(s.cullFace),depthTest:{func:j(e)},depthWrite:n?s.writeDepth?z:null:B(e),colorWrite:G,stencilWrite:s.hasOccludees?W:null,stencilTest:s.hasOccludees?t?H:k:null,polygonOffset:n||d?null:Q(s.enableOffset)})}initializePipeline(){return this._occludeePipelineState=this._setPipelineState(this.configuration.transparencyPassType,!0),this._setPipelineState(this.configuration.transparencyPassType,!1)}getPipeline(e){return e?this._occludeePipelineState:super.getPipeline()}}y.shader=new w(oe,()=>N(()=>Promise.resolve().then(()=>ue),void 0));const ne=R(x.ONE,x.ONE_MINUS_SRC_ALPHA);class r extends q{constructor(){super(...arguments),this.output=p.Color,this.cullFace=m.None,this.hasSlicePlane=!1,this.transparent=!1,this.enableOffset=!0,this.writeDepth=!0,this.hasOccludees=!1,this.transparencyPassType=u.NONE,this.multipassEnabled=!1,this.cullAboveGround=!1,this.perspectiveInterpolation=!0}}i([o({count:p.COUNT})],r.prototype,"output",void 0),i([o({count:m.COUNT})],r.prototype,"cullFace",void 0),i([o()],r.prototype,"hasSlicePlane",void 0),i([o()],r.prototype,"transparent",void 0),i([o()],r.prototype,"enableOffset",void 0),i([o()],r.prototype,"writeDepth",void 0),i([o()],r.prototype,"hasOccludees",void 0),i([o({count:u.COUNT})],r.prototype,"transparencyPassType",void 0),i([o()],r.prototype,"multipassEnabled",void 0),i([o()],r.prototype,"cullAboveGround",void 0),i([o()],r.prototype,"perspectiveInterpolation",void 0),i([o({constValue:!1})],r.prototype,"occlusionPass",void 0);const T=new Map([[l.POSITION,0],[l.UV0,2],[l.PERSPECTIVEDIVIDE,3]]);class he extends J{constructor(e){super(e,new ce),this.supportsEdges=!0,this.produces=new Map([[_.OPAQUE_MATERIAL,t=>t===p.Highlight||g(t)&&!this.parameters.transparent],[_.TRANSPARENT_MATERIAL,t=>g(t)&&this.parameters.transparent&&this.parameters.writeDepth],[_.TRANSPARENT_DEPTH_WRITE_DISABLED_MATERIAL,t=>g(t)&&this.parameters.transparent&&!this.parameters.writeDepth],[_.DRAPED_MATERIAL,t=>K(t)]]),this._vertexAttributeLocations=T,this._configuration=new r}getConfiguration(e,t){return this._configuration.output=e,this._configuration.cullFace=this.parameters.cullFace,this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.transparent=this.parameters.transparent,this._configuration.writeDepth=this.parameters.writeDepth,this._configuration.hasOccludees=this.parameters.hasOccludees,this._configuration.transparencyPassType=t.transparencyPassType,this._configuration.enableOffset=t.camera.relativeElevation<X,this._configuration.multipassEnabled=t.multipassEnabled,this._configuration.cullAboveGround=t.multipassTerrain.cullAboveGround,this._configuration.perspectiveInterpolation=this.parameters.perspectiveInterpolation,this._configuration}createGLMaterial(e){return new le(e)}createBufferWriter(){const e=Y.clone();return this.parameters.perspectiveInterpolation&&e.f32(l.PERSPECTIVEDIVIDE),new pe(e)}}class le extends Z{constructor(e){super({...e,...e.material.parameters})}_updateParameters(e){return this.updateTexture(this._material.parameters.textureId),this._material.setParameters(this.textureBindParameters),this.ensureTechnique(y,e)}_updateOccludeeState(e){e.hasOccludees!==this._material.parameters.hasOccludees&&(this._material.setParameters({hasOccludees:e.hasOccludees}),this._updateParameters(e))}beginSlot(e){return this._output!==p.Color&&this._output!==p.Alpha||this._updateOccludeeState(e),this._updateParameters(e)}}class pe extends ee{write(e,t,s,n,d){for(const h of this.vertexBufferLayout.fields.keys()){const f=s.attributes.get(h);if(f)if(h===l.PERSPECTIVEDIVIDE){te(f.size===1);const v=n.getField(h,ae);v&&se(f,v,d)}else re(h,f,e,t,n,d)}}}class ce extends ie{constructor(){super(...arguments),this.transparent=!1,this.writeDepth=!0,this.hasSlicePlane=!1,this.cullFace=m.None,this.hasOccludees=!1,this.opacity=1,this.textureId=null,this.initTextureTransparent=!0,this.perspectiveInterpolation=!1}}const ue=Object.freeze(Object.defineProperty({__proto__:null,build:E},Symbol.toStringTag,{value:"Module"}));export{he as T};
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
