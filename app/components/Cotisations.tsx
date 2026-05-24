"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { CheckCircle, Clock, Copy, Check, TrendingUp } from "lucide-react";

const OPERATEURS = [
  { nom: "Orange Money", couleur: "#ff8c42", fond: "rgba(255,140,66,0.1)", bordure: "rgba(255,140,66,0.2)", code: "#144*1*1*0707070707*1000#", tip: "Composer ce code → Appuyer sur Appel → Valider → Entrer votre code PIN Orange Money" },
  { nom: "Moov Money",   couleur: "#4f9cf9", fond: "rgba(79,156,249,0.1)", bordure: "rgba(79,156,249,0.2)", code: "#133*1*0707070707*1000#",   tip: "Composer ce code → Appuyer sur Appel → Valider → Entrer votre code PIN Moov" },
  { nom: "Wave",         couleur: "#38bdf8", fond: "rgba(56,189,248,0.1)", bordure: "rgba(56,189,248,0.2)", code: "Ouvrir Wave → Envoyer → 0707070707 → 1 000 FCFA", tip: 'Indiquer dans le motif : "Cotisation AJRN + Votre nom complet"' },
];

export default function Cotisations() {
  const { adherents, updateAdherent } = useStore();
  const [copie,      setCopie]      = useState<string|null>(null);
  const [toast,      setToast]      = useState<string|null>(null);
  const [filtre,     setFiltre]     = useState<"tous"|"payé"|"impayé">("tous");
  const [recherche,  setRecherche]  = useState("");

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const copier = (texte: string, cle: string) => {
    navigator.clipboard.writeText(texte).then(() => {
      setCopie(cle); setTimeout(() => setCopie(null), 2000);
      afficherToast("Copié dans le presse-papiers !");
    });
  };

  const togglePaiement = (id: string, paye: boolean) => {
    updateAdherent(id, { paye: !paye, date_paiement: !paye ? new Date().toISOString().split("T")[0] : "" });
    afficherToast(!paye ? "Paiement confirmé ✓" : "Paiement annulé");
  };

  const total    = adherents.length;
  const payes    = adherents.filter(a => a.paye).length;
  const nonPayes = total - payes;
  const montant  = payes * 1000;
  const taux     = total ? Math.round(payes / total * 100) : 0;

  const filtres = adherents.filter(a => {
    const q  = recherche.toLowerCase();
    const ok = (a.nom+" "+a.prenoms).toLowerCase().includes(q) || a.village.toLowerCase().includes(q) || a.pays.toLowerCase().includes(q);
    const p  = filtre === "tous" ? true : filtre === "payé" ? a.paye : !a.paye;
    return ok && p;
  });

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom:"1.75rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:4, height:32, background:"var(--or)", borderRadius:99 }} />
          <h1 className="titre" style={{ fontSize:32, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>Cotisations</h1>
        </div>
        <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
          Gestion des paiements · 1 000 FCFA par adhérent
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { titre:"Total attendu",   val:(total*1000).toLocaleString("fr")+" F",    couleur:"var(--texte-sec)",  fond:"rgba(255,255,255,0.03)", bordure:"var(--bordure)" },
          { titre:"Collecté",        val:montant.toLocaleString("fr")+" F",          couleur:"#4ade80",           fond:"rgba(74,222,128,0.08)",  bordure:"rgba(74,222,128,0.2)" },
          { titre:"Reste à collecter",val:((nonPayes)*1000).toLocaleString("fr")+" F",couleur:"#f87171",          fond:"rgba(248,113,113,0.08)", bordure:"rgba(248,113,113,0.2)" },
          { titre:"Taux de collecte", val:taux+"%",                                   couleur:"var(--or)",         fond:"var(--or-pale)",         bordure:"var(--or-bordure)" },
        ].map((s, i) => (
          <div key={i} className="stat-carte" style={{ borderColor:s.bordure, background:s.fond }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:10 }}>{s.titre}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.couleur }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      <div className="carte" style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14, color:"var(--texte)", marginBottom:3, display:"flex", alignItems:"center", gap:8 }}>
              <TrendingUp size={15} color="var(--or)" />
              Progression globale
            </div>
            <div style={{ fontSize:12, color:"var(--texte-ter)" }}>
              Objectif total : {(total * 1000).toLocaleString("fr")} FCFA
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:28, fontWeight:800, color:"var(--or)", lineHeight:1 }}>{taux}%</div>
            <div style={{ fontSize:11, color:"var(--texte-ter)" }}>{payes}/{total} adhérents</div>
          </div>
        </div>
        <div className="barre-fond">
          <div className="barre-remplie" style={{ width:`${taux}%` }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12 }}>
          <span style={{ color:"#4ade80", fontWeight:600 }}>✓ {payes} payé{payes > 1 ? "s" : ""}</span>
          <span style={{ color:"var(--alerte)", fontWeight:600 }}>⏳ {nonPayes} en attente</span>
        </div>
      </div>

      {/* Instructions de paiement */}
      <div className="carte" style={{ marginBottom:"1.5rem", borderLeft:"3px solid var(--or)" }}>
        <div style={{ marginBottom:"1.25rem" }}>
          <h2 style={{ fontWeight:600, fontSize:14, color:"var(--texte)", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
            💳 Instructions de paiement
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:"var(--or-pale)", border:"1px solid var(--or-bordure)", borderRadius:12, flexWrap:"wrap" }}>
            <div style={{ fontSize:13, color:"var(--texte-sec)" }}>Numéro de dépôt AJRN :</div>
            <div style={{ fontFamily:"monospace", fontSize:20, fontWeight:800, color:"var(--or)", letterSpacing:3 }}>0707070707</div>
            <button onClick={() => copier("0707070707", "numero")}
              style={{ border:"none", background: copie==="numero" ? "rgba(74,222,128,0.15)" : "var(--or-pale)", color: copie==="numero" ? "#4ade80" : "var(--or)", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5, border:`1px solid ${copie==="numero" ? "rgba(74,222,128,0.3)" : "var(--or-bordure)"}` as unknown as undefined }}>
              {copie==="numero" ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
            </button>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {OPERATEURS.map(op => (
            <div key={op.nom} style={{ border:`1px solid ${op.bordure}`, borderRadius:12, padding:"14px 16px", background:op.fond }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${op.couleur}22`, border:`1px solid ${op.bordure}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:op.couleur, fontSize:14 }}>
                    {op.nom[0]}
                  </div>
                  <span style={{ fontWeight:700, fontSize:14, color:op.couleur }}>{op.nom}</span>
                </div>
                <button onClick={() => copier(op.code, op.nom)}
                  style={{ border:`1px solid ${copie===op.nom ? "rgba(74,222,128,0.3)" : op.bordure}`, background: copie===op.nom ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)", color: copie===op.nom ? "#4ade80" : op.couleur, borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
                  {copie===op.nom ? <><Check size={12} /> Copié</> : <><Copy size={12} /> Copier</>}
                </button>
              </div>
              <div style={{ fontFamily:"monospace", fontSize:13.5, fontWeight:700, color:op.couleur, padding:"8px 12px", background:"rgba(0,0,0,0.2)", borderRadius:8, marginBottom:6, wordBreak:"break-all" }}>
                {op.code}
              </div>
              <div style={{ fontSize:12.5, color:"var(--texte-sec)", lineHeight:1.6 }}>💡 {op.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau de suivi */}
      <div className="carte" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <h2 style={{ fontWeight:600, fontSize:14, color:"var(--texte)" }}>Suivi individuel</h2>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <input className="champ" style={{ width:220 }} placeholder="Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)} />
            <select className="champ" style={{ width:"auto" }} value={filtre} onChange={e => setFiltre(e.target.value as "tous"|"payé"|"impayé")}>
              <option value="tous">Tous</option>
              <option value="payé">Payé</option>
              <option value="impayé">Impayé</option>
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
                  <td>
                    <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"var(--or)", background:"var(--or-pale)", padding:"2px 8px", borderRadius:6 }}>
                      {a.id}
                    </span>
                  </td>
                  <td style={{ fontWeight:600, color:"var(--texte)" }}>{a.nom} {a.prenoms}</td>
                  <td style={{ fontSize:13, color:"var(--texte-sec)" }}>{a.village}</td>
                  <td style={{ fontSize:13, color:"var(--texte-sec)" }}>{a.pays || "—"}</td>
                  <td style={{ fontSize:12.5, color:"var(--texte-ter)" }}>{a.operateur || "—"}</td>
                  <td style={{ fontSize:12.5, color:"var(--texte-ter)" }}>{a.date_paiement || "—"}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      {a.paye
                        ? <CheckCircle size={14} color="#4ade80" />
                        : <Clock size={14} color="var(--alerte)" />}
                      <span className="badge" style={{
                        background: a.paye ? "rgba(74,222,128,0.12)" : "rgba(217,119,6,0.12)",
                        color:      a.paye ? "#4ade80" : "var(--alerte)",
                      }}>
                        {a.paye ? "Payé" : "En attente"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => togglePaiement(a.id, a.paye)}
                      style={{ border:"none", borderRadius:8, padding:"6px 14px", fontSize:12.5, fontWeight:600, cursor:"pointer",
                        background: a.paye ? "var(--rouge-pale)" : "rgba(74,222,128,0.12)",
                        color:      a.paye ? "#f87171" : "#4ade80" }}>
                      {a.paye ? "Annuler" : "Confirmer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <span style={{ color:"var(--or)" }}>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
