"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import Sidebar from "./components/Sidebar";
import TableauDeBord from "./components/TableauDeBord";
import Adherents from "./components/Adherents";
import Villages from "./components/Villages";
import Messagerie from "./components/Messagerie";
import Cotisations from "./components/Cotisations";

export default function Page() {
  const { activeTab, chargerDonnees, chargement } = useStore();

  useEffect(() => {
    chargerDonnees();
  }, []);

  const pages: Record<string, React.ReactNode> = {
    "tableau-de-bord": <TableauDeBord />,
    "adherents":       <Adherents />,
    "villages":        <Villages />,
    "messagerie":      <Messagerie />,
    "paiements":       <Cotisations />,
  };

  if (chargement) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", flexDirection: "column", gap: 20,
      background: "var(--fond)",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        border: "3px solid rgba(30,107,69,0.15)",
        borderTopColor: "var(--vert)",
        animation: "spin 0.9s linear infinite",
      }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "var(--vert)", fontSize: 20, fontWeight: 700, fontFamily: "serif" }}>JN1000</div>
        <div style={{ color: "var(--texte-ter)", fontSize: 12.5, marginTop: 4 }}>26 villages · une seule vision</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div>
      <Sidebar />
      <main className="main-content">
        {pages[activeTab] || <TableauDeBord />}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding-top: 0 !important;
          }
          /* Fix titre caché par bouton menu mobile */
          .main-content h1 {
            padding-left: 52px !important;
          }
          .main-content > div > div:first-child {
            padding-left: 52px !important;
          }
        }
      `}</style>
    </div>
  );
}
