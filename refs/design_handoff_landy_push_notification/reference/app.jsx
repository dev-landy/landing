// Top-level app: header + side-by-side lockscreens.
// Each lockscreen shows the SAME ○○뱅킹 notification on top, then the
// CURRENT Landy notification (baseline) below, then the proposed variant
// — so the visibility delta is immediately visible.

const { useState, useCallback } = React;

// The current Landy notification, as captured in the user's screenshot:
// empty white tile + gray body. Used as the baseline in each board.
function LandyCurrentNotification(){
  return (
    <div style={{
      display:'flex', gap:10, padding:12,
      background:'rgba(40,40,46,0.78)', backdropFilter:'blur(20px)',
      borderRadius:18, color:'#fff',
      animation:'ldy-fade-in 0.4s ease both',
      position:'relative',
    }}>
      {/* Empty white square — the current state */}
      <div style={{
        width:38, height:38, borderRadius:9, flexShrink:0,
        background:'#fff',
      }}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12, opacity:0.85}}>
          <span style={{fontWeight:600}}>랜디 · 방금</span>
          <span style={{opacity:0.6, fontSize:14}}>⌄</span>
        </div>
        <div style={{fontSize:14, fontWeight:700, marginTop:3}}>월세 입금 확인</div>
        <div style={{fontSize:12.5, lineHeight:1.4, marginTop:2, opacity:0.78}}>
          102호실 세입자 홍길동님의 월세 입금을 확인했어요. 월세 수납 이력을 업데이트할게요.
        </div>
      </div>
      {/* "before" tag */}
      <div style={{
        position:'absolute', top:-9, left:14,
        fontSize:9, fontWeight:800, letterSpacing:1, textTransform:'uppercase',
        padding:'2px 7px', borderRadius:4,
        background:'#8590A6', color:'#fff',
      }}>현재</div>
    </div>
  );
}

function NotifBoard({title, kicker, blurb, children}){
  const [k, setK] = useState(0);
  const replay = useCallback(() => setK(x => x+1), []);

  return (
    <div style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      gap:14, padding:'18px 14px 18px',
      background:'#fff', borderRadius:24,
      border:'1px solid var(--line)',
      boxShadow:'var(--sh-card)',
    }}>
      <div style={{textAlign:'center', maxWidth:300}}>
        <div style={{
          display:'inline-block', fontSize:10, fontWeight:700, letterSpacing:1.4,
          color:'var(--brand)', padding:'3px 8px', borderRadius:99,
          background:'var(--brand-soft)', textTransform:'uppercase',
        }}>{kicker}</div>
        <div style={{
          fontSize:19, fontWeight:800, letterSpacing:-0.3, marginTop:8,
          color:'var(--ink)',
        }}>{title}</div>
        <div style={{
          fontSize:12.5, color:'var(--ink-2)', marginTop:5, lineHeight:1.5,
        }}>{blurb}</div>
      </div>

      <Lockscreen replayKey={k}>
        <GenericBankNotification/>
        <LandyCurrentNotification/>
        <div style={{position:'relative'}}>
          <div style={{
            position:'absolute', top:-9, left:14, zIndex:2,
            fontSize:9, fontWeight:800, letterSpacing:1, textTransform:'uppercase',
            padding:'2px 7px', borderRadius:4,
            background:'#1E3A8A', color:'#fff',
          }}>개선안</div>
          {children}
        </div>
      </Lockscreen>

      <button onClick={replay} style={{
        display:'flex', alignItems:'center', gap:6,
        fontFamily:'var(--ff)',
        fontSize:12, fontWeight:700, color:'var(--ink)',
        padding:'8px 14px', borderRadius:99,
        background:'#fff', border:'1px solid var(--line)',
        cursor:'pointer',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2.5 6 a3.5 3.5 0 1 0 1-2.5 M2.5 2 v2 h2"
            stroke="currentColor" strokeWidth="1.4" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        도착 애니메이션 재생
      </button>
    </div>
  );
}

function Intro(){
  return (
    <div style={{maxWidth:1100, margin:'0 auto', padding:'48px 32px 8px'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
        <LandyMark size={32} ink="#fff" bg="#1E3A8A" strong/>
        <div style={{
          fontSize:11, fontWeight:700, letterSpacing:1.4,
          color:'var(--brand)', textTransform:'uppercase',
        }}>Landy · 푸시 알림 가시성 개선</div>
      </div>
      <h1 style={{
        fontSize:38, fontWeight:800, letterSpacing:-1.2, margin:'0 0 12px',
        maxWidth:780, lineHeight:1.1, color:'var(--ink)',
      }}>
        ‘있는 줄도 몰랐던 알림’에서 <span style={{color:'var(--brand)'}}>‘바로 눈에 들어오는 알림’</span>으로.
      </h1>
      <p style={{
        maxWidth:680, color:'var(--ink-2)', lineHeight:1.6, fontSize:14.5, margin:0,
      }}>
        현재 Landy 알림은 빈 흰색 아이콘 + 회색 본문으로 ○○뱅킹 같은 다른 알림에 묻혀버립니다.
        같은 ‘월세 입금 확인’ 시나리오를 Landy의 네이비 + 호실 그리드 비주얼 시스템에 맞춰
        세 가지 모션 중심 방향으로 풀었어요. 모든 시안은 위쪽 ○○뱅킹 알림과
        ‘현재’ Landy 알림 바로 아래에 놓고 비교할 수 있게 했고, 도착 모션이 핵심이라
        카드 아래 ‘재생’ 버튼으로 반복해서 볼 수 있습니다.
      </p>

      <div style={{
        marginTop:24, display:'grid', gridTemplateColumns:'repeat(4, minmax(0,1fr))',
        gap:10, fontSize:12, color:'var(--ink-2)',
      }}>
        {[
          ['브랜드 컬러', '#1E3A8A 네이비 — Landy 디자인 시스템 그대로'],
          ['로고', '3×3 호실 그리드 마크 (Landy 시그니처)'],
          ['핵심 위계', '금액(헤드라인) → 호수·세입자 → 상태'],
          ['모션 원칙', '0.4–0.6s · easeOutBack 계열 “착지감”'],
        ].map(([k,v]) => (
          <div key={k} style={{
            padding:'10px 12px', background:'#fff', borderRadius:12,
            border:'1px solid var(--line)',
          }}>
            <div style={{fontSize:10, fontWeight:700, letterSpacing:1.2, color:'var(--ink-3)', textTransform:'uppercase'}}>{k}</div>
            <div style={{marginTop:4, lineHeight:1.45}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App(){
  return (
    <div style={{paddingBottom:80}}>
      <Intro/>
      <div style={{
        maxWidth:1240, margin:'32px auto 0', padding:'0 32px',
        display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))',
        gap:18,
      }} data-screen-label="01 Variations">
        <NotifBoard
          kicker="V1 · Color Pop"
          title="카드 전체를 Landy 네이비로"
          blurb="다른 다크 알림들 사이에서 단 하나만 Landy 네이비로 떠오릅니다. 금액이 Pretendard tnum으로 크게, 호실·세입자은 칩으로 정리. 도착 시 카드가 살짝 튀어오르며 호실 그리드 로고가 스탬프처럼 찍히고 링 펄스가 퍼집니다."
        >
          <LandyV1_ColorPop/>
        </NotifBoard>

        <NotifBoard
          kicker="V2 · Hierarchy Burst"
          title="형태는 그대로, 위계만 다시"
          blurb="iOS 다크 카드 규격을 지키되 왼쪽 네이비 액센트 레일 + 큰 제목 + 카운트업 금액으로 ‘스캔 한 번에 끝나는’ 정보 구조를 만듭니다. 가장 보수적·도입 부담이 적은 방향."
        >
          <LandyV2_HierarchyBurst/>
        </NotifBoard>

        <NotifBoard
          kicker="V3 · Live Activity"
          title="알림이 곧 작은 대시보드"
          blurb="확장형 카드에 ‘입금 완료’ 상태 + 금액 + Landy 시그니처인 호실 그리드로 이번 달 수납 현황까지 한 번에. 102호 셀이 초록으로 점등되며 동전 스프링클이 튀어요. 사장님 사용자에게 가장 만족도 높을 방향."
        >
          <LandyV3_LiveActivity/>
        </NotifBoard>
      </div>

      <div style={{
        maxWidth:1100, margin:'40px auto 0', padding:'24px 28px',
        background:'#fff', borderRadius:18, border:'1px solid var(--line)',
        display:'grid', gridTemplateColumns:'180px 1fr', gap:24,
        boxShadow:'var(--sh-card)',
      }}>
        <div>
          <div style={{
            fontSize:10, fontWeight:700, letterSpacing:1.4, color:'var(--ink-3)',
            textTransform:'uppercase',
          }}>다음 단계 제안</div>
          <div style={{fontSize:18, fontWeight:800, marginTop:6, lineHeight:1.25, color:'var(--ink)'}}>
            한 방향을 고른 뒤,<br/>상태별로 풀어볼게요
          </div>
        </div>
        <ul style={{
          margin:0, padding:0, listStyle:'none', display:'grid', gap:10, fontSize:13.5,
          color:'var(--ink-2)', lineHeight:1.5,
        }}>
          <li>· <b style={{color:'var(--ink)'}}>입금 예정 D-3</b> — 같은 시스템에서 warn 톤(#D9770A) 액센트 변형</li>
          <li>· <b style={{color:'var(--ink)'}}>연체 18일</b> — 호실 상세 화면과 동일한 danger 톤, 모션은 차분하게</li>
          <li>· <b style={{color:'var(--ink)'}}>그룹 입금</b> — 같은 날 여러 호실 입금 시 묶음 알림 ("3건 700,000원씩" + 그리드)</li>
          <li>· <b style={{color:'var(--ink)'}}>Android 변형</b> — Material 3 expanded notification (BigTextStyle) 적용</li>
        </ul>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
