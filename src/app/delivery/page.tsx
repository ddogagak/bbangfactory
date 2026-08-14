"use client";

import { useEffect, useMemo, useState } from "react";

type Shipping = { carrier:string|null; shipping_type:string|null; tracking_number:string|null; shipping_status:string|null };
type Order = { order_id:string; platform:string|null; first_order_date:string|null; nickname:string|null; order_status:string|null; request_status:string|null; order_count:number|null; created_at:string|null; domestic_shipping:Shipping|Shipping[]|null };

function shipping(order:Order){return Array.isArray(order.domestic_shipping)?order.domestic_shipping[0]||null:order.domestic_shipping}
function parseDate(value?:string|null){if(!value)return null;const raw=String(value).trim();if(!raw)return null;const normalized=raw.replace(/\./g,"-").replace(/\//g,"-").replace(/\s+/g," ").trim();const ymd=normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(ymd){const d=new Date(Number(ymd[1]),Number(ymd[2])-1,Number(ymd[3]));return Number.isNaN(d.getTime())?null:d}const d=new Date(raw);return Number.isNaN(d.getTime())?null:d}
function daysSince(value?:string|null){const start=parseDate(value);if(!start)return null;start.setHours(0,0,0,0);const today=new Date();today.setHours(0,0,0,0);const diff=Math.floor((today.getTime()-start.getTime())/86400000);return Number.isFinite(diff)?Math.max(0,diff):null}
function dateText(value?:string|null){const d=parseDate(value);if(!d)return value?String(value):"-";return new Intl.DateTimeFormat("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit"}).format(d)}
function statusText(value?:string|null){const labels:Record<string,string>={start:"배송대기",excel_exported:"배송준비",uploaded:"운송장입력",registered:"배송중",done:"배송완료"};return labels[value||"start"]||"배송대기"}
function orderStatusText(value?:string|null){const labels:Record<string,string>={accepted:"입력됨",checked:"재고확인",kept:"직배킵",packaged:"포장완료",done:"완료"};return labels[value||"accepted"]||value||"입력됨"}
function requestStatusText(value?:string|null){const labels:Record<string,string>={none:"요청없음",keep:"킵",immediate:"바배"};return labels[value||"none"]||value||"요청없음"}

export default function DeliveryPage(){
 const[orders,setOrders]=useState<Order[]>([]);const[loading,setLoading]=useState(true);const[message,setMessage]=useState("");const[q,setQ]=useState("");
 useEffect(()=>{fetch("/api/delivery",{cache:"no-store"}).then(async res=>{const json=await res.json();if(!res.ok)throw new Error(json.detail||json.error||"조회 실패");setOrders(json.orders||[])}).catch(error=>setMessage(error instanceof Error?error.message:"조회 실패")).finally(()=>setLoading(false))},[]);
 const filtered=useMemo(()=>{const keyword=q.trim().toLowerCase();if(!keyword)return orders;return orders.filter(order=>String(order.nickname||"").toLowerCase().includes(keyword))},[orders,q]);
 return <main className="delivery-shell">
  <header className="delivery-head compact-head"><a href="/" className="back-button">←</a><div><p className="delivery-kicker">DOPAMINE BBANG FACTORY</p><h1>배송 & KEEP 조회</h1></div><span className="head-bolt">ϟ</span></header>
  <section className="delivery-content compact-content">
   <label className="nickname-search compact-search"><span>닉네임</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="닉네임 검색"/>{q&&<button type="button" onClick={()=>setQ("")}>×</button>}</label>
   <div className="result-line compact-result"><span>{q?`“${q}” 검색결과`:"진행중인 배송"}</span><strong>{filtered.length}</strong></div>
   {loading&&<div className="delivery-empty">빵을 찾는 중...</div>}{!loading&&message&&<div className="delivery-empty error">{message}</div>}{!loading&&!message&&filtered.length===0&&<div className="delivery-empty">해당하는 진행중 주문이 없어요.</div>}
   <div className="delivery-list compact-list">{filtered.map(order=>{const s=shipping(order);const firstDate=order.first_order_date||order.created_at;const days=daysSince(firstDate);const currentStatus=statusText(s?.shipping_status);const currentOrderStatus=orderStatusText(order.order_status);const currentRequestStatus=requestStatusText(order.request_status);const count=Math.max(1,Number(order.order_count)||1);return <details className="delivery-row-card" key={order.order_id}>
    <summary className="delivery-row-summary">
     <span className="day-badge">+ {days===null?"-":days}일</span>
     <div className="summary-nickname"><span className="tiny-label">NICKNAME</span><strong>{order.nickname||"닉네임 없음"}</strong></div>
     <span className="summary-status-stack"><span><i className="status-dot"/>주문 {currentOrderStatus}</span><span><i className="status-dot request-dot"/>요청 {currentRequestStatus}</span></span>
     <span className="order-count"><small>합배송</small><b>{count}건</b></span>
     <span className="summary-chevron">▼</span>
    </summary>
    <div className="delivery-row-detail"><dl className="delivery-info compact-info"><div><dt>최초주문일</dt><dd>{dateText(firstDate)}</dd></div><div><dt>주문상태</dt><dd><span className="status-dot"/>{currentOrderStatus}</dd></div><div><dt>요청상태</dt><dd><span className="status-dot request-dot"/>{currentRequestStatus}</dd></div><div><dt>배송상태</dt><dd><span className="status-dot"/>{currentStatus}</dd></div><div><dt>운송장</dt><dd className="tracking">{s?.tracking_number||"아직 등록 전"}</dd></div></dl></div>
   </details>})}</div>
  </section>
  <nav className="bottom-nav"><a href="/">HOME</a><a href="/random">랜깡</a><a href="/catalog">도감</a><a className="active" href="/delivery">배송</a></nav>
 </main>
}
