import RandomListClient from "./RandomListClient";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RandomPage() {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id,item_name,item_type,series_name,image_url,created_at")
    .eq("status", "판매중")
    .order("created_at", { ascending: false });

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
