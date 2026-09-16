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
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

type Notice = {
  id: string;
  title: string;
  date: string;
  tag: string;
};

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notices, setNotices] = useState<Notice[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState("महत्त्वपूर्ण");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ------------------------------------
  // Firebase Authentication
  // ------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLogged(!!user);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // ------------------------------------
  // Firestore Notices
  // ------------------------------------
  useEffect(() => {
    if (!logged) return;

    const q = query(
      collection(db, "notices"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Notice[] = snapshot.docs.map((item) => {
          const d = item.data();

          return {
            id: item.id,
            title: d.title || "",
            date: d.date || "",
            tag: d.tag || "महत्त्वपूर्ण",
          };
        });

        setNotices(data);
      },
      (error) => {
        console.error(error);
        alert("Notices load करताना समस्या आली.");
      }
    );

    return () => unsubscribe();
  }, [logged]);

  // ------------------------------------
  // Login
  // ------------------------------------
  const login = async () => {
    if (!email.trim() || !password) {
      alert("कृपया Email आणि Password भरा.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error(error);

      if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/user-not-found"
      ) {
        alert("Email किंवा Password चुकीचा आहे.");
      } else {
        alert("Login करताना समस्या आली.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // Logout
  // ------------------------------------
  const logout = async () => {
    await signOut(auth);
  };

  // ------------------------------------
  // Add / Update Notice
  // ------------------------------------
  const saveNotice = async () => {
    if (!title.trim()) {
      alert("Notice title भरा.");
      return;
    }

    try {
      setLoading(true);

      // EDIT MODE
      if (editingId) {
        await updateDoc(doc(db, "notices", editingId), {
          title: title.trim(),
          date: date || new Date().toLocaleDateString("en-IN"),
          tag,
          updatedAt: serverTimestamp(),
        });

        alert("Notice successfully updated.");

        setEditingId(null);
      }

      // ADD MODE
      else {
        await addDoc(collection(db, "notices"), {
          title: title.trim(),
          date:
            date ||
            new Date().toLocaleDateString("en-IN"),
          tag,
          createdAt: serverTimestamp(),
        });

        alert("Notice successfully added.");
      }

      clearForm();
    } catch (error) {
      console.error(error);
      alert("Notice save करताना समस्या आली.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // Edit Notice
  // ------------------------------------
  const editNotice = (notice: Notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setDate(notice.date);
    setTag(notice.tag);

    window.scrollTo({
      top: 300,
      behavior: "smooth",
    });
  };

  // ------------------------------------
  // Delete Notice
  // ------------------------------------
  const remove = async (id: string) => {
    const confirmDelete = window.confirm(
      "ही Notice delete करायची आहे का?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "notices", id));

      alert("Notice deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Notice delete करताना समस्या आली.");
    }
  };

  // ------------------------------------
  // Clear Form
  // ------------------------------------
  const clearForm = () => {
    setTitle("");
    setDate("");
    setTag("महत्त्वपूर्ण");
    setEditingId(null);
  };

  // ------------------------------------
  // Loading
  // ------------------------------------
  if (checkingAuth) {
    return (
      <main className="section">
        <div className="container admin-login">
          <span className="section-kicker">
            ADMIN PANEL
          </span>

          <h1>Loading...</h1>
        </div>
      </main>
    );
  }

  // ------------------------------------
  // Login Screen
  // ------------------------------------
  if (!logged) {
    return (
      <main className="section">
        <div className="container admin-login">

          <span className="section-kicker">
            ADMIN PANEL
          </span>

          <h1>Administrator Login</h1>

          <p>
            पंचायत समिती चामोर्शी Website Administration
          </p>

          <input
            placeholder="Admin Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
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
              ? "Logging in..."
              : "Login"}
          </button>

        </div>
      </main>
    );
  }

  // ------------------------------------
  // Admin Dashboard
  // ------------------------------------
  return (
    <main className="section">
      <div className="container">

        {/* Header */}
        <div className="admin-head">

          <div>
            <span className="section-kicker">
              ADMIN DASHBOARD
            </span>

            <h1>Website Management</h1>
          </div>

          <button
            className="outline-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

        {/* Dashboard Cards */}
        <div className="admin-cards">

          <div>
            📢
            <b>{notices.length}</b>
            <span>Notices</span>
          </div>

          <div>
            📄
            <b>0</b>
            <span>Documents</span>
          </div>

          <div>
            📷
            <b>0</b>
            <span>Gallery</span>
          </div>

          <div>
            📰
            <b>0</b>
            <span>News</span>
          </div>

        </div>

        {/* Notice Management */}
        <div className="content-box">

          <h2>
            {editingId
              ? "Edit Notice"
              : "Add Notice"}
          </h2>

          <div className="form-grid">

            <input
              placeholder="Notice title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <input
              placeholder="Date"
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            <select
              value={tag}
              onChange={(e) =>
                setTag(e.target.value)
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
                : "Add Notice"}
            </button>

            {editingId && (
              <button
                className="outline-btn"
                onClick={clearForm}
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}

          </div>

          {/* Notice List */}
          <div className="list-card">

            {notices.length === 0 ? (

              <div className="list-item">

                <div>
                  <b>
                    अद्याप कोणतीही Notice नाही.
                  </b>

                  <small>
                    वरील form मधून नवीन Notice add करा.
                  </small>
                </div>

              </div>

            ) : (

              notices.map((n) => (

                <div
                  className="list-item"
                  key={n.id}
                >

                  <div>

                    <b>
                      {n.title}
                    </b>

                    <small>
                      {n.date} • {n.tag}
                    </small>

                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >

                    <button
                      className="outline-btn"
                      onClick={() =>
                        editNotice(n)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        remove(n.id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>
    </main>
  );
}