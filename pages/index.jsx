import React, { useState, useEffect, useCallback } from "react";
import { Zap, FileText, Megaphone, Share2, History, Settings, Shield, Eye, EyeOff, Target, Brain, Sword, Moon, Copy, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Users, Download, Search, BarChart2, Crosshair, ChevronRight, Star, Lock, Unlock, Coffee, Key } from "lucide-react";
if (typeof window === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
}
// ═══════════════════════════════════════════════════════
//  GEMINI API (المحرك الجديد المجاني)
// ═══════════════════════════════════════════════════════
async function askGemini(prompt, apiKey) {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("يرجى إدخال مفتاح API الخاص بـ Gemini أولاً.");
  }

  // تم تحديث اسم النموذج هنا إلى النسخة الأحدث المدعومة مجانًا gemini-3.5-flash
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=' + apiKey.trim();

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {}
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`خطأ من السيرفر: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("لم يتم العثور على إجابة في الرد.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
//  THEMES
// ═══════════════════════════════════════════════════════
const THEMES = {
  void:   { bg:"#0d0d12", bg2:"#12121a", surface:"#17171f", border:"#252535", a:"#9d7ee0", a2:"#7c5cbf", a3:"#4a3580", glow:"rgba(124,92,191,0.15)", name:"فراغ" },
  ember:  { bg:"#0d0a0a", bg2:"#130f0f", surface:"#1a1414", border:"#2e1f1f", a:"#e07e7e", a2:"#bf5c5c", a3:"#7a2f2f", glow:"rgba(191,92,92,0.15)", name:"جمر" },
  abyssal:{ bg:"#080d10", bg2:"#0c1318", surface:"#101b22", border:"#1a2d38", a:"#5db5e0", a2:"#3d8fbf", a3:"#1f4e6a", glow:"rgba(61,143,191,0.15)", name:"هاوية" },
  solaris:{ bg:"#0a0d08", bg2:"#101408", surface:"#151a10", border:"#252e18", a:"#8fd46a", a2:"#6abf42", a3:"#3a7020", glow:"rgba(106,191,66,0.15)", name:"شمسي" },
  gilded: { bg:"#0d0b06", bg2:"#131008", surface:"#1a1610", border:"#2e2510", a:"#e8c96b", a2:"#c9a84c", a3:"#7a6020", glow:"rgba(201,168,76,0.15)", name:"مذهب" },
};

// ═══════════════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════════════
export default function App() {
  const [tk, setTk] = useState("void");
  const T = THEMES[tk];
  const [panel, setPanel] = useState("welcome");
  const [zenMode, setZenMode] = useState(false);
  
  // حفظ المفتاح في متصفح المستخدم
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("zw4_gemini_key") || "");
  
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("zw4_hist") || "[]"); } catch { return []; } });
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("zw4_streak") || "0"));
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem("zw4_pts") || "0"));
  const [shields, setShields] = useState(() => parseInt(localStorage.getItem("zw4_shields") || "1"));
  const [persona, setPersona] = useState("shadow");
  const [toast, setToast] = useState(null);
  const [collaborators] = useState([
    { name: "ZY", color: "#9d7ee0" },
    { name: "IS", color: "#e07e7e" },
    { name: "JA", color: "#5db5e0" },
  ]);

  const showToast = useCallback((msg, type = "info", dur = 3500) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), dur);
  }, []);

  const addHistory = useCallback((item) => {
    const next = [{ ...item, id: Date.now(), date: new Date().toLocaleDateString("ar-SA"), words: item.content.split(/\s+/).filter(Boolean).length }, ...history].slice(0, 60);
    setHistory(next);
    localStorage.setItem("zw4_hist", JSON.stringify(next));
    const newPts = points + Math.floor(item.content.split(/\s+/).filter(Boolean).length / 10);
    setPoints(newPts); localStorage.setItem("zw4_pts", newPts);
    const newStreak = streak + 1;
    setStreak(newStreak); localStorage.setItem("zw4_streak", newStreak);
  }, [history, points, streak]);

  const buyShield = () => {
    if (points < 50) { showToast("تحتاج 50 نقطة لشراء درع ❌", "error"); return; }
    const np = points - 50; setPoints(np); localStorage.setItem("zw4_pts", np);
    const ns = shields + 1; setShields(ns); localStorage.setItem("zw4_shields", ns);
    showToast("🛡️ تم شراء درع التجميد!", "success");
  };

  const useShield = () => {
    if (shields < 1) { showToast("لا يوجد دروع — اشترِ واحداً أولاً", "error"); return; }
    const ns = shields - 1; setShields(ns); localStorage.setItem("zw4_shields", ns);
    showToast("🛡️ تم تفعيل درع التجميد — streak محمي اليوم", "success");
  };

  const personaHint = {
    shadow: null,
    advisor: "💡 المستشار: جرب تحديد جمهورك بدقة أكبر — كلما كان أضيق كان النص أقوى.",
    general: "⚔️ الجنرال: لم تكتب اليوم بعد. هذا يُضعف الـ streak. تحرّك.",
  }[persona];

  const S = {
    app: { minHeight:"100vh", background:T.bg, color:"#e4e4f0", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:"rtl", display:"flex", flexDirection:"column" },
    topbar: { background:T.bg2, borderBottom:`1px solid ${T.border}`, padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, gap:12 },
    body: { display:"flex", flex:1, overflow:"hidden" },
    sidebar: { width:220, background:T.bg2, borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column", overflowY:"auto", flexShrink:0 },
    main: { flex:1, overflowY:"auto", padding:"22px 24px" },
    navItem: (a) => ({ display:"flex", alignItems:"center", gap:9, padding:"9px 16px", cursor:"pointer", fontSize:13, color: a ? T.a : "#8888a8", background: a ? T.glow : "transparent", borderRight: a ? `3px solid ${T.a}` : "3px solid transparent", transition:"all 0.15s", userSelect:"none" }),
    card: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 18px", marginBottom:14 },
    cardTitle: { fontSize:12, fontWeight:700, color:"#7777a0", letterSpacing:1, textTransform:"uppercase", marginBottom:14, paddingBottom:10, borderBottom:`1px solid ${T.border}` },
    inp: { width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", color:"#e4e4f0", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", direction:"rtl" },
    ta: { width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", color:"#e4e4f0", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", direction:"rtl", resize:"vertical", minHeight:88, lineHeight:1.7 },
    sel: { width:"100%", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"9px 12px", color:"#e4e4f0", fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
    btn: (disabled) => ({ width:"100%", background: disabled ? "#2a2a3a" : `linear-gradient(135deg,${T.a3},${T.a2},${T.a})`, border:"none", borderRadius:10, padding:"13px", color: disabled?"#555":"#fff", fontSize:14, fontWeight:700, cursor: disabled?"not-allowed":"pointer", fontFamily:"inherit", marginTop:8, letterSpacing:0.5, transition:"opacity 0.2s" }),
    smBtn: { background:T.surface, border:`1px solid ${T.border}`, borderRadius:7, padding:"6px 12px", color:"#8888a8", fontSize:12, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" },
    badge: (col) => ({ fontSize:10, fontWeight:700, background: col || T.glow, color: col ? "#fff" : T.a, padding:"2px 7px", borderRadius:10, letterSpacing:0.5 }),
    label: { fontSize:12, fontWeight:600, color:"#8888a8", marginBottom:6, display:"block" },
  };

  if (zenMode) return (
    <div style={{ ...S.app, alignItems:"center", justifyContent:"center", background:T.bg }}>
      <div style={{ maxWidth:680, width:"100%", padding:32 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <span style={{ fontSize:11, letterSpacing:4, color:T.a, textTransform:"uppercase" }}>⚔ وضع الزن</span>
          <button onClick={() => setZenMode(false)} style={{ ...S.smBtn, display:"flex", alignItems:"center", gap:6 }}><Eye size={14}/> خروج</button>
        </div>
        <ZenEditor T={T} S={S} apiKey={apiKey} showToast={showToast} addHistory={addHistory} />
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      {toast && (
        <div style={{ position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", background:T.surface, border:`1px solid ${toast.type==="error"?"#f87171":toast.type==="success"?"#4ade80":T.border}`, borderRadius:10, padding:"10px 18px", fontSize:13, color:toast.type==="error"?"#f87171":toast.type==="success"?"#4ade80":"#e4e4f0", zIndex:9999, pointerEvents:"none", whiteSpace:"nowrap", boxShadow:"0 4px 24px rgba(0,0,0,0.5)" }}>
          {toast.msg}
        </div>
      )}

      <div style={S.topbar}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontFamily:"monospace", fontSize:17, fontWeight:900, letterSpacing:3, color:"#e4e4f0" }}>ZYNOR <span style={{ color:T.a }}>WRITE</span></span>
          <span style={{ fontSize:10, color:"#555570", letterSpacing:2 }}>V4.0 PRIME</span>
          <div style={{ display:"flex", gap:-4, marginRight:8 }}>
            {collaborators.map((c,i) => (
              <div key={i} title={c.name} style={{ width:24, height:24, borderRadius:"50%", background:c.color, border:`2px solid ${T.bg2}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:"#fff", marginRight:-6, zIndex:collaborators.length-i }}>
                {c.name}
              </div>
            ))}
            <div style={{ fontSize:10, color:"#5555", marginRight:12, alignSelf:"center" }}>+2 أونلاين</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", gap:4, background:T.bg, borderRadius:8, padding:"3px", border:`1px solid ${T.border}` }}>
            {[["shadow","الظل",Moon],["advisor","المستشار",Brain],["general","الجنرال",Sword]].map(([id,label,Icon]) => (
              <button key={id} onClick={() => setPersona(id)} title={label}
                style={{ background: persona===id ? T.glow : "transparent", border: persona===id ? `1px solid ${T.a}` : "1px solid transparent", borderRadius:6, padding:"4px 8px", cursor:"pointer", color: persona===id ? T.a : "#555570", display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                <Icon size={12}/> {label}
              </button>
            ))}
          </div>
          <button onClick={() => setZenMode(true)} style={{ ...S.smBtn, display:"flex", alignItems:"center", gap:5 }} title="وضع الزن">
            <EyeOff size={13}/> زن
          </button>
          <div style={{ display:"flex", gap:5 }}>
            {Object.entries(THEMES).map(([k,v]) => (
              <div key={k} onClick={() => setTk(k)} title={v.name}
                style={{ width:18, height:18, borderRadius:"50%", background:v.a2, cursor:"pointer", border:`2px solid ${tk===k?"#fff":T.border}`, transition:"all 0.2s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={S.body}>
        <nav style={S.sidebar}>
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 12px", borderTop:`2px solid ${T.a}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:11, fontWeight:700, color:T.a }}>⚔ ZYNOR</span>
                <span style={{ ...S.badge(), fontSize:9 }}>Streak {streak}🔥</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6666" }}>
                <span>⚡ {points} نقطة</span>
                <span>🛡️ {shields} درع</span>
              </div>
              <div style={{ display:"flex", gap:4, marginTop:8 }}>
                <button onClick={buyShield} style={{ flex:1, background:T.bg2, border:`1px solid ${T.border}`, borderRadius:6, padding:"5px 4px", cursor:"pointer", color:"#8888a8", fontSize:10, fontFamily:"inherit" }}>
                  شراء درع (50⚡)
                </button>
                <button onClick={useShield} style={{ flex:1, background: shields>0 ? T.glow : T.bg2, border:`1px solid ${shields>0?T.a:T.border}`, borderRadius:6, padding:"5px 4px", cursor:"pointer", color: shields>0?T.a:"#555", fontSize:10, fontFamily:"inherit" }}>
                  تفعيل 🛡️
                </button>
              </div>
            </div>
          </div>

          {personaHint && (
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${T.border}`, fontSize:11, color:"#8888a8", lineHeight:1.6, background:T.glow }}>
              {personaHint}
            </div>
          )}

          <div style={{ padding:"8px 0" }}>
            <div style={{ fontSize:9, color:"#444460", letterSpacing:2, padding:"6px 16px 4px", textTransform:"uppercase" }}>الأدوات</div>
            {[
              ["welcome","🏠","الرئيسية"],
              ["ads","📢","كتابة الإعلانات"],
              ["seo","🔍","مقالات SEO"],
              ["social","⚡","السوشيال ميديا"],
              ["improve","✨","تحسين نص"],
              ["resistance","🎯","رادار المقاومة","ثوري"],
              ["roi","💰","مصفوفة الـ ROI"],
            ].map(([id,icon,label,badge]) => (
              <div key={id} style={S.navItem(panel===id)} onClick={() => setPanel(id)}>
                <span>{icon}</span>
                <span style={{ flex:1 }}>{label}</span>
                {badge && <span style={{ fontSize:8, background:T.a3, color:"#fff", padding:"2px 5px", borderRadius:8 }}>{badge}</span>}
              </div>
            ))}
          </div>

          <div style={{ padding:"8px 0", borderTop:`1px solid ${T.border}` }}>
            <div style={{ fontSize:9, color:"#444460", letterSpacing:2, padding:"6px 16px 4px", textTransform:"uppercase" }}>أخرى</div>
            {[
              ["history","🕐","السجل"],
              ["settings","⚙️","الإعدادات والمفتاح"],
            ].map(([id,icon,label]) => (
              <div key={id} style={S.navItem(panel===id)} onClick={() => setPanel(id)}>
                <span>{icon}</span> {label}
                {id==="history" && <span style={{ marginRight:"auto", ...S.badge() }}>{history.length}</span>}
                {id==="settings" && !apiKey && <span style={{ marginRight:"auto", color:"#f87171" }}><AlertTriangle size={12}/></span>}
              </div>
            ))}
          </div>
        </nav>

        <main style={S.main}>
          {panel==="welcome"    && <WelcomePanel T={T} S={S} streak={streak} points={points} history={history} setPanel={setPanel} apiKey={apiKey} />}
          {panel==="ads"        && <AdsPanel     T={T} S={S} apiKey={apiKey} showToast={showToast} addHistory={addHistory} persona={persona} />}
          {panel==="seo"        && <SEOPanel     T={T} S={S} apiKey={apiKey} showToast={showToast} addHistory={addHistory} />}
          {panel==="social"     && <SocialPanel  T={T} S={S} apiKey={apiKey} showToast={showToast} addHistory={addHistory} />}
          {panel==="improve"    && <ImprovePanel T={T} S={S} apiKey={apiKey} showToast={showToast} addHistory={addHistory} />}
          {panel==="resistance" && <ResistancePanel T={T} S={S} apiKey={apiKey} showToast={showToast} />}
          {panel==="roi"        && <ROIPanel     T={T} S={S} />}
          {panel==="history"    && <HistoryPanel T={T} S={S} history={history} setHistory={setHistory} showToast={showToast} />}
          {panel==="settings"   && <SettingsPanel T={T} S={S} tk={tk} setTk={setTk} apiKey={apiKey} setApiKey={setApiKey} showToast={showToast} />}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SHARED
// ═══════════════════════════════════════════════════════
function ToneChip({ options, value, onChange, T }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
      {options.map(([v,e,l]) => (
        <div key={v} onClick={() => onChange(v)}
          style={{ background: value===v ? `rgba(${T.a.slice(1).match(/../g).map(x=>parseInt(x,16)).join(",")},0.12)` : T.bg, border:`1px solid ${value===v?T.a:T.border}`, borderRadius:8, padding:"8px 4px", cursor:"pointer", textAlign:"center", fontSize:11, color: value===v?T.a:"#7777a0", fontWeight: value===v?700:400, transition:"all 0.15s" }}>
          <div style={{ fontSize:16, marginBottom:3 }}>{e}</div>{l}
        </div>
      ))}
    </div>
  );
}

function MarketChip({ value, onChange, T }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
      {[["خليجية عملية وواثقة","🇸🇦","خليجي"],["مصرية حيوية وقريبة","🇪🇬","مصري"],["مغاربية مبسطة وعملية","🇲🇦","مغاربي"],["فصحى بيضاء للجميع","🌍","عام"]].map(([v,f,l]) => (
        <div key={v} onClick={() => onChange(v)}
          style={{ background: value===v ? `rgba(${T.a.slice(1).match(/../g).map(x=>parseInt(x,16)).join(",")},0.12)` : T.bg, border:`1px solid ${value===v?T.a:T.border}`, borderRadius:8, padding:"9px 3px", cursor:"pointer", textAlign:"center", fontSize:11, color: value===v?T.a:"#7777a0", fontWeight: value===v?700:400, transition:"all 0.15s" }}>
          <div style={{ fontSize:19, marginBottom:3 }}>{f}</div>{l}
        </div>
      ))}
    </div>
  );
}

function ToneMatrix({ values, onChange, T }) {
  const dialects = ["خليجي","مصري","مغاربي","فصحى"];
  const styles   = ["فاخر","شعبي","اقتصادي"];
  const moods    = ["عاجل","تثقيفي","عاطفي"];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {[["اللهجة", dialects, "dialect"],["النمط", styles, "style"],["الحالة", moods, "mood"]].map(([label,opts,key]) => (
        <div key={key}>
          <label style={{ fontSize:11, color:"#6666", display:"block", marginBottom:5 }}>{label}</label>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {opts.map(o => (
              <div key={o} onClick={() => onChange({ ...values, [key]:o })}
                style={{ background: values[key]===o ? T.glow : T.bg, border:`1px solid ${values[key]===o?T.a:T.border}`, borderRadius:7, padding:"5px 10px", cursor:"pointer", fontSize:12, color: values[key]===o?T.a:"#7777a0", fontWeight: values[key]===o?700:400, transition:"all 0.15s" }}>
                {o}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OutputSection({ text, onRegen, T, S, showToast, label="النتيجة" }) {
  if (!text) return null;
  const words = text.split(/\s+/).filter(Boolean).length;
  const copy = () => navigator.clipboard.writeText(text).then(() => showToast("تم النسخ ✓","success"));
  const exportTxt = () => {
    const b = new Blob([text], { type:"text/plain;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "zynor-content.txt"; a.click();
  };
  return (
    <div style={{ marginTop:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:T.a, letterSpacing:0.5 }}>⚔ {label}</span>
        <div style={{ display:"flex", gap:6 }}>
          <button style={{ ...S.smBtn, display:"flex", alignItems:"center", gap:5 }} onClick={copy}><Copy size={12}/> نسخ</button>
          <button style={{ ...S.smBtn, display:"flex", alignItems:"center", gap:5 }} onClick={onRegen}><RefreshCw size={12}/> إعادة</button>
          <button style={{ ...S.smBtn, display:"flex", alignItems:"center", gap:5 }} onClick={exportTxt}><Download size={12}/> تصدير</button>
        </div>
      </div>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"18px 20px", position:"relative", borderTop:`2px solid ${T.a}` }}>
        <div style={{ whiteSpace:"pre-wrap", lineHeight:1.85, fontSize:14, color:"#e4e4f0" }}>{text}</div>
        <div style={{ fontSize:10, color:"#5555", marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}`, display:"flex", gap:16 }}>
          <span>📝 {words} كلمة</span>
          <span>⚡ +{Math.floor(words/10)} نقطة مكتسبة</span>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ icon, title, accent, sub, T }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
      <span style={{ fontSize:26 }}>{icon}</span>
      <div>
        <div style={{ fontSize:20, fontWeight:800 }}>{title} <span style={{ color:T.a }}>{accent}</span></div>
        <div style={{ fontSize:12, color:"#5555" }}>{sub}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  WELCOME
// ═══════════════════════════════════════════════════════
function WelcomePanel({ T, S, streak, points, history, setPanel, apiKey }) {
  const tools = [
    ["ads","📢","كتابة الإعلانات","نصوص تبيع بروح عربية أصيلة"],
    ["seo","🔍","مقالات SEO","يفهم الاشتقاق ويتصدر جوجل"],
    ["social","⚡","السوشيال","لكل منصة بأسلوبها الخاص"],
    ["improve","✨","تحسين نص","حوّل البارد إلى حي"],
    ["resistance","🎯","رادار المقاومة","الميزة الحصرية الثورية"],
    ["roi","💰","مصفوفة الـ ROI","احسب أرباحك الحقيقية"],
  ];
  const totalWords = history.reduce((s,h) => s+(h.words||0), 0);

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      {!apiKey && (
        <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid #f87171", padding:"12px 16px", borderRadius:8, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, color:"#f87171", fontSize:13 }}>
            <AlertTriangle size={16} />
            <span>لم تقم بإدخال مفتاح Gemini API. الأداة لن تعمل بدون مفتاحك الخاص.</span>
          </div>
          <button onClick={() => setPanel("settings")} style={{ background:"#f87171", color:"#fff", border:"none", borderRadius:6, padding:"6px 12px", fontSize:11, cursor:"pointer", fontWeight:"bold" }}>الذهاب للإعدادات</button>
        </div>
      )}

      <div style={{ textAlign:"center", padding:"32px 0 24px" }}>
        <div style={{ fontSize:10, letterSpacing:5, color:T.a, marginBottom:10, textTransform:"uppercase" }}>⚔ الجيل الرابع — ZYNOR WRITE PRIME</div>
        <div style={{ fontSize:36, fontWeight:900, lineHeight:1.15, marginBottom:12, background:`linear-gradient(135deg,#e4e4f0,${T.a},#c9a84c)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          اكتب بروح.<br/>لا بترجمة.
        </div>
        <div style={{ fontSize:14, color:"#7777a0", maxWidth:480, margin:"0 auto" }}>
          نظام بيئي متكامل للمحتوى العربي — مدعوم بمحرك Gemini.
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:22 }}>
        {[["🔥", streak, "Streak"],["⚡", points, "نقطة"],["📝", history.length, "نص"],["🔤", totalWords>999?(totalWords/1000).toFixed(1)+"k":totalWords, "كلمة"]].map(([e,v,l]) => (
          <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontSize:20 }}>{e}</div>
            <div style={{ fontSize:20, fontWeight:900, color:T.a, fontFamily:"monospace" }}>{v}</div>
            <div style={{ fontSize:10, color:"#5555", marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {tools.map(([id,icon,title,desc]) => (
          <div key={id} onClick={() => setPanel(id)}
            style={{ background:T.surface, border:`1px solid ${id==="resistance"?T.a:T.border}`, borderRadius:13, padding:"18px 14px", cursor:"pointer", textAlign:"center", transition:"all 0.2s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=T.a; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 24px ${T.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=id==="resistance"?T.a:T.border; e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
            {id==="resistance" && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${T.a},transparent)` }} />}
            <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#e4e4f0", marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:11, color:"#5555", lineHeight:1.5 }}>{desc}</div>
            {id==="resistance" && <div style={{ marginTop:8, fontSize:10, color:T.a, fontWeight:700 }}>★ حصري</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ZEN EDITOR
// ═══════════════════════════════════════════════════════
function ZenEditor({ T, S, apiKey, showToast, addHistory }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const words = text.split(/\s+/).filter(Boolean).length;
  const improve = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await askGemini(`أنت محرر بلاغي عربي. حسّن هذا النص بروح عربية حقيقية دون تعليق أو مقدمات:\n\n${text}`, apiKey);
      setText(r); addHistory({ type:"زن", title: text.slice(0,40), content:r });
      showToast("تم التحسين ✓","success");
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };
  return (
    <div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="اكتب هنا... المساحة لك وحدك." autoFocus
        style={{ ...S.ta, minHeight:380, fontSize:16, lineHeight:2, background:"transparent", border:"none", borderBottom:`1px solid ${T.border}`, borderRadius:0, padding:"0 0 16px", color:"#d4d4e8", outline:"none", resize:"none" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16 }}>
        <span style={{ fontSize:11, color:"#4444" }}>{words} كلمة</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => navigator.clipboard.writeText(text).then(()=>showToast("تم ✓","success"))} style={S.smBtn}><Copy size={13}/></button>
          <button onClick={improve} disabled={loading} style={{ ...S.smBtn, color: loading?"#555":T.a, borderColor: T.a }}>{loading?"...":"✨ حسّن"}</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ADS PANEL
// ═══════════════════════════════════════════════════════
function AdsPanel({ T, S, apiKey, showToast, addHistory, persona }) {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [benefits, setBenefits] = useState("");
  const [fw, setFw] = useState("AIDA");
  const [tone, setTone] = useState("حماسية ومحفزة");
  const [toneMatrix, setToneMatrix] = useState({ dialect:"خليجي", style:"فاخر", mood:"عاجل" });
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const personaPrefix = {
    shadow: "",
    advisor: "قبل الكتابة: فكر في الدافع العاطفي الأعمق للمشتري.\n",
    general: "اكتب كأن الفشل في الإقناع ليس خياراً. كل كلمة سلاح.\n",
  }[persona] || "";

  const generate = async () => {
    if (!product.trim()) { showToast("أدخل اسم المنتج","error"); return; }
    setLoading(true); setOutput("");
    try {
      const prompt = `${personaPrefix}أنت كاتب إعلانات عربي يكتب بروح بلاغية لا بترجمة غربية.
اكتب نصاً إعلانياً بإطار ${fw}:
المنتج: ${product} | الجمهور: ${audience||"عام"} | المزايا: ${benefits||"غير محددة"}
اللهجة: ${toneMatrix.dialect} | النمط: ${toneMatrix.style} | الحالة: ${toneMatrix.mood}
النبرة: ${tone}
اجعل النص يدفع للفعل الآن. أعطني النص مباشرة دون مقدمات.`;
      const r = await askGemini(prompt, apiKey);
      setOutput(r); addHistory({ type:"إعلان", title:product, content:r });
      showToast("تم الكتابة ✓","success");
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:820 }}>
      <PanelHeader icon="📢" title="كتابة" accent="الإعلانات" sub="نصوص تبيع — بروح عربية، لا بترجمة غربية" T={T} />
      <div style={S.card}>
        <div style={S.cardTitle}>بيانات المنتج</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><label style={S.label}>* المنتج أو الخدمة</label><input style={S.inp} value={product} onChange={e=>setProduct(e.target.value)} placeholder="مثال: كورس التسويق الرقمي" /></div>
          <div><label style={S.label}>الجمهور المستهدف</label><input style={S.inp} value={audience} onChange={e=>setAudience(e.target.value)} placeholder="مثال: شباب 18-30 يريدون دخلاً إضافياً" /></div>
          <div><label style={S.label}>المزايا الرئيسية</label><textarea style={S.ta} value={benefits} onChange={e=>setBenefits(e.target.value)} placeholder="3 نقاط على الأقل..." rows={3} /></div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>🎭 مصفوفة النبرات ثلاثية الأبعاد</div>
        <ToneMatrix values={toneMatrix} onChange={setToneMatrix} T={T} />
        <div style={{ marginTop:14 }}>
          <label style={S.label}>إطار الإقناع</label>
          <ToneChip options={[["AIDA","⚡","AIDA"],["PAS","🔥","PAS"],["4U","💎","4U"]]} value={fw} onChange={setFw} T={T} />
        </div>
        <div style={{ marginTop:14 }}>
          <label style={S.label}>النبرة العاطفية</label>
          <ToneChip options={[["حماسية ومحفزة","🔥","حماسية"],["عاطفية ومؤثرة","💙","عاطفية"],["مباشرة وصريحة","⚔","مباشرة"],["مثيرة للفضول","🌀","فضولية"],["فكاهية وخفيفة","😄","فكاهية"],["احترافية وموثوقة","👔","احترافية"]]} value={tone} onChange={setTone} T={T} />
        </div>
      </div>
      <button style={S.btn(loading)} onClick={generate} disabled={loading}>{loading?"⚔ يكتب ZYNOR...":"⚔ اكتب الإعلان الآن"}</button>
      <OutputSection text={output} onRegen={generate} T={T} S={S} showToast={showToast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SEO PANEL
// ═══════════════════════════════════════════════════════
function SEOPanel({ T, S, apiKey, showToast, addHistory }) {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [len, setLen] = useState("متوسط (800-1200 كلمة)");
  const [style, setStyle] = useState("تعليمي محترف");
  const [market, setMarket] = useState("خليجية عملية وواثقة");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [heatmap, setHeatmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hloading, setHloading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) { showToast("أدخل الموضوع","error"); return; }
    setLoading(true); setOutput(""); setHeatmap(null);
    try {
      const r = await askGemini(`أنت كاتب SEO عربي يفهم الاشتقاق — "تسويق" و"للتسويق" جذر واحد.
اكتب مقالاً SEO:
الموضوع: ${topic} | الكلمة المفتاحية: ${keyword||"غير محددة"} | الطول: ${len} | الأسلوب: ${style} | السوق: ${market}
${notes?"ملاحظات: "+notes:""}
هيكل: H1 جذاب، مقدمة قوية، H2 منطقية، توزيع طبيعي للكلمات، خاتمة تفاعلية. قدم المقال مباشرة.`, apiKey);
      setOutput(r); addHistory({ type:"مقال SEO", title:topic, content:r });
      showToast("تم الكتابة ✓","success");
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  const analyzeHeatmap = async () => {
    if (!output) { showToast("اكتب المقال أولاً","error"); return; }
    setHloading(true);
    try {
      const r = await askGemini(`حلّل هذا النص من منظور SEO عربي. أرجع JSON فقط بهذا الهيكل حصراً:
{"strong":["كلمة1","كلمة2"],"stuffed":["كلمة3"],"opportunities":["كلمة4","كلمة5"]}
النص: ${output.slice(0,600)}`, apiKey, true);
      const clean = r.replace(/```json|```/g,"").trim();
      setHeatmap(JSON.parse(clean));
      showToast("تم تحليل الـ SEO ✓","success");
    } catch(e) { showToast("تعذّر التحليل، حاول مجدداً","error"); }
    finally { setHloading(false); }
  };

  return (
    <div style={{ maxWidth:820 }}>
      <PanelHeader icon="🔍" title="مقالات" accent="SEO" sub="محتوى يفهم الاشتقاق ويتصدر جوجل" T={T} />
      <div style={S.card}>
        <div style={S.cardTitle}>موضوع المقال</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><label style={S.label}>* الموضوع</label><input style={S.inp} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="مثال: كيف تبدأ التسويق بالعمولة" /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={S.label}>الكلمة المفتاحية</label><input style={S.inp} value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="مثال: التسويق بالعمولة" /></div>
            <div><label style={S.label}>الطول</label>
              <select style={S.sel} value={len} onChange={e=>setLen(e.target.value)}>
                <option>قصير (400-600 كلمة)</option>
                <option>متوسط (800-1200 كلمة)</option>
                <option>طويل (1500-2500 كلمة)</option>
              </select>
            </div>
          </div>
          <div><label style={S.label}>ملاحظات</label><textarea style={S.ta} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="نقاط تريد التركيز عليها..." rows={2} /></div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>الأسلوب والسوق</div>
        <div style={{ marginBottom:12 }}>
          <label style={S.label}>أسلوب الكتابة</label>
          <ToneChip options={[["تعليمي محترف","📚","تعليمي"],["قصصي سردي","📖","قصصي"],["تحليلي عميق","🔬","تحليلي"]]} value={style} onChange={setStyle} T={T} />
        </div>
        <div><label style={S.label}>السوق</label><MarketChip value={market} onChange={setMarket} T={T} /></div>
      </div>
      <button style={S.btn(loading)} onClick={generate} disabled={loading}>{loading?"🔍 يكتب ZYNOR...":"🔍 اكتب المقال الآن"}</button>

      {output && (
        <>
          <OutputSection text={output} onRegen={generate} T={T} S={S} showToast={showToast} />
          {/* SEO Heatmap */}
          <div style={{ marginTop:16, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:700, color:T.a }}>🌡️ خريطة SEO الحرارية</span>
              <button onClick={analyzeHeatmap} disabled={hloading} style={{ ...S.smBtn, color:T.a, borderColor:T.a }}>{hloading?"تحليل...":"تحليل الآن"}</button>
            </div>
            {heatmap ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[["جذور قوية 💚","strong","#4ade80"],["كلمات محشوة ❌","stuffed","#f87171"],["فرص مفقودة 💛","opportunities","#fbbf24"]].map(([label,key,color]) => (
                  <div key={key}>
                    <div style={{ fontSize:11, color:"#6666", marginBottom:5 }}>{label}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {(heatmap[key]||[]).map(w => <span key={w} style={{ background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:6, padding:"3px 9px", fontSize:12 }}>{w}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize:12, color:"#5555", textAlign:"center", padding:"10px 0" }}>اضغط "تحليل الآن" لرؤية الخريطة الحرارية</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SOCIAL PANEL
// ═══════════════════════════════════════════════════════
function SocialPanel({ T, S, apiKey, showToast, addHistory }) {
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState("انستغرام");
  const [type, setType] = useState("تحفيزي وملهم");
  const [market, setMarket] = useState("خليجية عملية وواثقة");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!idea.trim()) { showToast("أدخل الفكرة","error"); return; }
    setLoading(true); setOutput("");
    try {
      const r = await askGemini(`خبير محتوى سوشيال عربي. قواعد المنصات: تويتر→إيجاز وجرأة | انستغرام→قصة وعاطفة | لينكدإن→قيمة مهنية.
اكتب محتوى ${type} لـ${platform}. السوق: ${market}.
الفكرة: ${idea}
${platform==="جميع المنصات"?"اكتب نسخة لكل منصة.":"اكتب منشوراً واحداً قوياً مع هاشتاقات وCTA."} أعطني النص مباشرة.`, apiKey);
      setOutput(r); addHistory({ type:"سوشيال "+platform, title:idea.slice(0,40), content:r });
      showToast("تم ✓","success");
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:820 }}>
      <PanelHeader icon="⚡" title="محتوى" accent="السوشيال" sub="منشورات تشعل التفاعل — لكل منصة بأسلوبها" T={T} />
      <div style={S.card}>
        <div style={S.cardTitle}>فكرة المنشور</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><label style={S.label}>* الفكرة الأساسية</label><textarea style={S.ta} value={idea} onChange={e=>setIdea(e.target.value)} placeholder="مثال: منشور يشجع الشباب على الفريلانس..." rows={3} /></div>
          <div><label style={S.label}>المنصة</label><ToneChip options={[["انستغرام","📸","انستغرام"],["تويتر/X","🐦","تويتر"],["لينكدإن","💼","لينكدإن"],["تيك توك","🎵","تيك توك"],["فيسبوك","👥","فيسبوك"],["جميع المنصات","🌐","الكل"]]} value={platform} onChange={setPlatform} T={T} /></div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>النبرة والسوق</div>
        <div style={{ marginBottom:12 }}><label style={S.label}>نوع المحتوى</label><ToneChip options={[["تحفيزي وملهم","🚀","تحفيزي"],["تعليمي وقيمي","💡","تعليمي"],["قصة شخصية","🧠","قصة"],["استفزازي","🔥","استفزازي"],["ترفيهي خفيف","😄","ترفيهي"],["إخباري","📣","إخباري"]]} value={type} onChange={setType} T={T} /></div>
        <div><label style={S.label}>السوق</label><MarketChip value={market} onChange={setMarket} T={T} /></div>
      </div>
      <button style={S.btn(loading)} onClick={generate} disabled={loading}>{loading?"⚡ يكتب...":"⚡ اكتب المنشور الآن"}</button>
      <OutputSection text={output} onRegen={generate} T={T} S={S} showToast={showToast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  IMPROVE PANEL
// ═══════════════════════════════════════════════════════
function ImprovePanel({ T, S, apiKey, showToast, addHistory }) {
  const [input, setInput] = useState("");
  const [type, setType] = useState("روح عربية بلاغية");
  const [market, setMarket] = useState("خليجية عملية وواثقة");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const TYPES = { "روح عربية بلاغية":"أضف روحاً بلاغية عربية حقيقية", "أسلوب مبيعات":"أعد الكتابة بأسلوب مقنع يحقق مبيعات", "تحسين SEO":"حسّن للـ SEO مع قراءة سلسة", "تكثيف وإيجاز":"احذف الحشو وابقِ الجوهر", "تأثير عاطفي":"اجعله أكثر تأثيراً عاطفياً", "إعادة صياغة":"أعد الصياغة بالكامل مع الحفاظ على المعنى" };
  const generate = async () => {
    if (!input.trim()) { showToast("الصق النص أولاً","error"); return; }
    setLoading(true); setOutput("");
    try {
      const r = await askGemini(`محرر لغوي عربي. مهمتك: ${TYPES[type]||type}. السوق: ${market}. أعطِ النص المحسّن مباشرة بلا تعليق.\n\nالنص:\n${input}`, apiKey);
      setOutput(r); addHistory({ type:"تحسين", title:input.slice(0,40), content:r });
      showToast("تم التحسين ✓","success");
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ maxWidth:820 }}>
      <PanelHeader icon="✨" title="تحسين" accent="نص" sub="الصق أي نص وحوّله إلى تحفة لغوية عربية" T={T} />
      <div style={S.card}><div style={S.cardTitle}>النص الأصلي</div><textarea style={{ ...S.ta, minHeight:140 }} value={input} onChange={e=>setInput(e.target.value)} placeholder="الصق هنا أي نص — إعلان، مقال، منشور..." /></div>
      <div style={S.card}>
        <div style={S.cardTitle}>نوع التحسين</div>
        <ToneChip options={[["روح عربية بلاغية","🔥","روح عربية"],["أسلوب مبيعات","💰","مبيعات"],["تحسين SEO","🔍","SEO"],["تكثيف وإيجاز","✂️","تكثيف"],["تأثير عاطفي","💙","عاطفي"],["إعادة صياغة","🔄","إعادة صياغة"]]} value={type} onChange={setType} T={T} />
        <div style={{ marginTop:14 }}><label style={S.label}>السوق</label><MarketChip value={market} onChange={setMarket} T={T} /></div>
      </div>
      <button style={S.btn(loading)} onClick={generate} disabled={loading}>{loading?"✨ يحسّن...":"✨ حسّن النص الآن"}</button>
      <OutputSection text={output} onRegen={generate} T={T} S={S} showToast={showToast} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ★ RESISTANCE RADAR
// ═══════════════════════════════════════════════════════
function ResistancePanel({ T, S, apiKey, showToast }) {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [radarScore, setRadarScore] = useState(null);

  const analyze = async () => {
    if (!input.trim() || input.length < 30) { showToast("أدخل نصاً لا يقل عن 30 حرفاً","error"); return; }
    setLoading(true); setAnalysis(null);
    try {
      const r = await askGemini(`أنت عالم نفس سلوكي متخصص في ثقة المستهلك العربي.
حلّل هذا النص البيعي وأرجع JSON فقط بلا markdown ولا نصوص إضافية:
{
  "doubt_triggers": [{"word":"الكلمة","reason":"سبب الشك","anchor":"البديل الموثوق"}],
  "trust_score": 0_to_100,
  "aggression_score": 0_to_100,
  "trust_score_label": "نص واثق/نص مشكوك فيه/نص عدواني",
  "summary": "ملخص قصير بالعربية",
  "recommendations": ["توصية1","توصية2","توصية3"]
}
النص: ${input}`, apiKey, true);
      const clean = r.replace(/```json|```/g,"").trim();
      const data = JSON.parse(clean);
      setAnalysis(data);
      setRadarScore({ trust: data.trust_score, aggression: data.aggression_score });
      showToast("تم تحليل المقاومة النفسية ✓","success");
    } catch(e) { showToast("خطأ في التحليل — حاول مجدداً","error"); console.error(e); }
    finally { setLoading(false); }
  };

  const renderHighlighted = () => {
    if (!analysis?.doubt_triggers?.length) return <span style={{ whiteSpace:"pre-wrap" }}>{input}</span>;
    let result = input;
    const parts = [];
    let lastIndex = 0;
    const triggers = analysis.doubt_triggers.filter(t => t.word && input.includes(t.word));
    const sorted = [...triggers].sort((a,b) => input.indexOf(a.word) - input.indexOf(b.word));
    sorted.forEach(({ word, reason, anchor }) => {
      const idx = result.indexOf(word, lastIndex);
      if (idx === -1) return;
      if (idx > lastIndex) parts.push(<span key={lastIndex}>{result.slice(lastIndex, idx)}</span>);
      parts.push(
        <span key={`t-${idx}`} title={`⚠️ ${reason}\n✅ بديل: ${anchor}`}
          style={{ background:"rgba(248,113,113,0.25)", color:"#f87171", borderBottom:"2px solid #f87171", borderRadius:3, padding:"1px 3px", cursor:"help" }}>
          {word}
        </span>
      );
      lastIndex = idx + word.length;
    });
    if (lastIndex < input.length) parts.push(<span key="end">{input.slice(lastIndex)}</span>);
    return <>{parts}</>;
  };

  const RadarMeter = ({ trust, aggression }) => {
    const pos = Math.max(0, Math.min(100, 50 + (trust - aggression) / 2));
    const color = pos > 65 ? "#4ade80" : pos > 40 ? "#fbbf24" : "#f87171";
    return (
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#6666", marginBottom:6 }}>
          <span>⚔️ بيع عدواني</span>
          <span style={{ color, fontWeight:700 }}>{pos > 65 ? "ثقة ضمنية" : pos > 40 ? "توازن حذر" : "مقاومة عالية"}</span>
          <span>🤝 ثقة ضمنية</span>
        </div>
        <div style={{ height:10, background:T.bg, borderRadius:5, border:`1px solid ${T.border}`, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#f87171,#fbbf24,#4ade80)" }} />
          <div style={{ position:"absolute", top:-2, bottom:-2, width:14, height:14, background:"#fff", borderRadius:"50%", border:"2px solid #0a0a0f", left:`calc(${pos}% - 7px)`, transition:"left 0.5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, gap:8 }}>
          <div style={{ flex:1, background:T.bg, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:900, color:"#4ade80" }}>{trust}</div>
            <div style={{ fontSize:10, color:"#5555" }}>مؤشر الثقة</div>
          </div>
          <div style={{ flex:1, background:T.bg, borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ fontSize:18, fontWeight:900, color:"#f87171" }}>{aggression}</div>
            <div style={{ fontSize:10, color:"#5555" }}>مؤشر العدوانية</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth:860 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
        <span style={{ fontSize:26 }}>🎯</span>
        <div>
          <div style={{ fontSize:20, fontWeight:800 }}>رادار <span style={{ color:T.a }}>تفكيك المقاومة</span></div>
          <div style={{ fontSize:12, color:"#5555" }}>الميزة الحصرية الثورية — لا يوجد مثيلها في السوق العربي</div>
        </div>
        <div style={{ marginRight:"auto", background:T.glow, border:`1px solid ${T.a}`, borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:700, color:T.a }}>★ حصري</div>
      </div>

      <div style={{ background:T.glow, border:`1px solid ${T.a}33`, borderRadius:10, padding:"12px 16px", marginBottom:16, fontSize:12, color:"#aaaacc", lineHeight:1.7 }}>
        <strong style={{ color:T.a }}>ما هذا؟</strong> السوق العربي يفتقر للثقة في الإعلانات. هذا الرادار يكتشف <span style={{ color:"#f87171" }}>محفزات الشك</span> (كلمات تثير عناد القارئ) ويقترح <span style={{ color:"#4ade80" }}>مراسي الثقة</span> (كلمات تبني الأمان).
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>النص المراد تحليله</div>
        <textarea style={{ ...S.ta, minHeight:120 }} value={input} onChange={e=>setInput(e.target.value)} placeholder="الصق نصك الإعلاني أو البيعي هنا..." />
      </div>

      <button style={S.btn(loading)} onClick={analyze} disabled={loading}>
        {loading ? "🎯 يحلل ZYNOR المقاومة النفسية..." : "🎯 شغّل رادار المقاومة"}
      </button>

      {analysis && (
        <div style={{ marginTop:18 }}>
          <div style={{ ...S.card, borderTop:`2px solid ${T.a}` }}>
            <div style={S.cardTitle}>📡 مقياس اليقين</div>
            {radarScore && <RadarMeter trust={radarScore.trust} aggression={radarScore.aggression} />}
            <div style={{ fontSize:13, color:"#9999bb", lineHeight:1.7, padding:"10px 12px", background:T.bg, borderRadius:8 }}>
              <strong style={{ color:T.a }}>التقييم:</strong> {analysis.trust_score_label}<br/>
              {analysis.summary}
            </div>
          </div>

          {analysis.doubt_triggers?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>⚠️ النص مع تظليل محفزات الشك (مرّر على الأحمر)</div>
              <div style={{ background:T.bg, borderRadius:8, padding:"14px 16px", fontSize:14, lineHeight:1.85, direction:"rtl" }}>
                {renderHighlighted()}
              </div>
            </div>
          )}

          {analysis.doubt_triggers?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>🔄 جدول مراسي الثقة</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {analysis.doubt_triggers.map((t,i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1.5fr 1fr", gap:10, background:T.bg, borderRadius:8, padding:"10px 12px", fontSize:12 }}>
                    <div style={{ color:"#f87171" }}>❌ <strong>{t.word}</strong></div>
                    <div style={{ color:"#8888a8" }}>↳ {t.reason}</div>
                    <div style={{ color:"#4ade80" }}>✅ {t.anchor}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations?.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>💡 توصيات بناء الثقة</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {analysis.recommendations.map((r,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", fontSize:13, color:"#9999bb" }}>
                    <CheckCircle size={14} style={{ color:"#4ade80", marginTop:2, flexShrink:0 }} />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ROI PANEL
// ═══════════════════════════════════════════════════════
function ROIPanel({ T, S }) {
  const [visits, setVisits] = useState(1000);
  const [ctr, setCtr] = useState(3);
  const [conv, setConv] = useState(2);
  const [price, setPrice] = useState(100);
  const [adCost, setAdCost] = useState(200);

  const clicks = Math.round(visits * ctr / 100);
  const sales = Math.round(clicks * conv / 100);
  const revenue = sales * price;
  const profit = revenue - adCost;
  const roi = adCost > 0 ? ((profit / adCost) * 100).toFixed(1) : 0;
  const profitColor = profit > 0 ? "#4ade80" : "#f87171";

  const Slider = ({ label, value, setValue, min, max, step=1, suffix="" }) => (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <label style={S.label}>{label}</label>
        <span style={{ fontSize:13, fontWeight:700, color:T.a }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>setValue(Number(e.target.value))}
        style={{ width:"100%", accentColor:T.a }} />
    </div>
  );

  return (
    <div style={{ maxWidth:760 }}>
      <PanelHeader icon="💰" title="مصفوفة" accent="الـ ROI" sub="محاكاة حساب عائد الاستثمار الفعلي" T={T} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={S.card}>
          <div style={S.cardTitle}>متغيرات الحملة</div>
          <Slider label="الزيارات / الظهور" value={visits} setValue={setVisits} min={100} max={100000} step={100} />
          <Slider label="معدل النقر CTR" value={ctr} setValue={setCtr} min={0.1} max={20} step={0.1} suffix="%" />
          <Slider label="معدل التحويل" value={conv} setValue={setConv} min={0.1} max={20} step={0.1} suffix="%" />
          <Slider label="متوسط قيمة الطلب ($)" value={price} setValue={setPrice} min={1} max={2000} step={1} suffix="$" />
          <Slider label="تكلفة الإعلان ($)" value={adCost} setValue={setAdCost} min={0} max={10000} step={10} suffix="$" />
        </div>
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[["النقرات",clicks,"🖱️"],["المبيعات",sales,"🛒"],["الإيراد","$"+revenue,"💵"],["تكلفة الإعلان","$"+adCost,"📢"]].map(([l,v,e]) => (
              <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 10px", textAlign:"center" }}>
                <div style={{ fontSize:18 }}>{e}</div>
                <div style={{ fontSize:18, fontWeight:900, color:T.a, fontFamily:"monospace" }}>{v}</div>
                <div style={{ fontSize:10, color:"#5555", marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background:T.surface, border:`2px solid ${profitColor}`, borderRadius:12, padding:"18px", textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#6666", marginBottom:8 }}>صافي الربح</div>
            <div style={{ fontSize:36, fontWeight:900, color:profitColor, fontFamily:"monospace" }}>${profit}</div>
            <div style={{ marginTop:10, display:"flex", justifyContent:"center", gap:16 }}>
              <div><div style={{ fontSize:20, fontWeight:900, color:profitColor }}>{roi}%</div><div style={{ fontSize:10, color:"#5555" }}>ROI</div></div>
              <div><div style={{ fontSize:20, fontWeight:900, color:T.a }}>${adCost>0?(revenue/adCost).toFixed(2):0}</div><div style={{ fontSize:10, color:"#5555" }}>ROAS</div></div>
            </div>
            <div style={{ marginTop:12, fontSize:12, color:"#7777a0", lineHeight:1.6 }}>
              {profit > 0 ? `✅ لكل دولار تنفقه تربح $${(revenue/Math.max(adCost,1)).toFixed(2)}` : "⚠️ الحملة خاسرة حالياً — حسّن معدل التحويل أو قلل التكاليف"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  HISTORY
// ═══════════════════════════════════════════════════════
function HistoryPanel({ T, S, history, setHistory, showToast }) {
  const del = (id) => { const n=[...history.filter(h=>h.id!==id)]; setHistory(n); localStorage.setItem("zw4_hist",JSON.stringify(n)); };
  const clear = () => { if(!window.confirm("مسح كل السجل؟"))return; setHistory([]); localStorage.removeItem("zw4_hist"); showToast("تم المسح","success"); };
  return (
    <div style={{ maxWidth:820 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <PanelHeader icon="🕐" title="سجل" accent="الإنتاج" sub="كل ما كتبه ZYNOR لك محفوظ هنا" T={T} />
        {history.length>0 && <button style={{ ...S.smBtn, color:"#f87171" }} onClick={clear}>مسح الكل</button>}
      </div>
      {!history.length
        ? <div style={{ textAlign:"center", padding:"60px 0", color:"#5555" }}><div style={{ fontSize:40 }}>📭</div><div style={{ marginTop:12 }}>لا يوجد سجل بعد</div></div>
        : history.map(item => (
          <div key={item.id} style={{ ...S.card, marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:T.a, background:T.glow, padding:"2px 8px", borderRadius:8 }}>{item.type}</span>
              <span style={{ fontSize:10, color:"#5555" }}>{item.date} · {item.words} كلمة</span>
            </div>
            <div style={{ fontSize:13, color:"#7777a0", marginBottom:6 }}>{item.title}</div>
            <div style={{ fontSize:12, color:"#5555", lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{item.content}</div>
            <div style={{ display:"flex", gap:8, marginTop:10 }}>
              <button style={S.smBtn} onClick={() => navigator.clipboard.writeText(item.content).then(()=>showToast("تم النسخ ✓","success"))}>نسخ</button>
              <button style={{ ...S.smBtn, color:"#f87171" }} onClick={()=>del(item.id)}>حذف</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SETTINGS (مع مفتاح API)
// ═══════════════════════════════════════════════════════
function SettingsPanel({ T, S, tk, setTk, apiKey, setApiKey, showToast }) {
  const saveKey = (val) => {
    setApiKey(val);
    localStorage.setItem("zw4_gemini_key", val);
  };

  return (
    <div style={{ maxWidth:600 }}>
      <PanelHeader icon="⚙️" title="إعدادات" accent="ZYNOR" sub="شخّص تجربتك وأضف محرك الذكاء الاصطناعي" T={T} />
      
      {/* API KEY SECTION */}
      <div style={{ ...S.card, borderTop: `2px solid ${apiKey ? "#4ade80" : "#f87171"}` }}>
        <div style={{ ...S.cardTitle, color: apiKey ? "#4ade80" : "#f87171", display:"flex", alignItems:"center", gap:8 }}>
          <Key size={16} /> 
          {apiKey ? "المحرك متصل وجاهز" : "مطلوب: مفتاح Gemini API"}
        </div>
        <div style={{ fontSize:12, color:"#7777a0", lineHeight:1.7, marginBottom:16 }}>
          لكي تعمل الأداة مجاناً، يجب إدخال مفتاح <strong>Gemini API</strong> الخاص بك. 
          يتم حفظ المفتاح بشكل آمن ومحلي في متصفحك فقط.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <input 
            type="password" 
            style={{ ...S.inp, flex:1 }} 
            value={apiKey} 
            onChange={(e) => saveKey(e.target.value)} 
            placeholder="AIzaSyB................................" 
          />
        </div>
        <div style={{ fontSize:10, color:"#5555", marginTop:10 }}>
          * للحصول على مفتاح مجاني، ابحث عن <strong>Google AI Studio</strong> واضغط على Create API Key.
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>🎨 الثيم البصري</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {Object.entries(THEMES).map(([k,v]) => (
            <div key={k} onClick={()=>setTk(k)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:v.a2, border:`3px solid ${tk===k?"#fff":v.border}`, transition:"all 0.2s" }} />
              <span style={{ fontSize:11, color:tk===k?"#e4e4f0":"#5555" }}>{v.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>ℹ️ حول ZYNOR WRITE</div>
        <div style={{ fontSize:13, color:"#7777a0", lineHeight:1.9 }}>
          <div>الإصدار: <span style={{color:T.a}}>V4.0 — النظام البيئي</span></div>
          <div>المحرك: <span style={{color:T.a}}>Google Gemini 1.5 Flash</span></div>
          <div>الميزة الحصرية: <span style={{color:T.a}}>رادار تفكيك المقاومة النفسية</span></div>
          <div>الهيكلة: <span style={{color:T.a}}>BYOK (استضافة مجانية كاملة)</span></div>
          <div style={{ marginTop:12, padding:"10px 14px", background:T.bg, borderRadius:8, fontSize:11, color:"#5555", lineHeight:1.7 }}>
            ⚔ ZYNOR WRITE — سلاح لغوي عربي من الجيل الرابع.<br/>يكتب بروح. لا بترجمة.
          </div>
        </div>
      </div>
    </div>
  );
}
