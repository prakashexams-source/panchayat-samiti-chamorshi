"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
  createdAt?: any;
};

/* =========================================================
   GOOGLE DRIVE IMAGE URL CONVERTER
   ========================================================= */

function getDriveFileId(url: string) {
  if (!url) return "";

  // Format:
  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);

  if (fileMatch?.[1]) {
    return fileMatch[1];
  }

  // Format:
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  // https://drive.google.com/thumbnail?id=FILE_ID
  const idMatch = url.match(/[?&]id=([^&]+)/);

  if (idMatch?.[1]) {
    return idMatch[1];
  }

  return "";
}

function getImageUrl(url: string) {
  if (!url) return "";

  const fileId = getDriveFileId(url);

  if (fileId) {
    // Google Drive thumbnail endpoint
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }

  // Normal image URL
  return url;
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(dateValue: string) {
  if (!dateValue) return "";

  // YYYY-MM-DD
  const parts = dateValue.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return dateValue;
}

/* =========================================================
   PAGE
   ========================================================= */

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("सर्व");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  /* =======================================================
     FIRESTORE
     ======================================================= */

  useEffect(() => {
    const q = query(collection(db, "gallery"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: GalleryItem[] = snapshot.docs.map((doc) => {
          const d = doc.data();

          return {
            id: doc.id,
            title: d.title || d.Title || "",
            category: d.category || d.Category || "इतर",
            date: d.date || "",
            url: d.url || d.URL || "",
            createdAt: d.createdAt,
          };
        });

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds
            ? a.createdAt.seconds
            : 0;

          const bTime = b.createdAt?.seconds
            ? b.createdAt.seconds
            : 0;

          return bTime - aTime;
        });

        setItems(data);
        setLoading(false);
      },
      (error) => {
        console.error("Gallery load error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        items
          .map((item) => item.category)
          .filter(Boolean)
      )
    );

    return ["सर्व", ...unique];
  }, [items]);

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        category === "सर्व" || item.category === category;

      const matchesSearch =
        !searchText ||
        item.title.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [items, search, category]);

  /* =======================================================
     LIGHTBOX
     ======================================================= */

  const selectedItem =
    selectedIndex !== null
      ? filteredItems[selectedIndex]
      : null;

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      }

      if (e.key === "ArrowRight") {
        setSelectedIndex((current) => {
          if (current === null || filteredItems.length === 0) {
            return current;
          }

          return (current + 1) % filteredItems.length;
        });
      }

      if (e.key === "ArrowLeft") {
        setSelectedIndex((current) => {
          if (current === null || filteredItems.length === 0) {
            return current;
          }

          return (
            (current - 1 + filteredItems.length) %
            filteredItems.length
          );
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow = "";
    };
  }, [selectedIndex, filteredItems.length]);

  const nextImage = () => {
    if (selectedIndex === null || filteredItems.length === 0) {
      return;
    }

    setSelectedIndex(
      (selectedIndex + 1) % filteredItems.length
    );
  };

  const previousImage = () => {
    if (selectedIndex === null || filteredItems.length === 0) {
      return;
    }

    setSelectedIndex(
      (selectedIndex - 1 + filteredItems.length) %
        filteredItems.length
    );
  };

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =================================================
          HERO
          ================================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">

        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              📸 पंचायत समिती चामोर्शी
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              फोटो गॅलरी
            </h1>

            <p className="mt-5 text-base leading-7 text-blue-100 md:text-lg">
              पंचायत समिती चामोर्शी अंतर्गत विविध
              कार्यक्रम, बैठका, शिबिरे, विकासकामे व
              विशेष उपक्रमांच्या छायाचित्रांचा संग्रह.
            </p>

          </div>

          {/* TOTAL CARD */}

          <div className="mt-8 flex flex-wrap gap-4">

            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur">
              <div className="text-sm text-blue-100">
                एकूण फोटो
              </div>

              <div className="mt-1 text-3xl font-bold">
                {items.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur">
              <div className="text-sm text-blue-100">
                उपलब्ध वर्ग
              </div>

              <div className="mt-1 text-3xl font-bold">
                {Math.max(categories.length - 1, 0)}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =================================================
          CONTENT
          ================================================= */}

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">

        {/* FILTER BAR */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-[1fr_260px]">

            {/* SEARCH */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                फोटो शोधा
              </label>

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="फोटोचे नाव किंवा वर्ग शोधा..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                वर्ग
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

            </div>

          </div>

        </div>

        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (
          <div className="py-20 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-slate-500">
              फोटो लोड होत आहेत...
            </p>

          </div>
        )}

        {/* =================================================
            EMPTY
            ================================================= */}

        {!loading && filteredItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">

            <div className="text-5xl">📷</div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              फोटो उपलब्ध नाहीत
            </h2>

            <p className="mt-2 text-slate-500">
              शोध किंवा वर्ग बदलून पुन्हा प्रयत्न करा.
            </p>

          </div>
        )}

        {/* =================================================
            GALLERY GRID
            ================================================= */}

        {!loading && filteredItems.length > 0 && (

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredItems.map((item, index) => {

              const imageUrl = getImageUrl(item.url);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* IMAGE */}

                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={
                          item.title ||
                          "Panchayat Samiti Chamorshi Gallery"
                        }
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target =
                            e.currentTarget;

                          target.style.display =
                            "none";

                          const parent =
                            target.parentElement;

                          if (parent) {
                            parent.innerHTML =
                              `<div class="flex h-full w-full items-center justify-center text-slate-400 text-4xl">📷</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl text-slate-300">
                        📷
                      </div>
                    )}

                    {/* OVERLAY */}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">

                      <span className="scale-75 rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
                        🔍 फोटो पहा
                      </span>

                    </div>

                    {/* CATEGORY */}

                    <div className="absolute left-3 top-3">

                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-800 shadow-sm backdrop-blur">
                        {item.category || "इतर"}
                      </span>

                    </div>

                  </div>

                  {/* CARD CONTENT */}

                  <div className="p-4">

                    <h3 className="line-clamp-2 text-base font-bold text-slate-800">
                      {item.title ||
                        "Gallery Photo"}
                    </h3>

                    {item.date && (
                      <p className="mt-2 text-sm text-slate-500">
                        📅 {formatDate(item.date)}
                      </p>
                    )}

                  </div>

                </button>
              );
            })}

          </div>
        )}

      </section>

      {/* =================================================
          LIGHTBOX
          ================================================= */}

      {selectedItem && selectedIndex !== null && (

        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() =>
            setSelectedIndex(null)
          }
        >

          {/* CLOSE */}

          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              setSelectedIndex(null)
            }
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
          >
            ×
          </button>

          {/* PREVIOUS */}

          {filteredItems.length > 1 && (
            <button
              type="button"
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="absolute left-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20 md:left-6"
            >
              ‹
            </button>
          )}

          {/* IMAGE AREA */}

          <div
            className="relative flex max-h-[92vh] max-w-6xl flex-col items-center"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="max-h-[78vh] overflow-hidden rounded-xl">

              <img
                src={getImageUrl(
                  selectedItem.url
                )}
                alt={
                  selectedItem.title ||
                  "Gallery Photo"
                }
                className="max-h-[78vh] max-w-[90vw] object-contain"
              />

            </div>

            {/* INFO */}

            <div className="mt-4 max-w-3xl rounded-xl bg-white/10 px-5 py-3 text-center text-white backdrop-blur">

              <h3 className="text-base font-bold md:text-lg">
                {selectedItem.title ||
                  "Gallery Photo"}
              </h3>

              <div className="mt-1 flex flex-wrap justify-center gap-3 text-sm text-slate-200">

                {selectedItem.category && (
                  <span>
                    📁 {selectedItem.category}
                  </span>
                )}

                {selectedItem.date && (
                  <span>
                    📅{" "}
                    {formatDate(
                      selectedItem.date
                    )}
                  </span>
                )}

              </div>

              <div className="mt-2 text-xs text-slate-300">
                {(selectedIndex ?? 0) + 1} /{" "}
                {filteredItems.length}
              </div>

            </div>

          </div>

          {/* NEXT */}

          {filteredItems.length > 1 && (
            <button
              type="button"
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-3xl text-white backdrop-blur transition hover:bg-white/20 md:right-6"
            >
              ›
            </button>
          )}

        </div>
      )}

      {/* =================================================
          FOOTER SPACE
          ================================================= */}

      <div className="h-8" />

    </main>
  );
}