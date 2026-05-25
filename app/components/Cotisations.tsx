"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { CheckCircle, Clock, Copy, Check, TrendingUp, Smartphone } from "lucide-react";

const OPERATEURS = [
  {
    nom: "Orange Money",
    couleur: "#e8650a",
    fond: "rgba(232,101,10,0.07)",
    bordure: "rgba(232,101,10,0.20)",
    numero: "0789514185",
    code: "#144*1*1*0789514185*1000#",
    tip: "Composez ce code → Appuyez Appel → Validez → Entrez votre PIN Orange Money",
  },
  {
    nom: "MTN Money",
    couleur: "#d4900a",
    fond: "rgba(212,144,10,0.07)",
    bordure: "rgba(212,144,10,0.20)",
    numero: "0544415662",
    code: "*133*3*1*0544415662*1000#",
    tip: "Composez ce code → Appuyez Appel → Validez → Entrez votre PIN MTN",
  },
  {
    nom: "Moov Money",
    couleur: "#2563eb",
    fond: "rgba(37,99,235,0.07)",
    bordure: "rgba(37,99,235,0.20)",
    numero: "— (à venir)",
    code: "*155*1*1*NUMERO_MOOV*1000#",
    tip: "Remplacez NUMERO_MOOV par le numéro Moov du bénéficiaire quand disponible",
  },
  {
    nom: "Wave",
    couleur: "#0891b2",
    fond: "rgba(8,145,178,0.07)",
    bordure: "rgba(8,145,178,0.20)",
    numero: "— (à venir)",
    code: "*9113*1*NUMERO_WAVE*1000#",
    tip: "Composez ce code ou ouvrez Wave → Envoyer → Motif : Cotisation JN1000 + votre nom",
  },
];

export default function Cotisations() {
  const { adherents, updateAdherent } = useStore();
  const [copie,     setCopie]     = useState<string|null>(null);
  const [toast,     setToast]     = useState<string|null>(null);
  const [filtre,    setFiltre]    = useState<"tous"|"paye"|"impaye">("tous");
  const [recherche, setRecherche] = useState("");

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const copier = (texte: string, cle: string) => {
    navigator.clipboard.writeText(texte).then(() => {
      setCopie(cle); setTimeout(() => setCopie(null), 2200);
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
    const p  = filtre === "tous" ? true : filtre === "paye" ? a.paye : !a.paye;
    return ok && p;
  });

  return (
    <div>
      <div style={{ marginBottom:"1.75rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:4, height:32, background:"var(--vert)", borderRadius:99 }} />
          <h1 className="titre" style={{ fontSize:30, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>Cotisations</h1>
        </div>
        <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
          Gestion des paiements · 1 000 FCFA par adhérent
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(155px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { titre:"Total attendu",     val:(total*1000).toLocaleString("fr")+" F",      couleur:"var(--texte-sec)", fond:"var(--fond)" },
          { titre:"Collecté",          val:montant.toLocaleString("fr")+" F",            couleur:"var(--vert)",      fond:"var(--vert-pale)" },
          { titre:"Reste à collecter", val:(nonPayes*1000).toLocaleString("fr")+" F",    couleur:"var(--rouge)",     fond:"var(--rouge-pale)" },
          { titre:"Taux de collecte",  val:taux+"%",                                     couleur:"var(--or)",        fond:"var(--or-pale)" },
        ].map((s,i) => (
          <div key={i} className="stat-carte" style={{ background:s.fond }}>
            <div style={{ fontSize:10.5, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>{s.titre}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.couleur }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Barre progression */}
      <div className="carte" style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14.5, color:"var(--texte)", marginBottom:3, display:"flex", alignItems:"center", gap:8 }}>
              <TrendingUp size={15} color="var(--vert)" /> Progression des cotisations
            </div>
            <div style={{ fontSize:12, color:"var(--texte-ter)" }}>Objectif : {(total*1000).toLocaleString("fr")} FCFA</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:26, fontWeight:800, color:"var(--vert)", lineHeight:1 }}>{taux}%</div>
            <div style={{ fontSize:11, color:"var(--texte-ter)" }}>{payes}/{total} adhérents</div>
          </div>
        </div>
        <div className="barre-fond"><div className="barre-remplie" style={{ width:`${taux}%` }} /></div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12 }}>
          <span style={{ color:"var(--vert)", fontWeight:600 }}>✓ {payes} payé{payes>1?"s":""}</span>
          <span style={{ color:"var(--alerte)", fontWeight:600 }}>⏳ {nonPayes} en attente</span>
        </div>
      </div>

      {/* Instructions paiement */}
      <div className="carte" style={{ marginBottom:"1.5rem", borderLeft:"4px solid var(--vert)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.25rem" }}>
          <Smartphone size={18} color="var(--vert)" />
          <h2 style={{ fontWeight:700, fontSize:15, color:"var(--texte)" }}>Instructions de paiement — 1 000 FCFA</h2>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {OPERATEURS.map(op => (
            <div key={op.nom} style={{ border:`1.5px solid ${op.bordure}`, borderRadius:14, padding:"14px 16px", background:op.fond }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"white", border:`1px solid ${op.bordure}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:op.couleur, fontSize:13 }}>
                    {op.nom.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13.5, color:op.couleur }}>{op.nom}</div>
                    <div style={{ fontSize:11, color:"var(--texte-ter)", marginTop:1 }}>
                      N° : <strong style={{ color:"var(--texte-sec)" }}>{op.numero}</strong>
                    </div>
                  </div>
                </div>
                <button onClick={() => copier(op.code, op.nom)} style={{ border:`1px solid ${copie===op.nom?"rgba(22,163,74,0.4)":op.bordure}`, background:copie===op.nom?"rgba(22,163,74,0.10)":"white", color:copie===op.nom?"#16a34a":op.couleur, borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:5, cursor:"pointer" }}>
                  {copie===op.nom ? <><Check size={12}/> Copié</> : <><Copy size={12}/> Copier</>}
                </button>
              </div>
              <div style={{ fontFamily:"monospace", fontSize:14, fontWeight:700, color:op.couleur, padding:"10px 13px", background:"rgba(0,0,0,0.04)", borderRadius:8, marginBottom:8, wordBreak:"break-all", border:`1px solid ${op.bordure}`, letterSpacing:"0.5px" }}>
                {op.code}
              </div>
              <div style={{ fontSize:12.5, color:"var(--texte-sec)", lineHeight:1.6 }}>💡 {op.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suivi */}
      <div className="carte" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"1rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10, background:"var(--vert-pale)" }}>
          <h2 style={{ fontWeight:700, fontSize:14, color:"var(--texte)" }}>Suivi individuel</h2>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <input className="champ" style={{ width:220 }} placeholder="Rechercher..." value={recherche} onChange={e => setRecherche(e.target.value)} />
            <select className="champ" style={{ width:"auto" }} value={filtre} onChange={e => setFiltre(e.target.value as "tous"|"paye"|"impaye")}>
              <option value="tous">Tous</option>
              <option value="paye">Payé</option>
              <option value="impaye">Impayé</option>
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Adhésion</th><th>Adhérent</th><th>Village</th><th>Pays</th>
                <th>Opérateur</th><th>Date paiement</th><th>Statut</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtres.map(a => (
                <tr key={a.id}>
                  <td><span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"var(--or)", background:"var(--or-pale)", padding:"2px 8px", borderRadius:6 }}>{a.id}</span></td>
                  <td style={{ fontWeight:600, color:"var(--texte)" }}>{a.nom} {a.prenoms}</td>
                  <td style={{ fontSize:13, color:"var(--texte-sec)" }}>{a.village}</td>
                  <td style={{ fontSize:13, color:"var(--texte-sec)" }}>{a.pays || "—"}</td>
                  <td style={{ fontSize:12.5, color:"var(--texte-ter)" }}>{a.operateur || "—"}</td>
                  <td style={{ fontSize:12.5, color:"var(--texte-ter)" }}>{a.date_paiement || "—"}</td>
                  <td>
                    <span className="badge" style={{ background:a.paye?"var(--vert-pale)":"var(--alerte-pale)", color:a.paye?"var(--vert)":"var(--alerte)", border:`1px solid ${a.paye?"var(--vert-clair)":"rgba(180,83,9,0.2)"}` }}>
                      {a.paye ? <><CheckCircle size={11}/> Payé</> : <><Clock size={11}/> En attente</>}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => togglePaiement(a.id, a.paye)} style={{ border:"none", borderRadius:8, padding:"6px 14px", fontSize:12.5, fontWeight:600, cursor:"pointer", background:a.paye?"var(--rouge-pale)":"var(--vert-pale)", color:a.paye?"var(--rouge)":"var(--vert)" }}>
                      {a.paye ? "Annuler" : "Confirmer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div className="toast"><span style={{ color:"var(--vert)" }}>✓</span> {toast}</div>}
    </div>
  );
}
