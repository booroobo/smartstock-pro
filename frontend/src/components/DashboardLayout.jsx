import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Alert from "./Alert";

export default function DashboardLayout({ title, subtitle, onRefresh, children }) {
  const [notice, setNotice] = useState("");

  const prepared = () => {
    setNotice("Simulasi MVP. Disiapkan untuk pengembangan lanjutan.");
    window.setTimeout(() => setNotice(""), 2200);
  };

  return (
    <div className="ss-shell">
      <Sidebar onPrepared={prepared} />
      <div className="ss-main">
        <Navbar title={title} subtitle={subtitle} onRefresh={onRefresh} onPrepared={prepared} />
        <main className="ss-content">
          {notice && <Alert type="info" message={notice} onClose={() => setNotice("")} />}
          {children}
        </main>
      </div>
    </div>
  );
}
