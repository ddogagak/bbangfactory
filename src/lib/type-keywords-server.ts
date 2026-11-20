import "server-only";
import {createServiceRoleClient} from "@/lib/supabase/server";
import type {TypeKeywordRule} from "./item-analysis-type";
export async function getTypeKeywords():Promise<TypeKeywordRule[]>{
 const {data,error}=await createServiceRoleClient().from("item_analysis_type_keywords").select("type_name,keywords").order("type_name");
 if(error){console.error("public type keyword lookup",error);return [];}return data??[];
}
