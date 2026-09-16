"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type DocumentItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
  createdAt?: any;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("सर्व");

  useEffect(() => {
    const q = query(
      collection(db, "documents"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: DocumentItem[] = snapshot.docs.map((item) => {
          const d = item.data();

          return {
            id: item.id,
            title: d.title || "",
            category: d.category || "इतर",
            date: d.date || "",
            url: d.url || "",
            createdAt: d.createdAt,
          };
        });

        setDocuments(data);
        setLoading(false);
      },
      (error) => {
        console.error("Documents loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(documents.map((item) => item.category).filter(Boolean))
    );

    return ["सर्व", ...unique];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return documents.filter((item) => {
      const matchesCategory =
        category === "सर्व" || item.category === category;

      const matchesSearch =
        !searchText ||
        item.title.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [documents, search, category]);

  return (
    <main className="section">
      <div className="container">

        {/* PAGE HEADER */}
        <div className="documents-header">
          <div>
            <span className="section-kicker">
              DOCUMENTS & REPORTS
            </span>

            <h1>अहवाल व कागदपत्रे</h1>

            <p className="documents-subtitle">
              पंचायत समिती चामोर्शी येथील शासन निर्णय, परिपत्रके,
              सूचना, आदेश, अहवाल व इतर महत्त्वाची कागदपत्रे.
            </p>
          </div>

          <div className="document-count-card">
            <span>एकूण कागदपत्रे</span>
            <strong>{documents.length}</strong>
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="documents-filter-box">

          <div className="document-search">
            <label>कागदपत्र शोधा</label>

            <input
              type="text"
              placeholder="कागदपत्राचे नाव किंवा प्रकार शोधा..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="document-category">
            <label>प्रकार</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button
            className="document-reset-btn"
            onClick={() => {
              setSearch("");
              setCategory("सर्व");
            }}
          >
            Reset
          </button>

        </div>

        {/* RESULT COUNT */}
        {!loading && documents.length > 0 && (
          <div className="document-result-info">
            <span>
              दाखवत आहे: <b>{filteredDocuments.length}</b> कागदपत्रे
            </span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="content-box document-empty">
            <div className="document-loader">
              <div className="loader-circle"></div>
              <p>कागदपत्रे लोड होत आहेत...</p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && documents.length === 0 && (
          <div className="content-box document-empty">
            <div className="empty-icon">📄</div>

            <h2>सध्या कोणतेही कागदपत्र उपलब्ध नाही</h2>

            <p>
              Admin Panel मधून कागदपत्राची नोंद केल्यानंतर
              ती येथे दिसेल.
            </p>
          </div>
        )}

        {/* NO SEARCH RESULT */}
        {!loading &&
          documents.length > 0 &&
          filteredDocuments.length === 0 && (
            <div className="content-box document-empty">
              <div className="empty-icon">🔎</div>

              <h2>कागदपत्र सापडले नाही</h2>

              <p>
                शोध किंवा category filter बदलून पुन्हा प्रयत्न करा.
              </p>

              <button
                className="primary-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("सर्व");
                }}
              >
                सर्व कागदपत्रे दाखवा
              </button>
            </div>
          )}

        {/* DOCUMENT LIST */}
        {!loading && filteredDocuments.length > 0 && (
          <div className="documents-list">

            {filteredDocuments.map((item, index) => (
              <div className="document-card" key={item.id}>

                <div className="document-icon">
                  <span>PDF</span>
                </div>

                <div className="document-main">

                  <div className="document-top">

                    <span className="document-number">
                      #{index + 1}
                    </span>

                    <span className="document-category-badge">
                      {item.category}
                    </span>

                  </div>

                  <h2>{item.title}</h2>

                  <div className="document-meta">
                    <span>📅 {item.date || "दिनांक उपलब्ध नाही"}</span>
                    <span>•</span>
                    <span>PDF Document</span>
                  </div>

                </div>

                <div className="document-action">

                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-open-btn"
                    >
                      <span>📄</span>
                      PDF उघडा
                    </a>
                  ) : (
                    <button
                      className="document-disabled-btn"
                      disabled
                    >
                      Link उपलब्ध नाही
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

        {/* FOOTER NOTE */}
        {!loading && documents.length > 0 && (
          <div className="documents-note">
            <span>ℹ️</span>

            <p>
              कागदपत्र पाहण्यासाठी <b>PDF उघडा</b> या
              बटनावर क्लिक करा. कागदपत्रे Google Drive वरून
              उघडली जातील.
            </p>
          </div>
        )}

      </div>

      {/* PAGE SPECIFIC CSS */}
      <style jsx>{`
        .documents-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .documents-subtitle {
          max-width: 800px;
          margin-top: 10px;
          color: #64748b;
          line-height: 1.7;
          font-size: 16px;
        }

        .document-count-card {
          min-width: 150px;
          padding: 18px 22px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          text-align: center;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.06);
        }

        .document-count-card span {
          display: block;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .document-count-card strong {
          font-size: 32px;
          line-height: 1;
        }

        .documents-filter-box {
          display: grid;
          grid-template-columns: 1fr 240px auto;
          gap: 15px;
          align-items: end;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.05);
        }

        .documents-filter-box label {
          display: block;
          margin-bottom: 7px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .documents-filter-box input,
        .documents-filter-box select {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #ffffff;
          font-size: 14px;
          outline: none;
        }

        .documents-filter-box input:focus,
        .documents-filter-box select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .document-reset-btn {
          height: 46px;
          padding: 0 22px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #f8fafc;
          color: #334155;
          font-weight: 700;
          cursor: pointer;
        }

        .document-reset-btn:hover {
          background: #f1f5f9;
        }

        .document-result-info {
          margin: 0 0 14px;
          color: #64748b;
          font-size: 14px;
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .document-card {
          display: grid;
          grid-template-columns: 70px 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .document-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09);
        }

        .document-icon {
          width: 58px;
          height: 68px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 9px;
          border-radius: 10px;
          background: #fee2e2;
          position: relative;
          color: #b91c1c;
          font-size: 11px;
          font-weight: 900;
        }

        .document-icon:before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          border-top: 18px solid #ffffff;
          border-left: 18px solid transparent;
        }

        .document-main {
          min-width: 0;
        }

        .document-top {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 7px;
        }

        .document-number {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
        }

        .document-category-badge {
          display: inline-flex;
          padding: 4px 9px;
          border-radius: 999px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 800;
        }

        .document-main h2 {
          margin: 0;
          font-size: 17px;
          line-height: 1.5;
          color: #0f172a;
        }

        .document-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .document-action {
          display: flex;
          justify-content: flex-end;
        }

        .document-open-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 120px;
          height: 44px;
          padding: 0 17px;
          border-radius: 10px;
          background: #0f172a;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .document-open-btn:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }

        .document-disabled-btn {
          height: 44px;
          padding: 0 15px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #94a3b8;
          font-size: 12px;
        }

        .document-empty {
          text-align: center;
          padding: 55px 20px;
        }

        .empty-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        .document-empty h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .document-empty p {
          color: #64748b;
          line-height: 1.6;
        }

        .document-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        .loader-circle {
          width: 35px;
          height: 35px;
          border: 4px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .documents-note {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-top: 22px;
          padding: 15px 18px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #eff6ff;
          color: #334155;
          font-size: 13px;
          line-height: 1.6;
        }

        .documents-note p {
          margin: 0;
        }

        @media (max-width: 800px) {
          .documents-header {
            flex-direction: column;
            align-items: stretch;
          }

          .document-count-card {
            width: 100%;
          }

          .documents-filter-box {
            grid-template-columns: 1fr;
          }

          .document-card {
            grid-template-columns: 55px 1fr;
          }

          .document-icon {
            width: 50px;
            height: 60px;
          }

          .document-action {
            grid-column: 1 / -1;
            justify-content: stretch;
          }

          .document-open-btn,
          .document-disabled-btn {
            width: 100%;
          }
        }

        @media (max-width: 500px) {
          .document-card {
            padding: 15px;
            gap: 12px;
          }

          .document-main h2 {
            font-size: 15px;
          }

          .document-meta {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}