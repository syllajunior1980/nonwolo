"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { CreditCard, CheckCircle, Clock, AlertTriangle, Copy, Check } from "lucide-react";

const OPERATEURS = [
  {
    nom: "Orange Money",
    couleur: "#ff6b00",
    fond: "#fff4ee",
    numero: "0789514185",
    code: "#144*1*1*0789514185*1000#",
    tip: "Composer ce code sur votre téléphone → Appuyer sur Appel → Valider → Entrer votre code PIN Orange Money",
  },
  {
    nom: "MTN Money",
    couleur: "#ffcc00",
    fond: "#fffbea",
    numero: "0544415662",
    code: "*133*3*1*0544415662*1000#",
    tip: "Composer ce code sur votre téléphone → Appuyer sur Appel → Valider → Entrer votre code PIN MTN",
  },
  {
    nom: "Moov Money",
    couleur: "#0066cc",
    fond: "#eef4ff",
    numero: "— (à venir)",
    code: "*155*1*1*[numéro Moov]*1000#",
    tip: "Numéro Moov bientôt disponible — rapprochez-vous du bureau AJRN",
  },
  {
    nom: "Wave",
    couleur: "#1e90ff",
    fond: "#eef7ff",
    numero: "0789514185",
    code: "*9113*1*0789514185*1000#",
    tip: 'Composer ce code → Appuyer sur Appel → Valider → Entrer votre PIN Wave',
  },
];

export default function Cotisations() {
  const { adherents, updateAdherent } = useStore();
  const [copie, setCopie] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<"tous" | "payé" | "impayé">("tous");
  const [recherche, setRecherche] = useState("");

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const copier = (texte: string, cle: string) => {
    navigator.clipboard.writeText(texte).then(() => {
      setCopie(cle);
      setTimeout(() => setCopie(null), 2000);
      afficherToast("Copié dans le presse-papiers !");
    });
  };

  const togglePaiement = (id: string, paye: boolean) => {
    updateAdherent(id, { paye: !paye, datePaiement: !paye ? new Date().toISOString().split("T")[0] : "" });
    afficherToast(!paye ? "Paiement confirmé ✓" : "Paiement annulé");
  };

  const total = adherents.length;
  const payes = adherents.filter(a => a.paye).length;
  const nonPayes = total - payes;
  const montant = payes * 1000;
  const taux = total ? Math.round(payes / total * 100) : 0;

  const filtres = adherents.filter(a => {
    const q = recherche.toLowerCase();
    const ok = (a.nom + " " + a.prenoms).toLowerCase().includes(q) || a.village.toLowerCase().includes(q) || a.pays.toLowerCase().includes(q);
    const p = filtre === "tous" ? true : filtre === "payé" ? a.paye : !a.paye;
    return ok && p;
  });

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: "var(--vert-fonce)", marginBottom: 4 }}>Cotisations</h1>
        <p style={{ color: "var(--texte-sec)", fontSize: 14 }}>Gestion des paiements et suivi des cotisations — 1 000 FCFA par adhérent</p>
      </div>

      {/* Stats cotisations */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { titre: "Total attendu", val: (total * 1000).toLocaleString("fr") + " F", fond: "var(--vert-clair)", couleur: "var(--vert-fonce)" },
          { titre: "Montant collecté", val: montant.toLocaleString("fr") + " F", fond: "#dcfce7", couleur: "#16a34a" },
          { titre: "Reste à collecter", val: (nonPayes * 1000).toLocaleString("fr") + " F", fond: "#fef2f2", couleur: "#dc2626" },
          { titre: "Taux de collecte", val: taux + "%", fond: "var(--or-clair)", couleur: "var(--or)" },
        ].map((s, i) => (
          <div key={i} className="carte" style={{ background: s.fond, borderColor: "transparent" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: s.couleur, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8, opacity: 0.8 }}>{s.titre}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.couleur }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="carte" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Progression globale des cotisations</span>
          <span style={{ fontWeight: 700, color: "var(--vert)", fontSize: 14 }}>{payes}/{total} adhérents</span>
        </div>
        <div style={{ height: 14, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${taux}%`, background: "linear-gradient(90deg, var(--vert), var(--vert-moyen))", borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--texte-sec)" }}>
          <span style={{ color: "#16a34a", fontWeight: 600 }}>{payes} payé{payes > 1 ? "s" : ""}</span>
          <span style={{ color: "#dc2626", fontWeight: 600 }}>{nonPayes} en attente</span>
        </div>
      </div>

      {/* Instructions de paiement */}
      <div className="carte" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--vert)" }}>
        <div style={{ marginBottom: "1rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>💳 Instructions de paiement — Cotisation unique : 1 000 FCFA</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {OPERATEURS.map(op => (
            <div key={op.nom} style={{ border: "1px solid var(--bordure)", borderRadius: 12, padding: "12px 14px", background: "white" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: op.fond, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: op.couleur, fontSize: 13 }}>
                    {op.nom[0]}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: op.couleur }}>{op.nom}</span>
                    <div style={{ fontSize: 11.5, color: "var(--texte-sec)", marginTop: 1 }}>N° bénéficiaire : <strong style={{ color: "var(--texte)" }}>{op.numero}</strong></div>
                  </div>
                </div>
                <button onClick={() => copier(op.code, op.nom)}
                  style={{ border: "none", background: copie === op.nom ? "#dcfce7" : "var(--fond)", color: copie === op.nom ? "#16a34a" : "var(--texte-sec)", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  {copie === op.nom ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                </button>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: op.couleur, background: op.fond, padding: "8px 12px", borderRadius: 8, marginBottom: 6, wordBreak: "break-all" }}>
                {op.code}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--texte-sec)", lineHeight: 1.5 }}>
                💡 {op.tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau suivi */}
      <div className="carte" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--bordure)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontWeight: 700, fontSize: 14 }}>Suivi individuel des cotisations</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input className="champ" style={{ width: 200 }} placeholder="Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)} />
            <select className="champ" style={{ width: "auto" }} value={filtre} onChange={e => setFiltre(e.target.value as "tous" | "payé" | "impayé")}>
              <option value="tous">Tous</option>
              <option value="payé">Payé uniquement</option>
              <option value="impayé">Impayé uniquement</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Adhésion</th>
                <th>Adhérent</th>
                <th>Village</th>
                <th>Pays</th>
                <th>Opérateur</th>
                <th>Date paiement</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 700, color: "var(--vert)", fontFamily: "monospace", fontSize: 12.5 }}>{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.nom} {a.prenoms}</td>
                  <td style={{ fontSize: 13 }}>{a.village}</td>
                  <td style={{ fontSize: 13 }}>{a.pays || "—"}</td>
                  <td style={{ fontSize: 12.5 }}>{a.operateur || "—"}</td>
                  <td style={{ fontSize: 12.5, color: "var(--texte-sec)" }}>{a.datePaiement || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {a.paye ? <CheckCircle size={15} color="#16a34a" /> : <Clock size={15} color="#d97706" />}
                      <span className="badge" style={{ background: a.paye ? "#dcfce7" : "#fef2f2", color: a.paye ? "#16a34a" : "#dc2626" }}>
                        {a.paye ? "Payé" : "En attente"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => togglePaiement(a.id, a.paye)}
                      style={{ border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                        background: a.paye ? "var(--danger-clair)" : "var(--vert-clair)",
                        color: a.paye ? "var(--danger)" : "var(--vert)" }}>
                      {a.paye ? "Annuler" : "Confirmer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast" style={{ background: "var(--vert)", color: "white" }}>✓ {toast}</div>}
    </div>
  );
}
