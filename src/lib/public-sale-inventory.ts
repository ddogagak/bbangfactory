import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";

const HIDDEN_MARKER = "[[HIDDEN]]";

export type PublicSaleItem = {
  id: string;
  item_name: string | null;
  item_type: string | null;
  series_name: string | null;
  series_tags?: string[];
  image_url: string | null;
  lineup_image_url: string | null;
  public_comment: string | null;
  created_at: string | null;
};

export async function getPublicSaleItems(mode: "display" | "completed"): Promise<PublicSaleItem[]> {
  const supabase = createServiceRoleClient();

  const [{ data: orders, error: orderError }, { data: ledgers, error: ledgerError }, boxesResult] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("ordered_at,purchase_items(id,product_name,display_name_ko,image_url,sourcing_inventory_id,series_name,created_at)")
      .eq("order_status", "입고완료"),
    supabase
      .from("purchase_sale_inventory")
      .select("*"),
    supabase
      .from("sale_random_boxes")
      .select("id,title,image_url,public_comment,series_tags,created_at,updated_at")
      .eq("view_status", mode),
  ]);

  if (orderError) throw orderError;
  if (ledgerError) throw ledgerError;
  if (boxesResult.error) throw boxesResult.error;

  const ledgerByItemId = new Map((ledgers ?? []).map((row: any) => [String(row.purchase_item_id), row]));
  const purchaseItems = (orders ?? []).flatMap((order: any) =>
    (order.purchase_items ?? []).map((item: any) => ({ ...item, order_date: order.ordered_at }))
  );

  const sourcingIds = Array.from(new Set(
    purchaseItems.map((item: any) => String(item.sourcing_inventory_id || "").trim()).filter(Boolean)
  ));

  let sourcingRows: any[] = [];
  if (sourcingIds.length) {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("id,item_name,item_type,series_name,image_url,lineup_image_url")
      .in("id", sourcingIds);
    if (error) throw error;
    sourcingRows = data ?? [];
  }

  const sourcingById = new Map(sourcingRows.map((row: any) => [String(row.id), row]));

  const standardItems: PublicSaleItem[] = purchaseItems.flatMap((item: any) => {
    const sourcing: any = sourcingById.get(String(item.sourcing_inventory_id || "")) || null;
    const ledger: any = ledgerByItemId.get(String(item.id)) || null;
    const imageUrl = item.image_url || sourcing?.image_url || null;

    const viewStatus =
      ledger?.stock_status === "soldout"
        ? "completed"
        : String(ledger?.sale_memo || "").startsWith(HIDDEN_MARKER)
          ? "hidden"
          : ledger
            ? "display"
            : imageUrl
              ? "display"
              : "hidden";

    if (viewStatus !== mode) return [];

    return [{
      id: String(item.id),
      item_name: item.display_name_ko || sourcing?.item_name || item.product_name || null,
      item_type: sourcing?.item_type || null,
      series_name: item.series_name || sourcing?.series_name || null,
      image_url: imageUrl,
      lineup_image_url: sourcing?.lineup_image_url || null,
      public_comment: String(ledger?.public_comment || "").replace(/[\r\n\t]+/g, " ").trim() || null,
      created_at: mode === "completed"
        ? ledger?.sold_out_at || item.created_at || item.order_date || null
        : item.created_at || item.order_date || null,
    }];
  });

  const randomBoxes: PublicSaleItem[] = (boxesResult.data ?? []).map((box) => {
    const seriesTags = Array.from(new Set<string>((box.series_tags ?? []).map((tag: string) => tag.trim()).filter(Boolean)));
    return {
      id: `random-box-${box.id}`,
      item_name: box.title || null,
      item_type: "랜깡",
      series_name: seriesTags[0] || "랜덤박스",
      series_tags: seriesTags,
      image_url: box.image_url || null,
      lineup_image_url: box.image_url || null,
      public_comment: String(box.public_comment || "").replace(/[\r\n\t]+/g, " ").trim() || null,
      created_at: mode === "completed" ? box.updated_at || box.created_at : box.created_at,
    };
  });

  return [...standardItems, ...randomBoxes];
}
