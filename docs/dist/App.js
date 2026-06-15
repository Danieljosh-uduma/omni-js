var O=null,st=0,xt={signals:new Map,listeners:new Set,history:[],registerSignal(a,c,o){this.signals.set(a,{name:c,value:o}),this.broadcast("register",{id:a,name:c,value:o})},logMutation(a,c,o,e){this.signals.has(a)&&(this.signals.get(a).value=e);let x={id:a,name:c,oldValue:o,newValue:e,timestamp:Date.now()};this.history.push(x),this.broadcast("mutation",x)},onEvent(a){return this.listeners.add(a),()=>this.listeners.delete(a)},broadcast(a,c){this.listeners.forEach(o=>o({type:a,payload:c}))}};typeof window<"u"&&(window.__OMNI_DEVTOOLS__=xt);function p(a,c=""){let o=++st,e=new Set,x=c||`signal_${o}`;typeof window<"u"&&window.__OMNI_DEVTOOLS__&&window.__OMNI_DEVTOOLS__.registerSignal(o,x,a);function g(k){return k&&typeof k=="object"?new Proxy(k,{get(b,i,r){O&&e.add(O);let m=Reflect.get(b,i,r);return m&&typeof m=="object"?g(m):m},set(b,i,r,m){let t=Reflect.get(b,i,m);return t!==r&&(Reflect.set(b,i,r,m),typeof window<"u"&&window.__OMNI_DEVTOOLS__&&window.__OMNI_DEVTOOLS__.logMutation(o,x,t,r),e.forEach(n=>n())),!0}}):k}let l=g(a);return{__isSignal:!0,get value(){return O&&e.add(O),l},set value(k){if(l!==k){let b=l;l=g(k),typeof window<"u"&&window.__OMNI_DEVTOOLS__&&window.__OMNI_DEVTOOLS__.logMutation(o,x,b,k),e.forEach(i=>i())}}}}function u(a){let c=()=>{O=c;try{a()}finally{O=null}};c()}var at=!1,A=null,M=[];function T(a){M.push(a)}async function ct(a,c){let o=0;return new Promise(e=>{function x(g){if(g===!1)e({status:"cancel"});else if(typeof g=="string")e({status:"redirect",path:g});else if(g===!0||g===void 0)if(o++,o<M.length)try{M[o](a,c,x)}catch(l){console.error("[OmniJS Router] Guard error:",l),e({status:"cancel"})}else e({status:"ok"})}if(M.length===0)e({status:"ok"});else try{M[0](a,c,x)}catch(g){console.error("[OmniJS Router] Guard error:",g),e({status:"cancel"})}})}var it=()=>window.location.pathname||"/";function lt(){return at||(A=p(it()),window.addEventListener("popstate",async()=>{let a=A.value,c=it();if(c===a)return;let o=await ct(c,a);o.status==="ok"?(A.value=c,window.scrollTo({top:0,behavior:"instant"})):o.status==="redirect"?(window.history.pushState(null,"",o.path),A.value=o.path,window.scrollTo({top:0,behavior:"instant"})):(window.history.pushState(null,"",a),window.scrollTo({top:0,behavior:"instant"}))}),at=!0),A}async function f(a){A||lt();let c=A.value,o=a;if(o===c)return;let e=await ct(o,c);e.status==="ok"?(window.history.pushState(null,"",o),A.value=o,window.scrollTo({top:0,behavior:"instant"})):e.status==="redirect"&&f(e.path)}function d(){return A||lt(),A}function dt(a,c=[]){let o=a;for(let e of c){let x=e.name,g=new RegExp("<"+x+"\\b","g"),l=new RegExp("</"+x+"\\b","g");o=o.replace(g,`<omni-component-${x.toLowerCase()} omni-name="${x}"`),o=o.replace(l,`</omni-component-${x.toLowerCase()}>`)}return o=o.replace(/navigate::to=/g,"navigate-to="),o=o.replace(/bind::([a-zA-Z0-9_-]+)=/g,"bind-$1="),o=o.replace(/on::([a-zA-Z0-9_-]+)=/g,"on-$1="),o=o.replace(/animate::([a-zA-Z0-9_-]+)=/g,"animate-$1="),o=o.replace(/if::condition=/g,"if-condition="),o=o.replace(/src::logic=/g,"src-logic="),o=o.replace(/src::style=/g,"src-style="),o}async function h(a,c,o){let e=dt(a.templateSource,a.components||[]),g=new DOMParser().parseFromString(e,"text/html"),l=Array.from(g.body.childNodes);for(let k of l){let b=await E(k,c,{stackDepth:0,textDepth:1},a.components||[]);b&&o.appendChild(b)}}async function E(a,c,o,e){if(a.nodeType===Node.TEXT_NODE){let r=a.textContent;if(!r.trim())return null;if(r.includes("{")&&r.includes("}")){let m=document.createElement("span");return u(()=>{let t=r.replace(/\{[?]?([a-zA-Z0-9_.]+)\}/g,(n,z)=>{let C=z.split("."),w=c;for(let s of C)if(w&&typeof w=="object")if(s in w)w=w[s],w&&typeof w=="object"&&"value"in w&&Object.keys(w).length<=2&&(w=w.value);else return n;else return n;return w!==void 0?w:n});m.textContent=t}),m}return document.createTextNode(r)}if(a.nodeType!==Node.ELEMENT_NODE)return null;let x=a.tagName.toLowerCase();if(x==="portal"){let r=a.getAttribute("target")||"body",m=document.querySelector(r)||document.body,t=document.createElement("span");t.style.display="none",t.className="omni-portal-placeholder";let n=document.createElement("div");n.className="omni-portal-content",Array.from(a.attributes).forEach(s=>{s.name!=="target"&&s.name!=="as"&&n.setAttribute(s.name,s.value)});for(let s of Array.from(a.childNodes)){let S=await E(s,c,o,e);S&&n.appendChild(S)}m.appendChild(n);let z=()=>{let s=t.isConnected&&(t.offsetParent!==null||t.getBoundingClientRect().width>0);n.style.display=s?"":"none"},C=new MutationObserver(z);C.observe(document.body,{attributes:!0,subtree:!0,attributeFilter:["style","class"]}),setTimeout(z,0);let w=new MutationObserver(()=>{t.isConnected||(n.remove(),C.disconnect(),w.disconnect())});return w.observe(document.body,{childList:!0,subtree:!0}),t}let g=null;if(x.startsWith("omni-component-")){let r=a.getAttribute("omni-name");g=e.find(m=>m.name===r)}if(g){let r=document.createElement("div");r.className=`omni-component-${g.name.toLowerCase()}`;let m={};if(Array.from(a.attributes).forEach(t=>{if(t.name==="omni-name")return;let n=t.value;if(n.includes("{")&&n.includes("}")&&(n=n.replace(/\{[?]?([a-zA-Z0-9_.]+)\}/g,(z,C)=>{let w=C.split("."),s=c;for(let S of w)if(s&&typeof s=="object")if(S in s)s=s[S],s&&typeof s=="object"&&"value"in s&&Object.keys(s).length<=2&&(s=s.value);else return z;else return z;return s!==void 0?s:z})),t.name.startsWith("on-")){let z=t.name.replace("on-","");m[`on${z.charAt(0).toUpperCase()+z.slice(1)}`]=c[t.value]}else m[t.name]=n}),g.mount)await g.mount(r,m,c);else try{let n=await(await fetch(g.src,{cache:"no-cache"})).text();window.__omni_mount&&await window.__omni_mount(n,r,m,c)}catch(t){console.error(`[OmniJS] Failed to load component <${g.name}>`,t)}return r}let l,k={...o},b=a.getAttribute("as");if(x==="stack")k.stackDepth++,b?l=document.createElement(b):k.stackDepth===1?l=document.createElement("main"):k.stackDepth===2?l=document.createElement("section"):l=document.createElement("div");else if(x==="text")if(b)l=document.createElement(b);else if(o.collectionType==="tr"){let r=a.getAttribute("type");l=document.createElement(r==="th"?"th":"td")}else o.inCollection&&(o.collectionType==="ul"||o.collectionType==="ol"||!o.collectionType)?l=document.createElement("li"):k.textDepth<=6?(l=document.createElement(`h${k.textDepth}`),k.textDepth++):l=document.createElement("p");else if(x==="action")b==="link"||!b&&a.hasAttribute("href")?(l=document.createElement("a"),a.hasAttribute("href")&&(l.href=a.getAttribute("href"))):b==="submit"?(l=document.createElement("button"),l.type="submit"):a.hasAttribute("navigate-to")?(l=document.createElement("button"),l.setAttribute("role","link")):b?l=document.createElement(b):l=document.createElement("button");else if(x==="collection"){if(b)l=document.createElement(b);else{let r=a.getAttribute("type")||"ul";r==="table"?l=document.createElement("table"):r==="thead"?l=document.createElement("thead"):r==="tbody"?l=document.createElement("tbody"):r==="tr"?l=document.createElement("tr"):r==="ol"?l=document.createElement("ol"):l=document.createElement("ul"),k.collectionType=r}k.inCollection=!0}else if(x==="media")if(b)l=document.createElement(b);else{let r=a.getAttribute("src")||"",m=a.getAttribute("type");m==="video"||r.endsWith(".mp4")||r.endsWith(".webm")?l=document.createElement("video"):m==="audio"||r.endsWith(".mp3")||r.endsWith(".wav")?l=document.createElement("audio"):m==="iframe"||r.includes("youtube.com")||r.includes("vimeo.com")?l=document.createElement("iframe"):l=document.createElement("img")}else if(x==="form")if(b)l=document.createElement(b);else{let r=a.hasAttribute("bind-value")||a.hasAttribute("placeholder")||a.hasAttribute("type");if(!k.inForm&&!r)l=document.createElement("form"),k.inForm=!0;else{let m=a.getAttribute("type")||"text";m==="textarea"?l=document.createElement("textarea"):m==="select"?l=document.createElement("select"):m==="label"?l=document.createElement("label"):(l=document.createElement("input"),l.type=m)}}else l=document.createElement(a.tagName);let i=null;if(a.hasAttribute("route")&&(i=a.getAttribute("route")),Array.from(a.attributes).forEach(r=>{let m=r.name,t=r.value;if(m!=="route"&&m!=="as"){if(m==="navigate-to"){l.addEventListener("click",n=>{n.preventDefault(),f(t)});return}if(m.startsWith("bind-")){let n=m.replace("bind-",""),C=t.replace("?","").split("."),w=C[0];c[w]&&(u(()=>{let s=c[w];s&&typeof s=="object"&&s.__isSignal===!0&&(s=s.value);for(let S=1;S<C.length;S++)s&&typeof s=="object"?(s=s[C[S]],s&&typeof s=="object"&&s.__isSignal===!0&&(s=s.value)):s=void 0;n==="text"?l.textContent=s??"":n==="value"?l.value!==s&&(l.value=s):n==="show"?l.style.display=s?"":"none":n==="hide"?l.style.display=s?"none":"":l.setAttribute(n,s)}),n==="value"&&l.addEventListener("input",s=>{if(C.length===1)c[w].value=s.target.value;else{let S=c[w].value;for(let R=1;R<C.length-1;R++)S=S[C[R]];S[C[C.length-1]]=s.target.value}}));return}if(m.startsWith("on-")){let n=m.replace("on-","");c[t]&&l.addEventListener(n,c[t]);return}m!=="if-condition"&&l.setAttribute(m,t)}}),x==="collection"&&a.hasAttribute("data")&&a.hasAttribute("as")){let r=a.getAttribute("data").replace("?",""),m=a.getAttribute("as");if(c[r]){let t=Array.from(a.childNodes);u(()=>{l.innerHTML="",(c[r].value||[]).forEach(async z=>{let C={...c,[m]:z};for(let w of t){let s=w.cloneNode(!0),S=await E(s,C,k,e);S&&l.appendChild(S)}})})}}else for(let r of Array.from(a.childNodes)){let m=await E(r,c,k,e);m&&l.appendChild(m)}if(i!==null){let r=d();l.style.display="none",u(()=>{let m=r.value,t=i===m||i==="/"&&(m==="/"||m==="");l.style.display=t?"":"none"})}return l}function v(a,c){let[o,e]=p(void 0),[x,g]=p(!1),[l,k]=p(null);async function b(i){g(!0),k(null);try{let r=await a(i);e(r)}catch(r){k(r instanceof Error?r:new Error(String(r)))}finally{g(!1)}}return c?u(()=>{let i=typeof c=="function"?c():c&&c.value!==void 0?c.value:c;b(i)}):b(void 0),{get value(){return o.value},get loading(){return x.value},get error(){return l.value},$value:o,$loading:x,$error:l}}function y({initialValues:a={},validate:c=()=>({})}){let o={};Object.keys(a).forEach(b=>{o[b]=""});let e=p({...a}),x=p(o),g=p(!1);function l(){e.value={...a},x.value={...o},g.value=!1}function k(b){return async function(i){i&&typeof i.preventDefault=="function"&&i.preventDefault();let r=e.value,m=c(r)||{},t={...o};if(Object.keys(m).forEach(z=>{t[z]=m[z]||""}),x.value=t,!Object.keys(m).some(z=>m[z])){g.value=!0;try{await b(r)}catch(z){console.error("[OmniJS Form] Submission failed:",z)}finally{g.value=!1}}}}return{values:e,errors:x,submitting:g,handleSubmit:k,reset:l}}function _(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[850px] mx-auto pb-16 px-4">
  <!-- Hero Section -->
  <Stack class="mb-16 text-center sm:text-left">
    <Text class="font-mono text-xs font-semibold text-[var(--color-accent-pink)] tracking-widest uppercase mb-4 animate-load=\\"from: { opacity: 0, y: 20, duration: 0.6 }\\"">Introducing OmniJS</Text>
    <Text class="font-heading text-4xl sm:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.08] mb-6 transition-colors duration-300 animate-load=\\"from: { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }\\"">
      Build premium interfaces with 
      <Text class="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">6 core blocks.</Text>
    </Text>
    <Text class="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-[1.7] transition-colors duration-300 animate-load=\\"from: { opacity: 0, y: 30, duration: 0.8, delay: 0.2, ease: 'power3.out' }\\"">
      OmniJS replaces traditional complex HTML with a unified abstraction layer. Leveraging a zero-build browser runtime for dev and an optimizing AOT compiler for production.
    </Text>
  </Stack>

  <!-- CTA Buttons -->
  <Stack class="flex flex-row flex-wrap gap-4 mb-16 items-center justify-center sm:justify-start animate-load=\\"from: { opacity: 0, y: 20, duration: 0.6, delay: 0.3 }\\"">
    <Action class="px-6 py-3 bg-[var(--color-accent-pink)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-pink-500/20" navigate-to="/tutorial/1">Start Tutorial</Action>
    <Action class="px-6 py-3 bg-white dark:bg-white/5 text-zinc-900 dark:text-white border border-black/10 dark:border-white/10 rounded-lg text-sm font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer" navigate-to="/blocks">Explore Deep Dives</Action>
  </Stack>

  <!-- Core Features Grid -->
  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-black/5 dark:border-white/10 pb-2 transition-colors duration-300">Core Features</Text>
  
  <Stack class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-7 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
      <Text class="text-2xl mb-3">\u26A1</Text>
      <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">Zero-Build Dev Engine</Text>
      <Text class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
        In local dev, simply load the lightweight client-side runtime parser directly in your browser. Start writing \`.omni\` components with instant feedback upon browser refresh\u2014no bundling required.
      </Text>
    </Stack>
    
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-7 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
      <Text class="text-2xl mb-3">\u{1F4E6}</Text>
      <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">Static AOT Production Compiler</Text>
      <Text class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
        The command-line build compiles your \`.omni\` template hierarchy, extracts styles, tree-shakes unused bindings, and bundles your entire codebase into a single deployment-ready minified JS file.
      </Text>
    </Stack>

    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-7 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
      <Text class="text-2xl mb-3">\u{1F9ED}</Text>
      <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">Built-in History API Router</Text>
      <Text class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
        Declarative client-side routing. Switch paths instantly using \`<Action navigate::to=\\"/route\\">\` and display matching \`<Stack route=\\"/route\\">\` views. Features native URL synchronization and history controls.
      </Text>
    </Stack>

    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-7 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
      <Text class="text-2xl mb-3">\u{1F3A8}</Text>
      <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">CSS & Utility Styling</Text>
      <Text class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
        Support for scoped \`<style>\` blocks, standard inline styles, and utility-first styling with frameworks like Tailwind CSS out-of-the-box.
      </Text>
    </Stack>

    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-7 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
      <Text class="text-2xl mb-3">\u267B\uFE0F</Text>
      <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">Signals-Based Reactivity</Text>
      <Text class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
        Zero overhead Proxy reactivity system. Mutating a \`?state\` variable directly updates dependent DOM elements via granular subscriptions. No Virtual DOM diffing, just precise DOM updates.
      </Text>
    </Stack>

    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-7 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5">
      <Text class="text-2xl mb-3">\u{1F9E9}</Text>
      <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">Isolated Component Imports</Text>
      <Text class="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
        Import other \`.omni\` files cleanly using \`\` tags. Every component maintains fully isolated script state and scoped CSS styles to prevent name clashes.
      </Text>
    </Stack>
  </Stack>

  <!-- Setup and Workflow Details -->
  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mb-6 border-b border-black/5 dark:border-white/10 pb-2 transition-colors duration-300">Project Setup Guide</Text>

  <!-- Step 1: CLI Scaffolding -->
  <Stack class="mb-10">
    <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">1. Scaffold a New Project</Text>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
      You can quickly scaffold a fresh workspace pre-configured with Tailwind, hot-reloading dev servers, AOT compiler targets, and a starter layout by running:
    </Text>
    <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 font-mono text-[0.82rem] leading-relaxed text-zinc-700 dark:text-zinc-300 transition-all duration-300">
      <Text class="text-[var(--color-accent-pink)] font-semibold">npx @omni/cli create my-omni-app</Text>
      <Text class="text-[var(--color-accent-blue)] font-semibold mt-2">cd my-omni-app && npm install</Text>
    </Stack>
  </Stack>

  <!-- Step 2: Directory Layout -->
  <Stack class="mb-10">
    <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">2. Directory Structure</Text>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
      The standard project layout is organized as follows:
    </Text>
    <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 font-mono text-[0.8rem] leading-loose text-zinc-700 dark:text-zinc-300 transition-all duration-300">
      <Text>my-omni-app/</Text>
      <Text> \u251C\u2500\u2500 index.html            <Text class="text-zinc-500 dark:text-zinc-500"># Main entry point served by local server</Text></Text>
      <Text> \u251C\u2500\u2500 omni-runtime.js       <Text class="text-zinc-500 dark:text-zinc-500"># Core framework interpreter (dev mode only)</Text></Text>
      <Text> \u251C\u2500\u2500 output.css            <Text class="text-zinc-500 dark:text-zinc-500"># Compiled and built Tailwind CSS stylesheet</Text></Text>
      <Text> \u251C\u2500\u2500 package.json          <Text class="text-zinc-500 dark:text-zinc-500"># Package manager configuration & build targets</Text></Text>
      <Text> \u2514\u2500\u2500 src/</Text>
      <Text>      \u251C\u2500\u2500 App.omni          <Text class="text-zinc-500 dark:text-zinc-500"># Root app component and router layout</Text></Text>
      <Text>      \u251C\u2500\u2500 input.css         <Text class="text-zinc-500 dark:text-zinc-500"># Tailwind CSS source directives</Text></Text>
      <Text>      \u251C\u2500\u2500 components/       <Text class="text-zinc-500 dark:text-zinc-500"># Reusable atomic UI elements</Text></Text>
      <Text>      \u2514\u2500\u2500 pages/            <Text class="text-zinc-500 dark:text-zinc-500"># Large route page view components</Text></Text>
    </Stack>
  </Stack>

  <!-- Step 3: Local Development -->
  <Stack class="mb-10">
    <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">3. Run Local Development</Text>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
      Start the dev server by executing the command below. This starts a concurrent task that watches/compiles your CSS and boots a local file server:
    </Text>
    <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 font-mono text-[0.82rem] leading-relaxed text-zinc-700 dark:text-zinc-300 transition-all duration-300 mb-4">
      <Text class="text-[var(--color-accent-orange)] font-semibold">npm run dev</Text>
    </Stack>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
      Open the URL printed in your console (e.g. \`http://localhost:3000\`). In this mode, the browser retrieves \`/omni-runtime.js\` which dynamically fetches and compiles \`/src/App.omni\` on the fly. You can write code, save, and refresh to view changes immediately.
    </Text>
  </Stack>

  <!-- Step 4: Production Builds -->
  <Stack class="mb-10">
    <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">4. Compile and Build for Production</Text>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
      When you are ready to deploy your app, compile your codebase using AOT compiler optimization:
    </Text>
    <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 font-mono text-[0.82rem] leading-relaxed text-zinc-700 dark:text-zinc-300 transition-all duration-300 mb-4">
      <Text class="text-[var(--color-accent-blue)] font-semibold">npm run build</Text>
    </Stack>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
      This compiler executes a build pipeline that:
    </Text>
    <Collection class="list-disc pl-5 mt-2 space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
      <Text>Minifies and tree-shakes your source files into a single, optimized bundle inside \`dist/App.js\`.</Text>
      <Text>Copies and minifies your CSS stylesheet into \`dist/output.css\`.</Text>
      <Text>Generates \`dist/index.html\` with root-relative references, stripped development script tags, and a modern module mount block.</Text>
    </Collection>
  </Stack>

  <!-- Step 5: Start & Deploy -->
  <Stack class="mb-10">
    <Text class="font-heading text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">5. Start and Deploy</Text>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed transition-colors duration-300">
      You can preview the compiled production app locally before shipping by running:
    </Text>
    <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 font-mono text-[0.82rem] leading-relaxed text-zinc-700 dark:text-zinc-300 transition-all duration-300 mb-4">
      <Text class="text-zinc-500"># Start local static server in /dist</Text>
      <Text class="text-[var(--color-accent-pink)] font-semibold">npm run start</Text>
    </Stack>
    <Text class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed transition-colors duration-300">
      To deploy your application, simply copy the contents of the generated \`dist/\` directory directly to any static web hosting provider (such as Vercel, Netlify, AWS S3, Cloudflare Pages, or GitHub Pages).
    </Text>
  </Stack>
</Stack>`,components:[]},e,a)}function I(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Stack class="mb-12">\r
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2 transition-colors duration-300">Core Blocks</Text>\r
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">OmniJS replaces every HTML element with 6 universal building blocks. The compiler determines the correct semantic HTML output automatically.</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#7b5cff]/10 text-[var(--color-accent-purple)]">&lt;Stack&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">The foundation of all layout. A Stack automatically compiles to semantic elements based on its depth in the component tree \u2014 main at the root, section at depth 2, and div for deeper nesting.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">main \xB7 section \xB7 div \xB7 nav \xB7 header \xB7 footer</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0.1 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#00c2ff]/10 text-[var(--color-accent-blue)]">&lt;Text&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">Renders text content with automatic heading hierarchy. The first Text becomes h1, the next h2, and so on down to h6, after which it falls back to paragraph tags.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">h1 \xB7 h2 \xB7 h3 \xB7 h4 \xB7 h5 \xB7 h6 \xB7 p \xB7 span \xB7 li</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0.2 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#ff2d7b]/10 text-[var(--color-accent-pink)]">&lt;Action&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">Interactive elements. The output tag is determined by the attributes you provide \u2014 an anchor for href, a button for click handlers or navigation, and input for data binding.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">button \xB7 a \xB7 input \xB7 textarea</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0.3 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#ff9f43]/10 text-[var(--color-accent-orange)]">&lt;Collection&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">Iterates over data arrays to produce semantically correct, highly optimized list structures. Supports unordered lists, ordered lists, and complex table matrices. Use type="ol" for ordered lists.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">ul \xB7 ol \xB7 table \xB7 tr \xB7 td</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0.4 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#00d68f]/10 text-[var(--color-accent-green)]">&lt;Media&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">Handles all multimedia content intelligently. It automatically outputs the correct native tag based on the provided file extension or explicit type attribute.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">img \xB7 video \xB7 audio \xB7 iframe</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0.5 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#ff2d7b]/10 text-[var(--color-accent-pink)]">&lt;Form&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">A context-aware form builder. The top level acts as a form wrapper, while nested Form tags compile into appropriate form controls depending on the type attribute (inputs, textareas, selects, or labels).</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">form \xB7 input \xB7 textarea \xB7 select \xB7 label</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg" animate-load="from: { opacity: 0, y: 40, rotationX: -15, duration: 0.8, ease: 'back.out(1.2)', delay: 0.6 }">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#7b5cff]/10 text-[var(--color-accent-purple)]">&lt;Use&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">The component inclusion and instantiation block. Use it to import external OmniJS files and register them as custom tags that can accept props.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Compiles To</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">Custom Components</Text>\r
  </Stack>\r
\r
  <Stack class="block-card bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-8 mb-5 transition-all duration-300 hover:border-black/15 dark:hover:border-white/20 hover:shadow-lg">\r
    <Stack class="flex items-center gap-3 mb-4">\r
      <Text class="font-mono text-sm font-semibold px-3 py-1 rounded-md bg-[#ff2d7b]/10 text-[var(--color-accent-pink)]">&lt;Portal&gt;</Text>\r
    </Stack>\r
    <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-4 transition-colors duration-300">Renders its children into a target DOM node outside the parent component's DOM tree (e.g. #modal-root or body) while preserving reactive state bindings and syncing visibility with the parent component hierarchy.</Text>\r
    <Text class="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 transition-colors duration-300">Key Attribute</Text>\r
    <Text class="font-mono text-[0.82rem] text-zinc-500 dark:text-zinc-500 transition-colors duration-300">target (CSS selector string)</Text>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function D(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px] animate-in slide-in-from-bottom-4 duration-500">
  <Stack class="mb-12">
    <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">API Reference</Text>
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Reactivity & Signals</Text>
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">OmniJS uses a zero-overhead, fine-grained reactivity system based on Signals. State mutations trigger direct, surgical DOM updates without a virtual DOM.</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Declaring Reactive State</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    State is declared in component \`<script>\` blocks using the \`state ?varName = initialValue;\` syntax. The compiler transforms this into a Signal object behind the scenes and registers it with DevTools.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">// Declaring reactive variables</Text>
    <Text class="text-[var(--color-accent-pink)]">state ?counter = 0;</Text>
    <Text class="text-[var(--color-accent-blue)]">state ?username = "OmniJS";</Text>
    <Text class="text-[var(--color-accent-orange)]">state ?userProfile = { role: "admin", active: true };</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Mutating State</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    You modify state by assigning values to variables naturally. For objects and arrays, standard assignments and property mutations are automatically tracked via a Proxy wrapper.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-800 dark:text-zinc-200">function increment() {</Text>
    <Text class="text-[var(--color-accent-pink)]">  ?counter = ?counter + 1; // Direct assignment</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>
    <Text class="text-zinc-500 mt-2">// Object property mutations are also reactive</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">function toggleActive() {</Text>
    <Text class="text-[var(--color-accent-orange)]">  ?userProfile.active = !?userProfile.active;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Side Effects (effect)</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    The \`effect(fn)\` utility executes a function and automatically tracks any reactive signal accessed during its execution. Whenever those signals mutate, the function runs again automatically.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-[var(--color-accent-blue)]">effect(() => {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  // Automatically re-executes whenever ?counter changes</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  document.title = \`Count: \${?counter}\`;</Text>
    <Text class="text-[var(--color-accent-blue)]">});</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Logging State (log)</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    OmniJS provides a context-aware global \`log()\` function inside \`<script>\` blocks. It prefixes console output with \`[OmniJS]\` and automatically unpacks the current value of any reactive variable passed into it.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-800 dark:text-zinc-200">function checkState() {</Text>
    <Text class="text-[var(--color-accent-pink)]">  log("Counter value is:", ?counter); </Text>
    <Text class="text-zinc-500">  // Output: [OmniJS] Counter value is: 0</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/portal">&larr; Portal Block</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/api/resource">Next: createResource &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function P(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px] animate-in slide-in-from-bottom-4 duration-500">
  <Stack class="mb-12">
    <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">API Reference</Text>
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Asynchronous Resources (createResource)</Text>
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">Manage remote data fetching declaratively. The \`createResource\` primitive handles state synchronization, loading flags, errors, and reactive dependency refetching automatically.</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Usage & Signature</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    \`createResource\` takes an asynchronous fetcher function and an optional dependency tracking source. It returns a read-only object wrapping reactive signals.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">// Signature: const resource = createResource(fetcher, source?);</Text>
    <Text class="text-[var(--color-accent-blue)]">const userResource = createResource(async (id) => {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  const res = await fetch(\`/api/user/\${id}\`);</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  return res.json();</Text>
    <Text class="text-[var(--color-accent-blue)]">}, () => ?userId);</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-3">Resource Properties</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    The returned object exposes three read-only properties which can be bound directly to the template:
  </Text>
  
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12] my-4">
    <Collection type="table" class="w-full text-left text-sm">
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">
        <Collection type="tr">
          <Text type="th" class="px-4 py-3 font-semibold">Property</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>
        </Collection>
      </Collection>
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">value</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Any</Text>
          <Text type="td" class="px-4 py-3">The resolved data returned by the fetcher (or \`undefined\` initially).</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">loading</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Boolean</Text>
          <Text type="td" class="px-4 py-3">Reactive boolean indicating if the fetch operation is currently in progress.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">error</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Error | null</Text>
          <Text type="td" class="px-4 py-3">Contains any Error object thrown during fetching, or \`null\` if successful.</Text>
        </Collection>
      </Collection>
    </Collection>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-3">Binding to Templates</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    You can bind the resource states in templates using the standard \`bind-\` properties or inline template syntax. Nested signal unwrapping handles properties automatically.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-4 overflow-x-auto">
    <Text class="text-[var(--color-accent-pink)]">&lt;Stack bind-show="userResource.loading"&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Loading user details...&lt;/Text&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">&lt;/Stack&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">&lt;Stack bind-show="userResource.value"&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Welcome back, {userResource.value.name}!&lt;/Text&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">&lt;/Stack&gt;</Text>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/api/reactivity">&larr; Reactivity & Signals</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/api/context">Next: Context API &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function j(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px] animate-in slide-in-from-bottom-4 duration-500">
  <Stack class="mb-12">
    <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">API Reference</Text>
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Scoped Context API (provide / inject)</Text>
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">Share state and functions across deeply nested child component trees without prop-drilling. The provider/injector system resolves context dynamically by climbing up the component ancestry.</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Providing Context</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    In your provider component's script block, use \`provide(key, value)\`. You can pass objects containing reactive signals to share live state updates.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">// Provider Component (e.g., App.omni)</Text>
    <Text class="text-[var(--color-accent-pink)]">state ?theme = "dark";</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">function toggleTheme() {</Text>
    <Text class="text-[var(--color-accent-pink)]">  ?theme = ?theme === "dark" ? "light" : "dark";</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>
    <Text class="text-[var(--color-accent-blue)]">provide("themeContext", {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  theme: context.theme, // Pass the raw signal reference</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  toggleTheme</Text>
    <Text class="text-[var(--color-accent-blue)]">});</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Injecting Context</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    In any deeply nested child component, use \`inject(key)\` in the script block. To track context signal mutations reactively in children, bind or monitor them inside an effect.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">// Consumer Component (e.g., ThemeButton.omni)</Text>
    <Text class="text-[var(--color-accent-blue)]">const themeCtx = inject("themeContext");</Text>
    <Text class="text-[var(--color-accent-pink)]">state ?currentTheme = "";</Text>
    <Text class="text-zinc-500 mt-2">// Sync local state with context reactively</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">effect(() => {</Text>
    <Text class="text-[var(--color-accent-pink)]">  ?currentTheme = themeCtx.theme.value;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">});</Text>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/api/resource">&larr; Asynchronous Resources</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/api/form">Next: Form Management &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function F(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px] animate-in slide-in-from-bottom-4 duration-500">
  <Stack class="mb-12">
    <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">API Reference</Text>
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Form Management (useForm)</Text>
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">Manage input state validation, submission statuses, errors, and reset lifecycles reactively in your form controls with the \`useForm\` hook.</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Form Configuration</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    Call \`useForm\` inside your script block, passing the \`initialValues\` shape and a custom \`validate\` callback. The hook guarantees that all error fields are initialized to empty strings \`""\` to prevent \`"undefined"\` coersion in DOM bindings.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-[var(--color-accent-blue)]">const myForm = useForm({</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  initialValues: { email: "", password: "" },</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  validate: (values) => {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    const errs = {};</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    if (!values.email.includes("@")) errs.email = "Invalid email";</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    if (values.password.length &lt; 6) errs.password = "Too short";</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    return errs;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  }</Text>
    <Text class="text-[var(--color-accent-blue)]">});</Text>
    <Text class="text-zinc-500 mt-2">// Wrapper for submission logic</Text>
    <Text class="text-[var(--color-accent-pink)]">const onSubmit = myForm.handleSubmit(async (data) => {</Text>
    <Text class="text-zinc-850 dark:text-zinc-200">  log("Submitting validated data:", data);</Text>
    <Text class="text-[var(--color-accent-pink)]">});</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-3">API Members</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    The returned object exposes reactive signals and utility methods:
  </Text>
  
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12] my-4">
    <Collection type="table" class="w-full text-left text-sm">
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">
        <Collection type="tr">
          <Text type="th" class="px-4 py-3 font-semibold">Member</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>
        </Collection>
      </Collection>
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">values</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Signal&lt;Object&gt;</Text>
          <Text type="td" class="px-4 py-3">Reactive state wrapping input fields values.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">errors</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Signal&lt;Object&gt;</Text>
          <Text type="td" class="px-4 py-3">Reactive state holding validation error strings.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">submitting</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Signal&lt;Boolean&gt;</Text>
          <Text type="td" class="px-4 py-3">Reactive boolean indicating if async submit handler is running.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">handleSubmit</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Function</Text>
          <Text type="td" class="px-4 py-3">Validates inputs first, updates errors signal, and executes submit callback.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">reset</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Function</Text>
          <Text type="td" class="px-4 py-3">Resets values, errors, and submitting state signals to their initial shapes.</Text>
        </Collection>
      </Collection>
    </Collection>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-3">Binding to Form Elements</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    Two-way bind form inputs directly to form values signals. Use conditional bindings like \`bind-show\` to reveal errors.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-4 overflow-x-auto">
    <Text class="text-[var(--color-accent-pink)]">&lt;Form on-submit="onSubmit"&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Form type="email" placeholder="Email" bind-value="?myForm.values.email" /&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">  &lt;Text class="text-red-500" bind-text="?myForm.errors.email" bind-show="myForm.errors.email"&gt;&lt;/Text&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Action type="submit" bind-hide="myForm.submitting"&gt;Login&lt;/Action&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">&lt;/Form&gt;</Text>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/api/context">&larr; Scoped Context API</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/api/router">Next: Router & Guards &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function B(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px] animate-in slide-in-from-bottom-4 duration-500">
  <Stack class="mb-12">
    <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">API Reference</Text>
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Router Navigation Guards (beforeEach)</Text>
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">Build secure paths and transitions. Programmatically intercept, pause, cancel, or redirect route changes before they are committed using the beforeEach guard middleware.</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Registering Navigation Guards</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    Register a global navigation guard in your root script block using \`beforeEach((to, from, next) => { ... })\`. You must invoke the \`next()\` callback exactly once to resolve the transition.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">// Register guard</Text>
    <Text class="text-[var(--color-accent-blue)]">beforeEach((to, from, next) => {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  if (to === "/admin" && !?isLoggedIn) {</Text>
    <Text class="text-[var(--color-accent-pink)]">    next("/login"); // Redirect to login</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  } else if (to === "/blocked") {</Text>
    <Text class="text-[var(--color-accent-pink)]">    next(false); // Cancel transition, revert URL</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  } else {</Text>
    <Text class="text-[var(--color-accent-pink)]">    next(); // Proceed to destination</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  }</Text>
    <Text class="text-[var(--color-accent-blue)]">});</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-3">Guard Callback Parameter (next)</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    The third parameter \`next\` accepts the following arguments:
  </Text>
  
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12] my-4">
    <Collection type="table" class="w-full text-left text-sm">
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">
        <Collection type="tr">
          <Text type="th" class="px-4 py-3 font-semibold">Value</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Action</Text>
        </Collection>
      </Collection>
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">next()</Text>
          <Text type="td" class="px-4 py-3 text-zinc-600 dark:text-zinc-400">Proceed to the next guard or confirm the navigation if no guards remain.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">next(false)</Text>
          <Text type="td" class="px-4 py-3 text-zinc-600 dark:text-zinc-400">Abort current transition. The URL is automatically reset to the \`from\` path.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">next("/path")</Text>
          <Text type="td" class="px-4 py-3 text-zinc-600 dark:text-zinc-400">Redirects to the specified path. Aborts current transition and schedules a new transition.</Text>
        </Collection>
      </Collection>
    </Collection>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-3">Programmatic Navigation (navigate)</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    Trigger page transitions in your JavaScript functions by calling \`navigate("/path")\`.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-4 overflow-x-auto">
    <Text class="text-zinc-800 dark:text-zinc-200">function loginUser() {</Text>
    <Text class="text-[var(--color-accent-blue)]">  navigate("/dashboard"); // Redirect user</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/api/form">&larr; Form Management</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/api/devtools">Next: DevTools &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function N(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px] animate-in slide-in-from-bottom-4 duration-500">
  <Stack class="mb-12">
    <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">API Reference</Text>
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">DevTools Reactivity Explorer Hook</Text>
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">Inspect registered signals and trace state mutations in real-time. In OmniJS, the compiler automatically passes variable names as debug labels to the global DevTools hook.</Text>
  </Stack>

  <Text class="font-heading text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-3 transition-colors duration-300">Global Hook Hook API</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    The framework exposes a global \`window.__OMNI_DEVTOOLS__\` hook in the browser. You can inspect active signals, view history of mutations, and subscribe to events.
  </Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-xs leading-[1.75] my-3 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">// Subscribe to reactivity events (creation, updates)</Text>
    <Text class="text-[var(--color-accent-blue)]">if (typeof window !== "undefined" && window.__OMNI_DEVTOOLS__) {</Text>
    <Text class="text-zinc-850 dark:text-zinc-200">  window.__OMNI_DEVTOOLS__.onEvent(({ type, payload }) => {</Text>
    <Text class="text-zinc-850 dark:text-zinc-200">    if (type === "mutation") {</Text>
    <Text class="text-[var(--color-accent-pink)]">      console.log(\`[DevTools] Signal "\${payload.name}" changed:\`, payload.oldValue, "->", payload.newValue);</Text>
    <Text class="text-zinc-850 dark:text-zinc-200">    }</Text>
    <Text class="text-zinc-850 dark:text-zinc-200">  });</Text>
    <Text class="text-[var(--color-accent-blue)]">}</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-3">API Schema</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[0.92rem] mb-4 transition-colors duration-300">
    \`window.__OMNI_DEVTOOLS__\` exposes the following members:
  </Text>
  
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12] my-4">
    <Collection type="table" class="w-full text-left text-sm">
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">
        <Collection type="tr">
          <Text type="th" class="px-4 py-3 font-semibold">Member</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>
        </Collection>
      </Collection>
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">signals</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Map&lt;Number, Object&gt;</Text>
          <Text type="td" class="px-4 py-3">Map of active signals indexed by unique IDs, mapping to \`{ name, value }\`.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">history</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Array&lt;Object&gt;</Text>
          <Text type="td" class="px-4 py-3">Audit history log of all mutations: \`{ id, name, oldValue, newValue, timestamp }\`.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">onEvent</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Function</Text>
          <Text type="td" class="px-4 py-3">Registers listener for reactivity events. Returns an unsubscribe function.</Text>
        </Collection>
      </Collection>
    </Collection>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/api/router">&larr; Router & Guards</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/">Finish &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function H(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Stack class="mb-12">\r
    <Text class="font-heading text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-2 transition-colors duration-300">Interactive Tutorial</Text>\r
    <Text class="text-lg text-zinc-600 dark:text-zinc-400 max-w-[620px] leading-relaxed transition-colors duration-300">A comprehensive, hands-on walkthrough of every OmniJS concept. Let's start with the most fundamental building block of layout.</Text>\r
  </Stack>\r
\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-purple)] mb-2">Core Block 1 of 4</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">&lt;Stack&gt; \u2014 Layout Container</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">Stack is the universal container. It replaces every structural HTML element \u2014 div, section, main, nav, header, and footer. The compiler determines the correct semantic tag based on the Stack's depth in the component tree, ensuring accessibility without mental overhead.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">How Depth Mapping Works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">The first Stack in your template renders as a main element. Nested inside it, the next level renders as section. Any deeper nesting produces div elements.</Text>\r
\r
  <Stack class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">OmniJS Input</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;Stack&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;Stack&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-pink)]">    &lt;Stack&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">      &lt;Text&gt;Deep&lt;/Text&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-pink)]">    &lt;/Stack&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;/Stack&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;/Stack&gt;</Text>\r
    </Stack>\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">HTML Output</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;main&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;section&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-pink)]">    &lt;div&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">      &lt;h1&gt;Deep&lt;/h1&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-pink)]">    &lt;/div&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;/section&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;/main&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Attributes</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">All standard HTML attributes pass through to the rendered element.</Text>\r
\r
  <Stack class="w-full mb-6">\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/4 font-mono text-xs text-[var(--color-accent-blue)] font-medium">class</Text>\r
      <Text class="w-3/4 text-sm text-zinc-600 dark:text-zinc-400">CSS classes \u2014 fully compatible with Tailwind CSS</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/4 font-mono text-xs text-[var(--color-accent-blue)] font-medium">style</Text>\r
      <Text class="w-3/4 text-sm text-zinc-600 dark:text-zinc-400">Inline CSS styles</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/4 font-mono text-xs text-[var(--color-accent-blue)] font-medium">route</Text>\r
      <Text class="w-3/4 text-sm text-zinc-600 dark:text-zinc-400">Turns this Stack into a route view container</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Stack class="border-l-4 border-[var(--color-accent-purple)] bg-[#7b5cff]/10 p-4 rounded-r-xl my-6">\r
    <Text class="text-zinc-700 dark:text-zinc-300 text-[0.88rem] leading-relaxed">Pro tip: Since all layout is done via CSS (flexbox, grid), the specific HTML tag rarely matters for visual layout. What matters is the semantic meaning \u2014 and OmniJS handles that automatically based on tree depth.</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Stack></Stack>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/2">Next: Typography &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function L(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Core Block 2 of 4</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">&lt;Text&gt; \u2014 Typography</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">Text handles all typographic output. It automatically assigns the correct heading level based on how many Text blocks have appeared before it in the same scope, then falls back to paragraphs.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Heading Hierarchy</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">The heading depth counter starts at 1 and increments for each Text block the renderer encounters sequentially. Once it passes h6, all subsequent Text blocks become paragraph elements.</Text>\r
\r
  <Stack class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">OmniJS Input</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">&lt;Text&gt;Title&lt;/Text&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">&lt;Text&gt;Subtitle&lt;/Text&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">&lt;Text&gt;Section&lt;/Text&gt;</Text>\r
    </Stack>\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">HTML Output</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;h1&gt;Title&lt;/h1&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;h2&gt;Subtitle&lt;/h2&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;h3&gt;Section&lt;/h3&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Reactive Text</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Bind state directly to a Text element using bind-text. The content updates in real-time when the signal changes.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-zinc-500">&lt;!-- Static text --&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Text&gt;Hello World&lt;/Text&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-500">&lt;!-- Reactive text (updates when ?count changes) --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Text bind-text="?count"&gt;&lt;/Text&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-500">&lt;!-- Inline interpolation --&gt;</Text>\r
    <Text class="text-[var(--color-accent-green)]">&lt;Text&gt;You have {?count} items&lt;/Text&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/1">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/3">Next: Interaction &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function J(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">Core Block 3 of 4</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">&lt;Action&gt; \u2014 Interaction</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">Action is the interactive element. The compiler inspects the attributes you provide and selects the most appropriate HTML element \u2014 a button for clicks, an anchor for links, or an input for data binding.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Attribute-Based Element Selection</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">OmniJS infers the correct accessible HTML tag from your attributes. You can also explicitly set it using the \`as\` attribute.</Text>\r
\r
  <Stack class="w-full mb-6">\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">navigate-to="/path"</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;button role="link"&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">Client-side SPA navigation</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">as="link" href="..."</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;a&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">External or traditional link</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">as="button"</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;button&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">Explicitly forces a button tag</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">as="submit"</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;button type="submit"&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">Form submission button</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Examples</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-zinc-500">&lt;!-- SPA navigation --&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Action navigate-to="/about"&gt;About Us&lt;/Action&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-500">&lt;!-- External link --&gt;</Text>\r
    <Text class="text-[var(--color-accent-green)]">&lt;Action href="https://github.com"&gt;GitHub&lt;/Action&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-500">&lt;!-- Button with event --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Action class="px-4 py-2 bg-blue-500 rounded" on-click="submit"&gt;Submit&lt;/Action&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="border-l-4 border-[var(--color-accent-purple)] bg-[#7b5cff]/10 p-4 rounded-r-xl my-6">\r
    <Text class="text-zinc-700 dark:text-zinc-300 text-[0.88rem] leading-relaxed">Accessibility Note: Because Action renders as a real button or anchor element natively, keyboard navigation and screen reader support work out of the box. You never need to add tabindex or role manually for basic interactions.</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/2">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/media">Next: Media &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function U(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-green)] mb-2">Core Block 4 of 6</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">&lt;Media&gt; \u2014 Images, Video & Audio</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">The Media block handles all multimedia content intelligently. By inspecting the file extension or the URL, OmniJS automatically outputs the correct native media tag.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Automatic Type Inference</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">You rarely need to specify what kind of media you're rendering. The compiler infers it from the \`src\` attribute.</Text>\r
\r
  <Stack class="w-full mb-6">\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">src="image.png"</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;img&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">Default fallback</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">src="video.mp4"</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;video&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">.mp4 and .webm extensions</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">src="audio.mp3"</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;audio&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">.mp3 and .wav extensions</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/3 font-mono text-xs text-[var(--color-accent-blue)] font-medium">src="youtube.com/..."</Text>\r
      <Text class="w-1/4 font-mono text-xs text-zinc-500 font-medium">&lt;iframe&gt;</Text>\r
      <Text class="w-2/3 text-sm text-zinc-600 dark:text-zinc-400">youtube.com and vimeo.com domains</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Explicit Override</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">If the URL doesn't have an extension (e.g., an API endpoint), you can explicitly set the \`type\` attribute.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-zinc-500">&lt;!-- Explicitly forcing a video tag --&gt;</Text>\r
    <Text class="text-[var(--color-accent-green)]">&lt;Media type="video" src="https://api.example.com/stream/123" controls /&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/3">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/form">Next: Forms &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function W(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-pink)] mb-2">Core Block 5 of 6</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">&lt;Form&gt; \u2014 Forms & Inputs</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">The Form block is a context-aware form builder. The top-level Form acts as the form wrapper, while nested Form blocks automatically compile into appropriate form controls based on their type attribute.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Context-Aware Nesting</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">When the compiler encounters a Form block, it checks if it's already inside a Form. If it isn't, it outputs a \`&lt;form&gt;\` tag. If it is, it outputs an input, textarea, select, or label.</Text>\r
\r
  <Stack class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">OmniJS Input</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-pink)]">&lt;Form&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;Form type="label"&gt;Email&lt;/Form&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;Form type="email" bind-value="?email" /&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-blue)]">  &lt;Form type="textarea" bind-value="?msg" /&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-pink)]">&lt;/Form&gt;</Text>\r
    </Stack>\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">HTML Output</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;form&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">  &lt;label&gt;Email&lt;/label&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">  &lt;input type="email"&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">  &lt;textarea&gt;&lt;/textarea&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;/form&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Form Submission</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">To submit a form, include an \`&lt;Action as="submit"&gt;\` block inside it. You can handle the submission using the standard \`on-submit\` attribute on the parent Form block.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Form on-submit="handleSubmit"&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Form type="text" placeholder="Username" /&gt;</Text>\r
    <Text class="text-[var(--color-accent-green)]">  &lt;Action as="submit"&gt;Log In&lt;/Action&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;/Form&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/media">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/4">Next: Collections &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function V(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-orange)] mb-2">Core Block 4 of 4</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">&lt;Collection&gt; \u2014 Lists & Data</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">Collection handles repetitive data rendering. It wraps its children in a semantically correct list structure, ideal for navigation menus, feeds, tables, and any repeating UI pattern.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Automatic List Item Mapping</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">When you nest a &lt;Text&gt; block directly inside a &lt;Collection&gt;, the framework automatically compiles the &lt;Text&gt; as an &lt;li&gt; tag instead of a heading, ensuring valid HTML structure.</Text>\r
\r
  <Stack class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">OmniJS Input</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-orange)]">&lt;Collection&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Apples&lt;/Text&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Bananas&lt;/Text&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Cherries&lt;/Text&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-orange)]">&lt;/Collection&gt;</Text>\r
    </Stack>\r
    <Stack class="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl p-5 transition-all duration-300">\r
      <Text class="font-mono text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3 transition-colors duration-300">HTML Output</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;ul&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">  &lt;li&gt;Apples&lt;/li&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">  &lt;li&gt;Bananas&lt;/li&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-zinc-800 dark:text-zinc-200">  &lt;li&gt;Cherries&lt;/li&gt;</Text>\r
      <Text class="font-mono text-[0.75rem] leading-[1.7] text-[var(--color-accent-purple)]">&lt;/ul&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Custom Collection Types</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">By default, Collection compiles to a \`ul\` tag. You can specify \`type="ol"\` to produce an ordered list instead.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-orange)]">&lt;Collection type="ol" class="list-decimal pl-5"&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;First step&lt;/Text&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Second step&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">&lt;/Collection&gt;</Text>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Data Tables</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Setting \`type="table"\` transforms the Collection into a semantic HTML table. Nested Collections handle \`thead\`, \`tbody\`, and \`tr\` elements. A \`<Text>\` inside a \`tr\` automatically becomes a \`<td>\` or \`<th>\`.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-orange)]">&lt;Collection type="table" class="w-full text-left"&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Collection type="thead"&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">    &lt;Collection type="tr"&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">      &lt;Text type="th"&gt;Name&lt;/Text&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">      &lt;Text type="th"&gt;Status&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">    &lt;/Collection&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;/Collection&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Collection type="tbody"&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">    &lt;Collection type="tr"&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">      &lt;Text&gt;OmniJS&lt;/Text&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">      &lt;Text&gt;Active&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">    &lt;/Collection&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;/Collection&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">&lt;/Collection&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/form">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/5">Next: Reactivity &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function Y(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-green)] mb-2">Framework Feature</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Reactive State System</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">State management in OmniJS requires no imports, no stores, and no boilerplate. Prefix a variable with ? and the framework handles the rest.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Declaration</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Declare reactive variables inside a script block. The ? prefix tells the compiler to wrap the value in a reactive signal, and the state keyword replaces let/const.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-pink)]">state ?count = 0;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">state ?name = "Developer";</Text>\r
    <Text class="text-[var(--color-accent-green)]">state ?isOpen = false;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">state ?items = ["one", "two", "three"];</Text>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Mutation</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Mutate state with normal assignment. The reactive proxy detects the change and re-runs only the effects that depend on it.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-zinc-800 dark:text-zinc-200">function increment() {</Text>\r
    <Text class="text-[var(--color-accent-pink)]">  ?count = ?count + 1;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">function toggle() {</Text>\r
    <Text class="text-[var(--color-accent-green)]">  ?isOpen = !?isOpen;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">}</Text>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">The Reactive Data Flow</Text>\r
  <Stack class="border-l-4 border-[var(--color-accent-green)] bg-[#00d68f]/10 p-4 rounded-r-xl my-6">\r
    <Text class="text-zinc-700 dark:text-zinc-300 text-[0.88rem] leading-relaxed font-mono">state ?count = 0 &rarr; createSignal(0) &rarr; bind-text="?count" &rarr; effect() &rarr; DOM updates instantly when ?count changes. No virtual DOM diffing required.</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/4">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/6">Next: Routing &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function G(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Framework Feature</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Built-In Router</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">OmniJS routing is fully abstracted. No imports needed. No config files. Two attributes handle everything.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">navigate-to \u2014 Link to a Page</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Attach to any Action. When clicked, it updates the URL hash and the router signal \u2014 no page reload.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Action navigate-to="/"&gt;Home&lt;/Action&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Action navigate-to="/docs"&gt;Docs&lt;/Action&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Action navigate-to="/about"&gt;About&lt;/Action&gt;</Text>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">route \u2014 Declare a View</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Attach to any Stack. It will only be visible when the current URL hash matches the route value.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Stack route="/"&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Home content&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;/Stack&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-[var(--color-accent-green)]">&lt;Stack route="/docs"&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Documentation content&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-green)]">&lt;/Stack&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="border-l-4 border-[var(--color-accent-blue)] bg-[#00c2ff]/10 p-4 rounded-r-xl my-6">\r
    <Text class="text-zinc-700 dark:text-zinc-300 text-[0.88rem] leading-relaxed">The router uses hash-based URLs (e.g. yoursite.com/#/about). This means it works seamlessly on any static file server without server-side URL rewriting rules. Browser back/forward buttons are fully supported natively.</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/5">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/7">Next: Components &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function q(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-purple)] mb-2">Framework Feature</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Component System</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">Split your UI into reusable .omni files. Import them with a single tag. No dependency injection, no complex module system to learn.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Importing & Using</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Import components at the top level of your file using the Use tag, then call them like standard tags inside your template.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-purple)]">&lt;Use component="./src/Header.omni" name="Header" /&gt;</Text>\r
    <Text class="text-[var(--color-accent-purple)]">&lt;Use component="./src/Card.omni" name="Card" /&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">&lt;Stack&gt;</Text>\r
    <Text class="text-[var(--color-accent-purple)]">  &lt;Header /&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Page content&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-purple)]">  &lt;Card /&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">&lt;/Stack&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="w-full mb-10">\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/4 font-mono text-xs text-[var(--color-accent-blue)] font-medium">Dev Mode</Text>\r
      <Text class="w-3/4 text-sm text-zinc-600 dark:text-zinc-400">Components are fetched dynamically via HTTP when the page renders</Text>\r
    </Stack>\r
    <Stack class="border-b border-black/5 dark:border-white/10 flex flex-row py-3">\r
      <Text class="w-1/4 font-mono text-xs text-[var(--color-accent-blue)] font-medium">Production</Text>\r
      <Text class="w-3/4 text-sm text-zinc-600 dark:text-zinc-400">CLI compiler statically resolves, bundles, and minifies components into JS</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/6">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/css">Next: Styling (CSS) &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function $(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[780px]">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Framework Feature</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Styling & CSS</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">OmniJS supports traditional styling through \`&lt;style&gt;\` blocks, inline styles, and full compatibility with utility-first frameworks like Tailwind CSS.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">The \`class\` Attribute</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Every OmniJS block supports the standard \`class\` attribute. You can use global classes or utility frameworks directly on the tags.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-zinc-500">&lt;!-- Tailwind CSS Example --&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Stack class="flex items-center justify-between p-4 bg-gray-100 rounded-lg"&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">  &lt;Text class="text-lg font-bold text-gray-800"&gt;Tailwind in OmniJS&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;/Stack&gt;</Text>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Component Scoped \`&lt;style&gt;\` Blocks</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">You can add a \`&lt;style&gt;\` block anywhere in your \`.omni\` file. The compiler extracts it and efficiently injects it into the document head.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-[var(--color-accent-orange)]">&lt;style&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  .my-custom-card {</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">    background: linear-gradient(to right, #ff0055, #00c2ff);</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">    border-radius: 12px;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">    padding: 2rem;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  }</Text>\r
    <Text class="text-[var(--color-accent-orange)]">&lt;/style&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Stack class="my-custom-card"&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Text&gt;Styled with CSS&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;/Stack&gt;</Text>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Dynamic Inline Styles</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">You can use standard inline styles, and even bind them to reactive state for dynamic styling changes.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">\r
    <Text class="text-zinc-500">&lt;!-- Static inline style --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Text style="color: red; font-size: 20px;"&gt;Warning&lt;/Text&gt;</Text>\r
    <Text class="text-zinc-500"></Text>\r
    <Text class="text-zinc-500">&lt;!-- Dynamic inline style based on state (not implemented yet, coming soon!) --&gt;</Text>\r
    <Text class="text-zinc-500">&lt;!-- &lt;Stack bind-style="?dynamicStyle"&gt;...&lt;/Stack&gt; --&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-12 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/tutorial/7">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors" navigate-to="/tutorial/todo">Next: Build a Todo App &rarr;</Action>\r
  </Stack>\r
\r
  </Stack>`,components:[]},e,a)}function X(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(w,s)=>{e.provides||(e.provides={}),e.provides[w]=s},e.inject=w=>{let s=o;for(;s;){if(s.provides&&w in s.provides)return s.provides[w];s=s.parentContext}console.warn('[OmniJS] Context key "'+w+'" not found in parent ancestry.')};let x=(...w)=>console.log("[OmniJS]",...w);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e;e.todos=e.createSignal([{id:1,text:"Learn OmniJS"},{id:2,text:"Build a Todo App"}],"todos"),e.newTodo=e.createSignal("","newTodo"),e.emptyStyle=e.createSignal("display: none;","emptyStyle"),e.modalStyle=e.createSignal("display: none; opacity: 0;","modalStyle"),u(()=>{e.emptyStyle.value=e.todos.value.length===0?"display: flex;":"display: none;"});function i(){e.modalStyle.value="display: flex; opacity: 1;"}function r(){e.modalStyle.value="display: none; opacity: 0;"}function m(){e.newTodo.value.trim()!==""&&(e.todos.value=[...e.todos.value,{id:Date.now(),text:e.newTodo.value}],e.newTodo.value="")}function t(w){e.todos.value=e.todos.value.filter(s=>s.id!==w)}e.openModal=i,e.closeModal=r,e.addTodo=m,e.removeTodo=t;let n="",z="omni-style-"+Math.abs(n.split("").reduce((w,s)=>(w=(w<<5)-w+s.charCodeAt(0),w&w),0));if(n&&!document.getElementById(z)){let w=document.createElement("style");w.id=z,w.textContent=n,document.head.appendChild(w)}h({templateSource:`<Stack class="max-w-[800px]">
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Full Guide</Text>
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Building a Todo App</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">Let's put everything we've learned together! We are going to build a fully functional, animated Todo List application from scratch using OmniJS's 6 core blocks and reactive state.</Text>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">1. Setup the State & Logic</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">First, we need to declare our reactive state. We'll need a list of todos and a string for the new input. Then, we write our functions to add and remove items.</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">
    <Text class="text-[var(--color-accent-blue)]">&lt;script&gt;</Text>
    <Text class="text-zinc-500">  // Reactive state</Text>
    <Text class="text-[var(--color-accent-pink)]">  state ?todos = [];</Text>
    <Text class="text-[var(--color-accent-pink)]">  state ?newTodo = "";</Text>
    <Text class="text-zinc-500"></Text>
    <Text class="text-zinc-500">  // Logic</Text>
    <Text class="text-[var(--color-accent-blue)]">  function <Text type="span" class="text-zinc-900 dark:text-white">addTodo</Text>() {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    if (?newTodo.trim() === "") return;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    ?todos = [...?todos, { id: Date.now(), text: ?newTodo }];</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    ?newTodo = ""; // Clear input</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    log("Added todo!");</Text>
    <Text class="text-[var(--color-accent-blue)]">  }</Text>
    <Text class="text-zinc-500"></Text>
    <Text class="text-[var(--color-accent-blue)]">  function <Text type="span" class="text-zinc-900 dark:text-white">removeTodo</Text>(id) {</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    ?todos = ?todos.filter(t => t.id !== id);</Text>
    <Text class="text-[var(--color-accent-blue)]">  }</Text>
    <Text class="text-[var(--color-accent-blue)]">&lt;/script&gt;</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">2. Building the UI</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Now we'll use \`Stack\`, \`Text\`, \`Form\`, and \`Action\` to build the interface. We'll bind the input to our \`?newTodo\` state and trigger the \`addTodo\` function.</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">
    <Text class="text-[var(--color-accent-pink)]">&lt;Stack class="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg"&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">  &lt;Text class="text-2xl font-bold mb-4"&gt;My Tasks&lt;/Text&gt;</Text>
    <Text class="text-zinc-500"></Text>
    <Text class="text-[var(--color-accent-blue)]">  &lt;Stack class="flex gap-2 mb-6"&gt;</Text>
    <Text class="text-[var(--color-accent-orange)]">    &lt;Form class="flex-1 px-4 py-2 border rounded-lg" bind-value="?newTodo" placeholder="What needs to be done?" /&gt;</Text>
    <Text class="text-[var(--color-accent-orange)]">    &lt;Action class="px-4 py-2 bg-blue-500 text-white rounded-lg" on-click="addTodo"&gt;Add&lt;/Action&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">  &lt;/Stack&gt;</Text>
    <Text class="text-zinc-500"></Text>
    <Text class="text-[var(--color-accent-pink)]">&lt;/Stack&gt;</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">3. Rendering the List</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">We'll use a \`Collection\` block to iterate through our \`?todos\` array and render each task dynamically. Notice how we use \`{todo.text}\` to display data.</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">  &lt;!-- Inside our main Stack --&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">  &lt;Collection data="?todos" as="todo" class="space-y-2"&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">    &lt;Stack class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">      &lt;Text&gt;{todo.text}&lt;/Text&gt;</Text>
    <Text class="text-[var(--color-accent-orange)]">      &lt;Action class="text-red-500 text-sm" on-click="removeTodo(todo.id)"&gt;Delete&lt;/Action&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">    &lt;/Stack&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">  &lt;/Collection&gt;</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">You're Done!</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">That's all it takes! With just a few lines of OmniJS code, you've built a fully reactive application with state management, dynamic lists, and user input handling.</Text>

  <Stack class="mt-6">
    <Action class="inline-block px-6 py-3 bg-gradient-to-r from-[var(--color-accent-pink)] to-[var(--color-accent-purple)] text-white rounded-lg font-bold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all" on-click="openModal">Launch Live Todo App \u2728</Action>
  </Stack>

  <!-- Fullscreen Modal -->
  <Stack bind-style="?modalStyle" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
    <Stack class="max-w-md w-full mx-4 p-6 bg-white dark:bg-[#0e0e12] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 relative">
      <Action class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xl" on-click="closeModal">\xD7</Action>
      
      <Text class="text-2xl font-bold mb-4 font-heading text-zinc-900 dark:text-white">My Tasks</Text>

      <Stack class="flex gap-2 mb-6">
        <Form class="flex-1 px-4 py-2 border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-white/5 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-pink)] transition-all" bind-value="?newTodo" placeholder="What needs to be done?" />
        <Action class="px-5 py-2 bg-[var(--color-accent-blue)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity" on-click="addTodo">Add</Action>
      </Stack>

      <Stack class="max-h-[50vh] overflow-y-auto pr-2" style="scrollbar-width: thin;">
        <Collection data="?todos" as="todo" class="space-y-2">
          <Stack class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg">
            <Text class="text-zinc-800 dark:text-zinc-200">{todo.text}</Text>
            <Action class="text-red-500 hover:text-red-600 text-sm font-semibold transition-colors px-2 py-1 bg-red-500/10 rounded-md" on-click="removeTodo(todo.id)">Delete</Action>
          </Stack>
        </Collection>

        <Stack bind-style="?emptyStyle" class="py-10 flex flex-col justify-center items-center">
          <Text class="text-4xl mb-3">\u{1F4DD}</Text>
          <Text class="text-zinc-400 dark:text-zinc-500 font-medium text-sm">No tasks yet. Add one above!</Text>
        </Stack>
      </Stack>
    </Stack>
  </Stack>

  
</Stack>`,components:[]},e,a)}function Z(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Stack Block</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Stack\` block is the fundamental layout primitive in OmniJS. It replaces div, section, main, article, and other grouping tags, using depth-tracking to automatically render the correct semantic HTML structure.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">When the renderer encounters a \`Stack\`, it checks the nesting depth. The outermost Stack becomes a \`&lt;main&gt;\`, the next level becomes a \`&lt;section&gt;\`, and subsequent levels become \`&lt;div&gt;\` elements. This guarantees accessible, semantic HTML without thinking about tags.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Stack&gt;</Text>\r
    <Text class="text-zinc-500">  &lt;!-- Renders as &lt;main&gt; --&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Stack class="flex flex-col gap-4"&gt;</Text>\r
    <Text class="text-zinc-500">    &lt;!-- Renders as &lt;section&gt; --&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">    &lt;Stack&gt;</Text>\r
    <Text class="text-zinc-500">      &lt;!-- Renders as &lt;div&gt; --&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">      &lt;Text&gt;Content here&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">    &lt;/Stack&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;/Stack&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;/Stack&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">\r
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>\r
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">\r
      <Text style="white-space: pre-wrap;">&lt;main class="flex flex-col gap-4"&gt;\r
  &lt;section&gt;\r
    &lt;div&gt;\r
      &lt;p&gt;Content here&lt;/p&gt;\r
    &lt;/div&gt;\r
  &lt;/section&gt;\r
&lt;/main&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>\r
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">\r
    <Collection type="table" class="w-full text-left text-sm">\r
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">\r
        <Collection type="tr">\r
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>\r
        </Collection>\r
      </Collection>\r
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">class</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">CSS classes to apply. Use utility classes (Tailwind) here.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">as</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Override the default semantic tag based on depth (e.g. \`as="nav"\`, \`as="header"\` or \`as="footer"\`).</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">bind-style</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">State Signal</Text>\r
          <Text type="td" class="px-4 py-3">Reactively bind the inline style to a state variable (e.g. \`?myStyle\`).</Text>\r
        </Collection>\r
\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">on-*</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Function</Text>\r
          <Text type="td" class="px-4 py-3">Bind any standard JS event (e.g. \`on-click="myFunc"\`).</Text>\r
        </Collection>\r
      </Collection>\r
    </Collection>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/blocks">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/text">Next &rarr;</Action>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function K(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Text Block</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Text\` block handles all typography. Instead of manually specifying \`h1\` through \`h6\`, \`p\`, or \`span\`, the Text block infers its tag based on nesting depth and layout context.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">The renderer tracks the number of \`Text\` elements nested within each other or contextually inside headers. The first \`Text\` element in a tree becomes an \`h1\`, the next an \`h2\`, and anything beyond \`h6\` falls back to a standard \`p\` paragraph tag. Inside tables, it renders as \`td\` or \`th\`.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Text&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">  Title (Renders as &lt;h1&gt;)</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Text&gt;</Text>\r
    <Text class="text-zinc-800 dark:text-zinc-200">    Subtitle (Renders as &lt;h2&gt;)</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;/Text&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">\r
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>\r
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">\r
      <Text style="white-space: pre-wrap;">&lt;h1 class="text-2xl font-bold"&gt;My Website&lt;/h1&gt;\r
&lt;h2&gt;About Us&lt;/h2&gt;\r
&lt;p&gt;We build cool things.&lt;/p&gt;\r
&lt;span&gt;Inline text&lt;/span&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>\r
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">\r
    <Collection type="table" class="w-full text-left text-sm">\r
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">\r
        <Collection type="tr">\r
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>\r
        </Collection>\r
      </Collection>\r
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">type</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Override the automatic depth tag (e.g. \`type="span"\` or \`type="th"\`).</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">as</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Override the auto-inferred heading tag to a custom HTML tag (e.g. \`as="span"\`, \`as="h1"\`, or \`as="p"\`).</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">bind-text</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">State Signal</Text>\r
          <Text type="td" class="px-4 py-3">Reactively bind the element's textContent to a state variable.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">{?stateVar}</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Syntax</Text>\r
          <Text type="td" class="px-4 py-3">Inline string interpolation. Evaluated reactively (e.g. \`Hello {?name}\`).</Text>\r
        </Collection>\r
      </Collection>\r
    </Collection>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/stack">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/action">Next &rarr;</Action>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function Q(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Action Block</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Action\` block unifies \`&lt;a&gt;\` links, \`&lt;button&gt;\` elements, and router navigation. It abstracts away the differences between a structural button and a hyperlink.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">If you give an Action a \`navigate-to\` attribute, it behaves like an internal router link. If you give it an \`href\`, it behaves like an external anchor link. If neither is present, it defaults to a standard \`<button>\` that you can bind \`on-click\` listeners to.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">\r
    <Text class="text-zinc-500">&lt;!-- Router Link --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Action navigate-to="/docs"&gt;Go to Docs&lt;/Action&gt;</Text>\r
    <Text class="text-zinc-500 mt-2">&lt;!-- External Link --&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Action href="https://google.com" target="_blank"&gt;Google&lt;/Action&gt;</Text>\r
    <Text class="text-zinc-500 mt-2">&lt;!-- Standard Button --&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">&lt;Action on-click="myFunction"&gt;Click Me!&lt;/Action&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">\r
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>\r
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">\r
      <Text style="white-space: pre-wrap;">&lt;button class="bg-blue-500"&gt;Click Me&lt;/button&gt;\r
&lt;a href="https://google.com"&gt;Go to Google&lt;/a&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>\r
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">\r
    <Collection type="table" class="w-full text-left text-sm">\r
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">\r
        <Collection type="tr">\r
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>\r
        </Collection>\r
      </Collection>\r
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">navigate-to</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Internal client-side route path (e.g. \`/home\`). Uses History API.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">href</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Standard URL. Causes the Action to render as an \`&lt;a&gt;\` tag.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">on-click</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Function</Text>\r
          <Text type="td" class="px-4 py-3">Binds the button's click event to a function in the script block.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">as</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Forces the element type: \`submit\` creates a form submit button.</Text>\r
        </Collection>\r
      </Collection>\r
    </Collection>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/text">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/form">Next &rarr;</Action>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function tt(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Form Block</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Form\` block unifies all user input elements: input fields, textareas, dropdowns, labels, and the outer form wrapper itself.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">When the renderer encounters a \`Form\` block, it checks if it contains interactive attributes like \`bind-value\` or \`placeholder\`. If it does, it renders as an \`input\`, \`textarea\`, or \`select\`. If it is just a container, it renders as the HTML \`&lt;form&gt;\` wrapper.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">\r
    <Text class="text-zinc-500">&lt;!-- Outer Form Wrapper --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Form on-submit="handleSubmit"&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Form type="label" class="mb-2"&gt;Username&lt;/Form&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">  &lt;Form bind-value="?username" placeholder="Enter name..." /&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;/Form&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">\r
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>\r
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">\r
      <Text style="white-space: pre-wrap;">&lt;form&gt;\r
  &lt;label&gt;Email&lt;/label&gt;\r
  &lt;input type="email" placeholder="Enter email" /&gt;\r
&lt;/form&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>\r
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">\r
    <Collection type="table" class="w-full text-left text-sm">\r
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">\r
        <Collection type="tr">\r
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>\r
        </Collection>\r
      </Collection>\r
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">bind-value</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">State Signal</Text>\r
          <Text type="td" class="px-4 py-3">Two-way data binds the input value to a reactive state variable.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">type</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">\`text\`, \`password\`, \`email\`, \`textarea\`, \`select\`, or \`label\`.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">placeholder</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Standard HTML placeholder attribute for input fields.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">on-submit</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Function</Text>\r
          <Text type="td" class="px-4 py-3">Executes a script function when the form is submitted.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">as</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Override default element type to a custom HTML element tag (e.g., \`as="div"\` or \`as="span"\`).</Text>\r
        </Collection>\r
      </Collection>\r
    </Collection>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/action">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/collection">Next &rarr;</Action>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function et(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Collection Block</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Collection\` block is OmniJS's universal iterator. It replaces \`ul\`, \`ol\`, array mapping functions, and HTML table structures entirely.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">By providing the \`data\` attribute pointing to an array state variable, Collection repeats its child nodes for every element in the array. You expose the iterating item via the \`as\` attribute. If no data is provided, it simply acts as a standard list (\`ul\`/\`ol\`) or table component.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">\r
    <Text class="text-zinc-500">&lt;!-- Iterating over data --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Collection data="?users" as="user"&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;Stack class="card"&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">    &lt;Text&gt;{user.name}&lt;/Text&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">  &lt;/Stack&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;/Collection&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">\r
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>\r
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">\r
      <Text style="white-space: pre-wrap;">&lt;ul&gt;\r
  &lt;li&gt;Item 1&lt;/li&gt;\r
  &lt;li&gt;Item 2&lt;/li&gt;\r
&lt;/ul&gt;</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>\r
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">\r
    <Collection type="table" class="w-full text-left text-sm">\r
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">\r
        <Collection type="tr">\r
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>\r
        </Collection>\r
      </Collection>\r
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">data</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">State Signal</Text>\r
          <Text type="td" class="px-4 py-3">The array state variable to iterate over (e.g. \`?myArray\`).</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">as</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">If iterating, the alias for the scoped item variable (e.g. \`item\`). If not iterating, overrides the HTML tag type.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">type</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Defaults to \`ul\`. Options: \`ol\`, \`table\`, \`thead\`, \`tbody\`, \`tr\`.</Text>\r
        </Collection>\r
      </Collection>\r
    </Collection>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/form">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/media">Next &rarr;</Action>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function nt(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">\r
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>\r
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Media Block {prop.name} </Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Media\` block handles images, video, audio, and iframes seamlessly based on the file extension or the specified \`type\` attribute.</Text>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>\r
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">When parsing a Media block, OmniJS checks the \`src\` attribute. If it ends in \`.mp4\`, it renders a \`&lt;video&gt;\`. If it contains \`youtube.com\`, it renders an \`&lt;iframe&gt;\`. You can also manually specify \`type="audio"\` or \`type="video"\`.</Text>\r
\r
  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">\r
    <Text class="text-zinc-500">&lt;!-- Image (Inferred) --&gt;</Text>\r
    <Text class="text-[var(--color-accent-pink)]">&lt;Media src="/assets/logo.png" alt="Company Logo" /&gt;</Text>\r
    <Text class="text-zinc-500 mt-2">&lt;!-- Video (Inferred) --&gt;</Text>\r
    <Text class="text-[var(--color-accent-blue)]">&lt;Media src="/assets/promo.mp4" autoplay loop muted /&gt;</Text>\r
    <Text class="text-zinc-500 mt-2">&lt;!-- Iframe (Inferred) --&gt;</Text>\r
    <Text class="text-[var(--color-accent-orange)]">&lt;Media src="https://youtube.com/embed/..." /&gt;</Text>\r
  </Stack>\r
\r
  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">\r
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>\r
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">\r
      <Text style="white-space: pre-wrap;">&lt;img src="/logo.png" alt="Logo" /&gt;\r
&lt;video src="/promo.mp4" autoplay loop&gt;&lt;/video&gt;</Text>\r
    </Stack>\r
    <Media src="https://imgs.search.brave.com/QdSP9nzKYCWbK9V1mqXIb7zrteln-Kn0TZtLyuFfw-s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90ZW1w/bGF0ZS5jYW52YS5j/b20vRUFHMW1PS19k/emMvMi8wLzE2MDB3/LUVOczdWU0tKYmd3/LmpwZw" alt="Company Logo"></Media>\r
    <Media src="/assets/promo.mp4" autoplay loop muted></Media>\r
    <Media src="https://youtube.com/embed/..." ></Media>\r
  </Stack>\r
\r
  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>\r
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">\r
    <Collection type="table" class="w-full text-left text-sm">\r
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">\r
        <Collection type="tr">\r
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>\r
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>\r
        </Collection>\r
      </Collection>\r
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">src</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">The URL or relative path to the media file.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">type</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Explicitly override the media type: \`video\`, \`audio\`, \`iframe\`, \`img\`.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">alt</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Alternative text for accessibility (images).</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">autoplay / muted</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">Boolean</Text>\r
          <Text type="td" class="px-4 py-3">Standard HTML5 media attributes are passed directly through.</Text>\r
        </Collection>\r
        <Collection type="tr">\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">as</Text>\r
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>\r
          <Text type="td" class="px-4 py-3">Override default element type to a custom HTML element tag (e.g. \`as="picture"\`).</Text>\r
        </Collection>\r
      </Collection>\r
    </Collection>\r
  </Stack>\r
\r
  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">\r
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/collection">&larr; Previous</Action>\r
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/use">Next &rarr;</Action>\r
  </Stack>\r
</Stack>`,components:[]},e,a)}function ot(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px]">
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-purple)] mb-2">Deep Dive</Text>
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3 transition-colors duration-300">Use Block</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6 transition-colors duration-300">The \`Use\` block is OmniJS's mechanism for importing external files and registering them as components. It allows you to build modular, maintainable applications by breaking down UI into reusable pieces.</Text>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Component Registration</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Use the \`component\` attribute to specify the file path, and the \`name\` attribute to define the tag name you will use.</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">
    <Text class="text-[var(--color-accent-purple)]">&lt;Use component="./src/Header.omni" name="Header" /&gt;</Text>
    <Text class="text-zinc-500"></Text>
    <Text class="text-[var(--color-accent-blue)]">&lt;Header&gt;&lt;/Header&gt;</Text>
  </Stack>

  <Stack class="bg-zinc-100/50 dark:bg-white/5 p-4 rounded-lg my-6">
    <Text class="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">Equivalent HTML output</Text>
    <Stack class="font-mono text-[0.75rem] text-zinc-700 dark:text-zinc-300">
      <Text>&lt;!-- Injects the DOM content from Header.omni here --&gt;</Text>
    </Stack>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2 transition-colors duration-300">Passing Props</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">Once registered, custom components behave like regular elements. You can pass arbitrary attributes which become available in the component's internal \`props\` object.</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">
    <Text class="text-[var(--color-accent-blue)]">&lt;Header title="My Dashboard" theme="dark"&gt;&lt;/Header&gt;</Text>
  </Stack>

  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4 transition-colors duration-300">And inside \`Header.omni\`, you can access these props natively using interpolation:</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto transition-all duration-300">
    <Text class="text-zinc-500">&lt;!-- Inside Header.omni --&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">&lt;Stack class="header {props.theme}"&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">  &lt;Text&gt;{props.title}&lt;/Text&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">&lt;/Stack&gt;</Text>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/media">&larr; Previous</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/block/portal">Next &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function rt(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(t,n)=>{e.provides||(e.provides={}),e.provides[t]=n},e.inject=t=>{let n=o;for(;n;){if(n.provides&&t in n.provides)return n.provides[t];n=n.parentContext}console.warn('[OmniJS] Context key "'+t+'" not found in parent ancestry.')};let x=(...t)=>console.log("[OmniJS]",...t);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e,i="",r="omni-style-"+Math.abs(i.split("").reduce((t,n)=>(t=(t<<5)-t+n.charCodeAt(0),t&t),0));if(i&&!document.getElementById(r)){let t=document.createElement("style");t.id=r,t.textContent=i,document.head.appendChild(t)}h({templateSource:`<Stack class="max-w-[800px] animate-in slide-in-from-bottom-4 duration-500">
  <Text class="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[var(--color-accent-blue)] mb-2">Deep Dive</Text>
  <Text class="font-heading text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">Portal Block</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.95rem] leading-relaxed mb-6">The \`Portal\` block is a layout primitive that renders its children into a target DOM node outside the parent component's DOM structure (such as \`#modal-root\` or the document body), while maintaining complete reactivity and scope binding with the parent component hierarchy.</Text>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-8 mb-2">How it works</Text>
  <Text class="text-zinc-600 dark:text-zinc-400 text-[0.92rem] leading-relaxed mb-4">When a component contains a \`Portal\`, the framework renders the portal's children dynamically inside the target container specified by the \`target\` attribute. A hidden placeholder is left in the original tree. Visibility is reactively synced: if any ancestor of the portal's original placeholder is hidden (e.g. via \`bind-show\` or class hiding), the portal content is automatically hidden. If the parent component is unmounted, the portal content is automatically removed from the document.</Text>

  <Stack class="bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 rounded-xl font-mono text-[0.75rem] leading-[1.75] my-6 overflow-x-auto">
    <Text class="text-[var(--color-accent-pink)]">&lt;Portal target="#modal-root"&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;Stack class="modal-backdrop flex items-center justify-center"&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    &lt;Stack class="modal-content bg-white p-6 rounded-xl"&gt;</Text>
    <Text class="text-zinc-500 font-mono">      &lt;!-- Reacts to parent component state --&gt;</Text>
    <Text class="text-[var(--color-accent-blue)]">      &lt;Text&gt;Current Count: {?count}&lt;/Text&gt;</Text>
    <Text class="text-[var(--color-accent-orange)]">      &lt;Action on-click="closeModal"&gt;Close Modal&lt;/Action&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">    &lt;/Stack&gt;</Text>
    <Text class="text-zinc-800 dark:text-zinc-200">  &lt;/Stack&gt;</Text>
    <Text class="text-[var(--color-accent-pink)]">&lt;/Portal&gt;</Text>
  </Stack>

  <Text class="font-heading text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Attribute Reference</Text>
  <Stack class="w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e0e12]">
    <Collection type="table" class="w-full text-left text-sm">
      <Collection type="thead" class="bg-zinc-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 text-zinc-900 dark:text-white">
        <Collection type="tr">
          <Text type="th" class="px-4 py-3 font-semibold">Attribute</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Type</Text>
          <Text type="th" class="px-4 py-3 font-semibold">Description</Text>
        </Collection>
      </Collection>
      <Collection type="tbody" class="divide-y divide-black/5 dark:divide-white/5 text-zinc-600 dark:text-zinc-400">
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">target</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>
          <Text type="td" class="px-4 py-3">CSS selector string (e.g. \`#modal-root\`, \`.portal-target\`). Default is \`"body"\`.</Text>
        </Collection>
        <Collection type="tr">
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem] text-[var(--color-accent-pink)]">class</Text>
          <Text type="td" class="px-4 py-3 font-mono text-[0.8rem]">String</Text>
          <Text type="td" class="px-4 py-3">CSS class to apply to the rendered portal wrapper.</Text>
        </Collection>
      </Collection>
    </Collection>
  </Stack>

  <Stack class="flex justify-between items-center mt-16 pt-6 border-t border-black/5 dark:border-white/10">
    <Action class="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-medium hover:text-black dark:hover:text-white transition-colors" navigate-to="/block/use">&larr; Previous</Action>
    <Action class="px-6 py-3 bg-[var(--color-accent-blue)] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-opacity" navigate-to="/reactivity">Next: Reactivity &rarr;</Action>
  </Stack>
</Stack>`,components:[]},e,a)}function mt(a,c={},o=null){window.globalOmniContext||(window.globalOmniContext={currentPage:d()});let e={createSignal:p,effect:u,createResource:v,useForm:y,navigate:f,getRouterSignal:d,beforeEach:T,props:c,...window.globalOmniContext};e.parentContext=o,e.provide=(s,S)=>{e.provides||(e.provides={}),e.provides[s]=S},e.inject=s=>{let S=o;for(;S;){if(S.provides&&s in S.provides)return S.provides[s];S=S.parentContext}console.warn('[OmniJS] Context key "'+s+'" not found in parent ancestry.')};let x=(...s)=>console.log("[OmniJS]",...s);e.log=x;let{navigate:g,getRouterSignal:l,provide:k,inject:b}=e;function i(){let s=document.documentElement,S=s.getAttribute("data-theme")==="dark"?"light":"dark";s.setAttribute("data-theme",S)}e.isMobileMenuOpen=e.createSignal(!1,"isMobileMenuOpen"),e.sidebarClass=e.createSignal("responsive-sidebar w-[260px] min-w-[260px] bg-white/90 dark:bg-[#0e0e12]/85 backdrop-blur-md border-r border-black/10 dark:border-white/10 p-7 flex flex-col fixed inset-y-0 left-0 z-50 overflow-y-auto transition-colors duration-300","sidebarClass"),e.backdropStyle=e.createSignal("display: none; opacity: 0;","backdropStyle");function r(){e.isMobileMenuOpen.value=!e.isMobileMenuOpen.value}function m(){e.isMobileMenuOpen.value=!1}u(()=>{let s="responsive-sidebar w-[260px] min-w-[260px] bg-white/90 dark:bg-[#0e0e12]/85 backdrop-blur-md border-r border-black/10 dark:border-white/10 p-7 flex flex-col fixed inset-y-0 left-0 z-50 overflow-y-auto transition-colors duration-300";e.sidebarClass.value=e.isMobileMenuOpen.value?s+" open":s,e.backdropStyle.value=e.isMobileMenuOpen.value?"display: block; opacity: 1; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; backdrop-filter: blur(4px); transition: opacity 0.3s;":"display: none; opacity: 0; pointer-events: none;"}),e.isTutorialsOpen=e.createSignal(!0,"isTutorialsOpen"),e.tutorialStyle=e.createSignal("max-height: 500px; opacity: 1; margin-top: 0px;","tutorialStyle"),e.arrowStyle=e.createSignal("transform: rotate(0deg); transition: transform 0.3s ease;","arrowStyle"),e.isDeepDiveOpen=e.createSignal(!1,"isDeepDiveOpen"),e.deepDiveStyle=e.createSignal("max-height: 0px; opacity: 0; margin-top: -10px; overflow: hidden;","deepDiveStyle"),e.deepDiveArrowStyle=e.createSignal("transform: rotate(-90deg); transition: transform 0.3s ease;","deepDiveArrowStyle");function t(){e.isTutorialsOpen.value=!e.isTutorialsOpen.value,e.isTutorialsOpen.value?(e.tutorialStyle.value="display: flex; flex-direction: column;",e.arrowStyle.value="transform: rotate(180deg); transition: transform 0.3s ease;"):(e.arrowStyle.value="transform: rotate(0deg); transition: transform 0.3s ease;",e.tutorialStyle.value="display: none;")}function n(){e.isDeepDiveOpen.value=!e.isDeepDiveOpen.value,e.isDeepDiveOpen.value?(e.deepDiveStyle.value="max-height: 500px; opacity: 1; margin-top: 0px;",e.deepDiveArrowStyle.value="transform: rotate(0deg); transition: transform 0.3s ease;"):(e.deepDiveStyle.value="max-height: 0px; opacity: 0; margin-top: -10px; overflow: hidden;",e.deepDiveArrowStyle.value="transform: rotate(-90deg); transition: transform 0.3s ease;")}e.toggleTheme=i,e.toggleMobileMenu=r,e.closeMobileMenu=m,e.toggleTutorials=t,e.toggleDeepDives=n;let z=`\r
  @media (max-width: 1023px) {\r
    .responsive-sidebar {\r
      transform: translateX(-100%);\r
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\r
    }\r
    .responsive-sidebar.open {\r
      transform: translateX(0);\r
    }\r
    .responsive-main {\r
      margin-left: 0 !important;\r
      padding-top: 80px !important;\r
      padding-left: 1.5rem !important;\r
      padding-right: 1.5rem !important;\r
    }\r
  }\r
`,C="omni-style-"+Math.abs(z.split("").reduce((s,S)=>(s=(s<<5)-s+S.charCodeAt(0),s&s),0));if(z&&!document.getElementById(C)){let s=document.createElement("style");s.id=C,s.textContent=z,document.head.appendChild(s)}h({templateSource:`<Stack class="flex min-h-screen w-full">\r
  <Stack bind-style="?backdropStyle" on-click="closeMobileMenu"></Stack>\r
  \r
  <!-- Mobile Header -->\r
  <Stack class="lg:hidden flex flex-row items-center justify-between px-6 py-4 bg-white/90 dark:bg-[#0e0e12]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 fixed top-0 left-0 right-0 z-40 w-full">\r
    <Action class="font-heading text-xl font-extrabold bg-gradient-to-br from-[var(--color-accent-pink)] via-[var(--color-accent-purple)] to-[var(--color-accent-blue)] bg-clip-text text-transparent cursor-pointer" navigate-to="/">OmniJS</Action>\r
    <Stack class="flex flex-row items-center gap-3">\r
      <Action class="w-9 h-9 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors" on-click="toggleTheme">\u25D1</Action>\r
      <Action class="w-9 h-9 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors" on-click="toggleMobileMenu">\u2630</Action>\r
    </Stack>\r
  </Stack>\r
\r
  <!-- \u2550\u2550\u2550 Sidebar \u2550\u2550\u2550 -->\r
  <Stack bind-class="?sidebarClass" on-click="closeMobileMenu">\r
    <Stack class="flex flex-row items-center justify-between mb-1 px-2">\r
      <Action class="font-heading text-2xl font-extrabold bg-gradient-to-br from-[var(--color-accent-pink)] via-[var(--color-accent-purple)] to-[var(--color-accent-blue)] bg-clip-text text-transparent cursor-pointer tracking-tight" navigate-to="/">OmniJS</Action>\r
      <Action class="w-9 h-9 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors" on-click="toggleTheme">\u25D1</Action>\r
    </Stack>\r
    <Text class="text-[0.7rem] text-zinc-500 tracking-widest uppercase font-semibold px-2 mb-4">Documentation</Text>\r
\r
    <!-- Search UI removed -->\r
\r
    <Text class="text-[0.65rem] text-zinc-500 uppercase tracking-widest font-bold mt-3 mb-2 px-2">Overview</Text>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/">Getting Started</Action>\r
\r
    <Stack class="flex items-center justify-between mt-7 mb-2 px-2 cursor-pointer group" on-click="toggleTutorials">\r
      <Text class="text-[0.65rem] text-zinc-500 uppercase tracking-widest font-bold group-hover:text-black dark:group-hover:text-white transition-colors">Interactive Tutorial</Text>\r
      <Text class="text-zinc-400 text-xs" bind-style="?arrowStyle">\u25BC</Text>\r
    </Stack>\r
    \r
    <Stack bind-style="?tutorialStyle" class="overflow-y-auto overflow-x-hidden max-h-[40vh]">\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/1">1. Layout & Stack</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/2">2. Typography</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/3">3. Interaction</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/media">4. Media</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/form">5. Forms</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/4">6. Collections</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/5">7. Reactivity</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/6">8. Routing</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/7">9. Components</Action>\r
      <Action class="tutorial-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/tutorial/todo">11. Build a Todo App</Action>\r
    </Stack>\r
\r
    <Stack class="flex items-center justify-between mt-7 mb-2 px-2 cursor-pointer group" on-click="toggleDeepDives">\r
      <Text class="text-[0.65rem] text-zinc-500 uppercase tracking-widest font-bold group-hover:text-black dark:group-hover:text-white transition-colors">Deep Dives</Text>\r
      <Text class="text-zinc-400 text-xs" bind-style="?deepDiveArrowStyle">\u25BC</Text>\r
    </Stack>\r
\r
    <Stack bind-style="?deepDiveStyle" class="overflow-y-auto overflow-x-hidden max-h-[40vh] transition-all duration-300">\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/blocks">Core Blocks Overview</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/stack">Stack Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/text">Text Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/action">Action Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/form">Form Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/collection">Collection Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/media">Media Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/use">Use Block</Action>\r
      <Action class="deepdive-link w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/block/portal">Portal Block</Action>\r
    </Stack>\r
\r
    <Text class="text-[0.65rem] text-zinc-500 uppercase tracking-widest font-bold mt-7 mb-2 px-2">API Reference</Text>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/api/reactivity">Reactivity & Signals</Action>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/api/resource">createResource</Action>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/api/context">Context provide/inject</Action>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/api/form">Form useForm</Action>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/api/router">Router beforeEach</Action>\r
    <Action class="w-full text-left text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-md transition-colors mb-[1px]" navigate-to="/api/devtools">DevTools Explorer</Action>\r
\r
    <Stack class="mt-auto px-2">\r
      <Text class="text-[0.7rem] text-zinc-500 font-mono">v1.0.0</Text>\r
    </Stack>\r
  </Stack>\r
\r
  <!-- \u2550\u2550\u2550 Main Content with Routes \u2550\u2550\u2550 -->\r
  <Stack class="responsive-main flex-1 ml-[260px] py-14 px-16 min-h-screen max-w-[1100px] transition-colors duration-300">\r
    <Stack route="/">\r
      <Home></Home>\r
    </Stack>\r
    <Stack route="/blocks">\r
      <Stack>\r
      <Text>Hello world</Text>\r
      </Stack>\r
      <Blocks></Blocks>\r
    </Stack>\r
    \r
    <!-- Deep Dive Pages -->\r
    <Stack route="/block/stack" class="w-full h-full">\r
      \r
      <BlockStack></BlockStack>\r
    </Stack>\r
    <Stack route="/block/text" class="w-full h-full">\r
      \r
      <BlockText></BlockText>\r
    </Stack>\r
    <Stack route="/block/action" class="w-full h-full">\r
      \r
      <BlockAction></BlockAction>\r
    </Stack>\r
    <Stack route="/block/form" class="w-full h-full">\r
      \r
      <BlockForm></BlockForm>\r
    </Stack>\r
    <Stack route="/block/collection" class="w-full h-full">\r
      \r
      <BlockCollection></BlockCollection>\r
    </Stack>\r
    <Stack route="/block/media" class="w-full h-full">\r
      \r
      <BlockMedia name="Joshua Block"></BlockMedia>\r
    </Stack>\r
    <Stack route="/block/use" class="w-full h-full">\r
      \r
      <BlockUse></BlockUse>\r
    </Stack>\r
    <Stack route="/block/portal" class="w-full h-full">\r
      \r
      <BlockPortal></BlockPortal>\r
    </Stack>\r
\r
    <Stack route="/api/reactivity">\r
      <Reactivity></Reactivity>\r
    </Stack>\r
    <Stack route="/api/resource">\r
      <Resource></Resource>\r
    </Stack>\r
    <Stack route="/api/context">\r
      <Context></Context>\r
    </Stack>\r
    <Stack route="/api/form">\r
      <Form></Form>\r
    </Stack>\r
    <Stack route="/api/router">\r
      <Router></Router>\r
    </Stack>\r
    <Stack route="/api/devtools">\r
      <DevTools></DevTools>\r
    </Stack>\r
    <Stack route="/tutorial/1"><Tutorial1></Tutorial1></Stack>\r
    <Stack route="/tutorial/2"><Tutorial2></Tutorial2></Stack>\r
    <Stack route="/tutorial/3"><Tutorial3></Tutorial3></Stack>\r
    <Stack route="/tutorial/media"><TutorialMedia></TutorialMedia></Stack>\r
    <Stack route="/tutorial/form"><TutorialForm></TutorialForm></Stack>\r
    <Stack route="/tutorial/4"><Tutorial4></Tutorial4></Stack>\r
    <Stack route="/tutorial/5"><Tutorial5></Tutorial5></Stack>\r
    <Stack route="/tutorial/6"><Tutorial6></Tutorial6></Stack>\r
    <Stack route="/tutorial/7"><Tutorial7></Tutorial7></Stack>\r
    <Stack route="/tutorial/css"><TutorialCSS></TutorialCSS></Stack>\r
    <Stack route="/tutorial/todo"><TutorialTodo></TutorialTodo></Stack>\r
  </Stack>\r
\r
</Stack>`,components:[{name:"Home",mount:_},{name:"Blocks",mount:I},{name:"Reactivity",mount:D},{name:"Resource",mount:P},{name:"Context",mount:j},{name:"Form",mount:F},{name:"Router",mount:B},{name:"DevTools",mount:N},{name:"Tutorial1",mount:H},{name:"Tutorial2",mount:L},{name:"Tutorial3",mount:J},{name:"TutorialMedia",mount:U},{name:"TutorialForm",mount:W},{name:"Tutorial4",mount:V},{name:"Tutorial5",mount:Y},{name:"Tutorial6",mount:G},{name:"Tutorial7",mount:q},{name:"TutorialCSS",mount:$},{name:"TutorialTodo",mount:X},{name:"BlockStack",mount:Z},{name:"BlockText",mount:K},{name:"BlockAction",mount:Q},{name:"BlockForm",mount:tt},{name:"BlockCollection",mount:et},{name:"BlockMedia",mount:nt},{name:"BlockUse",mount:ot},{name:"BlockPortal",mount:rt}]},e,a)}export{mt as default};
