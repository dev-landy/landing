// Landy V2 — Sequential Notification Flow
//
// Bank deposit notification arrives → short beat → Landy V2 notification
// arrives. Nothing the OS can't actually do — just two normal push
// notifications landing in sequence on the lockscreen.

const { useState, useEffect, useRef, useCallback } = React;

// -------- shared bits --------
const numStyle = {
  fontFamily:'"Pretendard", system-ui, sans-serif',
  fontFeatureSettings:'"tnum"',
  letterSpacing:'-0.025em',
};

const LandyMark = ({size=38, ink='#fff', bg='#1E3A8A', strong=false}) => (
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

const ExpandCaret = ({color='rgba(255,255,255,0.55)'}) => (
  <svg width="14" height="14" viewBox="0 0 14 14" style={{flexShrink:0}}>
    <path d="M3.5 5.5 L7 9 L10.5 5.5" stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// -------- Bank notification (plain — no cross-app modifications)
function FlowBankNotification(){
  return (
    <div style={{
      display:'flex', gap:10, padding:12, position:'relative',
      background:'rgba(40,40,46,0.78)', backdropFilter:'blur(20px)',
      borderRadius:18, color:'#fff',
      overflow:'hidden',
    }}>
      <div style={{
        width:38, height:38, borderRadius:9, flexShrink:0,
        background:'linear-gradient(180deg,#f4d03f,#e6b800)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:800, fontSize:10, color:'#3a2a00',
        boxShadow:'inset 0 -2px 0 rgba(0,0,0,0.12)',
      }}>BANK</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, opacity:0.85}}>
          <span style={{fontWeight:600}}>○○뱅킹 · 오후 3:00</span>
          <span style={{opacity:0.6, fontSize:14}}>⌄</span>
        </div>
        <div style={{fontSize:14, fontWeight:700, marginTop:3}}>입금 700,000원</div>
        <div style={{fontSize:12.5, lineHeight:1.4, marginTop:2, opacity:0.92}}>
          건물주님 05/17 15:00 933862-**-****21<br/>
          홍길동 FBS입금 700,000 잔액 20,900,000
        </div>
      </div>
    </div>
  );
}

// -------- Landy V2 notification
function FlowLandyV2({active, animKey}){
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) { setN(0); return; }
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
    const id = setTimeout(() => { raf = requestAnimationFrame(tick); }, 250);
    return () => { clearTimeout(id); cancelAnimationFrame(raf); };
  }, [active, animKey]);

  if (!active) return null;

  return (
    <div className="ldy-v2-card" key={animKey} style={{
      position:'relative', overflow:'hidden',
      padding:14, borderRadius:18, color:'#fff',
      background:'rgba(28,30,40,0.82)', backdropFilter:'blur(20px)',
      boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.05), 0 14px 28px -14px rgba(20,38,77,0.55)',
    }}>
      {/* Navy accent rail */}
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
            <span style={{color:'#9BB3F2'}}>Landy · 방금</span>
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
    </div>
  );
}

// -------- The sequence --------
// 0 ms    : start
// 150 ms  : bank notification slides in
// 750 ms  : Landy V2 slides in (0.6s beat after bank)
// 2400 ms : done
const TIMELINE = [
  { at: 150, label: '뱅킹 입금 알림' },
  { at: 750, label: 'Landy 알림' },
];
const TOTAL = 2400;

function useFlow(speed = 1, replayKey = 0){
  const [t, setT] = useState(0);
  const rafRef = useRef(0);
  const startedAt = useRef(0);

  useEffect(() => {
    setT(0);
    cancelAnimationFrame(rafRef.current);
    startedAt.current = performance.now();
    const tick = (now) => {
      const elapsed = (now - startedAt.current) * speed;
      if (elapsed >= TOTAL){ setT(TOTAL); return; }
      setT(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, replayKey]);

  const bankMounted = t >= 150;
  const landyActive = t >= 750;

  return { t, bankMounted, landyActive };
}

// -------- Lockscreen for the flow --------
function FlowLockscreen({children}){
  return (
    <div style={{
      width:340, height:680, position:'relative', overflow:'hidden',
      borderRadius:42, boxShadow:'0 30px 80px -20px rgba(20,33,61,0.45), inset 0 0 0 8px #111',
      background:`
        radial-gradient(120% 60% at 100% 0%, rgba(155,179,242,0.18), transparent 60%),
        radial-gradient(80% 50% at 0% 100%, rgba(74,111,216,0.20), transparent 60%),
        linear-gradient(180deg, #0a0a0e 0%, #0d0d12 50%, #0a0a0e 100%)
      `,
      fontFamily:'"Pretendard", system-ui, sans-serif',
    }}>
      <div style={{
        position:'absolute', top:8, left:'50%', transform:'translateX(-50%)',
        width:114, height:32, background:'#000', borderRadius:18, zIndex:5,
      }}/>
      {/* Status bar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'15px 24px 6px', color:'#fff', fontSize:13, fontWeight:600,
      }}>
        <span style={{fontWeight:700}}>KT</span>
        <span style={{display:'flex', alignItems:'center', gap:8, opacity:0.95}}>
          <svg width="16" height="12" viewBox="0 0 24 24"><g fill="#fff">
            <rect x="2" y="10" width="3" height="6" rx="0.6"/>
            <rect x="7" y="7" width="3" height="9" rx="0.6"/>
            <rect x="12" y="4" width="3" height="12" rx="0.6"/>
            <rect x="17" y="1" width="3" height="15" rx="0.6"/>
          </g></svg>
          <svg width="16" height="12" viewBox="0 0 24 24">
            <path d="M2 8a18 18 0 0 1 20 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M5.5 11a13 13 0 0 1 13 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <path d="M9 14a8 8 0 0 1 6 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1.4" fill="#fff"/>
          </svg>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:3,
            padding:'2px 5px 2px 6px', borderRadius:5,
            background:'rgba(255,255,255,0.95)', color:'#000',
            fontSize:10, fontWeight:700,
          }}>
            <span>32</span>
            <span style={{
              width:14, height:7, border:'1.2px solid #000', borderRadius:2,
              position:'relative', display:'inline-block',
            }}>
              <span style={{position:'absolute', inset:1, width:4, background:'#000', borderRadius:1}}/>
              <span style={{position:'absolute', right:-3, top:1.6, width:1.4, height:3, background:'#000', borderRadius:1}}/>
            </span>
          </span>
        </span>
      </div>
      {/* Clock */}
      <div style={{padding:'6px 24px 24px', color:'#fff'}}>
        <div style={{fontSize:84, fontWeight:300, lineHeight:1, letterSpacing:-3,
          fontFamily:'"SF Pro Display","Pretendard",system-ui,sans-serif'}}>3:00</div>
        <div style={{fontSize:15, marginTop:5, fontWeight:500, opacity:0.92}}>5월 17일 일요일</div>
      </div>
      <div style={{padding:'0 12px', display:'flex', flexDirection:'column', gap:8}}>
        {children}
      </div>
    </div>
  );
}

// -------- Page --------
function Page(){
  const [speed, setSpeed] = useState(1);
  const [replayKey, setReplayKey] = useState(0);
  const replay = useCallback(() => setReplayKey(k => k+1), []);
  const { t, bankMounted, landyActive } = useFlow(speed, replayKey);
  const progress = Math.min(1, t / TOTAL);

  return (
    <div style={{paddingBottom:80}}>
      <FlowKeyframes/>

      {/* Header */}
      <div style={{maxWidth:1100, margin:'0 auto', padding:'48px 32px 8px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
          <LandyMark size={32} ink="#fff" bg="#1E3A8A" strong/>
          <div style={{
            fontSize:11, fontWeight:700, letterSpacing:1.4,
            color:'var(--brand)', textTransform:'uppercase',
          }}>Landy · V2 · 락스크린 플로우</div>
        </div>
        <h1 style={{
          fontSize:38, fontWeight:800, letterSpacing:-1.2, margin:'0 0 12px',
          maxWidth:860, lineHeight:1.1, color:'var(--ink)',
        }}>
          뱅킹 알림 바로 뒤에, <span style={{color:'var(--brand)'}}>Landy 알림이 따라옵니다.</span>
        </h1>
        <p style={{
          maxWidth:680, color:'var(--ink-2)', lineHeight:1.6, fontSize:14.5, margin:0,
        }}>
          은행 알림은 ‘무슨 입금인지’를 알려주지 않습니다. Landy는 입금을 인식한 직후
          자체 푸시를 보내 ‘어느 호실 · 어떤 세입자 · 이번 달 진행도’를 한 줄에 묶어줍니다.
          실제 모바일 OS에서 가능한 자연스러운 순차 알림 시퀀스로만 구성했어요.
        </p>
      </div>

      {/* Main stage */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 360px',
        gap:36, maxWidth:1100, margin:'32px auto 0', padding:'0 32px',
        alignItems:'start',
      }}>
        {/* Lockscreen + controls */}
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:18}}>
          <FlowLockscreen>
            {bankMounted && (
              <div key={`bank-${replayKey}`} style={{animation:'flow-slide-in 0.5s cubic-bezier(.2,.9,.25,1.1) both'}}>
                <FlowBankNotification/>
              </div>
            )}

            {landyActive && (
              <div key={`landy-${replayKey}`} style={{animation:'flow-slide-in 0.5s cubic-bezier(.2,.9,.25,1.1) both'}}>
                <FlowLandyV2 active={landyActive} animKey={replayKey}/>
              </div>
            )}
          </FlowLockscreen>

          {/* Controls */}
          <div style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'10px 14px', background:'#fff',
            borderRadius:99, border:'1px solid var(--line)',
            boxShadow:'var(--sh-card)',
          }}>
            <button onClick={replay} style={{
              display:'flex', alignItems:'center', gap:6,
              fontFamily:'var(--ff)', fontSize:13, fontWeight:700, color:'#fff',
              padding:'8px 14px', borderRadius:99,
              background:'var(--brand)', border:0, cursor:'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 12 12">
                <path d="M2.5 6 a3.5 3.5 0 1 0 1-2.5 M2.5 2 v2 h2"
                  stroke="currentColor" strokeWidth="1.4" fill="none"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              플로우 재생
            </button>
            <div style={{width:1, height:22, background:'var(--line)'}}/>
            <div style={{display:'flex', gap:4, fontSize:12, fontWeight:600, color:'var(--ink-2)'}}>
              <span style={{padding:'0 4px', color:'var(--ink-3)'}}>속도</span>
              {[0.5, 1, 2].map(s => (
                <button key={s} onClick={() => setSpeed(s)} style={{
                  fontFamily:'var(--ff)', fontSize:12, fontWeight:700,
                  padding:'4px 9px', borderRadius:99, cursor:'pointer',
                  background: speed === s ? 'var(--brand-soft)' : 'transparent',
                  color: speed === s ? 'var(--brand)' : 'var(--ink-2)',
                  border: 0,
                }}>{s}×</button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline panel */}
        <div style={{
          background:'#fff', borderRadius:18, border:'1px solid var(--line)',
          boxShadow:'var(--sh-card)', padding:'18px 20px 20px',
        }}>
          <div style={{
            fontSize:10, fontWeight:700, letterSpacing:1.4, color:'var(--ink-3)',
            textTransform:'uppercase', marginBottom:14,
          }}>타임라인</div>

          {/* Progress bar */}
          <div style={{
            position:'relative', height:4, borderRadius:99,
            background:'var(--bg-2)', marginBottom:18,
          }}>
            <div style={{
              position:'absolute', left:0, top:0, bottom:0,
              width:`${progress*100}%`, borderRadius:99,
              background:'var(--brand)', transition:'width 0.06s linear',
            }}/>
            {TIMELINE.map(step => (
              <span key={step.at} style={{
                position:'absolute', left:`${(step.at/TOTAL)*100}%`,
                top:-3, width:10, height:10, marginLeft:-5, borderRadius:99,
                background: t >= step.at ? 'var(--brand)' : 'var(--card)',
                border: t >= step.at ? '2px solid var(--brand)' : '2px solid var(--line)',
                transition:'background 0.15s ease, border-color 0.15s ease',
              }}/>
            ))}
          </div>

          <ul style={{margin:0, padding:0, listStyle:'none',
            display:'grid', gap:9, fontSize:13, color:'var(--ink-2)'}}>
            {TIMELINE.map(step => {
              const reached = t >= step.at;
              return (
                <li key={step.at} style={{
                  display:'flex', alignItems:'center', gap:10,
                  opacity: reached ? 1 : 0.45,
                  transition:'opacity 0.15s ease',
                }}>
                  <span style={{
                    width:14, height:14, borderRadius:99, flexShrink:0,
                    background: reached ? 'var(--brand)' : 'var(--bg-2)',
                    display:'inline-flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {reached && (
                      <svg width="8" height="8" viewBox="0 0 12 12">
                        <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#fff"
                          strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span style={{
                    ...numStyle,
                    fontSize:11, fontWeight:700, color: reached ? 'var(--brand)' : 'var(--ink-3)',
                    width:48, flexShrink:0,
                  }}>{(step.at/1000).toFixed(1)}s</span>
                  <span style={{fontWeight: reached ? 600 : 500, color: reached ? 'var(--ink)' : 'var(--ink-2)'}}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div style={{
            marginTop:18, paddingTop:14, borderTop:'1px solid var(--line-2)',
            fontSize:12, lineHeight:1.5, color:'var(--ink-2)',
          }}>
            두 알림 사이 간격은 <b style={{color:'var(--ink)'}}>약 0.6초</b>로, 뱅킹 알림과
            Landy 알림이 거의 동시에 도착하는 빠른 페이스입니다.
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowKeyframes(){
  return (
    <style>{`
      @keyframes flow-slide-in {
        0%   { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      /* V2 inner sub-element animations triggered when card mounts */
      .ldy-v2-rail{ animation: flow-rail 0.5s cubic-bezier(.2,.9,.25,1.1) 0.1s both; transform-origin: top; }
      .ldy-v2-logo{ animation: flow-pop 0.5s cubic-bezier(.2,.9,.3,1.2) 0.05s both; }
      .ldy-v2-title{ animation: flow-slideX 0.45s cubic-bezier(.2,.9,.25,1) 0.12s both; }
      .ldy-v2-amount{ animation: flow-slideX 0.45s cubic-bezier(.2,.9,.25,1) 0.22s both; }
      .ldy-v2-meta{ animation: flow-slideX 0.45s ease 0.42s both; }

      @keyframes flow-rail{
        0% { transform: scaleY(0); opacity: 0; }
        100% { transform: scaleY(1); opacity: 1; }
      }
      @keyframes flow-pop{
        0% { transform: scale(0.5); opacity: 0; }
        70% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(1); }
      }
      @keyframes flow-slideX{
        0% { transform: translateX(-6px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
    `}</style>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Page/>);
