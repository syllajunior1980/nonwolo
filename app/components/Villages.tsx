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
  const ACCENTS = ["var(--vert)","var(--or)","#7c3aed","#0891b2","#dc2626","#16a34a"];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:4, height:32, background:"var(--vert)", borderRadius:99 }} />
            <h1 className="titre" style={{ fontSize:30, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>Villages du Nonwolo</h1>
          </div>
          <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
            {villages.length} village{villages.length!==1?"s":""} enregistré{villages.length!==1?"s":""} · 58 villages, une seule vision
          </p>
        </div>
        <button className="btn-principal" onClick={() => setModalOuvert(true)}>
          <Plus size={15} /> Ajouter un village
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:"1rem" }}>
        {villages.map((v, i) => {
          const count = adherents.filter(a => a.village === v.nom).length;
          const pct   = total ? Math.round(count/total*100) : 0;
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <div key={v.id} className="carte" style={{ position:"relative", transition:"transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 24px rgba(22,79,51,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=""; (e.currentTarget as HTMLDivElement).style.boxShadow=""; }}>
              <button onClick={() => supprimerVillage(v.id, v.nom)} title="Supprimer"
                style={{ position:"absolute", top:12, right:12, border:"none", background:"transparent", color:"var(--texte-ter)", borderRadius:8, padding:"5px", cursor:"pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="var(--rouge-pale)"; (e.currentTarget as HTMLButtonElement).style.color="var(--rouge)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="transparent"; (e.currentTarget as HTMLButtonElement).style.color="var(--texte-ter)"; }}>
                <Trash2 size={13} />
              </button>
              <div style={{ width:46, height:46, borderRadius:13, background:"var(--vert-pale)", border:"1px solid var(--vert-clair)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1rem" }}>
                <MapPin size={20} color={accent} />
              </div>
              <div style={{ fontWeight:700, fontSize:16, color:"var(--texte)", marginBottom:3 }}>{v.nom}</div>
              {v.region && <div style={{ fontSize:11.5, color:"var(--texte-ter)", marginBottom:"0.75rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>{v.region}</div>}
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <Users size={12} color="var(--texte-ter)" />
                <span style={{ fontSize:13, fontWeight:700, color:accent }}>{count}</span>
                <span style={{ fontSize:12.5, color:"var(--texte-ter)" }}>adhérent{count!==1?"s":""}</span>
                <span style={{ fontSize:12, color:"var(--texte-ter)", marginLeft:"auto", fontWeight:600 }}>{pct}%</span>
              </div>
              <div className="barre-fond" style={{ height:5 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:accent, borderRadius:99, transition:"width 0.6s ease" }} />
              </div>
            </div>
          );
        })}

        <div onClick={() => setModalOuvert(true)}
          style={{ border:"2px dashed var(--vert-clair)", borderRadius:16, padding:"1.5rem", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", minHeight:160, transition:"all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="var(--vert)"; (e.currentTarget as HTMLDivElement).style.background="var(--vert-pale)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="var(--vert-clair)"; (e.currentTarget as HTMLDivElement).style.background="transparent"; }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--vert-pale)", border:"1px solid var(--vert-clair)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Plus size={20} color="var(--vert)" />
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:"var(--vert)" }}>Nouveau village</span>
        </div>
      </div>

      {modalOuvert && (
        <div className="modal-fond">
          <div className="modal" style={{ maxWidth:400 }}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--vert-pale)", borderRadius:"20px 20px 0 0" }}>
              <h2 className="titre" style={{ fontSize:20, fontWeight:700, color:"var(--vert)" }}>Nouveau village</h2>
              <button onClick={() => setModalOuvert(false)} style={{ border:"none", background:"transparent", color:"var(--texte-sec)", borderRadius:8, padding:"6px", cursor:"pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label className="label">Nom du village *</label>
                <input className="champ" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Nonwolo, Gnégré..." onKeyDown={e => e.key==="Enter" && sauvegarder()} autoFocus />
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
      {toast && <div className="toast"><span style={{ color:"var(--vert)" }}>✓</span> {toast}</div>}
    </div>
  );
}
