import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PublicSaleItem } from "@/lib/public-sale-inventory";

// Mirror the pre-arrival stages in DDOGA's purchase management screen.
const ARRIVING_STATUSES = ["주문완료", "현지배송", "배대지", "국제배송", "통관"];

export async function getPublicArrivingItems(): Promise<PublicSaleItem[]> {
  const supabase = createServiceRoleClient();
  const items: any[] = [];
  const pageSize = 500;

  // Query item rows directly so the API's row limit cannot truncate the list.
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("purchase_items")
      .select("id,product_name,display_name_ko,image_url,sourcing_inventory_id,series_name,item_type,created_at,purchase_orders!inner(order_status)")
      .in("purchase_orders.order_status", ARRIVING_STATUSES)
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    items.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }

  const sourcingIds = [...new Set<string>(items.map(item => item.sourcing_inventory_id).filter(Boolean))];
  const sourcingById = new Map<string, any>();
  for (let offset = 0; offset < sourcingIds.length; offset += 100) {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("id,item_name,item_type,series_name,image_url,lineup_image_url")
      .in("id", sourcingIds.slice(offset, offset + 100));
    if (error) throw error;
    for (const row of data ?? []) sourcingById.set(row.id, row);
  }

  // Only customer-facing fields are passed to the browser.
  return items.map(item => {
    const sourcing = sourcingById.get(item.sourcing_inventory_id);
    return {
      id: item.id,
      item_name: item.display_name_ko || sourcing?.item_name || item.product_name || null,
      item_type: item.item_type || sourcing?.item_type || null,
      series_name: String(item.series_name || "").trim() === "기타"
        ? sourcing?.series_name || item.series_name
        : item.series_name || sourcing?.series_name || null,
      image_url: item.image_url || sourcing?.image_url || null,
      lineup_image_url: sourcing?.lineup_image_url || null,
      public_comment: null,
      created_at: item.created_at || null,
    };
  });
}
