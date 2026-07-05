// ════════════════════════════════════════════════════════════
//  CSC Centre | Aadhaar Sewa Kendra
//  Fully Supabase-backed CMS — Services, Notices, Documents,
//  Hero, Popup/Ticker, Payment/QR, Contact — sab kuch Supabase
//  database/storage me store hota hai. Admin ka koi bhi change
//  sabhi customers ko turant real data se dikhta hai.
//  Sirf theme (dark/light) aur visitor counter — jo per-device
//  UI state hain, admin-editable content nahi — LocalStorage me
//  hain, baaki sab kuch Supabase me hai.
// ════════════════════════════════════════════════════════════

// ── Supabase Config ──────────────────────────────────────────
// 👉 README.md follow karke ye दोनों values भरें
const SUPABASE_URL = "https://qpdwpcwtpnksxiyobwzw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwZHdwY3d0cG5rc3hpeW9id3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxODAzMjksImV4cCI6MjA5ODc1NjMyOX0.eZLA1b4fWUm9pdUvqh7gwc7178T9G_TgFS6e-gqtwDE";

let sb = null;
let SB_READY = false;
try{
  if(typeof supabase==="undefined"){
    throw new Error("Supabase library load नहीं हो पाई — internet connection या CDN block check करें।");
  }
  if(!SUPABASE_URL || SUPABASE_URL.indexOf("YOUR_SUPABASE")===0 || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.indexOf("YOUR_SUPABASE")===0){
    throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY अभी भी placeholder values हैं — README.md Step 4 follow करके असली values भरें।");
  }
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  SB_READY = true;
}catch(cfgErr){
  console.error("[CSC Supabase Config Error]", cfgErr.message);
  window.addEventListener("DOMContentLoaded",()=>{
    const w=document.getElementById("toast-wrap");
    if(w){
      const el=document.createElement("div");
      el.className="toast err";
      el.style.pointerEvents="all";
      el.innerHTML=`<span class="toast-ic">⚠️</span><span class="toast-msg">Backend connect नहीं हुआ: ${cfgErr.message}</span>`;
      w.appendChild(el);
    }
  });
}
// हर Supabase call से पहले ये check कर लेता है ताकि config missing होने पर
// पूरा page crash होने की बजाय सिर्फ वो feature गracefully skip हो जाए
function sbOK(){
  if(!SB_READY){console.warn("Supabase configured नहीं है — README.md देखें।");return false;}
  return true;
}

// ── Default Services ───────────────────────────────────────
const DEF_SVCS = [
  {id:"s1",ic:"📄",nm:"आय प्रमाण पत्र",dsc:"आय प्रमाण पत्र हेतु आवेदन करें। आधार कार्ड एवं स्व-घोषणा पत्र आवश्यक।",doc:"आधार, राशन कार्ड, स्व-घोषणा"},
  {id:"s2",ic:"🪪",nm:"जाति प्रमाण पत्र",dsc:"SC/ST/OBC जाति प्रमाण पत्र के लिए आवेदन करें।",doc:"आधार, राशन कार्ड, जाति दस्तावेज"},
  {id:"s3",ic:"🏠",nm:"निवास प्रमाण पत्र",dsc:"स्थायी निवास प्रमाण पत्र हेतु आवेदन।",doc:"आधार, बिजली बिल, राशन कार्ड"},
  {id:"s4",ic:"👶",nm:"जन्म प्रमाण पत्र",dsc:"बच्चे के जन्म प्रमाण पत्र हेतु अस्पताल रिकॉर्ड लेकर आएं।",doc:"अस्पताल प्रमाण, आधार (माता/पिता)"},
  {id:"s5",ic:"🔵",nm:"आधार अपडेट",dsc:"आधार में नाम, पता, मोबाइल अपडेट करें। बायोमेट्रिक अपडेट भी उपलब्ध।",doc:"आधार कार्ड, मूल दस्तावेज"},
  {id:"s6",ic:"🟠",nm:"पैन कार्ड",dsc:"नया पैन कार्ड आवेदन एवं पैन-आधार लिंकिंग सेवा।",doc:"आधार, फोटो, हस्ताक्षर"},
  {id:"s7",ic:"🏥",nm:"आयुष्मान कार्ड",dsc:"PM-JAY के अंतर्गत 5 लाख तक मुफ्त इलाज।",doc:"राशन कार्ड, आधार, परिवार सूची"},
  {id:"s8",ic:"🌾",nm:"पीएम किसान",dsc:"पीएम किसान e-KYC एवं आवेदन सुधार सेवा।",doc:"आधार, बैंक पासबुक, भूमि दस्तावेज"},
  {id:"s9",ic:"👴",nm:"पेंशन सेवाएं",dsc:"वृद्धा, विधवा एवं दिव्यांग पेंशन हेतु आवेदन।",doc:"आधार, फोटो, बैंक पासबुक, आयु प्रमाण"},
  {id:"s10",ic:"📜",nm:"सरकारी योजनाएं",dsc:"PM Awas, Ujjwala, Sukanya Samriddhi आवेदन।",doc:"आधार, राशन कार्ड, आय प्रमाण"}
];

// ── Default Notices ────────────────────────────────────────
const DEF_NTCS = [
  {id:"n1",ttl:"आधार बायोमेट्रिक अपडेट हेतु दस्तावेज अनिवार्य",bdy:"बायोमेट्रिक लॉक/अनलॉक के लिए आधार नंबर एवं मूल दस्तावेज लाना अनिवार्य।",dt:"20 मई 2025",isNew:true},
  {id:"n2",ttl:"पीएम किसान 19वीं किस्त हेतु e-KYC करवाएं",bdy:"जिन किसानों की e-KYC नहीं हुई वे तत्काल केंद्र पर आकर e-KYC करवाएं।",dt:"18 मई 2025",isNew:true},
  {id:"n3",ttl:"आयुष्मान कार्ड शिविर 25 मई को",bdy:"25 मई को विशेष शिविर। राशन कार्ड एवं आधार साथ लाएं।",dt:"15 मई 2025",isNew:false},
  {id:"n4",ttl:"जाति प्रमाण पत्र शुल्क अद्यतन",bdy:"जाति एवं निवास प्रमाण पत्र का सेवा शुल्क अब ₹30 निर्धारित।",dt:"10 मई 2025",isNew:false}
];

// ── FAQ Data ───────────────────────────────────────────────
const FAQS = [
  {q:"आधार अपडेट के लिए कौन से दस्तावेज चाहिए?",a:"मूल आधार कार्ड, पता प्रमाण (बिजली बिल/राशन कार्ड), एवं पंजीकृत मोबाइल नंबर आवश्यक है।"},
  {q:"पैन कार्ड बनने में कितना समय लगता है?",a:"7–15 कार्यदिवस। ई-पैन 48 घंटों में मिल सकता है। शुल्क ₹107।"},
  {q:"आयुष्मान कार्ड की पात्रता कैसे जांचें?",a:"PMJAY पोर्टल या हमारे केंद्र पर राशन कार्ड से पात्रता जांचें। ₹5 लाख तक मुफ्त इलाज।"},
  {q:"जन्म प्रमाण पत्र के लिए क्या चाहिए?",a:"1 वर्ष तक: अस्पताल प्रमाण। 1 वर्ष से अधिक: न्यायालय शपथ पत्र।"},
  {q:"पेंशन आवेदन की स्थिति कहाँ देखें?",a:"हमारे केंद्र पर या राज्य सरकार पोर्टल पर आवेदन क्रमांक से।"},
  {q:"सेवाओं का शुल्क क्या है?",a:"आधार: ₹30–50 | पैन: ₹107 | प्रमाण पत्र: ₹30 | आयुष्मान: निःशुल्क।"}
];

// ── State ──────────────────────────────────────────────────
// Services, Notices, Documents — सब Supabase-backed हैं (in-memory admin cache)
let admSvcs = [];   // admin के लिए सभी services की cache
let admNtcs = [];   // admin के लिए सभी notices (active + inactive) की cache
let admDocs = [];   // admin के लिए सभी documents की cache
let heroCustomized = false;   // true जब admin ने hero content Supabase से customize किया हो

// ════════════════════════════════════════════════════════════
//  TOAST
// ════════════════════════════════════════════════════════════
function toast(msg, type="ok", ms=3200) {
  const icons={ok:"✅",err:"❌",warn:"⚠️",info:"ℹ️"};
  const w=document.getElementById("toast-wrap");
  const el=document.createElement("div");
  el.className=`toast ${type}`;
  el.innerHTML=`<span class="toast-ic">${icons[type]||"ℹ️"}</span><span class="toast-msg">${msg}</span><button class="toast-x" onclick="this.parentElement.remove()">✕</button>`;
  w.appendChild(el);
  setTimeout(()=>{el.style.animation="toastOut .32s forwards";setTimeout(()=>el.remove(),340);},ms);
}

// ════════════════════════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════════════════════════
function toggleDark() {
  const h=document.documentElement;
  const d=h.getAttribute("data-theme")==="dark";
  h.setAttribute("data-theme",d?"light":"dark");
  document.getElementById("dark-btn").textContent=d?"🌙":"☀️";
  localStorage.setItem("csc_theme",d?"light":"dark");
}
(function(){
  if(localStorage.getItem("csc_theme")==="dark"){
    document.documentElement.setAttribute("data-theme","dark");
    const b=document.getElementById("dark-btn");if(b)b.textContent="☀️";
  }
})();

// ════════════════════════════════════════════════════════════
//  MOBILE MENU
// ════════════════════════════════════════════════════════════
function toggleMenu(){document.getElementById("mob-menu").classList.toggle("open");}
function closeMenu(){document.getElementById("mob-menu").classList.remove("open");}
document.addEventListener("click",e=>{
  const m=document.getElementById("mob-menu"),h=document.getElementById("ham-btn");
  if(m&&m.classList.contains("open")&&!m.contains(e.target)&&!h.contains(e.target))closeMenu();
});

// ════════════════════════════════════════════════════════════
//  LANGUAGE SWITCHER
// ════════════════════════════════════════════════════════════
const LANGS={
  hi:{badge:"सरकारी मान्यता प्राप्त केंद्र — CSC 3.0",h2:"आपकी <span>सरकारी सेवाएं</span><br/>एक ही जगह",p:"Batang, Raipur में आपके नजदीकी CSC केंद्र पर सेवाएं प्राप्त करें।",c1:"सेवाएं देखें",c2:"अभी कॉल करें"},
  en:{badge:"Govt Authorized Centre — CSC 3.0",h2:"Your <span>Government Services</span><br/>At One Place",p:"Visit our CSC Centre in Batang, Raipur for all government services.",c1:"View Services",c2:"Call Now"},
  cg:{badge:"सरकारी मान्यता प्राप्त केंद्र — CSC 3.0",h2:"आपकर <span>सरकारी सेवा</span><br/>एके जगह",p:"Batang, Raipur मा हमर CSC केंद्र मा सब सेवा मिलही।",c1:"सेवा देखव",c2:"अभी फोन करव"}
};
function switchLang(l){
  const d=LANGS[l];if(!d)return;
  if(heroCustomized)return;
  const ids=[["hero-badge-el","badge",true],["hero-h2-el","h2",true],["hero-p-el","p",false],["hero-c1-el","c1",false],["hero-c2-el","c2",false]];
  ids.forEach(([id,k,html])=>{const e=document.getElementById(id);if(e){if(html)e.innerHTML=d[k];else e.textContent=d[k];}});
}

// ════════════════════════════════════════════════════════════
//  POPUP
// ════════════════════════════════════════════════════════════
function closePopup(){
  const o=document.getElementById("popup-ov");
  if(o){o.style.opacity="0";o.style.transition="opacity .3s";setTimeout(()=>o.style.display="none",320);}
}

// ════════════════════════════════════════════════════════════
//  APPLY NOW MODAL
// ════════════════════════════════════════════════════════════
function showApplyModal(nm){
  const el=document.getElementById("apply-svc-name");if(el)el.textContent=nm;
  document.getElementById("apply-ov").classList.add("open");
}
function closeApplyModal(){document.getElementById("apply-ov").classList.remove("open");}

// ════════════════════════════════════════════════════════════
//  VIEW FORM (opens href in new tab; shows toast if href="#")
// ════════════════════════════════════════════════════════════
function viewForm(e,nm){
  const href=e.currentTarget.getAttribute("href");
  if(!href||href==="#"){
    e.preventDefault();
    toast(nm+" का Form जल्द उपलब्ध होगा। केंद्र पर संपर्क करें।","info",4000);
  }
  // If real URL — browser opens in new tab naturally
}

// ════════════════════════════════════════════════════════════
//  SEARCH
// ════════════════════════════════════════════════════════════
let _st;
function searchSvc(q){
  const div=document.getElementById("srch-res");
  if(!q.trim()){div.style.display="none";return;}
  clearTimeout(_st);
  _st=setTimeout(()=>{
    const ql=q.toLowerCase();
    const list=admSvcs.filter(s=>s.nm.toLowerCase().includes(ql)||s.doc.toLowerCase().includes(ql));
    div.style.display="block";
    div.innerHTML=list.length
      ?list.map(s=>`<div class="res-item" onclick="gotoSvc()"><span>${s.ic}</span><span>${s.nm}</span></div>`).join("")
      :`<div class="res-item" style="color:var(--text-light)">😔 "${q}" से कोई सेवा नहीं मिली।</div>`;
  },250);
}
function gotoSvc(){document.getElementById("srch-res").style.display="none";document.getElementById("srch-inp").value="";document.getElementById("services").scrollIntoView({behavior:"smooth"});}
document.addEventListener("click",e=>{if(!e.target.closest(".srch-wrap"))document.getElementById("srch-res").style.display="none";});

// ════════════════════════════════════════════════════════════
//  RENDER SERVICES (public grid)
// ════════════════════════════════════════════════════════════
async function loadServices(){
  const grid=document.getElementById("svc-grid");if(!grid)return;
  if(!sbOK()){grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-light)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("services").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  if(error){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-light)">⚠️ Services लोड नहीं हो पाईं।</div>`;
    console.error(error);return;
  }
  // DB rows को उसी shape में map करते हैं जो बाकी कोड (search वगैरह) पहले से use करता है
  admSvcs=(data||[]).map(s=>({id:s.id,ic:s.icon||"📋",nm:s.name,dsc:s.description||"",doc:s.doc_required||"",formFile:s.form_file_url||"",formPath:s.form_file_path||""}));
  if(!admSvcs.length){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-light)"><div style="font-size:3rem;margin-bottom:12px">😔</div><div style="font-weight:600">कोई सेवा नहीं मिली।</div></div>`;
    return;
  }
  grid.innerHTML=admSvcs.map((s,i)=>`
    <div class="svc-card su" style="animation-delay:${i*0.055}s">
      <div class="svc-top"><span class="svc-ic">${escH(s.ic)}</span><h3>${escH(s.nm)}</h3></div>
      <div class="svc-bd">
        <p>${escH(s.dsc)}</p>
        <div class="svc-tags"><span class="svc-tag">📋 ${escH(s.doc)}</span></div>
        <div class="svc-btns">
          <a href="${s.formFile||'#'}" target="${s.formFile?'_blank':'_self'}" class="btn-vf" onclick="viewForm(event,'${esc(s.nm)}')">📄 View Form</a>
          <button class="btn-ap" onclick="showApplyModal('${esc(s.nm)}')">✅ Apply Now</button>
        </div>
      </div>
    </div>`).join("");
}

// ════════════════════════════════════════════════════════════
//  RENDER NOTICES (public) — Supabase-backed, केवल active notices
// ════════════════════════════════════════════════════════════
async function loadNotices(){
  const el=document.getElementById("ntc-list");if(!el)return;
  if(!sbOK()){el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text-light)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("notices").select("*").eq("is_active",true).order("created_at",{ascending:false});
  if(error){
    el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text-light)"><span style="font-size:2rem">⚠️</span><p style="margin-top:9px">सूचनाएं लोड नहीं हो पाईं।</p></div>`;
    console.error(error);return;
  }
  const now=Date.now();
  el.innerHTML=(data&&data.length)
    ?data.map(n=>{
      const isNew=n.created_at&&(now-new Date(n.created_at).getTime())<5*24*60*60*1000;
      return `<div class="ntc-item">
        ${isNew?'<span class="ntc-new">NEW</span>':""}
        <div class="ntc-txt"><h4>${escH(n.title)}</h4><p>${escH(n.message||"")}</p><div class="ntc-dt">📅 ${escH(n.date||"")}</div></div>
      </div>`;
    }).join("")
    :`<div style="text-align:center;padding:30px;color:var(--text-light)"><span style="font-size:2rem">📭</span><p style="margin-top:9px">कोई सूचना नहीं।</p></div>`;
}

// ════════════════════════════════════════════════════════════
//  RENDER DOCUMENTS (public) — Supabase Storage + table
// ════════════════════════════════════════════════════════════
async function loadDocuments(){
  const el=document.getElementById("doc-list");if(!el)return;
  if(!sbOK()){el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text-light)">⚠️ Backend connect नहीं हुआ।</div>`;return;}
  const {data,error}=await sb.from("documents").select("*").order("uploaded_at",{ascending:false});
  if(error){
    el.innerHTML=`<div style="text-align:center;padding:30px;color:var(--text-light)"><span style="font-size:2rem">⚠️</span><p style="margin-top:9px">दस्तावेज़ लोड नहीं हो पाए।</p></div>`;
    console.error(error);return;
  }
  el.innerHTML=(data&&data.length)
    ?data.map(d=>`
      <div class="ntc-item">
        <div class="ntc-txt">
          <h4>📄 ${escH(d.title)}</h4>
          ${d.category?`<div class="svc-tags" style="margin:4px 0"><span class="svc-tag">${escH(d.category)}</span></div>`:""}
          <div class="ntc-dt">📅 ${d.uploaded_at?new Date(d.uploaded_at).toLocaleDateString("hi-IN"):""}</div>
        </div>
        <a href="${d.file_url}" target="_blank" rel="noopener" class="btn-dl" style="flex:none;padding:8px 16px;min-height:36px">⬇️ Download</a>
      </div>`).join("")
    :`<div style="text-align:center;padding:30px;color:var(--text-light)"><span style="font-size:2rem">📁</span><p style="margin-top:9px">अभी कोई दस्तावेज़ उपलब्ध नहीं।</p></div>`;
}

// ════════════════════════════════════════════════════════════
//  RENDER FAQ
// ════════════════════════════════════════════════════════════
function renderFAQ(){
  const el=document.getElementById("faq-list");if(!el)return;
  el.innerHTML=FAQS.map((f,i)=>`
    <div class="faq-it" id="fq${i}">
      <div class="faq-q" onclick="document.getElementById('fq${i}').classList.toggle('open')">
        <span>${f.q}</span><span class="faq-tog">+</span>
      </div>
      <div class="faq-a">${f.a}</div>
    </div>`).join("");
}

// ════════════════════════════════════════════════════════════
//  STAT COUNTERS
// ════════════════════════════════════════════════════════════
function animStats(){
  document.querySelectorAll(".stat-n[data-target]").forEach(el=>{
    const t=parseFloat(el.getAttribute("data-target")),isF=t%1!==0;
    let c=0;const step=t/60;
    const tm=setInterval(()=>{c+=step;if(c>=t){c=t;clearInterval(tm);}el.textContent=isF?c.toFixed(1):Math.floor(c).toLocaleString("en-IN");},25);
  });
}
const _obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){animStats();_obs.unobserve(e.target);}}),{threshold:.25});
const _hEl=document.getElementById("hero");if(_hEl)_obs.observe(_hEl);

// ════════════════════════════════════════════════════════════
//  SCROLL TO TOP
// ════════════════════════════════════════════════════════════
window.addEventListener("scroll",()=>document.getElementById("top-btn").classList.toggle("show",scrollY>400));

// ════════════════════════════════════════════════════════════
//  COPY UPI
// ════════════════════════════════════════════════════════════
function copyUPI(){
  const el=document.getElementById("upi-el");
  const text=el?el.textContent:"aman.kumar@upi";
  const fb=()=>{const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);};
  navigator.clipboard?navigator.clipboard.writeText(text).then(()=>toast("UPI ID कॉपी हो गई: "+text,"ok")).catch(fb):(fb(),toast("UPI ID कॉपी हो गई: "+text,"ok"));
}

// ════════════════════════════════════════════════════════════
//  CHATBOT
// ════════════════════════════════════════════════════════════
const CB_R={
  "आधार":"आधार अपडेट के लिए:\n• मूल आधार कार्ड\n• पता प्रमाण\n• मोबाइल नंबर\nशुल्क: ₹30–50 | सोम–शनि 9AM–6PM 📞 7697800802",
  "पैन":"PAN Card: आधार+फोटो+हस्ताक्षर\nशुल्क: ₹107 | समय: 7–15 दिन",
  "आयुष्मान":"Ayushman: राशन कार्ड+आधार\n₹5 लाख तक मुफ्त इलाज! 📞 7697800802",
  "प्रमाण":"प्रमाण पत्र: आधार+राशन कार्ड\nशुल्क: ₹30 | 3–7 दिन",
  "किसान":"PM Kisan e-KYC: आधार+बैंक पासबुक\n19वीं किस्त हेतु अनिवार्य!",
  "पेंशन":"पेंशन: आधार+आयु प्रमाण+बैंक पासबुक\nवृद्धा, विधवा, दिव्यांग पेंशन उपलब्ध",
  "समय":"केंद्र समय:\n🕘 सोम–शनि: 9AM–6PM\n🕙 रविवार: 10AM–2PM\n📍 Batang, Raipur 491111",
  "शुल्क":"शुल्क:\n• आधार: ₹30–50\n• पैन: ₹107\n• प्रमाण पत्र: ₹30\n• आयुष्मान: निःशुल्क"
};
function toggleCB(){document.getElementById("cb-box").classList.toggle("open");}
function cbAsk(q){cbAdd(q,"user");setTimeout(()=>cbReply(q),480);}
function cbSend(){const i=document.getElementById("cb-inp"),v=i.value.trim();if(!v)return;cbAdd(v,"user");i.value="";setTimeout(()=>cbReply(v),480);}
function cbAdd(txt,type){const m=document.getElementById("cb-msgs"),d=document.createElement("div");d.className=`cb-msg ${type}`;d.innerHTML=`<div class="cb-bub">${txt.replace(/\n/g,"<br/>")}</div>`;m.appendChild(d);m.scrollTop=m.scrollHeight;}
function cbReply(q){const ql=q.toLowerCase();let r="";for(const k in CB_R){if(ql.includes(k.toLowerCase())){r=CB_R[k];break;}}if(!r){const d=["📞 7697800802 पर कॉल करें।","WhatsApp से संपर्क करें।","केंद्र पर सोम–शनि 9AM–6PM आएं।"];r=d[Math.floor(Math.random()*d.length)];}cbAdd(r,"bot");}

// ════════════════════════════════════════════════════════════
//  ADMIN LOGIN — Supabase Auth (email + password)
//  Admin user Supabase Dashboard में पहले से बनाना होगा (README देखें)
// ════════════════════════════════════════════════════════════
async function openAdmModal(){
  if(!sbOK()){toast("⚠️ Backend connect नहीं हुआ — README.md देखें।","err");return;}
  const {data:{session}}=await sb.auth.getSession();
  if(session){openAdmPanel();return;}
  document.getElementById("adm-modal-ov").classList.add("open");
  setTimeout(()=>document.getElementById("amc-user").focus(),200);
}
function closeAdmModal(){document.getElementById("adm-modal-ov").classList.remove("open");document.getElementById("amc-err").style.display="none";}
async function doLogin(){
  if(!sbOK())return;
  const u=document.getElementById("amc-user").value.trim();
  const p=document.getElementById("amc-pass").value;
  const e=document.getElementById("amc-err");
  const {error}=await sb.auth.signInWithPassword({email:u,password:p});
  if(error){
    e.style.display="block";
    e.textContent="❌ गलत Email या Password!";
    document.getElementById("amc-pass").value="";
    setTimeout(()=>e.style.display="none",3500);
    return;
  }
  e.style.display="none";
  document.getElementById("amc-user").value="";
  document.getElementById("amc-pass").value="";
  closeAdmModal();
  openAdmPanel();
}
async function doLogout(){
  if(!confirm("Logout करें?"))return;
  if(sbOK())await sb.auth.signOut();
  closeAdmPanel();
  toast("Logout हो गए।","info");
}

// ════════════════════════════════════════════════════════════
//  ADMIN PANEL
// ════════════════════════════════════════════════════════════
async function openAdmPanel(){
  if(!sbOK()){toast("⚠️ Backend connect नहीं हुआ — README.md देखें।","err");return;}
  const {data:{session}}=await sb.auth.getSession();
  if(!session){openAdmModal();return;}
  document.getElementById("adm-panel").classList.add("open");
  document.body.style.overflow="hidden";
  await admLoadSvcs();
  await admLoadNtcs();
  await admLoadDocs();
  await admLoadSettings();
  admUpdateDash();updateBadges();
}
function closeAdmPanel(){document.getElementById("adm-panel").classList.remove("open");document.body.style.overflow="";}
function toggleAdmSB(){document.getElementById("adm-sb").classList.toggle("open");document.getElementById("adm-sb-ov").classList.toggle("show");}
function closeAdmSB(){document.getElementById("adm-sb").classList.remove("open");document.getElementById("adm-sb-ov").classList.remove("show");}
function switchTab(btn,id){
  document.querySelectorAll(".adm-nav").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".adm-tab").forEach(t=>t.classList.remove("active"));
  if(btn)btn.classList.add("active");
  const t=document.getElementById(id);if(t)t.classList.add("active");
  closeAdmSB();
}

// ── Dashboard ─────────────────────────────────────────────
function admUpdateDash(){
  const sv=document.getElementById("ds-sv");if(sv)sv.textContent=admSvcs.length;
  const nt=document.getElementById("ds-nt");if(nt)nt.textContent=admNtcs.length;
  const dc=document.getElementById("ds-dc");if(dc)dc.textContent=admDocs.length;
  const vi=document.getElementById("ds-vi");if(vi)vi.textContent=parseInt(localStorage.getItem("csc_vis")||"0");
  const dd=document.getElementById("ds-dt");if(dd){const d=new Date();dd.textContent=d.toLocaleDateString("hi-IN",{day:"2-digit",month:"short"});}
  const rl=document.getElementById("dash-ntc");
  if(rl)rl.innerHTML=admNtcs.slice(0,4).map(n=>`<div class="adm-li ntc"><div class="lco"><div class="lt">${escH(n.title)}</div><div class="ls">📅 ${escH(n.date||"")}</div></div>${n.is_active?"":'<span style="font-size:.6rem;background:#8a9ec0;color:#fff;padding:1px 6px;border-radius:50px;font-weight:700;flex-shrink:0">HIDDEN</span>'}</div>`).join("")||'<div class="adm-empty"><em>📭</em>No notices</div>';
}
function updateBadges(){
  const sv=document.getElementById("bdg-svc");if(sv)sv.textContent=admSvcs.length;
  const nt=document.getElementById("bdg-ntc");if(nt)nt.textContent=admNtcs.length;
  const dc=document.getElementById("bdg-doc");if(dc)dc.textContent=admDocs.length;
}

// ── Services CRUD (Supabase — RLS controls write access) ───
async function admLoadSvcs(){
  if(!sbOK())return;
  const {data,error}=await sb.from("services").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true});
  admSvcs=error?[]:(data||[]).map(s=>({id:s.id,ic:s.icon||"📋",nm:s.name,dsc:s.description||"",doc:s.doc_required||"",formFile:s.form_file_url||"",formPath:s.form_file_path||""}));
  if(error)console.error(error);
  renderAdmSvc();
}
function renderAdmSvc(){
  const q=(document.getElementById("sv-srch")||{value:""}).value.toLowerCase();
  const el=document.getElementById("adm-svc-list");if(!el)return;
  const list=admSvcs.filter(s=>!q||s.nm.toLowerCase().includes(q));
  el.innerHTML=list.length?list.map(s=>`
    <div class="adm-li svc">
      <div class="lic">${escH(s.ic)}</div>
      <div class="lco"><div class="lt">${escH(s.nm)}</div><div class="ls">📋 ${escH(s.doc)}</div></div>
      <div class="la">
        <button class="adm-btn adm-gh adm-ic-btn" onclick="admEditSvc('${s.id}')" title="Edit">✏️</button>
        <button class="adm-btn adm-del adm-ic-btn" onclick="admDelSvc('${s.id}')" title="Delete">🗑️</button>
      </div>
    </div>`).join(""):`<div class="adm-empty"><em>📭</em>No services found</div>`;
}
async function addService(){
  if(!sbOK())return;
  const nm=(document.getElementById("sv-nm")||{value:""}).value.trim();
  const dsc=(document.getElementById("sv-dsc")||{value:""}).value.trim();
  const ic=(document.getElementById("sv-ic")||{value:"📋"}).value.trim()||"📋";
  const doc=(document.getElementById("sv-doc")||{value:""}).value.trim();
  if(!nm){toast("Service name जरूरी है!","warn");return;}
  const {error}=await sb.from("services").insert({icon:ic,name:nm,description:dsc,doc_required:doc||"आधार कार्ड"});
  if(error){toast("❌ Service जोड़ने में समस्या: "+error.message,"err");return;}
  await admLoadSvcs();updateBadges();await loadServices();admUpdateDash();
  ["sv-nm","sv-dsc","sv-ic","sv-doc"].forEach(id=>{const e=document.getElementById(id);if(e)e.value="";});
  toast("✅ Service जोड़ी गई!","ok");
}
async function admDelSvc(id){
  if(!confirm("यह service delete करें?"))return;
  const s=admSvcs.find(x=>x.id===id);
  const {error}=await sb.from("services").delete().eq("id",id);
  if(error){toast("❌ Delete में समस्या: "+error.message,"err");return;}
  if(s&&s.formPath){await sb.storage.from("site-assets").remove([s.formPath]);}
  await admLoadSvcs();updateBadges();await loadServices();admUpdateDash();
  toast("Service delete हो गई।","info");
}
function admEditSvc(id){
  const s=admSvcs.find(x=>x.id===id);if(!s)return;
  const hasFile=!!(s.formFile);
  document.getElementById("edit-ttl").textContent="✏️ Edit Service";
  document.getElementById("edit-bd").innerHTML=`
    <div class="adm-fg"><label>Icon</label><input id="em-ic" value="${escH(s.ic)}" maxlength="4"/></div>
    <div class="adm-fg"><label>Name</label><input id="em-nm" value="${escH(s.nm)}"/></div>
    <div class="adm-fg"><label>Description</label><textarea id="em-dsc" rows="3">${escH(s.dsc)}</textarea></div>
    <div class="adm-fg"><label>Documents</label><input id="em-doc" value="${escH(s.doc)}"/></div>
    <div class="adm-fg" style="border-top:1.5px solid var(--border);padding-top:13px;margin-top:4px">
      <label>📄 Upload Form / PDF / Image</label>
      <input type="file" id="em-form-file" accept="image/*,application/pdf"
        style="padding:8px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);width:100%;margin-top:4px"/>
      <small id="em-file-status" style="color:var(--text-light);margin-top:5px;display:block">
        ${hasFile?'✅ File already uploaded — नई file upload करने से replace होगी':'No file uploaded yet'}
      </small>
      ${hasFile?`<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button type="button" onclick="window.open(admSvcs.find(x=>x.id==='${s.id}')?.formFile,'_blank')"
          style="padding:7px 13px;border-radius:8px;background:var(--primary);color:#fff;border:none;font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--fm)">👁️ View File</button>
        <button type="button" onclick="admRemoveSvcFile('${s.id}')"
          style="padding:7px 13px;border-radius:8px;background:#e63946;color:#fff;border:none;font-size:.78rem;font-weight:600;cursor:pointer;font-family:var(--fm)">🗑️ Remove File</button>
      </div>`:''}
    </div>`;
  document.getElementById("edit-ov").classList.add("open");
  document.getElementById("edit-ov").dataset.editId=id;
  document.getElementById("edit-ov").dataset.editType="svc";
}
async function admRemoveSvcFile(id){
  if(!confirm("इस service की file remove करें?"))return;
  const s=admSvcs.find(x=>x.id===id);if(!s)return;
  const {error}=await sb.from("services").update({form_file_url:null,form_file_path:null}).eq("id",id);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  if(s.formPath){await sb.storage.from("site-assets").remove([s.formPath]);}
  await admLoadSvcs();await loadServices();
  admEditSvc(id);
  toast("File remove हो गई।","info");
}

// ── Notices CRUD (Supabase — RLS controls write access) ────
async function admLoadNtcs(){
  const {data,error}=await sb.from("notices").select("*").order("created_at",{ascending:false});
  admNtcs=error?[]:(data||[]);
  if(error)console.error(error);
  renderAdmNtc();
}
function renderAdmNtc(){
  const el=document.getElementById("adm-ntc-list");if(!el)return;
  el.innerHTML=admNtcs.length?admNtcs.map(n=>`
    <div class="adm-li ntc">
      <div class="lco">
        <div class="lt">${escH(n.title)} ${n.is_active?"":'<span style="font-size:.6rem;background:#8a9ec0;color:#fff;padding:1px 6px;border-radius:50px;font-weight:700">HIDDEN</span>'}</div>
        <div class="ls">📅 ${escH(n.date||"")}</div>
        <div class="ls" style="margin-top:3px">${escH((n.message||"").substring(0,70))}${(n.message||"").length>70?"...":""}</div>
      </div>
      <div class="la">
        <button class="adm-btn adm-gh adm-ic-btn" onclick="admEditNtc('${n.id}')" title="Edit">✏️</button>
        <button class="adm-btn adm-del adm-ic-btn" onclick="admDelNtc('${n.id}')" title="Delete">🗑️</button>
      </div>
    </div>`).join(""):`<div class="adm-empty"><em>📭</em>No notices</div>`;
}
async function addNotice(){
  const ttl=(document.getElementById("nt-ttl")||{value:""}).value.trim();
  const bdy=(document.getElementById("nt-bdy")||{value:""}).value.trim();
  const dt=(document.getElementById("nt-dt")||{value:""}).value.trim()||new Date().toLocaleDateString("hi-IN");
  const active=(document.getElementById("nt-nw")||{value:"true"}).value==="true";
  if(!ttl){toast("Title जरूरी है!","warn");return;}
  const {error}=await sb.from("notices").insert({title:ttl,message:bdy,date:dt,is_active:active});
  if(error){toast("❌ Notice जोड़ने में समस्या: "+error.message,"err");return;}
  await admLoadNtcs();updateBadges();await loadNotices();admUpdateDash();
  ["nt-ttl","nt-bdy","nt-dt"].forEach(id=>{const e=document.getElementById(id);if(e)e.value="";});
  toast("✅ Notice जोड़ी गई!","ok");
}
async function admDelNtc(id){
  if(!confirm("Notice delete करें?"))return;
  const {error}=await sb.from("notices").delete().eq("id",id);
  if(error){toast("❌ Delete में समस्या: "+error.message,"err");return;}
  await admLoadNtcs();updateBadges();await loadNotices();admUpdateDash();
  toast("Notice delete हो गई।","info");
}
function admEditNtc(id){
  const n=admNtcs.find(x=>x.id===id);if(!n)return;
  document.getElementById("edit-ttl").textContent="✏️ Edit Notice";
  document.getElementById("edit-bd").innerHTML=`
    <div class="adm-fg"><label>Title</label><input id="em-ttl-n" value="${escH(n.title)}"/></div>
    <div class="adm-fg"><label>Message</label><textarea id="em-dsc-n" rows="4">${escH(n.message||"")}</textarea></div>
    <div class="adm-fg"><label>Date</label><input id="em-dt-n" value="${escH(n.date||"")}"/></div>
    <div class="adm-fg"><label>Active (customers को दिखे)?</label>
      <select id="em-nw-n"><option value="true" ${n.is_active?"selected":""}>✅ Yes</option><option value="false" ${!n.is_active?"selected":""}>❌ No</option></select>
    </div>`;
  document.getElementById("edit-ov").classList.add("open");
  document.getElementById("edit-ov").dataset.editId=id;
  document.getElementById("edit-ov").dataset.editType="ntc";
}

// ── Documents CRUD (Supabase Storage + table — RLS controls write) ──
async function admLoadDocs(){
  const {data,error}=await sb.from("documents").select("*").order("uploaded_at",{ascending:false});
  admDocs=error?[]:(data||[]);
  if(error)console.error(error);
  renderAdmDoc();
}
function renderAdmDoc(){
  const el=document.getElementById("adm-doc-list");if(!el)return;
  el.innerHTML=admDocs.length?admDocs.map(d=>`
    <div class="adm-li svc">
      <div class="lic">📄</div>
      <div class="lco"><div class="lt">${escH(d.title)}</div><div class="ls">${escH(d.category||"—")} · ${d.uploaded_at?new Date(d.uploaded_at).toLocaleDateString("hi-IN"):""}</div></div>
      <div class="la">
        <button class="adm-btn adm-gh adm-ic-btn" onclick="window.open('${d.file_url}','_blank')" title="View">👁️</button>
        <button class="adm-btn adm-del adm-ic-btn" onclick="admDelDoc('${d.id}')" title="Delete">🗑️</button>
      </div>
    </div>`).join(""):`<div class="adm-empty"><em>📁</em>No documents uploaded</div>`;
}
async function uploadDocument(){
  const ttl=(document.getElementById("dc-ttl")||{value:""}).value.trim();
  const cat=(document.getElementById("dc-cat")||{value:""}).value.trim();
  const fileInput=document.getElementById("dc-file");
  const file=fileInput&&fileInput.files[0];
  if(!ttl){toast("Title जरूरी है!","warn");return;}
  if(!file){toast("File चुनें!","warn");return;}
  toast("⏳ Upload हो रहा है...","info",2500);
  const path=`${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
  const {error:upErr}=await sb.storage.from("documents").upload(path,file);
  if(upErr){toast("❌ Upload में समस्या: "+upErr.message,"err");return;}
  const {data:urlData}=sb.storage.from("documents").getPublicUrl(path);
  const {error:insErr}=await sb.from("documents").insert({title:ttl,category:cat,file_url:urlData.publicUrl,file_path:path});
  if(insErr){toast("❌ Save में समस्या: "+insErr.message,"err");return;}
  await admLoadDocs();updateBadges();await loadDocuments();admUpdateDash();
  ["dc-ttl","dc-cat"].forEach(id=>{const e=document.getElementById(id);if(e)e.value="";});
  fileInput.value="";
  toast("✅ Document अपलोड हो गया!","ok");
}
async function admDelDoc(id){
  if(!confirm("यह document delete करें?"))return;
  const doc=admDocs.find(d=>d.id===id);
  const {error}=await sb.from("documents").delete().eq("id",id);
  if(error){toast("❌ Delete में समस्या: "+error.message,"err");return;}
  if(doc&&doc.file_path){await sb.storage.from("documents").remove([doc.file_path]);}
  await admLoadDocs();updateBadges();await loadDocuments();admUpdateDash();
  toast("Document delete हो गया।","info");
}

// ── Edit Modal ────────────────────────────────────────────
function closeEdit(){document.getElementById("edit-ov").classList.remove("open");}
async function saveEdit(){
  const ov=document.getElementById("edit-ov");
  const type=ov.dataset.editType,id=ov.dataset.editId;
  if(type==="svc"){
    const upd={
      icon:(document.getElementById("em-ic")||{value:"📋"}).value.trim()||"📋",
      name:(document.getElementById("em-nm")||{value:""}).value.trim(),
      description:(document.getElementById("em-dsc")||{value:""}).value.trim(),
      doc_required:(document.getElementById("em-doc")||{value:""}).value.trim()
    };
    const fileInput=document.getElementById("em-form-file");
    if(fileInput&&fileInput.files[0]){
      const file=fileInput.files[0];
      const path=`services/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
      const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
      if(upErr){toast("❌ File upload में समस्या: "+upErr.message,"err");closeEdit();return;}
      const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
      upd.form_file_url=urlData.publicUrl;
      upd.form_file_path=path;
    }
    const {error}=await sb.from("services").update(upd).eq("id",id);
    if(error){toast("❌ Update में समस्या: "+error.message,"err");closeEdit();return;}
    await admLoadSvcs();await loadServices();toast("Service अपडेट!","ok");
  } else if(type==="ntc"){
    const upd={
      title:(document.getElementById("em-ttl-n")||{value:""}).value.trim(),
      message:(document.getElementById("em-dsc-n")||{value:""}).value.trim(),
      date:(document.getElementById("em-dt-n")||{value:""}).value.trim(),
      is_active:(document.getElementById("em-nw-n")||{value:"true"}).value==="true"
    };
    const {error}=await sb.from("notices").update(upd).eq("id",id);
    if(error){toast("❌ Update में समस्या: "+error.message,"err");closeEdit();return;}
    await admLoadNtcs();await loadNotices();admUpdateDash();toast("Notice अपडेट!","ok");
  }
  closeEdit();
}

// ── Site Content (Supabase key-value table: hero/popup/ticker/payment/contact) ──
async function getContent(key){
  if(!sbOK())return null;
  const {data,error}=await sb.from("site_content").select("value").eq("key",key).maybeSingle();
  if(error){console.error(error);return null;}
  return data?data.value:null;
}
async function setContent(key,value){
  if(!sbOK())return{error:{message:"Backend connect नहीं हुआ"}};
  return await sb.from("site_content").upsert({key,value,updated_at:new Date().toISOString()});
}

// ── Settings ──────────────────────────────────────────────
async function admLoadSettings(){
  if(!sbOK())return;
  const pay=(await getContent("payment"))||{};
  const ct=(await getContent("contact"))||{};
  const m=[["py-upi",pay.upi_id],["py-nm",pay.center_name],["ct-nm",ct.center_name],["ct-ph",ct.phone],["ct-em",ct.email],["ct-wa",ct.whatsapp],["ct-addr",ct.address],["ct-ot",ct.office_time]];
  m.forEach(([id,v])=>{const e=document.getElementById(id);if(e&&v)e.value=v;});
  const qrSt=document.getElementById("qr-status");
  if(qrSt)qrSt.textContent=pay.qr_url?"QR uploaded ✅":"No QR uploaded yet";
}
async function savePayment(){
  if(!sbOK())return;
  const pay=(await getContent("payment"))||{};
  const upi=(document.getElementById("py-upi")||{value:""}).value.trim();
  const nm=(document.getElementById("py-nm")||{value:""}).value.trim();
  if(upi)pay.upi_id=upi;if(nm)pay.center_name=nm;
  const qf=document.getElementById("py-qr-file");
  if(qf&&qf.files[0]){
    const file=qf.files[0];
    const path=`qr/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,"_")}`;
    toast("⏳ QR upload हो रहा है...","info",2000);
    const {error:upErr}=await sb.storage.from("site-assets").upload(path,file);
    if(upErr){toast("❌ QR upload में समस्या: "+upErr.message,"err");return;}
    const {data:urlData}=sb.storage.from("site-assets").getPublicUrl(path);
    pay.qr_url=urlData.publicUrl;
    const qrBox=document.getElementById("qr-box");
    if(qrBox)qrBox.innerHTML=`<img src="${pay.qr_url}" alt="QR Code" style="max-width:100%;height:auto;display:block;border-radius:8px"/>`;
    const qrSt=document.getElementById("qr-status");if(qrSt)qrSt.textContent="QR uploaded ✅";
    qf.value="";
  }
  const {error}=await setContent("payment",pay);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  const upiEl=document.getElementById("upi-el");if(upiEl&&pay.upi_id)upiEl.textContent=pay.upi_id;
  const nmEl=document.getElementById("pay-name-el");if(nmEl&&pay.center_name)nmEl.textContent=pay.center_name;
  toast("Payment info सेव हो गई!","ok");
}
async function saveContact(){
  if(!sbOK())return;
  const get=id=>(document.getElementById(id)||{value:""}).value.trim();
  const ct=(await getContent("contact"))||{};
  const fields=[["ct-nm","center_name"],["ct-ph","phone"],["ct-em","email"],["ct-wa","whatsapp"],["ct-addr","address"],["ct-ot","office_time"]];
  fields.forEach(([id,k])=>{const v=get(id);if(v)ct[k]=v;});
  const {error}=await setContent("contact",ct);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  const phEl=document.getElementById("ct-ph-el");if(phEl&&ct.phone)phEl.textContent=ct.phone;
  const emEl=document.getElementById("ct-em-el");if(emEl&&ct.email)emEl.textContent=ct.email;
  if(ct.whatsapp){const msg=encodeURIComponent("नमस्ते, CSC Centre की सेवाओं के बारे में जानकारी चाहिए।");const url=`https://wa.me/${ct.whatsapp}?text=${msg}`;["wa-btn","wa-ft-link"].forEach(id=>{const el=document.getElementById(id);if(el)el.href=url;});}
  toast("Contact info सेव हो गई!","ok");
}
async function saveHero(){
  if(!sbOK())return;
  const hc={h2:(document.getElementById("hr-h2")||{value:""}).value.trim(),p:(document.getElementById("hr-p")||{value:""}).value.trim(),c1:(document.getElementById("hr-c1")||{value:""}).value.trim(),c2:(document.getElementById("hr-c2")||{value:""}).value.trim(),badge:(document.getElementById("hr-bdg")||{value:""}).value.trim()};
  const {error}=await setContent("hero",hc);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  applyHero(hc);toast("Hero Section अपडेट!","ok");
}
function applyHero(hc){
  if(!hc)return;
  heroCustomized=true;
  if(hc.h2){const e=document.getElementById("hero-h2-el");if(e)e.innerHTML=hc.h2;}
  if(hc.p){const e=document.getElementById("hero-p-el");if(e)e.textContent=hc.p;}
  if(hc.c1){const e=document.getElementById("hero-c1-el");if(e)e.textContent=hc.c1;}
  if(hc.c2){const e=document.getElementById("hero-c2-el");if(e)e.textContent=hc.c2;}
  if(hc.badge){const e=document.getElementById("hero-badge-el");if(e)e.textContent=hc.badge;}
}
async function savePopup(){
  if(!sbOK())return;
  const c={enabled:(document.getElementById("pp-en")||{value:"true"}).value==="true",ttl:(document.getElementById("pp-ttl")||{value:""}).value.trim(),msg:(document.getElementById("pp-msg")||{value:""}).value.trim(),hl:(document.getElementById("pp-hl")||{value:""}).value.trim()};
  const {error}=await setContent("popup",c);
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  toast("Popup settings सेव हो गई!","ok");
}
async function saveTicker(){
  if(!sbOK())return;
  const t=(document.getElementById("tick-adm")||{value:""}).value.trim();
  if(!t){toast("खाली नहीं हो सकता!","warn");return;}
  const {error}=await setContent("ticker",{text:t});
  if(error){toast("❌ समस्या: "+error.message,"err");return;}
  const el=document.getElementById("tick-el");if(el)el.innerHTML=t;
  toast("Ticker अपडेट!","ok");
}
async function changePass(){
  if(!sbOK())return;
  // Password अब Supabase Auth में manage होता है (current password की जरूरत नहीं —
  // session पहले से logged-in है, इसलिए Supabase सीधे नया password set कर देता है)
  const nw=(document.getElementById("sp-new")||{value:""}).value;
  const cnf=(document.getElementById("sp-cnf")||{value:""}).value;
  if(nw.length<6){toast("Password कम से कम 6 characters का होना चाहिए!","warn");return;}
  if(nw!==cnf){toast("Passwords match नहीं!","warn");return;}
  const {error}=await sb.auth.updateUser({password:nw});
  if(error){toast("❌ Password बदलने में समस्या: "+error.message,"err");return;}
  ["sp-cur","sp-new","sp-cnf"].forEach(id=>{const e=document.getElementById(id);if(e)e.value="";});
  toast("✅ Password बदल गया!","ok");
}
function exportData(){
  const d={services:admSvcs,notices:admNtcs,documents:admDocs};
  const b=new Blob([JSON.stringify(d,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="csc-data.json";a.click();
  toast("Data export हो गया!","ok");
}
function clearData(){
  // अब लगभग सारा data Supabase database में है (services, notices, documents, hero,
  // popup, ticker, payment, contact) — इसलिए यहाँ delete करना है तो सीधे उसी table/row
  // को Admin Panel से (या Supabase Dashboard से) delete करना होगा।
  // यहाँ सिर्फ visitor counter जैसी local device-level setting reset होती है।
  if(!confirm("Local visitor counter reset करें? (बाकी सारा data Supabase में सुरक्षित रहेगा)"))return;
  localStorage.removeItem("csc_vis");
  toast("Local counter reset हो गया।","warn");
}

// ── Helpers ───────────────────────────────────────────────
function esc(s=""){return String(s).replace(/\'/g,"\\\'").replace(/\n/g,"\\n");}
function escH(s=""){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

// ════════════════════════════════════════════════════════════
//  INIT — runs on page load
// ════════════════════════════════════════════════════════════
(async function init(){
  // Visitor counter — ye per-device UI counter hai, admin-editable content नहीं, इसलिए LocalStorage में ही रहता है
  try{const v=parseInt(localStorage.getItem("csc_vis")||"0");localStorage.setItem("csc_vis",v+1);}catch{}

  if(!sbOK()){
    // Backend config नहीं है — फिर भी बाकी static UI (theme, FAQ) चले
    renderFAQ();
    return;
  }

  // Services, Notices, Documents — Supabase से load
  loadServices();
  loadNotices();
  loadDocuments();
  renderFAQ();

  // Hero, Popup, Ticker, Payment, Contact — सब एक ही query में site_content से fetch
  try{
    const {data,error}=await sb.from("site_content").select("key,value");
    if(error)throw error;
    const cmap={};
    (data||[]).forEach(r=>cmap[r.key]=r.value);

    if(cmap.hero)applyHero(cmap.hero);

    if(cmap.ticker&&cmap.ticker.text){const el=document.getElementById("tick-el");if(el)el.innerHTML=cmap.ticker.text;}

    if(cmap.payment){
      const pay=cmap.payment;
      if(pay.upi_id){const el=document.getElementById("upi-el");if(el)el.textContent=pay.upi_id;}
      if(pay.center_name){const el=document.getElementById("pay-name-el");if(el)el.textContent=pay.center_name;}
      if(pay.qr_url){const qrBox=document.getElementById("qr-box");if(qrBox)qrBox.innerHTML=`<img src="${pay.qr_url}" alt="QR Code" style="max-width:100%;height:auto;display:block;border-radius:8px"/>`;}
    }

    if(cmap.contact){
      const ct=cmap.contact;
      if(ct.phone){const el=document.getElementById("ct-ph-el");if(el)el.textContent=ct.phone;}
      if(ct.email){const el=document.getElementById("ct-em-el");if(el)el.textContent=ct.email;}
      if(ct.whatsapp){const msg=encodeURIComponent("नमस्ते, CSC Centre की सेवाओं के बारे में जानकारी चाहिए।");const url=`https://wa.me/${ct.whatsapp}?text=${msg}`;["wa-btn","wa-ft-link"].forEach(id=>{const el=document.getElementById(id);if(el)el.href=url;});}
    }

    const pc=cmap.popup;
    const po=document.getElementById("popup-ov");
    if(pc&&pc.enabled===false){if(po)po.style.display="none";}
    else{
      if(pc&&po){
        if(pc.ttl){const e=document.getElementById("pop-ttl");if(e)e.textContent=pc.ttl;}
        if(pc.msg){const e=document.getElementById("pop-msg");if(e)e.textContent=pc.msg;}
        if(pc.hl){const e=document.getElementById("pop-hl");if(e)e.textContent=pc.hl;}
      }
      setTimeout(()=>{const po=document.getElementById("popup-ov");if(po)po.classList.add("show");},800);
    }
  }catch(err){
    console.error(err);
    setTimeout(()=>{const po=document.getElementById("popup-ov");if(po)po.classList.add("show");},800);
  }
})();
