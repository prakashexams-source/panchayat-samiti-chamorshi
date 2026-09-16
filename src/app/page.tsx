import Link from "next/link";
import { departments, digital, news, notices, schemes, services, stats } from "@/lib/data";

export default function Home() {
  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span>महाराष्ट्र शासन</span>
          <span>जिल्हा परिषद गडचिरोली</span>
          <span className="top-links"><Link href="/notices">सूचना</Link><Link href="/contact">संपर्क</Link><Link href="/admin">Admin</Link></span>
        </div>
      </div>

      <header className="header">
        <div className="container brand-row">
          <div className="seal">🏛️</div>
          <div>
            <div className="eyebrow">PANCHAYAT SAMITI • GADCHIROLI</div>
            <h1>पंचायत समिती चामोर्शी</h1>
            <p>जिल्हा गडचिरोली, महाराष्ट्र</p>
          </div>
          <div className="header-actions">
            <Link className="outline-btn" href="/services">नागरिक सेवा</Link>
            <Link className="primary-btn" href="/contact">संपर्क</Link>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/">मुख्यपृष्ठ</Link>
          <Link href="/about">आमच्याविषयी</Link>
          <Link href="/departments">विभाग</Link>
          <Link href="/schemes">योजना</Link>
          <Link href="/services">नागरिक सेवा</Link>
          <Link href="/development">विकासकामे</Link>
          <Link href="/notices">सूचना</Link>
          <Link href="/documents">अहवाल</Link>
          <Link href="/gallery">गॅलरी</Link>
          <Link href="/contact">संपर्क</Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="container hero-content">
            <div className="hero-copy">
              <span className="badge">DIGITAL GOVERNANCE • CHAMORSHI</span>
              <h2>लोकाभिमुख प्रशासनातून<br/><strong>चामोर्शीचा सर्वांगीण विकास</strong></h2>
              <p>पारदर्शक प्रशासन • गतिमान विकास • गुणवत्तापूर्ण सेवा</p>
              <div className="hero-buttons">
                <Link className="primary-btn large" href="/services">नागरिक सेवा →</Link>
                <Link className="glass-btn large" href="/development">विकासाचा आढावा</Link>
              </div>
            </div>
            <div className="hero-panel">
              <div className="panel-title">चामोर्शी एक नजर</div>
              <div className="mini-grid">
                
                {stats.slice(0,4).map((s) => <div key={s.label}><b>{s.value}</b><span>{s.icon} {s.label}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        <div className="notice-strip">
          <div className="container notice-inner">
            <span className="notice-label">🔔 महत्त्वपूर्ण सूचना</span>
            <span className="ticker">{notices[0].title}</span>
            <Link href="/notices">सर्व सूचना →</Link>
          </div>
        </div>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div><span className="section-kicker">SMART PANCHAYAT</span><h2>डिजिटल गव्हर्नन्स</h2></div>
              <Link href="/services">सर्व Digital Services →</Link>
            </div>
            <div className="digital-grid">
              {digital.map(([icon, title, desc]) => (
                <div className="feature-card" key={title}><div className="icon-box">{icon}</div><h3>{title}</h3><p>{desc}</p><span className="arrow">Explore →</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="section-head light"><div><span className="section-kicker">AT A GLANCE</span><h2>चामोर्शी एक नजर</h2></div></div>
            <div className="stats-grid">
              {stats.map((s) => <div className="stat-card" key={s.label}><div className="stat-icon">{s.icon}</div><b>{s.value}</b><span>{s.label}</span></div>)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head"><div><span className="section-kicker">OUR DEPARTMENTS</span><h2>प्रमुख विभाग</h2></div><Link href="/departments">सर्व विभाग →</Link></div>
            <div className="cards-grid">
              {departments.map(([icon, title, desc]) => <div className="simple-card" key={title}><div className="round-icon">{icon}</div><h3>{title}</h3><p>{desc}</p><Link href="/departments">माहिती →</Link></div>)}
            </div>
          </div>
        </section>

        <section className="section soft">
          <div className="container">
            <div className="section-head"><div><span className="section-kicker">GOVERNMENT SCHEMES</span><h2>शासकीय योजना</h2></div><Link href="/schemes">सर्व योजना →</Link></div>
            <div className="scheme-grid">
              {schemes.map(([icon, title, desc]) => <div className="scheme-card" key={title}><div className="scheme-icon">{icon}</div><h3>{title}</h3><p>{desc}</p><Link href="/schemes">योजनेबद्दल माहिती →</Link></div>)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split">
            <div>
              <span className="section-kicker">LATEST UPDATES</span><h2>ताज्या सूचना</h2>
              <div className="list-card">
                {notices.map((n) => <div className="list-item" key={n.title}><span className="date-pill">{n.date}</span><div><b>{n.title}</b><small>{n.tag}</small></div></div>)}
              </div>
              <Link className="primary-btn inline-btn" href="/notices">सर्व सूचना</Link>
            </div>
            <div>
              <span className="section-kicker">NEWS & EVENTS</span><h2>बातम्या व उपक्रम</h2>
              <div className="news-list">{news.map(([t,d]) => <article key={t}><span>NEWS</span><h3>{t}</h3><p>{d}</p></article>)}</div>
            </div>
          </div>
        </section>

        <section className="officer-section">
          <div className="container officer">
            <div className="officer-photo">👨‍💼</div>
            <div><span className="section-kicker">OFFICER'S MESSAGE</span><h2>गटविकास अधिकाऱ्यांचा संदेश</h2><p>पारदर्शक, उत्तरदायी आणि लोकाभिमुख प्रशासनाच्या माध्यमातून ग्रामीण भागातील प्रत्येक नागरिकापर्यंत शासनाच्या योजना व सेवा प्रभावीपणे पोहोचविणे हे आमचे प्रमुख उद्दिष्ट आहे.</p><b>— गटविकास अधिकारी, पंचायत समिती चामोर्शी</b></div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head"><div><span className="section-kicker">CITIZEN SERVICES</span><h2>नागरिकांसाठी सेवा</h2></div></div>
            <div className="service-grid">{services.map((s) => <Link href="/services" className="service-item" key={s}>→ <span>{s}</span></Link>)}</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div><h3>पंचायत समिती चामोर्शी</h3><p>जिल्हा गडचिरोली, महाराष्ट्र</p><p>लोकाभिमुख प्रशासन • गतिमान विकास</p></div>
          <div><h4>महत्त्वाचे दुवे</h4><Link href="/notices">सूचना</Link><Link href="/schemes">योजना</Link><Link href="/documents">अहवाल</Link></div>
          <div><h4>Digital Governance</h4><Link href="/development">Development Dashboard</Link><Link href="/services">Digital Services</Link><Link href="/admin">Admin Panel</Link></div>
          <div><h4>संपर्क</h4><p>पंचायत समिती चामोर्शी</p><p>जि. गडचिरोली, महाराष्ट्र</p></div>
        </div>
        <div className="copyright">© 2026 Panchayat Samiti Chamorshi. Website under development.</div>
      </footer>
    </>
  );
}
