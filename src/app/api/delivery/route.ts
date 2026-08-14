import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function normalizePostalCode(value: unknown) {
  const raw = String(value ?? "").trim().replace(/^['"]+/, "");
  if (!raw) return "";

  // Excel/CSV에서 12345.0 형태로 들어온 경우도 12345로 처리
  const decimalMatch = raw.match(/^(\d{1,5})\.0+$/);
  if (decimalMatch) return decimalMatch[1].padStart(5, "0");

  // 일반적인 5자리 우편번호
  const fiveDigitMatch = raw.match(/(?:^|\D)(\d{5})(?:\D|$)/);
  if (fiveDigitMatch) return fiveDigitMatch[1];

  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  // 숫자형 저장 과정에서 맨 앞 0이 사라진 경우 보정
  if (digits.length < 5) return digits.padStart(5, "0");

  return digits.slice(0, 5);
}

function appendMemo(currentMemo: string | null, nextLine: string) {
  const current = String(currentMemo || "").trim();
  return current ? `${current}\n${nextLine}` : nextLine;
}

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
        request_status,
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
      return NextResponse.json(
        { error: "배송현황 조회 실패", detail: error.message },
        { status: 500 }
      );
    }

    const orders = (data || []).filter((order: any) => {
      const shippingRows = Array.isArray(order.domestic_shipping)
        ? order.domestic_shipping
        : order.domestic_shipping
          ? [order.domestic_shipping]
          : [];

      return !shippingRows.some(
        (shipping: any) => shipping?.shipping_status === "done"
      );
    });

    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    return NextResponse.json(
      {
        error: "배송현황 조회 실패",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServiceRoleClient();
    const body = await req.json();

    const orderId = String(body.order_id || "").trim();
    const requestType = String(body.request_type || "").trim();
    const postalCode = normalizePostalCode(body.postal_code);
    const otherText = String(body.other_text || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { error: "주문정보가 없습니다." },
        { status: 400 }
      );
    }

    if (!["direct_keep", "keep", "immediate", "other"].includes(requestType)) {
      return NextResponse.json(
        { error: "요청 종류가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (!postalCode) {
      return NextResponse.json(
        { error: "우편번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (requestType === "other" && !otherText) {
      return NextResponse.json(
        { error: "기타 요청 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // 우편번호는 브라우저로 내려주지 않고 서버에서만 비교합니다.
    const { data: order, error: fetchError } = await supabase
      .from("domestic_order")
      .select("order_id, postal_code, memo, request_status")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        {
          error: "주문정보를 찾을 수 없습니다.",
          detail: fetchError?.message,
        },
        { status: 404 }
      );
    }

    const savedPostalCode = normalizePostalCode(order.postal_code);

    if (!savedPostalCode || postalCode !== savedPostalCode) {
      return NextResponse.json(
        { error: "우편번호가 일치하지 않습니다." },
        { status: 403 }
      );
    }

    const nowText = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (requestType === "keep") {
      const { error } = await supabase
        .from("domestic_order")
        .update({
          request_status: "keep",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (error) {
        return NextResponse.json(
          { error: "킵 요청 저장 실패", detail: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "킵 요청이 접수되었습니다.",
      });
    }

    if (requestType === "immediate") {
      const { error } = await supabase
        .from("domestic_order")
        .update({
          request_status: "immediate",
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (error) {
        return NextResponse.json(
          { error: "바배 요청 저장 실패", detail: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "바배 요청이 접수되었습니다.",
      });
    }

    if (requestType === "direct_keep") {
      const nextMemo = appendMemo(
        order.memo,
        `[고객요청 ${nowText}] 직배킵 요청`
      );

      const { error } = await supabase
        .from("domestic_order")
        .update({
          memo: nextMemo,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (error) {
        return NextResponse.json(
          { error: "직배킵 요청 저장 실패", detail: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "직배킵 요청이 접수되었습니다.",
      });
    }

    const nextMemo = appendMemo(
      order.memo,
      `[고객요청 ${nowText}] 기타 요청: ${otherText}`
    );

    const { error } = await supabase
      .from("domestic_order")
      .update({
        memo: nextMemo,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (error) {
      return NextResponse.json(
        { error: "기타 요청 저장 실패", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "기타 요청이 접수되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "요청 처리 실패",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
