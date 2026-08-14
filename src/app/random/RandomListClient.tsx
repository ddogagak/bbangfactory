"use client";

import { useMemo, useState } from "react";

type RandomItem = {
  id: string;
  item_name: string | null;
  item_type: string | null;
  series_name: string | null;
  image_url: string | null;
  created_at: string | null;
};

type SortValue = "newest" | "title" | "series";

export default function RandomListClient({
  initialItems,
}: {
  initialItems: RandomItem[];
}) {
  const [series, setSeries] = useState("전체");
  const [sort, setSort] = useState<SortValue>("newest");

  const seriesList = useMemo(() => {
    const values = Array.from(
      new Set(
        initialItems
          .map((item) => item.series_name?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b, "ko"));

    return ["전체", ...values];
  }, [initialItems]);

  const items = useMemo(() => {
    const filtered = initialItems.filter(
      (item) => series === "전체" || item.series_name === series
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
  }, [initialItems, series, sort]);

  return (
    <>
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
          판매중인 랜깡이 없어요.
        </div>
      ) : (
        <section style={gridStyle}>
          {items.map((item) => (
            <article key={item.id} style={cardStyle}>
              <div style={imageWrapStyle}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.item_name ?? "랜깡 이미지"}
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
              </div>
            </article>
          ))}
        </section>
      )}
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
  background: "#f5f5f5",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
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
