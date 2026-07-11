import{e as a,j as e}from"./index-DE1oI-NR.js";import{C as l}from"./chevron-right-ympUqyym.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=a("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);function h({current:s,total:o,onChange:n}){const i=[];for(let t=1;t<=o;t++)i.push(t);const r=t=>({width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"var(--radius-sm)",border:t?"none":"1px solid var(--border)",backgroundColor:t?"var(--primary)":"transparent",color:t?"#fff":"var(--text)",fontWeight:t?600:400,fontSize:14,cursor:"pointer"});return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:4,justifyContent:"center"},children:[e.jsx("button",{style:r(!1),onClick:()=>n(Math.max(1,s-1)),children:e.jsx(f,{size:16})}),i.map(t=>e.jsx("button",{style:r(t===s),onClick:()=>n(t),children:t},t)),e.jsx("button",{style:r(!1),onClick:()=>n(Math.min(o,s+1)),children:e.jsx(l,{size:16})})]})}export{f as C,h as P};
