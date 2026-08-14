export default function CatalogPage() {
  return (
    <main className="delivery-shell">
      <header className="delivery-head compact-head">
        <a href="/" className="back-button">←</a>
        <div>
          <p className="delivery-kicker">DOPAMINE BBANG FACTORY</p>
          <h1>COLLECT BOOK</h1>
        </div>
        <span className="head-bolt">ϟ</span>
      </header>

      <section className="delivery-content">
        <div className="delivery-empty" style={{ marginTop: "30px", padding: "60px 15px" }}>
          준비중
        </div>
      </section>

      <nav className="bottom-nav">
        <a href="/">HOME</a>
        <a href="/delivery">배송</a>
        <a href="/random">랜깡LIST</a>
        <a className="active" href="/catalog">COLLECTION</a>
      </nav>
    </main>
  );
}
