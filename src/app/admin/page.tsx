"use client";

import { useEffect, useState } from "react";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Notice = {
  id: string;
  title: string;
  date: string;
  tag: string;
};

type DocumentItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  url: string;
  createdAt?: any;
};

export default function Admin() {
  /* =====================================================
     AUTH
  ===================================================== */

  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* =====================================================
     COMMON LOADING
  ===================================================== */

  const [loading, setLoading] = useState(false);

  /* =====================================================
     NOTICE STATES
  ===================================================== */

  const [notices, setNotices] = useState<Notice[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("महत्त्वपूर्ण");

  const [editingId, setEditingId] = useState<string | null>(null);

  /* =====================================================
     DOCUMENT STATES
  ===================================================== */

  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [documentTitle, setDocumentTitle] = useState("");
  const [documentCategory, setDocumentCategory] =
    useState("सूचना");
  const [documentDate, setDocumentDate] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const [editingDocumentId, setEditingDocumentId] =
    useState<string | null>(null);

  const [documentLoading, setDocumentLoading] =
    useState(false);

  /* =====================================================
     FIREBASE LOGIN STATUS
  ===================================================== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =====================================================
     LOAD NOTICES FROM FIRESTORE
  ===================================================== */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notices"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Notice[] = snapshot.docs.map(
          (item) => ({
            id: item.id,
            ...(item.data() as Omit<Notice, "id">),
          })
        );

        setNotices(data);
      },
      (error) => {
        console.error(
          "Notice loading error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* =====================================================
     LOAD DOCUMENTS FROM FIRESTORE
     
     orderBy वापरलेले नाही.
     त्यामुळे createdAt field नसलेले जुने documents
     सुद्धा website वर दिसतील.
  ===================================================== */

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "documents")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: DocumentItem[] =
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

        /* नवीन document प्रथम */
        data.sort((a, b) => {
          const aTime =
            a.createdAt?.toMillis?.() ||
            0;

          const bTime =
            b.createdAt?.toMillis?.() ||
            0;

          return bTime - aTime;
        });

        setDocuments(data);
      },
      (error) => {
        console.error(
          "Documents loading error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [user]);

  /* =====================================================
     LOGIN
  ===================================================== */

  const login = async () => {
    if (!email.trim() || !password) {
      alert(
        "Email आणि Password भरा."
      );

      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error: any) {
      console.error(error);

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        alert(
          "Email किंवा Password चुकीचा आहे."
        );
      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        alert(
          "खूप प्रयत्न झाले आहेत. थोड्या वेळाने पुन्हा प्रयत्न करा."
        );
      } else {
        alert(
          "Login failed. Firebase Authentication तपासा."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     NOTICE - SAVE / UPDATE
  ===================================================== */

  const saveNotice = async () => {
    if (!title.trim()) {
      alert(
        "Notice title भरा."
      );

      return;
    }

    try {
      setLoading(true);

      /* UPDATE */
      if (editingId) {
        await updateDoc(
          doc(
            db,
            "notices",
            editingId
          ),
          {
            title: title.trim(),

            date:
              date ||
              new Date()
                .toISOString()
                .split("T")[0],

            tag: tag,
          }
        );

        alert(
          "Notice यशस्वीपणे Update झाली ✅"
        );
      }

      /* ADD */
      else {
        await addDoc(
          collection(
            db,
            "notices"
          ),
          {
            title: title.trim(),

            date:
              date ||
              new Date()
                .toISOString()
                .split("T")[0],

            tag: tag,

            createdAt:
              new Date().toISOString(),
          }
        );

        alert(
          "Notice यशस्वीपणे Save झाली ✅"
        );
      }

      clearForm();
    } catch (error: any) {
      console.error(error);

      alert(
        "Notice Save/Update झाली नाही. Firestore Rules तपासा."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     NOTICE - EDIT
  ===================================================== */

  const editNotice = (
    notice: Notice
  ) => {
    setEditingId(notice.id);

    setTitle(notice.title);

    setDate(notice.date);

    setTag(notice.tag);

    window.scrollTo({
      top: 350,
      behavior: "smooth",
    });
  };

  /* =====================================================
     NOTICE - CLEAR FORM
  ===================================================== */

  const clearForm = () => {
    setEditingId(null);

    setTitle("");

    setDate("");

    setTag(
      "महत्त्वपूर्ण"
    );
  };

  /* =====================================================
     NOTICE - DELETE
  ===================================================== */

  const removeNotice = async (
    id: string
  ) => {
    const confirmDelete =
      confirm(
        "ही Notice delete करायची आहे का?"
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(
          db,
          "notices",
          id
        )
      );

      if (editingId === id) {
        clearForm();
      }

      alert(
        "Notice delete झाली ✅"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Delete करताना error आला."
      );
    }
  };

  /* =====================================================
     DOCUMENT - CLEAR FORM
  ===================================================== */

  const clearDocumentForm = () => {
    setEditingDocumentId(null);

    setDocumentTitle("");

    setDocumentCategory(
      "सूचना"
    );

    setDocumentDate("");

    setDocumentUrl("");
  };

  /* =====================================================
     DOCUMENT - SAVE / UPDATE
  ===================================================== */

  const saveDocument = async () => {
    if (!documentTitle.trim()) {
      alert(
        "Document Title भरा."
      );

      return;
    }

    if (!documentUrl.trim()) {
      alert(
        "Google Drive PDF Link भरा."
      );

      return;
    }

    try {
      setDocumentLoading(true);

      const finalDate =
        documentDate ||
        new Date()
          .toISOString()
          .split("T")[0];

      /* UPDATE */
      if (editingDocumentId) {
        await updateDoc(
          doc(
            db,
            "documents",
            editingDocumentId
          ),
          {
            title:
              documentTitle.trim(),

            category:
              documentCategory,

            date:
              finalDate,

            url:
              documentUrl.trim(),
          }
        );

        alert(
          "Document यशस्वीपणे Update झाले ✅"
        );
      }

      /* ADD */
      else {
        await addDoc(
          collection(
            db,
            "documents"
          ),
          {
            title:
              documentTitle.trim(),

            category:
              documentCategory,

            date:
              finalDate,

            url:
              documentUrl.trim(),

            createdAt:
              serverTimestamp(),
          }
        );

        alert(
          "Document यशस्वीपणे Save झाले ✅"
        );
      }

      clearDocumentForm();
    } catch (error: any) {
      console.error(
        "Document Save Error:",
        error
      );

      alert(
        "Document Save/Update झाले नाही. Firestore Rules तपासा."
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  /* =====================================================
     DOCUMENT - EDIT
  ===================================================== */

  const editDocument = (
    item: DocumentItem
  ) => {
    setEditingDocumentId(
      item.id
    );

    setDocumentTitle(
      item.title
    );

    setDocumentCategory(
      item.category
    );

    setDocumentDate(
      item.date
    );

    setDocumentUrl(
      item.url
    );

    window.scrollTo({
      top: 850,
      behavior: "smooth",
    });
  };

  /* =====================================================
     DOCUMENT - DELETE
  ===================================================== */

  const removeDocument = async (
    id: string
  ) => {
    const confirmDelete =
      confirm(
        "हे Document delete करायचे आहे का?"
      );

    if (!confirmDelete) return;

    try {
      await deleteDoc(
        doc(
          db,
          "documents",
          id
        )
      );

      if (
        editingDocumentId === id
      ) {
        clearDocumentForm();
      }

      alert(
        "Document delete झाले ✅"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Document Delete करताना error आला."
      );
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = async () => {
    await signOut(auth);
  };

  /* =====================================================
     LOGIN SCREEN
  ===================================================== */

  if (!user) {
    return (
      <main className="section">

        <div className="container admin-login">

          <span className="section-kicker">
            ADMIN PANEL
          </span>

          <h1>
            Administrator Login
          </h1>

          <p>
            पंचायत समिती चामोर्शी वेबसाइट
            व्यवस्थापनासाठी Login करा.
          </p>

          <input
            placeholder="Admin Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                "Enter"
              ) {
                login();
              }
            }}
          />

          <button
            className="primary-btn"
            onClick={login}
            disabled={loading}
          >
            {loading
              ? "Login होत आहे..."
              : "Login"}
          </button>

        </div>

      </main>
    );
  }

  /* =====================================================
     ADMIN DASHBOARD
  ===================================================== */

  return (
    <main className="section">

      <div className="container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="admin-head">

          <div>

            <span className="section-kicker">
              ADMIN DASHBOARD
            </span>

            <h1>
              Website Management
            </h1>

            <p>
              Logged in:{" "}
              {user.email}
            </p>

          </div>

          <button
            className="outline-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

        {/* =================================================
            DASHBOARD CARDS
        ================================================= */}

        <div className="admin-cards">

          <div>
            📢

            <b>
              {notices.length}
            </b>

            <span>
              Notices
            </span>
          </div>

          <div>
            📄

            <b>
              {documents.length}
            </b>

            <span>
              Documents
            </span>
          </div>

          <div>
            📷

            <b>
              0
            </b>

            <span>
              Gallery
            </span>
          </div>

          <div>
            📰

            <b>
              0
            </b>

            <span>
              News
            </span>
          </div>

        </div>

        {/* =================================================
            NOTICE MANAGEMENT
        ================================================= */}

        <div className="content-box">

          <h2>
            {editingId
              ? "सूचना संपादित करा"
              : "नवीन सूचना प्रकाशित करा"}
          </h2>

          <div className="form-grid">

            <input
              placeholder="Notice title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target.value
                )
              }
            />

            <select
              value={tag}
              onChange={(e) =>
                setTag(
                  e.target.value
                )
              }
            >
              <option>
                महत्त्वपूर्ण
              </option>

              <option>
                बैठक
              </option>

              <option>
                परिपत्रक
              </option>

              <option>
                निविदा
              </option>

              <option>
                आदेश
              </option>

              <option>
                इतर
              </option>
            </select>

            <button
              className="primary-btn"
              onClick={saveNotice}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Notice"
                : "Notice Save करा"}
            </button>

            {editingId && (
              <button
                className="outline-btn"
                onClick={
                  clearForm
                }
                disabled={loading}
              >
                Cancel
              </button>
            )}

          </div>

          {/* NOTICE LIST */}

          <div className="list-card">

            {notices.length ===
            0 ? (

              <p>
                सध्या कोणतीही
                सूचना उपलब्ध नाही.
              </p>

            ) : (

              notices.map(
                (n) => (

                  <div
                    className="list-item"
                    key={n.id}
                  >

                    <div>

                      <b>
                        {n.title}
                      </b>

                      <small>
                        {n.date} •{" "}
                        {n.tag}
                      </small>

                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "8px",
                        alignItems:
                          "center",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <button
                        className="outline-btn"
                        onClick={() =>
                          editNotice(
                            n
                          )
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          removeNotice(
                            n.id
                          )
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

        {/* =================================================
            DOCUMENT MANAGEMENT
        ================================================= */}

        <div
          className="content-box"
          style={{
            marginTop:
              "25px",
          }}
        >

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "15px",
              marginBottom:
                "20px",
              flexWrap:
                "wrap",
            }}
          >

            <div>

              <span className="section-kicker">
                DOCUMENT MANAGEMENT
              </span>

              <h2
                style={{
                  marginTop:
                    "8px",
                }}
              >
                📄 कागदपत्र व्यवस्थापन
              </h2>

              <p
                style={{
                  color:
                    "#64748b",
                  marginTop:
                    "5px",
                }}
              >
                Google Drive वर
                अपलोड केलेल्या PDF
                कागदपत्रांची Website
                वर नोंद करा.
              </p>

            </div>

            <div
              style={{
                minWidth:
                  "110px",
                padding:
                  "12px 18px",
                textAlign:
                  "center",
                border:
                  "1px solid #dbeafe",
                borderRadius:
                  "12px",
                background:
                  "#eff6ff",
              }}
            >

              <small
                style={{
                  display:
                    "block",
                  color:
                    "#64748b",
                }}
              >
                Documents
              </small>

              <strong
                style={{
                  fontSize:
                    "28px",
                }}
              >
                {documents.length}
              </strong>

            </div>

          </div>

          {/* DOCUMENT FORM */}

          <div
            className="form-grid"
            style={{
              marginBottom:
                "20px",
            }}
          >

            <input
              placeholder="Document Title"
              value={
                documentTitle
              }
              onChange={(e) =>
                setDocumentTitle(
                  e.target.value
                )
              }
            />

            <select
              value={
                documentCategory
              }
              onChange={(e) =>
                setDocumentCategory(
                  e.target.value
                )
              }
            >

              <option>
                सूचना
              </option>

              <option>
                शासन निर्णय
              </option>

              <option>
                परिपत्रक
              </option>

              <option>
                आदेश
              </option>

              <option>
                अहवाल
              </option>

              <option>
                निविदा
              </option>

              <option>
                बैठक
              </option>

              <option>
                इतर
              </option>

            </select>

            <input
              type="date"
              value={
                documentDate
              }
              onChange={(e) =>
                setDocumentDate(
                  e.target.value
                )
              }
            />

            <input
              type="url"
              placeholder="Google Drive PDF Link"
              value={
                documentUrl
              }
              onChange={(e) =>
                setDocumentUrl(
                  e.target.value
                )
              }
            />

            <button
              className="primary-btn"
              onClick={
                saveDocument
              }
              disabled={
                documentLoading
              }
            >
              {documentLoading
                ? "Saving..."
                : editingDocumentId
                ? "Update Document"
                : "Document Save करा"}
            </button>

            {editingDocumentId && (
              <button
                className="outline-btn"
                onClick={
                  clearDocumentForm
                }
                disabled={
                  documentLoading
                }
              >
                Cancel
              </button>
            )}

          </div>

          <p
            style={{
              fontSize:
                "12px",
              color:
                "#64748b",
              marginBottom:
                "15px",
            }}
          >
            ℹ️ Google Drive मध्ये
            PDF ची Sharing
            <b>
              {" "}
              Anyone with the
              link → Viewer
            </b>{" "}
            अशी असणे आवश्यक आहे.
          </p>

          {/* DOCUMENT LIST */}

          <div className="list-card">

            {documents.length ===
            0 ? (

              <p>
                सध्या कोणतेही
                Document उपलब्ध
                नाही.
              </p>

            ) : (

              documents.map(
                (item) => (

                  <div
                    className="list-item"
                    key={item.id}
                  >

                    <div
                      style={{
                        minWidth:
                          "0",
                        flex:
                          "1",
                      }}
                    >

                      <b>
                        📄{" "}
                        {item.title}
                      </b>

                      <small>
                        {item.date} •{" "}
                        {item.category}
                      </small>

                      {item.url && (
                        <small
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                            maxWidth:
                              "650px",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.url}
                        </small>
                      )}

                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "8px",
                        alignItems:
                          "center",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      {item.url && (
                        <a
                          href={
                            item.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="outline-btn"
                          style={{
                            textDecoration:
                              "none",
                          }}
                        >
                          👁️ View PDF
                        </a>
                      )}

                      <button
                        className="outline-btn"
                        onClick={() =>
                          editDocument(
                            item
                          )
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          removeDocument(
                            item.id
                          )
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </main>
  );
}