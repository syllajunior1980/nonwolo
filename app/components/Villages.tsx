"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, MapPin, X, Users } from "lucide-react";

export default function Villages() {
  const { villages, adherents, addVillage, deleteVillage } = useStore();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [nom,    setNom]    = useState("");
  const [region, setRegion] = useState("");
  const [toast,  setToast]  = useState<string|null>(null);

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const sauvegarder = () => {
    if (!nom.trim()) { afficherToast("Veuillez entrer un nom de village"); return; }
    if (villages.find(v => v.nom.toLowerCase() === nom.toLowerCase())) { afficherToast("Ce village existe déjà"); return; }
    addVillage({ nom: nom.trim(), region: region.trim() });
    setNom(""); setRegion(""); setModalOuvert(false);
    afficherToast("Village ajouté !");
  };

  const supprimerVillage = (id: string, nomV: string) => {
    const count = adherents.filter(a => a.village === nomV).length;
    if (count > 0) { afficherToast(`Impossible : ${count} adhérent(s) rattaché(s) à ce village`); return; }
    if (confirm(`Supprimer le village "${nomV}" ?`)) { deleteVillage(id); afficherToast("Village supprimé"); }
  };

  const total = adherents.length;

  return (
    <div>
      {/* En-tête */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:4, height:32, background:"var(--or)", borderRadius:99 }} />
            <h1 className="titre" style={{ fontSize:32, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>
              Villages du Nonwolo
            </h1>
          </div>
          <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
            {villages.length} village{villages.length !== 1 ? "s" : ""} enregistré{villages.length !== 1 ? "s" : ""}
            &nbsp;·&nbsp;26 villages, une seule vision
          </p>
        </div>
        <button className="btn-principal" onClick={() => setModalOuvert(true)}>
          <Plus size={15} /> Ajouter un village
        </button>
      </div>

      {/* Grille des villages */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(230px, 1fr))", gap:"1rem" }}>
        {villages.map((v, i) => {
          const count = adherents.filter(a => a.village === v.nom).length;
          const pct   = total ? Math.round(count / total * 100) : 0;
          // Couleur accentuée par rotation
          const accents = ["var(--or)","#4ade80","#a78bfa","#38bdf8","#f87171","var(--or-clair)"];
          const accent = accents[i % accents.length];

          return (
            <div key={v.id} className="carte" style={{ position:"relative", transition:"border-color 0.2s, transform 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>

              {/* Bouton supprimer */}
              <button
                onClick={() => supprimerVillage(v.id, v.nom)}
                title="Supprimer"
                style={{ position:"absolute", top:12, right:12, border:"none", background:"rgba(255,255,255,0.04)", color:"var(--texte-ter)", borderRadius:8, padding:"5px", cursor:"pointer", transition:"background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="var(--rouge-pale)"; (e.currentTarget as HTMLButtonElement).style.color="#f87171"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color="var(--texte-ter)"; }}
              >
                <Trash2 size={13} />
              </button>

              {/* Icône */}
              <div style={{ width:48, height:48, borderRadius:14, background:`rgba(${accent === "var(--or)" ? "201,168,76" : "255,255,255"},0.08)`, border:`1px solid ${accent === "var(--or)" ? "var(--or-bordure)" : "rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1rem" }}>
                <MapPin size={22} color={accent} />
              </div>

              <div style={{ fontWeight:700, fontSize:17, color:"var(--texte)", marginBottom:3 }}>{v.nom}</div>
              {v.region && (
                <div style={{ fontSize:11.5, color:"var(--texte-ter)", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  {v.region}
                </div>
              )}

              {/* Stat adhérents */}
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                <Users size={13} color="var(--texte-ter)" />
                <span style={{ fontSize:13, fontWeight:700, color:accent }}>{count}</span>
                <span style={{ fontSize:12.5, color:"var(--texte-ter)" }}>adhérent{count !== 1 ? "s" : ""}</span>
                <span style={{ fontSize:12, color:"var(--texte-ter)", marginLeft:"auto", fontWeight:600 }}>{pct}%</span>
              </div>

              {/* Barre */}
              <div className="barre-fond" style={{ height:4 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${accent}, ${accent}88)`, borderRadius:99, transition:"width 0.6s cubic-bezier(.4,0,.2,1)" }} />
              </div>
            </div>
          );
        })}

        {/* Carte "Ajouter" */}
        <div
          onClick={() => setModalOuvert(true)}
          style={{ border:"2px dashed var(--bordure)", borderRadius:16, padding:"1.5rem", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", minHeight:160, transition:"border-color 0.2s, background 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="var(--or-bordure)"; (e.currentTarget as HTMLDivElement).style.background="var(--or-pale)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="var(--bordure)"; (e.currentTarget as HTMLDivElement).style.background="transparent"; }}
        >
          <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--or-pale)", border:"1px solid var(--or-bordure)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Plus size={20} color="var(--or)" />
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:"var(--or)" }}>Nouveau village</span>
        </div>
      </div>

      {/* Modal */}
      {modalOuvert && (
        <div className="modal-fond">
          <div className="modal" style={{ maxWidth:400 }}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure-or)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 className="titre" style={{ fontSize:20, fontWeight:600, color:"var(--or)" }}>Nouveau village</h2>
              <button onClick={() => setModalOuvert(false)} style={{ border:"none", background:"rgba(255,255,255,0.05)", color:"var(--texte-sec)", borderRadius:8, padding:"6px" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label className="label">Nom du village *</label>
                <input className="champ" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Nonwolo, Gnégré..." onKeyDown={e => e.key === "Enter" && sauvegarder()} autoFocus />
              </div>
              <div>
                <label className="label">Région</label>
                <input className="champ" value={region} onChange={e => setRegion(e.target.value)} placeholder="Ex: Centre, Nord..." />
              </div>
            </div>
            <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid var(--bordure)", display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button className="btn-neutre" onClick={() => setModalOuvert(false)}>Annuler</button>
              <button className="btn-principal" onClick={sauvegarder}>Ajouter le village</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span style={{ color:"#4ade80" }}>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
