import RandomListClient from "./RandomListClient";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getPublicSaleItems, type PublicSaleItem } from "@/lib/public-sale-inventory";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RandomPage() {
  let data: PublicSaleItem[] = [];
  let error: Error | null = null;
  let seriesOptions: string[] = [];

  try {
    const [items, categories] = await Promise.all([
      getPublicSaleItems("display"),
      createServiceRoleClient().from("inventory_items").select("series_name"),
    ]);
    data = items;
    if (categories.error) throw categories.error;
    seriesOptions = Array.from(new Set((categories.data ?? [])
      .map((row) => String(row.series_name ?? "").trim())
      .filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
  } catch (caught) {
    error = caught instanceof Error ? caught : new Error("목록 조회 실패");
  }

  return (
    <main className="delivery-shell">
      <header className="delivery-head compact-head">
        <a href="/" className="back-button">←</a>
        <div>
          <p className="delivery-kicker">DOPAMINE BBANG FACTORY</p>
          <h1>랜덤빵 LIST</h1>
        </div>
        <span className="head-bolt">ϟ</span>
      </header>

      <section className="delivery-content">
        <p style={{ margin: "0 0 4px", fontSize: 13, lineHeight: 1.4, fontWeight: 800, color: "var(--blue-dark)" }}>입고 완료된 빵 리스트입니다</p>
        {error ? (
          <div className="delivery-empty" style={{ marginTop: 30, padding: "50px 15px" }}>
            랜덤빵 목록을 불러오지 못했어요.
            <div style={{ marginTop: 8, fontSize: 11, opacity: 0.55 }}>
              {error.message}
            </div>
          </div>
        ) : (
          <RandomListClient initialItems={data ?? []} seriesOptions={seriesOptions} />
        )}
      </section>

      <nav className="bottom-nav">
        <a href="/">HOME</a>
        <a href="/delivery">배송</a>
        <a className="active" href="/random">랜덤빵 LIST</a>
        <a href="/catalog">SOLDOUT 빵</a>
      </nav>
    </main>
  );
}
