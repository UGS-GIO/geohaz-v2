import{d as u}from"./index-67svOC1w.js";import{e as f}from"./locale-10002228-AApp3kqC.js";/*!
 * All material copyright ESRI, All Rights Reserved, unless otherwise specified.
 * See https://github.com/Esri/calcite-design-system/blob/main/LICENSE.md for details.
 * v2.9.0
 */const t={};async function i(e,s){const a=`${s}_${e}`;return t[a]||(t[a]=fetch(u(`./assets/${s}/t9n/messages_${e}.json`)).then(n=>(n.ok||o(),n.json())).catch(()=>o())),t[a]}function o(){throw new Error("could not fetch component message bundle")}function c(e){e.messages={...e.defaultMessages,...e.messageOverrides}}function M(){}async function m(e){e.defaultMessages=await g(e,e.effectiveLocale),c(e)}async function g(e,s){const{el:a}=e,r=a.tagName.toLowerCase().replace("calcite-","");return i(f(s,"t9n"),r)}async function w(e,s){e.defaultMessages=await g(e,s),c(e)}function y(e){e.onMessagesChange=d}function C(e){e.onMessagesChange=M}function d(){c(this)}export{y as c,C as d,m as s,w as u};
