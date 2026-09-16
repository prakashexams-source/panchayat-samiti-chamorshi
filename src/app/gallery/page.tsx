"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
  createdAt: any;
};

const CATEGORIES = [
  "सर्व",
  "कार्यक्रम",
  "बैठक",
  "शिबिर",
  "विकासकामे",
  "पुरस्कार",
  "इतर",
];

export default function GalleryPage() {
  const [gallery, setGallery] =
    useState<GalleryItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("सर्व");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  /* =====================================================
     FIRESTORE LIVE DATA
  ===================================================== */

  useEffect(() => {
    const q = query(
      collection(db, "gallery")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: GalleryItem[] =
          snapshot.docs.map((item) => {
            const d = item.data();

            return {
              id: item.id,

              title:
                d.title ||
                d.Title ||
                "",

              category:
                d.category ||
                d.Category ||
                "इतर",

              date:
                d.date ||
                "",

              url:
                d.url ||
                "",

              createdAt:
                d.createdAt,
            };
          });

        data.sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() || 0;

          const bTime =
            b.createdAt?.toMillis?.() || 0;

          if (aTime !== bTime) {
            return bTime - aTime;
          }

          return String(
            b.date || ""
          ).localeCompare(
            String(a.date || "")
          );
        });

        setGallery(data);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error(
          "Gallery loading error:",
          err
        );

        setError(
          "Gallery माहिती load करताना समस्या आली."
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredGallery =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return gallery.filter(
        (item) => {
          const matchesCategory =
            category === "सर्व" ||
            item.category ===
              category;

          const matchesSearch =
            !term ||
            item.title
              .toLowerCase()
              .includes(term) ||
            item.category
              .toLowerCase()
              .includes(term);

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      gallery,
      search,
      category,
    ]);

  /* =====================================================
     LIGHTBOX
  ===================================================== */

  const selectedItem =
    selectedIndex !== null
      ? filteredGallery[
          selectedIndex
        ]
      : null;

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const previousPhoto = () => {
    if (
      selectedIndex === null ||
      filteredGallery.length === 0
    ) {
      return;
    }

    setSelectedIndex(
      selectedIndex === 0
        ? filteredGallery.length - 1
        : selectedIndex - 1
    );
  };

  const nextPhoto = () => {
    if (
      selectedIndex === null ||
      filteredGallery.length === 0
    ) {
      return;
    }

    setSelectedIndex(
      selectedIndex ===
        filteredGallery.length - 1
        ? 0
        : selectedIndex + 1
    );
  };

  /* =====================================================
     KEYBOARD
  ===================================================== */

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        selectedIndex === null
      ) {
        return;
      }

      if (e.key === "Escape") {
        closeLightbox();
      }

      if (e.key === "ArrowLeft") {
        previousPhoto();
      }

      if (e.key === "ArrowRight") {
        nextPhoto();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    selectedIndex,
    filteredGallery.length,
  ]);

  /* =====================================================
     BODY SCROLL LOCK
  ===================================================== */

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [selectedIndex]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <main className="gallery-page">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="gallery-hero">

          <div className="hero-overlay" />

          <div className="container hero-content">

            <div className="hero-icon">
              📷
            </div>

            <span className="hero-kicker">
              PANCHAYAT SAMITI CHAMORSHI
            </span>

            <h1>
              छायाचित्र दालन
            </h1>

            <p>
              पंचायत समिती चामोर्शी येथील
              विविध कार्यक्रम, उपक्रम,
              विकासकामे आणि महत्त्वपूर्ण
              क्षणांचे छायाचित्र संग्रह.
            </p>

          </div>

        </section>

        {/* =================================================
            MAIN
        ================================================= */}

        <section className="gallery-section">

          <div className="container">

            {/* HEADER */}

            <div className="section-header">

              <div>

                <span className="section-kicker">
                  PHOTO GALLERY
                </span>

                <h2>
                  आमच्या उपक्रमांची झलक
                </h2>

                <p>
                  पंचायत समिती चामोर्शीच्या
                  विविध उपक्रमांची
                  छायाचित्रे येथे पहा.
                </p>

              </div>

              <div className="photo-count">

                <span>
                  📷
                </span>

                <div>
                  <b>
                    {gallery.length}
                  </b>

                  <small>
                    एकूण छायाचित्रे
                  </small>
                </div>

              </div>

            </div>

            {/* =================================================
                FILTER PANEL
            ================================================= */}

            <div className="filter-panel">

              <div className="search-box">

                <span>
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="छायाचित्र शोधा..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

              <div className="category-list">

                {CATEGORIES.map(
                  (item) => (
                    <button
                      key={item}
                      className={
                        category === item
                          ? "category-btn active"
                          : "category-btn"
                      }
                      onClick={() =>
                        setCategory(
                          item
                        )
                      }
                    >
                      {item}
                    </button>
                  )
                )}

              </div>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="state-box">

                <div className="spinner" />

                <h3>
                  Gallery Load होत आहे...
                </h3>

                <p>
                  कृपया काही क्षण प्रतीक्षा करा.
                </p>

              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error && (
              <div className="state-box error-box">

                <div className="state-icon">
                  ⚠️
                </div>

                <h3>
                  Gallery उपलब्ध नाही
                </h3>

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
              !error &&
              filteredGallery.length ===
                0 && (
                <div className="state-box">

                  <div className="state-icon">
                    🖼️
                  </div>

                  <h3>
                    छायाचित्र सापडले नाही
                  </h3>

                  <p>
                    तुमच्या शोधासाठी किंवा
                    निवडलेल्या category साठी
                    कोणतेही छायाचित्र उपलब्ध नाही.
                  </p>

                  {(search ||
                    category !==
                      "सर्व") && (
                    <button
                      className="reset-btn"
                      onClick={() => {
                        setSearch("");
                        setCategory(
                          "सर्व"
                        );
                      }}
                    >
                      फिल्टर Reset करा
                    </button>
                  )}

                </div>
              )}

            {/* =================================================
                GALLERY GRID
            ================================================= */}

            {!loading &&
              !error &&
              filteredGallery.length >
                0 && (
                <div className="gallery-grid">

                  {filteredGallery.map(
                    (item, index) => (
                      <article
                        className="gallery-card"
                        key={item.id}
                        onClick={() =>
                          setSelectedIndex(
                            index
                          )
                        }
                      >

                        <div className="image-wrap">

                          <img
                            src={
                              item.url
                            }
                            alt={
                              item.title ||
                              "Gallery Photo"
                            }
                            loading="lazy"
                          />

                          <div className="image-overlay">

                            <span className="zoom-icon">
                              ⛶
                            </span>

                            <span>
                              फोटो पहा
                            </span>

                          </div>

                          <span className="category-badge">
                            {
                              item.category
                            }
                          </span>

                        </div>

                        <div className="card-content">

                          <h3>
                            {item.title ||
                              "Untitled Photo"}
                          </h3>

                          {item.date && (
                            <div className="photo-date">
                              <span>
                                📅
                              </span>

                              <span>
                                {item.date}
                              </span>
                            </div>
                          )}

                        </div>

                      </article>
                    )
                  )}

                </div>
              )}

          </div>

        </section>

      </main>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {selectedItem && (
        <div
          className="lightbox"
          onClick={
            closeLightbox
          }
        >

          <button
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close"
          >
            ×
          </button>

          <button
            className="lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              previousPhoto();
            }}
            aria-label="Previous"
          >
            ‹
          </button>

          <div
            className="lightbox-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={
                selectedItem.url
              }
              alt={
                selectedItem.title
              }
            />

            <div className="lightbox-info">

              <div>

                <span className="lightbox-category">
                  {
                    selectedItem.category
                  }
                </span>

                <h2>
                  {
                    selectedItem.title
                  }
                </h2>

                {selectedItem.date && (
                  <p>
                    📅{" "}
                    {
                      selectedItem.date
                    }
                  </p>
                )}

              </div>

              <span className="photo-position">
                {(selectedIndex || 0) +
                  1}{" "}
                /{" "}
                {
                  filteredGallery.length
                }
              </span>

            </div>

          </div>

          <button
            className="lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            aria-label="Next"
          >
            ›
          </button>

        </div>
      )}

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        .gallery-page {
          background: #f7f9fc;
          min-height: 100vh;
        }

        .container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }

        /* HERO */

        .gallery-hero {
          position: relative;
          min-height: 310px;
          display: flex;
          align-items: center;
          background:
            linear-gradient(
              135deg,
              #12395a,
              #176b78
            );
          overflow: hidden;
        }

        .gallery-hero::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.06
          );
          right: -100px;
          top: -180px;
        }

        .gallery-hero::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.05
          );
          left: -100px;
          bottom: -150px;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(5, 30, 48, 0.3),
              transparent
            );
        }

        .hero-content {
          position: relative;
          z-index: 2;
          color: white;
          padding: 55px 0;
        }

        .hero-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: rgba(
            255,
            255,
            255,
            0.15
          );
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 18px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.18
            );
        }

        .hero-kicker {
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 700;
          opacity: 0.82;
        }

        .hero-content h1 {
          margin: 9px 0 10px;
          font-size: clamp(
            34px,
            5vw,
            52px
          );
          line-height: 1.1;
        }

        .hero-content p {
          max-width: 680px;
          margin: 0;
          font-size: 17px;
          line-height: 1.75;
          opacity: 0.9;
        }

        /* SECTION */

        .gallery-section {
          padding: 58px 0 80px;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 28px;
        }

        .section-kicker {
          color: #176b78;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .section-header h2 {
          margin: 8px 0 7px;
          color: #172b3a;
          font-size: 32px;
        }

        .section-header p {
          margin: 0;
          color: #667786;
          font-size: 15px;
        }

        .photo-count {
          min-width: 170px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 18px;
          border-radius: 15px;
          background: white;
          border: 1px solid #e4eaf0;
          box-shadow:
            0 8px 25px
            rgba(
              20,
              45,
              65,
              0.06
            );
        }

        .photo-count > span {
          font-size: 27px;
        }

        .photo-count b {
          display: block;
          font-size: 24px;
          color: #173d59;
        }

        .photo-count small {
          display: block;
          color: #71808d;
          margin-top: 1px;
        }

        /* FILTER */

        .filter-panel {
          background: white;
          border: 1px solid #e4eaf0;
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 32px;
          box-shadow:
            0 8px 25px
            rgba(
              20,
              45,
              65,
              0.05
            );
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #dce4eb;
          background: #f9fbfc;
          border-radius: 11px;
          padding: 0 13px;
          height: 48px;
        }

        .search-box span {
          font-size: 18px;
        }

        .search-box input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          height: 100%;
          font-size: 15px;
          color: #263846;
        }

        .search-box button {
          border: none;
          background: transparent;
          font-size: 24px;
          color: #758491;
          cursor: pointer;
        }

        .category-list {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 14px;
        }

        .category-btn {
          border: 1px solid #dbe4ea;
          background: white;
          color: #536675;
          padding: 8px 15px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: 0.2s;
        }

        .category-btn:hover {
          border-color: #176b78;
          color: #176b78;
        }

        .category-btn.active {
          background: #176b78;
          color: white;
          border-color: #176b78;
        }

        /* GRID */

        .gallery-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 24px;
        }

        .gallery-card {
          background: white;
          border: 1px solid #e5ebf0;
          border-radius: 17px;
          overflow: hidden;
          cursor: pointer;
          box-shadow:
            0 7px 22px
            rgba(
              18,
              45,
              65,
              0.06
            );
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .gallery-card:hover {
          transform:
            translateY(-5px);
          box-shadow:
            0 15px 35px
            rgba(
              18,
              45,
              65,
              0.12
            );
        }

        .image-wrap {
          position: relative;
          height: 245px;
          background: #e9eef2;
          overflow: hidden;
        }

        .image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition:
            transform 0.45s ease;
        }

        .gallery-card:hover
          .image-wrap img {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          background: rgba(
            8,
            29,
            42,
            0.45
          );
          color: white;
          opacity: 0;
          transition: 0.25s;
          font-size: 13px;
          font-weight: 600;
        }

        .gallery-card:hover
          .image-overlay {
          opacity: 1;
        }

        .zoom-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.2
          );
          font-size: 22px;
        }

        .category-badge {
          position: absolute;
          top: 13px;
          left: 13px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(
            255,
            255,
            255,
            0.94
          );
          color: #176b78;
          font-size: 11px;
          font-weight: 800;
          box-shadow:
            0 3px 10px
            rgba(
              0,
              0,
              0,
              0.12
            );
        }

        .card-content {
          padding: 17px 18px 18px;
        }

        .card-content h3 {
          margin: 0 0 10px;
          color: #203441;
          font-size: 17px;
          line-height: 1.45;
        }

        .photo-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7a8995;
          font-size: 13px;
        }

        /* STATES */

        .state-box {
          background: white;
          border: 1px solid #e5ebf0;
          border-radius: 18px;
          text-align: center;
          padding: 70px 25px;
        }

        .state-box h3 {
          margin: 15px 0 7px;
          color: #263946;
        }

        .state-box p {
          margin: 0;
          color: #71808d;
        }

        .state-icon {
          font-size: 45px;
        }

        .error-box {
          border-color: #f0d8d8;
        }

        .reset-btn {
          margin-top: 20px;
          border: none;
          background: #176b78;
          color: white;
          padding: 10px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .spinner {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 3px solid #dbe7eb;
          border-top-color: #176b78;
          margin: 0 auto;
          animation:
            spin 0.8s
            linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(
              360deg
            );
          }
        }

        /* LIGHTBOX */

        .lightbox {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(
            5,
            14,
            22,
            0.94
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }

        .lightbox-content {
          width: min(
            1050px,
            88vw
          );
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 74vh;
          object-fit: contain;
          border-radius: 10px;
          box-shadow:
            0 15px 50px
            rgba(
              0,
              0,
              0,
              0.35
            );
        }

        .lightbox-info {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          color: white;
          padding-top: 15px;
        }

        .lightbox-category {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(
            255,
            255,
            255,
            0.14
          );
          font-size: 11px;
        }

        .lightbox-info h2 {
          margin: 7px 0 3px;
          font-size: 21px;
        }

        .lightbox-info p {
          margin: 0;
          opacity: 0.7;
          font-size: 13px;
        }

        .photo-position {
          white-space: nowrap;
          opacity: 0.65;
          font-size: 13px;
        }

        .lightbox-close,
        .lightbox-prev,
        .lightbox-next {
          position: absolute;
          border: none;
          color: white;
          background: rgba(
            255,
            255,
            255,
            0.12
          );
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .lightbox-close:hover,
        .lightbox-prev:hover,
        .lightbox-next:hover {
          background: rgba(
            255,
            255,
            255,
            0.23
          );
        }

        .lightbox-close {
          top: 20px;
          right: 25px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 29px;
        }

        .lightbox-prev,
        .lightbox-next {
          top: 50%;
          transform:
            translateY(-50%);
          width: 50px;
          height: 70px;
          border-radius: 12px;
          font-size: 45px;
        }

        .lightbox-prev {
          left: 25px;
        }

        .lightbox-next {
          right: 25px;
        }

        /* RESPONSIVE */

        @media (
          max-width: 900px
        ) {
          .gallery-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .section-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .photo-count {
            width: 100%;
          }
        }

        @media (
          max-width: 600px
        ) {
          .gallery-hero {
            min-height: 280px;
          }

          .hero-content {
            padding: 42px 0;
          }

          .hero-content h1 {
            font-size: 34px;
          }

          .hero-content p {
            font-size: 15px;
          }

          .gallery-section {
            padding: 40px 0 60px;
          }

          .section-header h2 {
            font-size: 27px;
          }

          .gallery-grid {
            grid-template-columns:
              1fr;
            gap: 18px;
          }

          .image-wrap {
            height: 235px;
          }

          .filter-panel {
            padding: 13px;
          }

          .category-list {
            gap: 7px;
          }

          .category-btn {
            padding: 7px 12px;
          }

          .lightbox {
            padding: 15px;
          }

          .lightbox-content {
            width: 100%;
          }

          .lightbox-content img {
            max-height: 68vh;
          }

          .lightbox-prev,
          .lightbox-next {
            width: 40px;
            height: 55px;
            font-size: 34px;
          }

          .lightbox-prev {
            left: 8px;
          }

          .lightbox-next {
            right: 8px;
          }

          .lightbox-info h2 {
            font-size: 16px;
          }

          .photo-position {
            font-size: 11px;
          }
        }

      `}</style>
    </>
  );
}