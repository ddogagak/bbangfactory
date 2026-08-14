import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("domestic_order")
      .select(`
        order_id,
        platform,
        first_order_date,
        nickname,
        order_status,
        order_count,
        created_at,
        domestic_shipping (
          carrier,
          shipping_type,
          tracking_number,
          shipping_status
        )
      `)
      .eq("platform", "wise")
      .neq("order_status", "done")
      .order("first_order_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "배송현황 조회 실패", detail: error.message }, { status: 500 });
    }

    const orders = (data || []).filter((order: any) => {
      const shippingRows = Array.isArray(order.domestic_shipping)
        ? order.domestic_shipping
        : order.domestic_shipping
          ? [order.domestic_shipping]
          : [];

      return !shippingRows.some((shipping: any) => shipping?.shipping_status === "done");
    });

    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    return NextResponse.json(
      { error: "배송현황 조회 실패", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
