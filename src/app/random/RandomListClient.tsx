"use client";

import { useMemo, useState } from "react";

type RandomItem = {
  id: string;
  item_name: string | null;
  item_type: string | null;
  series_name: string | null;
  image_url: string | null;
  lineup_image_url?: string | null;
  public_comment?: string | null;
  created_at: string | null;
};

type SortValue = "newest" | "title" | "series";

export default function RandomListClient({
  initialItems,
  seriesOptions,
}: {
  initialItems: RandomItem[];
  seriesOptions: string[];
}) {
  const [series, setSeries] = useState("전체");
  const [lineupImage, setLineupImage] = useState<string | null>(null);
  const [sort, setSort] = useState<SortValue>("newest");
  const [itemType, setItemType] = useState("전체");
  const [query, setQuery] = useState("");

  const seriesList = useMemo(() => {
    const values = Array.from(
      new Set(
        [...seriesOptions, ...initialItems.map((item) => item.series_name ?? "")]
          .map((value) => value.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "ko"));

    return ["전체", ...values];
  }, [initialItems, seriesOptions]);

  const typeList = useMemo(() => ["전체", ...Array.from(new Set(initialItems.map((item) => (item.item_type ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"))], [initialItems]);

  const items = useMemo(() => {
    const filtered = initialItems.filter(
      (item) => (series === "전체" || item.series_name === series) &&
        (itemType === "전체" || item.item_type?.trim() === itemType) &&
        [item.item_name, item.series_name, item.item_type].some((value) => (value ?? "").toLocaleLowerCase("ko").includes(query.trim().toLocaleLowerCase("ko")))
    );

    return [...filtered].sort((a, b) => {
      if (sort === "title") {
        return String(a.item_name ?? "").localeCompare(
          String(b.item_name ?? ""),
          "ko"
        );
      }

      if (sort === "series") {
        return String(a.series_name ?? "").localeCompare(
          String(b.series_name ?? ""),
          "ko"
        );
      }

      return (
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
      );
    });
  }, [initialItems, series, itemType, query, sort]);

  return (
    <>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="빵 이름, 애니, 굿즈 검색" aria-label="랜덤빵 검색" style={{...selectStyle, marginTop: 14, boxSizing: "border-box"}} />
      <div style={toolBarStyle}>
        <select
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          aria-label="애니 필터"
          style={selectStyle}
        >
          {seriesList.map((value) => (
            <option key={value} value={value}>
              {value === "전체" ? "전체 애니" : value}
            </option>
          ))}
        </select>

        <select value={itemType} onChange={(e) => setItemType(e.target.value)} aria-label="굿즈 종류 필터" style={selectStyle}>
          {typeList.map((value) => <option key={value} value={value}>{value === "전체" ? "전체 굿즈" : value}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          aria-label="정렬"
          style={selectStyle}
        >
          <option value="newest">최신 등록순</option>
          <option value="title">제목순</option>
          <option value="series">애니순</option>
        </select>
      </div>

      <div style={countStyle}>{items.length}개</div>

      {items.length === 0 ? (
        <div className="delivery-empty" style={{ marginTop: 16, padding: "48px 15px" }}>
          검색 조건에 맞는 랜덤빵이 없어요.
        </div>
      ) : (
        <section style={gridStyle}>
          {items.map((item) => (
            <article key={item.id} style={cardStyle}>
              <div style={imageWrapStyle}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.item_name ?? "랜덤빵 이미지"}
                    style={imageStyle}
                    loading="lazy"
                  />
                ) : (
                  <div style={emptyImageStyle}>NO IMAGE</div>
                )}
              </div>

              <div style={bodyStyle}>
                <div style={tagRowStyle}>
                  <span style={seriesTagStyle}>{item.series_name || "기타"}</span>
                  {item.item_type ? (
                    <span style={typeTagStyle}>{item.item_type}</span>
                  ) : null}
                </div>

                <div style={titleStyle}>{item.item_name || "제목 없음"}</div>
                {item.public_comment ? <div style={{marginTop:6,padding:"5px 7px",borderRadius:6,background:"#fff7db",fontSize:11,lineHeight:1.35,fontWeight:700,color:"#173d91",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",wordBreak:"break-word"}}>{item.public_comment}</div> : null}
                {item.lineup_image_url ? (
                  <button type="button" style={lineupButtonStyle} onClick={() => setLineupImage(item.lineup_image_url ?? null)}>라인업 보기 ↗</button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
      {lineupImage ? (
        <div style={lineupBackdropStyle} onClick={() => setLineupImage(null)}>
          <div role="dialog" aria-modal="true" aria-label="라인업 이미지" style={lineupDialogStyle} onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label="라인업 닫기" style={lineupCloseStyle} onClick={() => setLineupImage(null)}>×</button>
            <img src={lineupImage} alt="상품 라인업 이미지" style={lineupImageStyle} />
          </div>
        </div>
      ) : null}
    </>
  );
}

const toolBarStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
  gap: 8,
  marginTop: 14,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  height: 42,
  padding: "0 10px",
  border: "2px solid #111",
  borderRadius: 12,
  background: "#fff",
  fontSize: 13,
  fontWeight: 800,
  color: "#111",
};

const countStyle: React.CSSProperties = {
  margin: "10px 2px 8px",
  textAlign: "right",
  fontSize: 12,
  fontWeight: 800,
  opacity: 0.55,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  paddingBottom: 90,
};

const cardStyle: React.CSSProperties = {
  overflow: "hidden",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "#fff",
};

const imageWrapStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1.13",
  overflow: "hidden",
  background: "#fff",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "contain",
};

const emptyImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 900,
  opacity: 0.35,
};

const bodyStyle: React.CSSProperties = {
  padding: "9px 9px 11px",
};

const tagRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 5,
  marginBottom: 7,
};

const seriesTagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 20,
  padding: "2px 7px",
  borderRadius: 999,
  background: "#eaf1ff",
  fontSize: 10,
  fontWeight: 900,
  lineHeight: 1.1,
};

const typeTagStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 20,
  padding: "2px 7px",
  borderRadius: 999,
  background: "#fff3b8",
  fontSize: 10,
  fontWeight: 900,
  lineHeight: 1.1,
};

const titleStyle: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  minHeight: 38,
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 900,
  wordBreak: "keep-all",
};

const lineupButtonStyle: React.CSSProperties = {
  display: "block", marginTop: 8, padding: "7px 10px", width: "100%",
  border: "1px solid #111", borderRadius: 8, background: "#fff",
  color: "#111", fontSize: 12, fontWeight: 800, cursor: "pointer",
};
const lineupBackdropStyle: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 9999, padding: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(0, 0, 0, 0.75)",
};
const lineupDialogStyle: React.CSSProperties = {
  position: "relative", width: "100%", maxWidth: 720, maxHeight: "90dvh",
  padding: "50px 12px 12px", borderRadius: 14, background: "#fff",
  display: "flex", justifyContent: "center",
};
const lineupCloseStyle: React.CSSProperties = {
  position: "absolute", top: 8, right: 10, width: 34, height: 34,
  border: "1px solid #111", borderRadius: 18, background: "#fff",
  fontSize: 25, cursor: "pointer",
};
const lineupImageStyle: React.CSSProperties = {
  display: "block", maxWidth: "100%", maxHeight: "calc(90dvh - 70px)",
  objectFit: "contain",
};
