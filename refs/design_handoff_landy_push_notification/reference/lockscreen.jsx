// iOS-style lockscreen mock used to host notification variations.
// Single column, fixed width 320, dark wallpaper, status bar, clock, then children (notifications).

function LockscreenStatusBar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px 6px', color: '#fff', fontSize: 13, fontWeight: 600,
      letterSpacing: 0.2
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 700 }}>KT</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.95 }}>
        <Icon name="mute" />
        <span style={{
          fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
          background: 'rgba(255,255,255,0.95)', color: '#000'
        }}>HD</span>
        <Icon name="signal" />
        <Icon name="wifi" />
        <BatteryGlyph pct={32} />
      </span>
    </div>);

}

function BatteryGlyph({ pct = 32 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 5px 2px 6px', borderRadius: 5,
      background: 'rgba(255,255,255,0.95)', color: '#000',
      fontSize: 10, fontWeight: 700
    }}>
      <span>{pct}</span>
      <span style={{
        width: 14, height: 7, border: '1.2px solid #000', borderRadius: 2, position: 'relative',
        display: 'inline-block'
      }}>
        <span style={{
          position: 'absolute', inset: 1, width: `${Math.max(2, pct * 0.11)}px`,
          background: '#000', borderRadius: 1
        }} />
        <span style={{
          position: 'absolute', right: -3, top: 1.6, width: 1.4, height: 3,
          background: '#000', borderRadius: 1
        }} />
      </span>
    </span>);

}

function Icon({ name }) {
  const common = { width: 14, height: 14, fill: 'none', stroke: '#fff', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'mute') return (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
      <path {...common} d="M4 9v6h4l5 4V5L8 9H4z M16 9l5 5 M21 9l-5 5" />
    </svg>);

  if (name === 'signal') return (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 12 }}>
      <g fill="#fff">
        <rect x="2" y="10" width="3" height="6" rx="0.6" />
        <rect x="7" y="7" width="3" height="9" rx="0.6" />
        <rect x="12" y="4" width="3" height="12" rx="0.6" />
        <rect x="17" y="1" width="3" height="15" rx="0.6" />
      </g>
    </svg>);

  if (name === 'wifi') return (
    <svg viewBox="0 0 24 24" style={{ width: 16, height: 12 }}>
      <path d="M2 8a18 18 0 0 1 20 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M5.5 11a13 13 0 0 1 13 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M9 14a8 8 0 0 1 6 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.4" fill="#fff" />
    </svg>);

  return null;
}

function LockscreenClock() {
  return (
    <div style={{
      padding: '4px 22px 22px', color: '#fff', textAlign: 'left'
    }}>
      <div style={{
        fontSize: 78, fontWeight: 300, lineHeight: 1, letterSpacing: -3,
        fontFamily: '"SF Pro Display", "Pretendard", system-ui, sans-serif'
      }}>3:00</div>
      <div style={{
        fontSize: 15, marginTop: 4, fontWeight: 500, opacity: 0.92
      }}>5월 17일 일요일</div>
    </div>);

}

function Lockscreen({ children, replayKey }) {
  // Soft dark wallpaper with a subtle warm radial — feels like dusk, lets coral pop.
  return (
    <div style={{
      width: 320, height: 640, position: 'relative', overflow: 'hidden',
      borderRadius: 38, boxShadow: '0 24px 60px -20px rgba(0,0,0,0.35), inset 0 0 0 8px #111',
      background: `
        radial-gradient(120% 60% at 100% 0%, rgba(255,120,70,0.22), transparent 60%),
        radial-gradient(80% 50% at 0% 100%, rgba(70,90,160,0.28), transparent 60%),
        linear-gradient(180deg, #0a0a0e 0%, #0d0d12 50%, #0a0a0e 100%)
      `,
      fontFamily: '"Pretendard", system-ui, sans-serif'
    }}>
      {/* Notch */}
      <div style={{
        position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
        width: 108, height: 30, background: '#000', borderRadius: 18, zIndex: 5
      }} />
      <LockscreenStatusBar />
      <LockscreenClock />
      <div style={{
        padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8
      }} key={replayKey}>
        {children}
      </div>
    </div>);

}

// --- "Generic" bank notification used as the comparison baseline ---
// Intentionally not branded — gray-ish icon, classic iOS card.
function GenericBankNotification() {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: 12,
      background: 'rgba(40,40,46,0.78)', backdropFilter: 'blur(20px)',
      borderRadius: 18, color: '#fff',
      animation: 'ldy-fade-in 0.4s ease both'
    }}>
      <style>{`
        @keyframes ldy-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        width: 38, height: 38, borderRadius: 9, flexShrink: 0,
        background: 'linear-gradient(180deg,#f4d03f,#e6b800)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 10, color: '#3a2a00',
        boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.12)'
      }}>BANK</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, opacity: 0.85 }}>
          <span style={{ fontWeight: 600 }}>○○뱅킹 · 오후 3:00</span>
          <span style={{ opacity: 0.6, fontSize: 14 }}>⌄</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>입금 700,000원</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.4, marginTop: 2, opacity: 0.92 }}>
          건물주님 05/17 15:00 933862-**-****21<br />
          홍*동 FBS입금 700,000 잔액 20,900,000
        </div>
      </div>
    </div>);

}

Object.assign(window, {
  Lockscreen, GenericBankNotification
});