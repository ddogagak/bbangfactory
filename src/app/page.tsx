const Breads = ({ count = 8 }: { count?: number }) => (
  <div className="bread-row" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div className={`bread bread-${(i % 4) + 1}`} key={i}>
        <span className="bread-face">•ᴗ•</span>
      </div>
    ))}
  </div>
);

export default function Home() {
  return (
    <main className="site-shell">
      <section className="hero">
        <div className="decor pipe pipe-left" />
        <div className="decor pipe pipe-right" />
        <div className="spark spark-1">✦</div>
        <div className="spark spark-2">✦</div>
        <div className="mini-brand">DOPAMINE BBANG FACTORY</div>
        <div className="factory-sign">
          <span className="main-title">도파민빵 팩토리</span>
          <span className="sign-bolt">ϟ</span>
        </div>
        <p className="hero-copy">오늘도 도파민 생산중</p>
        <div className="conveyor">
          <Breads count={9} />
          <div className="belt">
            {Array.from({ length: 12 }).map((_, i) => <i key={i} />)}
          </div>
        </div>
      </section>
      <section className="dashboard">
        <a className="panel panel-wide cream-panel" href="/delivery">
          <div className="panel-icon machine-icon"><span /><span /><span /></div>
          <div><p className="eyebrow">MY ORDER</p><h2>배송/킵 현황 및 요청</h2><p>배송 관련 조회 & 요청 하러가기</p></div>
          <span className="arrow">→</span>
        </a>
        <div className="two-col">
          <a className="panel yellow-panel" href="/random">
            <div className="window"><div className="tiny-breads"><span /><span /><span /></div></div>
            <p className="eyebrow">OPEN NOW</p><h2>랜깡LIST</h2><p>재고리스트</p><span className="corner-bolt">ϟ</span>
          </a>
          <a className="panel blue-panel" href="/catalog">
            <div className="card-stack" aria-hidden="true"><span /><span /><span /></div>
            <p className="eyebrow">COLLECTION</p><h2>COLLECT BOOK</h2><p>랜깡 정보 조회하기</p><span className="arrow light">→</span>
          </a>
        </div>
        <div className="mini-factory"><Breads count={7} /></div>
      </section>
      <nav className="bottom-nav">
        <a className="active" href="/">HOME</a><a href="/delivery">배송</a><a href="/random">랜깡LIST</a><a href="/catalog">COLLECTION</a>
      </nav>
    </main>
  );
}
