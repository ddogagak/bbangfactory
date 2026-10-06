import CollectionListClient from "./CollectionListClient";
import { getPublicSaleItems, type PublicSaleItem } from "@/lib/public-sale-inventory";

export const dynamic = "force-dynamic";
// Public sale inventory is loaded fresh from ddoga on every request.
export const revalidate = 0;

export default async function CatalogPage() {
  let data: PublicSaleItem[] = [];
  let error: Error | null = null;

  try {
    const [completedItems, legacyItemsResult] = await Promise.all([
      getPublicSaleItems("completed"),
      (async () => {
        const { createServiceRoleClient } = await import("@/lib/supabase/server");
        const supabase = createServiceRoleClient();
        return supabase
          .from("inventory_items")
          .select("id,item_name,item_type,series_name,image_url,created_at")
          .in("status", ["판매중", "판매완료"])
          .order("created_at", { ascending: false });
      })(),
    ]);

    if (legacyItemsResult.error) throw legacyItemsResult.error;

    const merged = [...completedItems, ...(legacyItemsResult.data ?? [])] as PublicSaleItem[];
    const seen = new Set<string>();
    data = merged.filter((item) => {
      const key = [
        String(item.item_name || "").trim().toLowerCase(),
        String(item.image_url || "").trim().toLowerCase(),
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (caught) {
    error = caught instanceof Error ? caught : new Error("목록 조회 실패");
  }

  return (
    <main className="delivery-shell">
      <header className="delivery-head compact-head">
        <a href="/" className="back-button">←</a>
        <div>
          <p className="delivery-kicker">DOPAMINE BBANG FACTORY</p>
          <h1>COLLECTION</h1>
        </div>
        <span className="head-bolt">ϟ</span>
      </header>

      <section className="delivery-content">
        {error ? (
          <div className="delivery-empty" style={{ marginTop: 16, padding: "48px 15px" }}>
            컬렉션을 불러오지 못했어요.
          </div>
        ) : (
          <CollectionListClient initialItems={data ?? []} />
        )}
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
