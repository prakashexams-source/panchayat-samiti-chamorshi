"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Notice = {
  id: string;
  title: string;
  date: string;
  tag: string;
};

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Notice[] = snapshot.docs.map((doc) => {
          const item = doc.data();

          return {
            id: doc.id,
            title: item.title || "",
            date: item.date || "",
            tag: item.tag || "महत्त्वपूर्ण",
          };
        });

        setNotices(data);
        setLoading(false);
      },
      (error) => {
        console.error("Notice loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="section">
      <div className="container">
        <span className="section-kicker">NOTICE BOARD</span>

        <h1>महत्त्वपूर्ण सूचना</h1>

        {loading ? (
          <div className="list-card">
            <div className="list-item">
              <div>
                <b>सूचना लोड होत आहेत...</b>
                <small>कृपया प्रतीक्षा करा.</small>
              </div>
            </div>
          </div>
        ) : notices.length === 0 ? (
          <div className="list-card">
            <div className="list-item">
              <div>
                <b>सध्या कोणतीही सूचना उपलब्ध नाही.</b>
                <small>नवीन सूचना लवकरच प्रकाशित करण्यात येतील.</small>
              </div>
            </div>
          </div>
        ) : (
          <div className="list-card">
            {notices.map((n) => (
              <div className="list-item" key={n.id}>
                <span className="date-pill">{n.date}</span>

                <div>
                  <b>{n.title}</b>
                  <small>{n.tag}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}