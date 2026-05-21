"use client";
import { useStore } from "@/lib/store";
import { Users, Home, MessageSquare, CreditCard, BarChart3, Menu, X, Globe } from "lucide-react";
import { useState } from "react";

const liens = [
  { id: "tableau-de-bord", label: "Tableau de bord", icone: BarChart3 },
  { id: "adherents", label: "Adhérents", icone: Users },
  { id: "villages", label: "Villages", icone: Home },
  { id: "messagerie", label: "Messagerie", icone: MessageSquare },
  { id: "paiements", label: "Cotisations", icone: CreditCard },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, adherents, messages } = useStore();
  const [ouvert, setOuvert] = useState(false);
  const nonPayes = adherents.filter(a => !a.paye).length;
  const nonLus = messages.filter(m => !m.lu).length;

  const contenu = (
    <div className="sidebar" style={{ transform: ouvert || typeof window === 'undefined' ? undefined : undefined }}>
      {/* Logo */}
      <div style={{ padding: "1.5rem 1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>N</div>
          <div>
            <div className="syne" style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>AJRN</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5, marginTop: 2 }}>Nonwolo — Monde entier</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "0.75rem", color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
          <Globe size={11} />
          <span>Accessible partout dans le monde</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
        {liens.map(l => {
          const Ic = l.icone;
          const badge = l.id === "paiements" ? nonPayes : l.id === "messagerie" ? nonLus : 0;
          return (
            <div
              key={l.id}
              className={`nav-item ${activeTab === l.id ? "actif" : ""}`}
              onClick={() => { setActiveTab(l.id); setOuvert(false); }}
            >
              <Ic size={17} />
              <span style={{ flex: 1 }}>{l.label}</span>
              {badge > 0 && (
                <span style={{ background: l.id === "paiements" ? "#ef4444" : "#f59e0b", color: "white", borderRadius: "99px", padding: "1px 7px", fontSize: 10.5, fontWeight: 700 }}>{badge}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Pied */}
      <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
          © 2025 AJRN · Tous droits réservés
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setOuvert(!ouvert)}
        style={{ position: "fixed", top: 12, left: 12, zIndex: 100, background: "var(--vert-fonce)", color: "white", border: "none", borderRadius: 9, padding: "8px 10px", display: "none" }}
        className="menu-mobile"
      >
        {ouvert ? <X size={20} /> : <Menu size={20} />}
      </button>
      <style>{`@media(max-width:768px){ .sidebar{ position:fixed; transform: translateX(${ouvert ? "0" : "-100%"}); transition: transform 0.25s; } .menu-mobile{ display:flex!important; } }`}</style>
      {ouvert && <div onClick={() => setOuvert(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 49 }} />}
      {contenu}
    </>
  );
}
