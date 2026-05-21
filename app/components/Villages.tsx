"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, Trash2, MapPin, X, Users } from "lucide-react";

export default function Villages() {
  const { villages, adherents, addVillage, deleteVillage } = useStore();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [region, setRegion] = useState("");
  const [toast, setToast] = useState<string|null>(null);

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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 className="syne" style={{ fontSize:26, fontWeight:800, color:"var(--vert-fonce)", marginBottom:4 }}>Villages du Nonwolo</h1>
          <p style={{ color:"var(--texte-sec)", fontSize:14 }}>{villages.length} village(s) enregistré(s)</p>
        </div>
        <button className="btn-principal" onClick={() => setModalOuvert(true)}>
          <Plus size={16} /> Ajouter un village
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"1rem" }}>
        {villages.map(v => {
          const count = adherents.filter(a => a.village === v.nom).length;
          const pct = total ? Math.round(count / total * 100) : 0;
          return (
            <div key={v.id} className="carte" style={{ position:"relative" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"0.75rem" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"var(--vert-clair)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <MapPin size={20} color="var(--vert)" />
                </div>
                <button onClick={() => supprimerVillage(v.id, v.nom)} style={{ border:"none", background:"none", color:"#d1d5db", padding:4, borderRadius:6 }} title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:2 }}>{v.nom}</div>
              {v.region && <div style={{ fontSize:12, color:"var(--texte-sec)", marginBottom:"0.75rem" }}>Région : {v.region}</div>}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <Users size={13} color="var(--texte-sec)" />
                <span style={{ fontSize:13, fontWeight:600, color:"var(--vert)" }}>{count} adhérent{count !== 1 ? "s" : ""}</span>
                <span style={{ fontSize:12, color:"var(--texte-sec)" }}>({pct}%)</span>
              </div>
              <div style={{ height:5, background:"#e5e7eb", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:"var(--vert-moyen)", borderRadius:99, transition:"width 0.5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>

      {modalOuvert && (
        <div className="modal-fond">
          <div className="modal" style={{ maxWidth:380 }}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 className="syne" style={{ fontSize:17, fontWeight:700 }}>Nouveau village</h2>
              <button onClick={() => setModalOuvert(false)} style={{ border:"none", background:"none", color:"var(--texte-sec)" }}><X size={20} /></button>
            </div>
            <div style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label className="label">Nom du village *</label>
                <input className="champ" value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Nonwolo" onKeyDown={e => e.key === "Enter" && sauvegarder()} />
              </div>
              <div>
                <label className="label">Région</label>
                <input className="champ" value={region} onChange={e => setRegion(e.target.value)} placeholder="Ex: Centre" />
              </div>
            </div>
            <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid var(--bordure)", display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button className="btn-neutre" onClick={() => setModalOuvert(false)}>Annuler</button>
              <button className="btn-principal" onClick={sauvegarder}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" style={{ background:"var(--vert)", color:"white" }}>✓ {toast}</div>}
    </div>
  );
}
