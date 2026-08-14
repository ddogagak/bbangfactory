import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function normalizePostalCode(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").trim();
}

function appendMemo(currentMemo: string | null, nextLine: string) {
  const current = String(currentMemo || "").trim();
  return current ?