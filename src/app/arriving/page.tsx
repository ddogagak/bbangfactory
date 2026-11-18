import RandomListClient from "../random/RandomListClient";
import { getPublicArrivingItems } from "@/lib/public-arriving-inventory";
import type { PublicSaleItem } from "@/lib/public-sale-inventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArrivingPage() {
  let items: PublicSaleItem[] = [];
  let failed = false;
  try {
    items = await getPublicArrivingItems();
  } catch (error) {
    console.error("Arriving inventory lookup failed", error);
    failed = true;
  }

  return (
    <main className="delivery-shell">
      <header className="delivery-head compact-head">
        <a href="/" className="back-button" aria-label="홈으로">←</a>
        <div>
          <p className="delivery-kicker">DOPAMINE BBANG FACTORY</p>
          <h1>빵굽는중</h1>
        </div>
        <span className="head-bolt">ϟ</span>
      </header>
      <section className="delivery-content">
        <div className="arriving-banner">
          <span className="arriving-label">ARRIVING SOON</span>
          <strong>따끈따끈한 빵이 오는 중!</strong>
          <p>아직 입고 전인 빵들이에요. 곧 방송에서 만나요!</p>
        </div>
        {failed ? (
          <div className="delivery-empty" style={{ marginTop: 16, padding: "48px 15px" }}>목록을 불러오지 못했어요. 잠시 후 다시 확인해주세요.</div>
        ) : (
          <RandomListClient initialItems={items} seriesOptions={[]} mode="arriving" />
        )}
      </section>
      <nav className="bottom-nav">
        <a href="/">HOME</a>
        <a href="/delivery">배송</a>
        <a href="/random">랜덤빵 LIST</a>
        <a className="active" aria-current="page" href="/arriving">빵굽는중</a>
        <a href="/catalog">SOLDOUT 빵</a>
      </nav>
    </main>
  );
}
