// Three motion-led directions for the Landy push notification.
// All built from the Landy design system: navy #1E3A8A brand, 3×3 dot-grid
// logo, Pretendard + tnum for numbers, semantic ok/warn/danger colors.

// ---- Landy mark: the 3×3 room grid inside a rounded square ----
const LandyMark = ({size=38, ink='#fff', bg='#1E3A8A', strong=false}) => {
  // strong = filled brand square (for use on white). default = transparent
  // bg so caller controls container.
  return (
    <div style={{
      width:size, height:size, borderRadius:size*0.26, flexShrink:0,
      background:bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow: strong ? 'inset 0 -2px 0 rgba(0,0,0,0.10)' : 'none',
    }}>
      <svg viewBox="0 0 200 200" width={size*0.62} height={size*0.62}>
        <rect x="50" y="50" width="100" height="100" rx="8" fill="none"
          stroke={ink} strokeWidth="10"/>
        <circle cx="70"  cy="70"  r="6" fill={ink} opacity="0.9"/>
        <circle cx="100" cy="70"  r="6" fill={ink} opacity="0.9"/>
        <circle cx="130" cy="70"  r="6" fill={ink} opacity="0.9"/>
        <circle cx="70"  cy="100" r="6" fill={ink} opacity="0.9"/>
        <circle cx="100" cy="100" r="9" fill={ink}/>
        <circle cx="130" cy="100" r="6" fill={ink} opacity="0.9"/>
        <circle cx="100" cy="130" r="6" fill={ink} opacity="0.9"/>
        <circle cx="130" cy="130" r="6" fill={ink} opacity="0.9"/>
      </svg>
    </div>
  );
};

const ExpandCaret = ({color='rgba(255,255,255,0.55)'}) => (
  <svg width="14" height="14" viewBox="0 0 14 14" style={{flexShrink:0}}>
    <path d="M3.5 5.5 L7 9 L10.5 5.5" stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Inline shared numeric style (Landy uses Pretendard tnum)
const numStyle = {
  fontFamily:'"Pretendard", system-ui, sans-serif',
  fontFeatureSettings:'"tnum"',
  letterSpacing:'-0.025em',
};

/* ============================================================
   V1 — COLOR POP (Landy Navy)
   Replaces the empty white tile with a confident navy card.
   The logo "stamps" in, the amount rises, and a soft brand-soft
   ring pulses outward — all within Landy's visual vocabulary.
   ============================================================ */
function LandyV1_ColorPop(){
  return (
    <div className="ldy-v1-card" style={{
      position:'relative', overflow:'hidden',
      padding:'14px', borderRadius:18, color:'#fff',
      background:'linear-gradient(155deg, #2A4FB8 0%, #1E3A8A 55%, #14264D 100%)',
      boxShadow:'0 12px 28px -12px rgba(20,38,77,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
      transformOrigin:'top center',
    }}>
      {/* Pulse ring around logo */}
      <span className="ldy-v1-pulse" style={{
        position:'absolute', left:18, top:18, width:38, height:38,
        borderRadius:11, border:'2px solid rgba(232,237,251,0.55)',
        pointerEvents:'none',
      }}/>

      <div style={{display:'flex', gap:11, alignItems:'flex-start'}}>
        <div className="ldy-v1-logo">
          <LandyMark size={38} ink="#fff" bg="transparent"/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            fontSize:12, fontWeight:600, letterSpacing:0.1,
            color:'rgba(232,237,251,0.92)',
          }}>
            <span>Landy · 월세 입금</span>
            <ExpandCaret color="rgba(232,237,251,0.7)"/>
          </div>

          <div style={{
            ...numStyle,
            display:'flex', alignItems:'baseline', gap:6, marginTop:7,
          }} className="ldy-v1-amount">
            <span style={{fontSize:28, fontWeight:800, lineHeight:1}}>700,000</span>
            <span style={{fontSize:14, fontWeight:600, opacity:0.85}}>원</span>
          </div>

          <div style={{
            display:'flex', flexWrap:'wrap', gap:5, marginTop:10,
          }} className="ldy-v1-chips">
            <span className="ldy-chip-on-navy">
              <span style={{
                width:5, height:5, borderRadius:99, background:'#86EAB5',
                display:'inline-block', marginRight:5,
              }}/>
              102호 · 정수아
            </span>
            <span className="ldy-chip-on-navy">5월분 완납</span>
          </div>
        </div>
      </div>

      <style>{`
        .ldy-v1-card{ animation: ldy-v1-land 0.55s cubic-bezier(.2,.9,.25,1.15) both; }
        .ldy-v1-logo{ animation: ldy-v1-stamp 0.6s cubic-bezier(.2,.9,.3,1.25) 0.05s both; }
        .ldy-v1-amount{ animation: ldy-rise 0.5s cubic-bezier(.2,.9,.25,1) 0.18s both; }
        .ldy-v1-chips{ animation: ldy-rise 0.45s ease 0.32s both; }
        .ldy-v1-pulse{ animation: ldy-v1-ring 0.9s ease-out 0.08s both; }
        @keyframes ldy-v1-land{
          0%   { transform: translateY(-8px) scale(0.96); opacity: 0; }
          60%  { transform: translateY(2px) scale(1.015); opacity: 1; }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes ldy-v1-stamp{
          0%   { transform: scale(0.4) rotate(-14deg); opacity: 0; }
          70%  { transform: scale(1.12) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes ldy-rise{
          0%   { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes ldy-v1-ring{
          0%   { transform: scale(0.4); opacity: 0; border-width: 3px; }
          50%  { opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; border-width: 1px; }
        }
        .ldy-chip-on-navy{
          display:inline-flex; align-items:center;
          font-size:11px; font-weight:600; padding:3px 8px; border-radius:99px;
          background:rgba(232,237,251,0.18); color:#E8EDFB;
          backdrop-filter: blur(8px);
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   V2 — HIERARCHY BURST (Landy Navy Rail)
   Sticks to iOS dark-card form, but adds Landy's navy left rail,
   restructures the info hierarchy, and counts the amount up with
   Pretendard tnum digits. Most "drop-in safe" of the three.
   ============================================================ */
function LandyV2_HierarchyBurst(){
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    const target = 700000;
    const start = performance.now();
    const dur = 700;
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
      setN(Math.round(target * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="ldy-v2-card" style={{
      position:'relative', overflow:'hidden',
      padding:14, borderRadius:18, color:'#fff',
      background:'rgba(28,30,40,0.82)', backdropFilter:'blur(20px)',
      boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.05)',
    }}>
      {/* Left navy accent rail */}
      <div className="ldy-v2-rail" style={{
        position:'absolute', left:0, top:14, bottom:14, width:3,
        borderRadius:'0 3px 3px 0',
        background:'linear-gradient(180deg,#4A6FD8,#1E3A8A)',
      }}/>
      <div style={{display:'flex', gap:11, paddingLeft:6}}>
        <div className="ldy-v2-logo">
          <LandyMark size={38} ink="#fff" bg="#1E3A8A" strong/>
        </div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            fontSize:12, fontWeight:600,
          }}>
            <span style={{color:'#9BB3F2'}}>Landy · 입금 확인</span>
            <ExpandCaret/>
          </div>

          <div className="ldy-v2-title" style={{
            fontSize:16, fontWeight:800, letterSpacing:-0.3, marginTop:4,
          }}>
            5월분 월세가 들어왔어요
          </div>

          <div className="ldy-v2-amount" style={{
            ...numStyle,
            display:'flex', alignItems:'baseline', gap:4, marginTop:8,
          }}>
            <span style={{fontSize:26, fontWeight:800, lineHeight:1, color:'#fff'}}>
              {n.toLocaleString()}
            </span>
            <span style={{fontSize:13, fontWeight:600, opacity:0.7}}>원</span>
          </div>

          <div className="ldy-v2-meta" style={{
            marginTop:10, fontSize:12, opacity:0.82,
            display:'flex', gap:6, alignItems:'center',
          }}>
            <span style={{
              width:6, height:6, borderRadius:99, background:'#52D97F',
              boxShadow:'0 0 6px rgba(82,217,127,0.7)',
              display:'inline-block',
            }}/>
            <span>102호 정수아 · 이번 달 4/5세대 완납</span>
          </div>
        </div>
      </div>

      <style>{`
        .ldy-v2-card{ animation: ldy-v2-land 0.5s cubic-bezier(.2,.9,.25,1.1) both; }
        .ldy-v2-rail{ animation: ldy-v2-rail 0.5s cubic-bezier(.2,.9,.25,1.1) 0.1s both; transform-origin: top; }
        .ldy-v2-logo{ animation: ldy-pop 0.5s cubic-bezier(.2,.9,.3,1.2) 0.05s both; }
        .ldy-v2-title{ animation: ldy-slideX 0.45s cubic-bezier(.2,.9,.25,1) 0.12s both; }
        .ldy-v2-amount{ animation: ldy-slideX 0.45s cubic-bezier(.2,.9,.25,1) 0.22s both; }
        .ldy-v2-meta{ animation: ldy-slideX 0.45s ease 0.42s both; }
        @keyframes ldy-v2-land{
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes ldy-v2-rail{
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes ldy-pop{
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes ldy-slideX{
          0% { transform: translateX(-6px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   V3 — LIVE ACTIVITY · 호실 그리드 메타포
   Expanded card with status pill + amount + the 3×3 room grid
   visualizing this month's collection status. Lights up the
   matching room cell. Reuses Landy's signature visual metaphor.
   ============================================================ */
function LandyV3_LiveActivity(){
  // Coin-style sprinkles for the arrival burst (navy / brand-soft palette)
  const sprinkles = React.useMemo(() => (
    Array.from({length: 9}, (_, i) => ({
      id:i,
      dx: (Math.random()*2 - 1) * 60,
      dy: -Math.random()*40 - 20,
      rot: (Math.random()*2 - 1) * 90,
      delay: 0.05 + Math.random()*0.15,
      hue: i%3 === 0 ? '#86EAB5' : (i%3 === 1 ? '#9BB3F2' : '#FFFFFF'),
      size: 5 + Math.random()*4,
    }))
  ), []);

  // 5 units this month, this notification is the 4th one in.
  // Layout reads as a 3×2 grid of units (well, 5 units shown in 3+2 row).
  const units = [
    {n:'101', paid:true,  highlight:false},
    {n:'102', paid:true,  highlight:true },  // ← this one just paid
    {n:'201', paid:true,  highlight:false},
    {n:'202', paid:true,  highlight:false},
    {n:'301', paid:false, highlight:false},
  ];

  return (
    <div className="ldy-v3-card" style={{
      position:'relative',
      padding:'14px 14px 12px', borderRadius:18, color:'#fff',
      background:`
        radial-gradient(120% 80% at 100% 0%, rgba(74,111,216,0.35) 0%, transparent 55%),
        linear-gradient(180deg, rgba(30,36,56,0.92), rgba(18,22,38,0.92))`,
      backdropFilter:'blur(20px)',
      boxShadow:'inset 0 0 0 1px rgba(155,179,242,0.18), 0 10px 24px -12px rgba(20,38,77,0.5)',
    }}>
      {/* Sprinkles */}
      <div style={{position:'absolute', left:34, top:28, pointerEvents:'none'}}>
        {sprinkles.map(s => (
          <span key={s.id} className="ldy-v3-sprinkle"
            style={{
              '--dx':`${s.dx}px`, '--dy':`${s.dy}px`, '--rot':`${s.rot}deg`,
              '--delay':`${s.delay}s`, background:s.hue,
              width:s.size, height:s.size,
            }}/>
        ))}
      </div>

      {/* Header row */}
      <div style={{display:'flex', gap:10, alignItems:'center'}}>
        <div className="ldy-v3-logo">
          <LandyMark size={32} ink="#fff" bg="#1E3A8A" strong/>
        </div>
        <div style={{flex:1, fontSize:12, fontWeight:600, color:'rgba(232,237,251,0.88)'}}>
          Landy · 지금
        </div>
        <div className="ldy-v3-pill" style={{
          display:'flex', alignItems:'center', gap:4,
          fontSize:11, fontWeight:700, padding:'3px 9px 3px 7px',
          borderRadius:99, background:'#00875A', color:'#fff',
          boxShadow:'0 0 0 1px rgba(255,255,255,0.06)',
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12">
            <path className="ldy-v3-check" d="M2.5 6.2 L5 8.6 L9.5 3.6"
              stroke="#fff" strokeWidth="1.9" fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              style={{strokeDasharray:14, strokeDashoffset:14}}
            />
          </svg>
          입금 완료
        </div>
      </div>

      {/* Big amount block */}
      <div className="ldy-v3-amount" style={{
        ...numStyle,
        marginTop:10, display:'flex', alignItems:'baseline', gap:6,
      }}>
        <span style={{fontSize:14, opacity:0.7, fontWeight:700, color:'#86EAB5'}}>+</span>
        <span style={{
          fontSize:30, fontWeight:800, lineHeight:1, color:'#fff',
        }}>700,000</span>
        <span style={{fontSize:15, fontWeight:600, opacity:0.8}}>원</span>
      </div>
      <div style={{fontSize:12, marginTop:3, color:'rgba(232,237,251,0.78)'}}>
        102호 · 정수아 · 5월분
      </div>

      {/* Month progress — Landy room-grid metaphor */}
      <div style={{
        marginTop:11, padding:'10px 11px', borderRadius:12,
        background:'rgba(255,255,255,0.06)',
        border:'1px solid rgba(155,179,242,0.10)',
      }}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          fontSize:11, fontWeight:600, color:'rgba(232,237,251,0.85)',
        }}>
          <span>이번 달 수납 현황</span>
          <span style={{...numStyle, fontWeight:700, color:'#fff'}}>
            4 / 5세대
          </span>
        </div>
        <div style={{
          marginTop:9, display:'flex', gap:6, alignItems:'center',
        }}>
          {units.map((u, i) => (
            <div key={u.n} className={`ldy-v3-unit ${u.highlight ? 'ldy-v3-unit--hl' : ''}`}
              style={{
                '--i': i,
                flex:1, height:30, borderRadius:7,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:700,
                ...numStyle,
                background: u.paid
                  ? (u.highlight ? '#00875A' : 'rgba(0,135,90,0.28)')
                  : 'rgba(255,255,255,0.05)',
                color: u.paid ? '#fff' : 'rgba(232,237,251,0.45)',
                border: u.paid
                  ? '1px solid rgba(0,135,90,0.45)'
                  : '1px dashed rgba(232,237,251,0.18)',
              }}>
              {u.n}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ldy-v3-card{ animation: ldy-v3-land 0.55s cubic-bezier(.2,.9,.25,1.1) both; }
        .ldy-v3-logo{ animation: ldy-pop 0.55s cubic-bezier(.2,.9,.3,1.3) 0.05s both; }
        .ldy-v3-pill{ animation: ldy-v3-pill 0.5s cubic-bezier(.2,.9,.25,1.15) 0.2s both; transform-origin: right center; }
        .ldy-v3-check{ animation: ldy-v3-draw 0.45s ease 0.4s forwards; }
        .ldy-v3-amount{ animation: ldy-slideX 0.45s ease 0.3s both; }
        .ldy-v3-unit{ animation: ldy-rise 0.4s ease both; animation-delay: calc(0.5s + var(--i) * 0.06s); }
        .ldy-v3-unit--hl{
          animation: ldy-v3-unit-hl 0.6s cubic-bezier(.2,.9,.3,1.3) 0.75s both;
          box-shadow: 0 0 0 0 rgba(0,135,90,0.55);
        }
        @keyframes ldy-v3-land{
          0% { transform: translateY(-10px) scale(0.97); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes ldy-v3-pill{
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes ldy-v3-draw{
          to { stroke-dashoffset: 0; }
        }
        @keyframes ldy-v3-unit-hl{
          0%   { transform: scale(0.85); box-shadow: 0 0 0 0 rgba(0,135,90,0); }
          50%  { transform: scale(1.12); box-shadow: 0 0 0 6px rgba(0,135,90,0.25); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0,135,90,0); }
        }
        .ldy-v3-sprinkle{
          position:absolute; left:0; top:0; border-radius:2px;
          animation: ldy-v3-sprinkle 0.85s cubic-bezier(.2,.6,.4,1) var(--delay) both;
          opacity:0;
        }
        @keyframes ldy-v3-sprinkle{
          0%   { transform: translate(0,0) rotate(0); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

Object.assign(window, {
  LandyMark,
  LandyV1_ColorPop, LandyV2_HierarchyBurst, LandyV3_LiveActivity,
  // Back-compat alias so older app.jsx imports still resolve
  RandyV1_ColorPop: LandyV1_ColorPop,
  RandyV2_HierarchyBurst: LandyV2_HierarchyBurst,
  RandyV3_LiveActivity: LandyV3_LiveActivity,
});
