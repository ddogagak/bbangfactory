import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";

const HIDDEN_MARKER = "[[HIDDEN]]";

export type PublicSaleItem = {
  id: string;
  item_name: string | null;
  item_type: string | null;
  series_name: string | null;
  image_url: string | null;
  created_at: string | null;
};

export async function getPublicSaleItems(mode: "display" | "completed"): Promise<PublicSaleItem[]> {
  const supabase = createServiceRoleClient();

  const [{ data: orders, error: orderError }, { data: ledgers, error: ledgerError }] = await Promise.all([
    supabase
      .from("purchase_orders")
      .select("ordered_at,purchase_items(id,product_name,display_name_ko,image_url,sourcing_inventory_id,created_at)")
      .eq("order_status", "입고완료"),
    supabase
      .from("purchase_sale_inventory")
      .select("purchase_item_id,stock_status,sale_memo,sold_out_at"),
  ]);

  if (orderError) throw orderError;
  if (ledgerError) throw ledgerError;

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
      .select("id,item_name,item_type,series_name,image_url")
      .in("id", sourcingIds);
    if (error) throw error;
    sourcingRows = data ?? [];
  }

  const sourcingById = new Map(sourcingRows.map((row: any) => [String(row.id), row]));

  return purchaseItems.flatMap((item: any) => {
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
      series_name: sourcing?.series_name || null,
      image_url: imageUrl,
      created_at: mode === "completed"
        ? ledger?.sold_out_at || item.created_at || item.order_date || null
        : item.created_at || item.order_date || null,
    }];
  });
}
