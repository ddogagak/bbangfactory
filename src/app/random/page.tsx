import RandomListClient from "./RandomListClient";
import { getPublicSaleItems, type PublicSaleItem } from "@/lib/public-sale-inventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RandomPage() {
  let data: PublicSaleItem[] = [];
  let error: Error | null = null;

  try {
    data = await getPublicSaleItems("display");
  } catch (caught) {
    error = caught instanceof Error ? caught : new Error("목록 조회 실패");
  }

  return (
    <main className="delivery-shell">
      <header className="delivery-head compact-head">
        <a href="/" className="back-button">←</a>
        <div>
          <p className="delivery-kicker">DOPAMINE BBANG FACTORY</p>
          <h1>랜깡LIST</h1>
        </div>
        <span className="head-bolt">ϟ</span>
      </header>

      <section className="delivery-content">
        {error ? (
          <div className="delivery-empty" style={{ marginTop: 30, padding: "50px 15px" }}>
            랜깡 목록을 불러오지 못했어요.
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.55 }}>
              {error.message}
            </div>
          </div>
        ) : (
          <RandomListClient initialItems={data ?? []} />
        )}
      </section>

      <nav className="bottom-nav">
        <a href="/">HOME</a>
        <a href="/delivery">배송</a>
        <a className="active" href="/random">랜깡LIST</a>
        <a href="/catalog">COLLECTION</a>
      </nav>
    </main>
  );
}
