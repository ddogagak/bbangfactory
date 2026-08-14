import CollectionListClient from "./CollectionListClient";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CatalogPage() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id,item_name,item_type,series_name,image_url,created_at")
    .eq("status", "판매완료")
    .order("created_at", { ascending: false });

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
