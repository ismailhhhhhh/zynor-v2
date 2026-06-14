import React, { useState, useEffect, useCallback } from "react";
import { Zap, FileText, Megaphone, Search, Share2, Sparkles, Crosshair, BarChart2, History, Settings, Key, AlertTriangle, Shield, Moon, Brain, Sword, EyeOff, Eye, Copy, RefreshCw, TrendingUp, BookOpen, MapPin, Users } from "lucide-react";

if (typeof window === 'undefined') {
  global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
}

// ═══════════════════════════════════════════════════════
//  GEMINI API ENGINE
// ═══════════════════════════════════════════════════════
async function askGemini(prompt, apiKey) {
  if (!apiKey || apiKey.trim() === "") throw new Error("يرجى إدخال مفتاح API الخاص بـ Gemini أولاً.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey.trim()}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`خطأ سيرفر: ${response.status}`);
    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) return data.candidates[0].content.parts[0].text;
    throw new Error("لم يتم العثور على رد مدعوم.");
  } catch (error) { console.error("API Error:", error); throw error; }
}

// ═══════════════════════════════════════════════════════
//  3D ICONOGRAPHY ASSETS LINKS (STABLE CDN)
// ═══════════════════════════════════════════════════════
const ASSETS3D = {
  sphere: "https://raw.githubusercontent.com/gndx/3d-icons-pack/main/png/purple-sphere.png", // الكرة البنفسجية الزجاجية لـ Living Text
  brain: "https://raw.githubusercontent.com/gndx/3d-icons-pack/main/png/blue-brain.png",   // دماغ هيدروغرام أزرق لمحرك الذكاء
  pen: "https://raw.githubusercontent.com/gndx/3d-icons-pack/main/png/cyber-pen.png",       // قلم معدني ثلاثي أبعاد لأداة الكتابة
  ui: "https://raw.githubusercontent.com/gndx/3d-icons-pack/main/png/glass-ui.png",         // واجهة تحكم زجاجية ثلاثية أبعاد
  hand: "https://raw.githubusercontent.com/gndx/3d-icons-pack/main/png/robotic-hand.png"   // اليد الروبوتية للتفاصيل الخارقة
};

export default function App() {
  const [panel, setPanel] = useState("welcome");
  const [zenMode, setZenMode] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("zw4_gemini_key") || "");
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("zw4_hist") || "[]"); } catch { return []; } });
  const [streak] = useState(() => parseInt(localStorage.getItem("zw4_streak") || "0"));
  const [points, setPoints] = useState(() => parseInt(localStorage.getItem("zw4_pts") || "0"));
  const [shields] = useState(() => parseInt(localStorage.getItem("zw4_shields") || "1"));
  const [persona, setPersona] = useState("shadow");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const addHistory = useCallback((item) => {
    const next = [{ ...item, id: Date.now(), date: new Date().toLocaleDateString("ar-SA"), words: item.content.split(/\s+/).filter(Boolean).length }, ...history].slice(0, 60);
    setHistory(next);
    localStorage.setItem("zw4_hist", JSON.stringify(next));
  }, [history]);

  // ═══════════════════════════════════════════════════════
  //  THE DNA OF THE INTERFACE (CSS OBJECT STYLES)
  // ═══════════════════════════════════════════════════════
  const S = {
    app: { minHeight: "100vh", background: "#0A0A1A", color: "#F3F4F6", fontFamily: "'Cairo', 'Inter', sans-serif", direction: "rtl", display: "flex", flexDirection: "column", overflowX: "hidden" },
    topbar: { background: "rgba(10, 10, 26, 0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", padding: "0 32px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
    body: { display: "flex", flex: 1 },
    sidebar: { width: 280, background: "rgba(13, 13, 26, 0.4)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", flexDirection: "column" },
    main: { flex: 1, padding: "50px 60px", position: "relative" },
    
    // Hyper-Realistic Glassmorphism Card Style
    glassCard: {
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "24px",
      padding: "32px",
      marginBottom: "24px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -2px 10px rgba(139, 92, 246, 0.05)",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
    },
    
    // Borders as Vertical Accent Pillars (Slide 3 & 4)
    verticalBorderTitle: {
      borderRight: "4px solid #8B5CF6",
      paddingRight: "16px",
      fontSize: "20px",
      fontWeight: "800",
      color: "#FFFFFF",
      marginBottom: "24px"
    },
    
    // Form Elements
    inp: { width: "100%", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", color: "#FFF", fontSize: "14px", outline: "none", transition: "all 0.3s" },
    ta: { width: "100%", background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px", padding: "18px", color: "#FFF", fontSize: "14px", outline: "none", resize: "vertical", minHeight: "130px", lineHeight: "1.8", transition: "all 0.3s" },
    
    // Glowing Action Button
    btn: (disabled) => ({
      width: "100%",
      background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
      border: "none",
      borderRadius: "16px",
      padding: "18px",
      color: disabled ? "#A0AEC0" : "#FFF",
      fontSize: "16px",
      fontWeight: "800",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : "0 12px 30px rgba(139, 92, 246, 0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      marginTop: "16px"
    }),
    
    navItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "14px 24px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: active ? "800" : "600",
      color: active ? "#FFFFFF" : "#A0AEC0",
      background: active ? "rgba(139, 92, 246, 0.12)" : "transparent",
      borderRight: active ? "4px solid #8B5CF6" : "4px solid transparent",
      transition: "all 0.2s ease"
    }),
    label: { fontSize: "13px", fontWeight: "700", color: "#A0AEC0", marginBottom: "8px", display: "block" }
  };

  if (zenMode) return (
    <div style={{ ...S.app, alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: 800, width: "100%", padding: 20 }}>
        <button onClick={() => setZenMode(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFF", padding: "10px 20px", borderRadius: "12px", cursor: "pointer", marginBottom: "20px" }}>الخروج من وضع الزن 👁️</button>
        <textarea style={{ ...S.ta, minHeight: 450, fontSize: "18px", background: "rgba(255,255,255,0.02)" }} placeholder="اكتب نبرتك الصافية هنا..." />
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      {/* Dynamic 3D Environment Injecting Styles & Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&family=Inter:wght@400;700;800;900&display=swap');
        
        /* Ambient Cosmic Glows */
        .cosmic-glow-top {
          position: fixed; width: 600px; height: 600px; top: -150px; left: -150px;
          background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
          pointer-events: none; z-index: 0; filter: blur(80px);
        }
        .cosmic-glow-bottom {
          position: fixed; width: 500px; height: 500px; bottom: -100px; right: -100px;
          background: radial-gradient(circle, rgba(96,165,242,0.12) 0%, transparent 70%);
          pointer-events: none; z-index: 0; filter: blur(100px);
        }

        /* 3D Floating Animation */
        @keyframes float3D {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .floating-3d { animation: float3D 6s infinite ease-in-out; }

        /* Typography Mastery & Living Text Glow */
        .living-text-hero {
          font-family: 'Inter', sans-serif; font-weight: 900; color: #FFF;
          font-size: clamp(48px, 8vw, 96px); letter-spacing: -2px; line-height: 0.95;
          text-shadow: 0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(139,92,246,0.2);
        }
        
        /* Global CSS Overrides */
        textarea:focus, input:focus { border-color: #8B5CF6 !important; box-shadow: 0 0 0 4px rgba(139,92,246,0.15) !important; background: rgba(0,0,0,0.5) !important; }
        .interactive-card:hover { transform: translateY(-6px); border-color: rgba(139, 92, 246, 0.3) !important; box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.1) !important; }
      `}} />
      
      <div className="cosmic-glow-top"></div>
      <div className="cosmic-glow-bottom"></div>

      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "24px", fontWeight: "900", letterSpacing: "1px" }}>ZYNOR <span style={{ color: "#8B5CF6" }}>WRITE</span></span>
          <span style={{ fontSize: "11px", fontWeight: "800", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: "8px", letterSpacing: "1px" }}>V2.0 DNA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "4px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => setPersona("shadow")} style={{ border: "none", background: persona === "shadow" ? "#8B5CF6" : "transparent", color: "#FFF", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>الظل 👤</button>
            <button onClick={() => setPersona("advisor")} style={{ border: "none", background: persona === "advisor" ? "#8B5CF6" : "transparent", color: "#FFF", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>المستشار 🧠</button>
          </div>
          <button onClick={() => setZenMode(true)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0AEC0", padding: "8px 16px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>وضع الزن 👁️</button>
        </div>
      </div>

      {/* Main Body */}
      <div style={S.body}>
        <aside style={S.sidebar}>
          <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "#A0AEC0", fontWeight: "700" }}>نقاط التطور</span>
                <span style={{ fontSize: "11px", background: "rgba(139,92,246,0.2)", color: "#8B5CF6", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>STREAK {streak}</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "900", color: "#FFF" }}>{points} <span style={{ fontSize: "13px", color: "#8B5CF6" }}>PXT</span></div>
            </div>
          </div>
          <div style={{ padding: "16px 0", flex: 1 }}>
            <div style={S.navItem(panel === "welcome")} onClick={() => setPanel("welcome")}><Zap size={18} /> الرئيسية كونيّة</div>
            <div style={S.navItem(panel === "ads")} onClick={() => setPanel("ads")}><Megaphone size={18} /> كتابة الإعلانات</div>
            <div style={S.navItem(panel === "seo")} onClick={() => setPanel("seo")}><Search size={18} /> مقالات SEO</div>
            <div style={S.navItem(panel === "social")} onClick={() => setPanel("social")}><Share2 size={18} /> السوشيال ميديا</div>
            <div style={S.navItem(panel === "improve")} onClick={() => setPanel("improve")}><Sparkles size={18} /> تحسين نص ذكي</div>
            <div style={S.navItem(panel === "resistance")} onClick={() => setPanel("resistance")}><Crosshair size={18} /> رادار المقاومة</div>
            <div style={S.navItem(panel === "roi")} onClick={() => setPanel("roi")}><BarChart2 size={18} /> مصفوفة العائد ROI</div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 0" }}>
            <div style={S.navItem(panel === "history")} onClick={() => setPanel("history")}><History size={18} /> الأرشيف الإنتاجي</div>
            <div style={S.navItem(panel === "settings")} onClick={() => setPanel("settings")}><Settings size={18} /> إعدادات المحرك العلمي</div>
          </div>
        </aside>

        <main style={S.main}>
          {panel === "welcome" && <WelcomePanel S={S} />}
          {panel === "ads" && <AdsPanel S={S} apiKey={apiKey} showToast={showToast} addHistory={addHistory} />}
          {panel === "settings" && <SettingsPanel S={S} apiKey={apiKey} setApiKey={setApiKey} showToast={showToast} />}
          {/* Lazy Fallback for Other Subpanels to keep architectural layout unbroken */}
          {["seo", "social", "improve", "resistance", "roi", "history"].includes(panel) && (
            <div style={S.glassCard}>
              <div style={S.verticalBorderTitle}>تحت الهيكلة البصرية المتقدمة</div>
              <p style={{ color: "#A0AEC0", lineHeight: "1.8", fontWeight: "600" }}>هذا القسم مجهز ليعمل بمصفوفة الـ Glassmorphism الكاملة المربوطة بمحرك الـ API المعين في الإعدادات.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SLIDE 1 & 6 COMBINED: THE KINETIC WELCOME PANEL
// ═══════════════════════════════════════════════════════
function WelcomePanel({ S }) {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 10 }}>
      {/* Slide 1 Screen Component */}
      <div style={{ textAlign: "center", padding: "60px 0 80px", position: "relative" }}>
        <h1 className="living-text-hero">Zynor Write 2.0</h1>
        <div style={{ fontFamily: "'Cairo', sans-serif", fontWeight: "800", fontSize: "22px", color: "#8B5CF6", marginTop: "20px", letterSpacing: "1px" }}>دليل التطور البصري: المرحلة الثانية</div>
        <p style={{ fontFamily: "'Cairo', sans-serif", fontSize: "15px", color: "#A0AEC0", maxWidth: "600px", margin: "16px auto 0", lineHeight: "1.8", opacity: 0.85, fontWeight: "600" }}>
          الخطوط الحية والتوزيع الديناميكي — الانتقال من النصوص الجامدة إلى الحروف التي تتنفس في الفراغ الكوني المقصود.
        </p>
      </div>

      {/* Slide 6: Three Column Asset Cards Implementation */}
      <div style={S.verticalBorderTitle}>عناصر Zynor الجديدة — 3D Asset Ecosystem</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
        
        <div className="interactive-card" style={S.glassCard}>
          <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <img className="floating-3d" src={ASSETS3D.ui} alt="UI 3D" style={{ height: "120px", objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: "800", textAlign: "center", color: "#FFF" }}>واجهة التحكم الزجاجية</div>
          <div style={{ fontSize: "12px", color: "#A0AEC0", textAlign: "center", marginTop: "6px", fontWeight: "600" }}>UI 3D Layered Canvas</div>
        </div>

        <div className="interactive-card" style={S.glassCard}>
          <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <img className="floating-3d" src={ASSETS3D.pen} alt="Pen 3D" style={{ height: "120px", objectFit: "contain", animationDelay: "1.5s" }} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: "800", textAlign: "center", color: "#FFF" }}>أداة الكتابة الفولاذية</div>
          <div style={{ fontSize: "12px", color: "#A0AEC0", textAlign: "center", marginTop: "6px", fontWeight: "600" }}>Pen 3D Metallic Precision</div>
        </div>

        <div className="interactive-card" style={S.glassCard}>
          <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <img className="floating-3d" src={ASSETS3D.brain} alt="Brain 3D" style={{ height: "120px", objectFit: "contain", animationDelay: "3s" }} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: "800", textAlign: "center", color: "#FFF" }}>محرك الذكاء الهولوغرامي</div>
          <div style={{ fontSize: "12px", color: "#A0AEC0", textAlign: "center", marginTop: "6px", fontWeight: "600" }}>Brain 3D Cyan Light</div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SLIDE 3 & 4 INJECTED: ADVANCED COPYWRITING ENGINE
// ═══════════════════════════════════════════════════════
function AdsPanel({ S, apiKey, showToast, addHistory }) {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [benefits, setBenefits] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const triggerGeneration = async () => {
    if (!product.trim()) { showToast("برجاء إدخال اسم المشروع أو المنتج أولاً.", "error"); return; }
    setLoading(true); setOutput("");
    try {
      const promptText = `قم بصياغة نص تسويقي فاخر جداً ومقنع بالكامل:\nالمنتج: ${product}\nالجمهور: ${audience || "عام"}\nالفوائد: ${benefits}\nأريد النص مباشرة وبأسلوب إبداعي بليغ بدون جمل تمهيدية.`;
      const result = await askGemini(promptText, apiKey);
      setOutput(result);
      addHistory({ type: "إعلان", content: result });
      showToast("تم صقل واستدعاء النص بنجاح الإقناع.", "success");
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 950, margin: "0 auto" }}>
      {/* Slide 4: Feature Highlight with 3D Object Layout (Asymmetric Arrangement) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px", alignItems: "start" }}>
        
        {/* Right Pillar: Input Architectures */}
        <div>
          <div style={S.verticalBorderTitle}>Living Text Effects — هندسة النص الحي</div>
          <div style={S.glassCard}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={S.label}>المشروع البصري أو اسم المنتج</label>
                <input style={S.inp} value={product} onChange={e => setProduct(e.target.value)} placeholder="مثال: Zynor Write 2.0" />
              </div>
              <div>
                <label style={S.label}>تحديد رادار الجمهور المستهدف</label>
                <input style={S.inp} value={audience} onChange={e => setAudience(e.target.value)} placeholder="مثال: رواد أعمال التكنولوجيا المتقدمة" />
              </div>
              <div>
                <label style={S.label}>تحليل القيمة والمزايا التشغيلية</label>
                <textarea style={S.ta} value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="اذكر جوهر التطور الذي تقدمه هنا..." />
              </div>
              <button style={S.btn(loading)} onClick={triggerGeneration} disabled={loading}>
                {loading ? "جاري كسر المقاومة النفسية وتوليد الإقناع..." : "توليد وهندسة النص البلاغي"}
              </button>
            </div>
          </div>
        </div>

        {/* Left Pillar: The Floating Crystal Sphere Showcase */}
        <div style={{ position: "sticky", top: "100px" }}>
          <div style={S.verticalBorderTitle}>توازن البعد الثالث البصري</div>
          <div className="interactive-card" style={{ ...S.glassCard, textAlign: "center", padding: "50px 32px" }}>
            <div style={{ marginBottom: "24px" }}>
              <img className="floating-3d" src={ASSETS3D.sphere} alt="Crystal Sphere" style={{ width: "160px", height: "160px", objectFit: "contain" }} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#60A5FA", marginBottom: "10px" }}>Living Text Effects</h3>
            <p style={{ fontSize: "13px", color: "#A0AEC0", lineHeight: "1.7", fontWeight: "600", margin: 0 }}>
              تمثل هذه الكرة الزجاجية الكونية "الحروف التي تطفو فوق طبقات الزجاج الحقيقي" لتعكس تفاعل الإضاءة المحيطة المتغيرة في التصميم الحقيقي.
            </p>
          </div>
        </div>

      </div>

      {/* Output Glass Screen */}
      {output && (
        <div style={{ marginTop: "32px" }}>
          <div style={S.verticalBorderTitle}>النتيجة البلاغية المصقولة</div>
          <div style={{ ...S.glassCard, borderRight: "4px solid #60A5FA" }}>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: "2", fontSize: "15px", color: "#FFF", fontWeight: "700" }}>{output}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  ENGINE SETTINGS MATRIX (SLIDE 10: METRIC IMPACT IMPL)
// ═══════════════════════════════════════════════════════
function SettingsPanel({ S, apiKey, setApiKey, showToast }) {
  return (
    <div style={{ maxWidth: 850, margin: "0 auto" }}>
      <div style={S.verticalBorderTitle}>مقياس الجودة الكلي — Stat Evaluation Matrix</div>
      
      {/* Slide 10: Visual Punch Realization */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px", alignItems: "center", marginBottom: "32px" }}>
        
        <div style={{ ...S.glassCard, marginBottom: 0 }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#8B5CF6", marginBottom: "12px" }}>المنافسة العالمية</h3>
          <p style={{ fontSize: "14px", color: "#A0AEC0", lineHeight: "1.8", fontWeight: "600", margin: 0 }}>
            من خلال ضبط المفتاح البرمجي والاعتماد الأصيل على تدرجات Glassmorphic مدمجة مع أصول ثلاثية الأبعاد متحركة، يتم تحويل البيئة البرمجية من مجرد كود تقليدي باهت إلى واجهة مستخدم بمعايير جودة عالمية.
          </p>
        </div>

        <div style={{ ...S.glassCard, marginBottom: 0, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "72px", fontWeight: "900", color: "#8B5CF6", lineHeight: 1, textShadow: "0 0 50px rgba(139,92,246,0.3)" }}>100%</div>
          <div style={{ fontSize: "13px", color: "#FFF", fontWeight: "800", marginTop: "12px", letterSpacing: "1px" }}>تحول بصري كامل</div>
        </div>

      </div>

      {/* API Key Wireup */}
      <div style={S.glassCard}>
        <div style={{ fontSize: "15px", fontWeight: "800", color: "#FFF", marginBottom: "12px" }}>ربط محرك الذكاء الفلسفي (Gemini AI Key)</div>
        <p style={{ fontSize: "13px", color: "#A0AEC0", lineHeight: "1.7", marginBottom: "20px", fontWeight: "600" }}>
          يتم حفظ المفتاح بأمان تام داخل الـ Local Storage للمتصفح دون رفعه لأي خادم وسيط لتأمين سرية بياناتك تماماً.
        </p>
        <input type="password" style={S.inp} value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem("zw4_gemini_key", e.target.value); }} placeholder="AIzaSyB................................" />
      </div>
    </div>
  );
}
