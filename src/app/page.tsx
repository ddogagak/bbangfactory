const Breads = ({ count = 8 }: { count?: number }) => (
  <div className="bread-row" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div className={`bread bread-${(i % 4) + 1}`} key={i}>
        <span className="bread-face">•ᴗ•</span>
      </div>
    ))}
  </div>
);

function FactoryPipe() {
  return (
    <div className="pipe-scene" aria-hidden="true">
      <div className="pipe pipe-a" />
      <div className="pipe pipe-b" />
      <div className="pipe pipe-c" />
      <div className="spark spark-a">✦</div>
      <div className="spark spark-b">✦</div>
      <div className="spark spark-c">✦</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <section className="hero">
        <FactoryPipe />

        <div className="mini-brand">DOPAMINE BBANG FACTORY</div>

        <div className="factory-sign">
          <span className="sign-top">도파민빵</span>
          <span className="sign-bottom">팩토리</span>
          <span className="bolt bolt-left">ϟ</span>
          <span className="bolt bolt-right">ϟ</span>
        </div>

        <p className="hero-copy">오늘도 도파민 생산중</p>

        <div className="conveyor">
          <Breads count={9} />
          <div className="belt">
            {Array.from({ length: 12 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard">
        <a className="panel panel-wide cream-panel" href="/delivery">
          <div className="panel-icon machine-icon">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">MY ORDER</p>
            <h2>배송 & KEEP 조회</h2>
            <p>내 물건 어디까지 왔지?</p>
          </div>
          <span className="arrow">→</span>
        </a>

        <div className="two-col">
          <a className="panel yellow-panel" href="/random">
            <div className="window">
              <div className="tiny-breads">
                <span />
                <span />
                <span />
              </div>
            </div>
            <p className="eyebrow">OPEN NOW</p>
            <h2>랜깡 LIST</h2>
            <p>오늘 뭐 깔까?</p>
            <span className="corner-bolt">ϟ</span>
          </a>

          <a className="panel blue-panel" href="/catalog">
            <div className="card-stack" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="eyebrow">CARD BOOK</p>
            <h2>도감</h2>
            <p>시리즈별 카드 한눈에</p>
            <span className="arrow light">→</span>
          </a>
        </div>

        <div className="mini-factory">
          <div className="mini-pipe left" />
          <div className="mini-pipe right" />
          <Breads count={7} />
        </div>
      </section>

      <nav className="bottom-nav">
        <a className="active" href="/">HOME</a>
        <a href="/random">랜깡</a>
        <a href="/catalog">도감</a>
        <a href="/delivery">배송</a>
      </nav>
    </main>
  );
}
