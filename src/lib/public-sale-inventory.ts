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

  let ledgerQuery = supabase
    .from("purchase_sale_inventory")
    .select("purchase_item_id,stock_status,sale_memo,sold_out_at");

  ledgerQuery = mode === "completed"
    ? ledgerQuery.eq("stock_status", "soldout")
    : ledgerQuery.eq("stock_status", "active");

  const { data: ledgers, error: ledgerError } = await ledgerQuery;
  if (ledgerError) throw ledgerError;

  const visibleLedgers = (ledgers ?? []).filter((row: any) =>
    mode === "completed" || !String(row.sale_memo || "").startsWith(HIDDEN_MARKER)
  );
  const purchaseItemIds = visibleLedgers
    .map((row: any) => String(row.purchase_item_id || "").trim())
    .filter(Boolean);

  if (!purchaseItemIds.length) return [];

  const { data: purchaseItems, error: itemError } = await supabase
    .from("purchase_items")
    .select("id,product_name,display_name_ko,image_url,sourcing_inventory_id,created_at")
    .in("id", purchaseItemIds);

  if (itemError) throw itemError;

  const sourcingIds = Array.from(new Set(
    (purchaseItems ?? [])
      .map((item: any) => String(item.sourcing_inventory_id || "").trim())
      .filter(Boolean)
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
  const ledgerByItemId = new Map(visibleLedgers.map((row: any) => [String(row.purchase_item_id), row]));

  return (purchaseItems ?? []).map((item: any) => {
    const sourcing: any = sourcingById.get(String(item.sourcing_inventory_id || "")) || null;
    const ledger: any = ledgerByItemId.get(String(item.id)) || null;

    return {
      id: String(item.id),
      item_name: item.display_name_ko || sourcing?.item_name || item.product_name || null,
      item_type: sourcing?.item_type || null,
      series_name: sourcing?.series_name || null,
      image_url: item.image_url || sourcing?.image_url || null,
      created_at: mode === "completed"
        ? ledger?.sold_out_at || item.created_at || null
        : item.created_at || null,
    };
  });
}
