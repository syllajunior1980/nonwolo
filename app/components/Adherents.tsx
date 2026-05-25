"use client";
import { useState } from "react";
import { useStore, Adherent, Situation, Operateur, Continent } from "@/lib/store";
import { Plus, Search, Trash2, Edit3, Eye, X, Camera } from "lucide-react";

const SITUATIONS: Situation[] = ["Fonctionnaire","Chomeur","Ouvrier","Eleve","Etudiant","Autre"];
const OPERATEURS: Operateur[] = ["Orange Money","Moov Money","Wave",""];
const CONTINENTS: Continent[] = ["Afrique","Europe","Amerique du Nord","Amerique du Sud","Asie","Oceanie"];

const BADGE_SIT: Record<string, { bg: string; color: string }> = {
  "Fonctionnaire": { bg:"rgba(22,107,69,0.12)",   color:"var(--vert)" },
  "Chomeur":       { bg:"rgba(192,57,43,0.12)",   color:"var(--rouge)" },
  "Ouvrier":       { bg:"rgba(124,58,237,0.12)",  color:"#7c3aed" },
  "Eleve":         { bg:"rgba(181,130,13,0.12)",  color:"var(--or)" },
  "Etudiant":      { bg:"rgba(8,145,178,0.12)",   color:"#0891b2" },
  "Autre":         { bg:"rgba(100,100,100,0.10)", color:"var(--texte-sec)" },
};

const VIDE: Omit<Adherent,"id"|"date_inscription"> = {
  nom:"",prenoms:"",ddn:"",lieu_naissance:"",village:"",quartier:"",
  contact:"",email:"",pays:"",continent:"Afrique",
  situation:"Etudiant",operateur:"",photo:"",
  paye:false,date_paiement:"",notes:""
};

export default function Adherents() {
  const { adherents, villages, addAdherent, updateAdherent, deleteAdherent } = useStore();
  const [recherche,       setRecherche]       = useState("");
  const [filtrePaye,      setFiltrePaye]      = useState<"tous"|"paye"|"impaye">("tous");
  const [filtreContinent, setFiltreContinent] = useState("tous");
  const [modalOuvert,     setModalOuvert]     = useState(false);
  const [modalDetail,     setModalDetail]     = useState<Adherent|null>(null);
  const [form,            setForm]            = useState(VIDE);
  const [editId,          setEditId]          = useState<string|null>(null);
  const [toast,           setToast]           = useState<{msg:string;type:"ok"|"err"}|null>(null);

  const afficherToast = (msg: string, type:"ok"|"err"="ok") => { setToast({msg,type}); setTimeout(() => setToast(null), 3000); };

  const filtres = adherents.filter(a => {
    const q    = recherche.toLowerCase();
    const ok   = (a.nom+" "+a.prenoms).toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.village.toLowerCase().includes(q) || a.pays.toLowerCase().includes(q);
    const paye = filtrePaye === "tous" ? true : filtrePaye === "paye" ? a.paye : !a.paye;
    const cont = filtreContinent === "tous" ? true : a.continent === filtreContinent;
    return ok && paye && cont;
  });

  const ouvrir = (a?: Adherent) => {
    if (a) { setForm({...a}); setEditId(a.id); }
    else   { setForm(VIDE); setEditId(null); }
    setModalOuvert(true);
  };

  const sauvegarder = () => {
    if (!form.nom.trim() || !form.prenoms.trim() || !form.village || !form.contact.trim()) {
      afficherToast("Veuillez remplir les champs obligatoires (*)", "err"); return;
    }
    if (editId) { updateAdherent(editId, form); afficherToast("Adhérent mis à jour !"); }
    else        { addAdherent(form); afficherToast("Adhérent enregistré avec succès !"); }
    setModalOuvert(false);
  };

  const supprimer = (id: string) => {
    if (confirm("Supprimer cet adhérent ?")) { deleteAdherent(id); afficherToast("Adhérent supprimé"); }
  };

  const lirePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(x => ({ ...x, photo: ev.target?.result as string }));
    r.readAsDataURL(f);
  };

  const champ = (k: keyof typeof form, val: string | boolean) => setForm(x => ({ ...x, [k]: val }));

  return (
    <div>
      {/* En-tête */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:4, height:32, background:"var(--vert)", borderRadius:99 }} />
            <h1 className="titre" style={{ fontSize:30, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>Adhérents</h1>
          </div>
          <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
            {adherents.length} membre{adherents.length!==1?"s":""} inscrits dans le monde
          </p>
        </div>
        <button className="btn-principal" onClick={() => ouvrir()}>
          <Plus size={15} /> Ajouter un adhérent
        </button>
      </div>

      {/* Filtres */}
      <div className="carte" style={{ marginBottom:"1.25rem", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--texte-ter)" }} />
          <input className="champ" style={{ paddingLeft:34 }} placeholder="Rechercher par nom, ID, village, pays..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        </div>
        <select className="champ" style={{ width:"auto" }} value={filtrePaye} onChange={e => setFiltrePaye(e.target.value as "tous"|"paye"|"impaye")}>
          <option value="tous">Toutes les cotisations</option>
          <option value="paye">Cotisation payée</option>
          <option value="impaye">Cotisation impayée</option>
        </select>
        <select className="champ" style={{ width:"auto" }} value={filtreContinent} onChange={e => setFiltreContinent(e.target.value)}>
          <option value="tous">Tous les continents</option>
          {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ fontSize:12, color:"var(--texte-ter)", fontWeight:600, whiteSpace:"nowrap" }}>
          {filtres.length} résultat{filtres.length!==1?"s":""}
        </span>
      </div>

      {/* Tableau */}
      <div className="carte" style={{ padding:0, overflow:"hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Adhésion</th><th>Adhérent</th><th>Localisation</th>
                <th>Village</th><th>Contact</th><th>Situation</th>
                <th>Cotisation</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign:"center", color:"var(--texte-ter)", padding:"3rem" }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--texte-sec)" }}>Aucun adhérent trouvé</div>
                  </td>
                </tr>
              ) : filtres.map(a => {
                const bs = BADGE_SIT[a.situation] || BADGE_SIT["Autre"];
                return (
                  <tr key={a.id}>
                    <td>
                      <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"var(--or)", background:"var(--or-pale)", padding:"3px 8px", borderRadius:6 }}>
                        {a.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {a.photo
                          ? <img src={a.photo} style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--vert-clair)",flexShrink:0 }} alt="" />
                          : <div style={{ width:36,height:36,borderRadius:"50%",background:"var(--vert-pale)",border:"1.5px solid var(--vert-clair)",color:"var(--vert)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0 }}>
                              {(a.nom[0]||"")+(a.prenoms[0]||"")}
                            </div>
                        }
                        <div>
                          <div style={{ fontWeight:600, fontSize:13.5, color:"var(--texte)" }}>{a.nom} {a.prenoms}</div>
                          <div style={{ fontSize:11, color:"var(--texte-ter)" }}>{a.date_inscription}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13, color:"var(--texte-sec)" }}>{a.pays || "—"}</td>
                    <td style={{ fontSize:13, color:"var(--texte-sec)" }}>{a.village}</td>
                    <td style={{ fontSize:12.5, color:"var(--texte-sec)" }}>{a.contact}</td>
                    <td><span className="badge" style={{ background:bs.bg, color:bs.color }}>{a.situation}</span></td>
                    <td>
                      <span className="badge" style={{ background:a.paye?"var(--vert-pale)":"var(--alerte-pale)", color:a.paye?"var(--vert)":"var(--alerte)", border:`1px solid ${a.paye?"var(--vert-clair)":"rgba(180,83,9,0.2)"}` }}>
                        {a.paye ? "✓ Payé" : "⏳ En attente"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={() => setModalDetail(a)} title="Voir" style={{ border:"none", background:"var(--fond)", color:"var(--texte-sec)", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Eye size={14}/></button>
                        <button onClick={() => ouvrir(a)} title="Modifier" style={{ border:"none", background:"var(--vert-pale)", color:"var(--vert)", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Edit3 size={14}/></button>
                        <button onClick={() => supprimer(a.id)} title="Supprimer" style={{ border:"none", background:"var(--rouge-pale)", color:"var(--rouge)", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulaire */}
      {modalOuvert && (
        <div className="modal-fond">
          <div className="modal">
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--vert-pale)", borderRadius:"20px 20px 0 0" }}>
              <h2 className="titre" style={{ fontSize:20, fontWeight:700, color:"var(--vert)" }}>
                {editId ? "Modifier l'adhérent" : "Nouvel adhérent"}
              </h2>
              <button onClick={() => setModalOuvert(false)} style={{ border:"none", background:"transparent", color:"var(--texte-sec)", borderRadius:8, padding:"6px", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ padding:"1.5rem" }}>

              {/* Photo */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:"1.5rem" }}>
                <label style={{ cursor:"pointer" }}>
                  <div style={{ width:90, height:90, borderRadius:"50%", background:"var(--vert-pale)", border:"2px dashed var(--vert-clair)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:5, overflow:"hidden", transition:"border-color 0.2s" }}>
                    {form.photo
                      ? <img src={form.photo} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                      : <><Camera size={22} color="var(--vert)" /><span style={{ fontSize:10, color:"var(--texte-ter)", fontWeight:600 }}>Photo</span></>
                    }
                  </div>
                  <input type="file" accept="image/*" onChange={lirePhoto} style={{ display:"none" }} />
                </label>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <div>
                  <label className="label">Nom *</label>
                  <input className="champ" value={form.nom} onChange={e => champ("nom", e.target.value)} placeholder="Nom de famille" />
                </div>
                <div>
                  <label className="label">Prénoms *</label>
                  <input className="champ" value={form.prenoms} onChange={e => champ("prenoms", e.target.value)} placeholder="Prénoms" />
                </div>
                <div>
                  <label className="label">Date de naissance</label>
                  <input className="champ" type="date" value={form.ddn} onChange={e => champ("ddn", e.target.value)} />
                </div>
                <div>
                  <label className="label">Lieu de naissance</label>
                  <input className="champ" value={form.lieu_naissance} onChange={e => champ("lieu_naissance", e.target.value)} placeholder="Ville de naissance" />
                </div>
                <div>
                  <label className="label">Village *</label>
                  <select className="champ" value={form.village} onChange={e => champ("village", e.target.value)}>
                    <option value="">Sélectionner un village...</option>
                    {villages.map(v => <option key={v.id} value={v.nom}>{v.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quartier</label>
                  <input className="champ" value={form.quartier} onChange={e => champ("quartier", e.target.value)} placeholder="Quartier de résidence" />
                </div>
                <div>
                  <label className="label">Contact *</label>
                  <input className="champ" value={form.contact} onChange={e => champ("contact", e.target.value)} placeholder="+225 XX XX XX XX" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="champ" type="email" value={form.email} onChange={e => champ("email", e.target.value)} placeholder="adresse@email.com" />
                </div>
                <div>
                  <label className="label">Pays de résidence</label>
                  <input className="champ" value={form.pays} onChange={e => champ("pays", e.target.value)} placeholder="Ex: Côte d'Ivoire, France..." />
                </div>
                <div>
                  <label className="label">Continent</label>
                  <select className="champ" value={form.continent} onChange={e => champ("continent", e.target.value as Continent)}>
                    {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Situation professionnelle</label>
                  <select className="champ" value={form.situation} onChange={e => champ("situation", e.target.value as Situation)}>
                    {SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Opérateur mobile money</label>
                  <select className="champ" value={form.operateur} onChange={e => champ("operateur", e.target.value as Operateur)}>
                    <option value="">— Sélectionner —</option>
                    {OPERATEURS.filter(o => o).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop:"1rem" }}>
                <label className="label">Notes</label>
                <textarea className="champ" rows={3} value={form.notes} onChange={e => champ("notes", e.target.value)} placeholder="Notes supplémentaires..." style={{ resize:"vertical" }} />
              </div>

              <div style={{ marginTop:"1rem", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"var(--vert-pale)", border:"1px solid var(--vert-clair)", borderRadius:10 }}>
                <input type="checkbox" id="paye" checked={form.paye} onChange={e => champ("paye", e.target.checked)} style={{ width:16, height:16, accentColor:"var(--vert)", cursor:"pointer" }} />
                <label htmlFor="paye" style={{ fontSize:13.5, fontWeight:600, color:"var(--vert)", cursor:"pointer" }}>
                  Cotisation de 1 000 FCFA payée
                </label>
              </div>
            </div>
            <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid var(--bordure)", display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button className="btn-neutre" onClick={() => setModalOuvert(false)}>Annuler</button>
              <button className="btn-principal" onClick={sauvegarder}>
                {editId ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail */}
      {modalDetail && (
        <div className="modal-fond">
          <div className="modal" style={{ maxWidth:450 }}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--vert-pale)", borderRadius:"20px 20px 0 0" }}>
              <h2 className="titre" style={{ fontSize:18, fontWeight:700, color:"var(--vert)" }}>Fiche adhérent</h2>
              <button onClick={() => setModalDetail(null)} style={{ border:"none", background:"transparent", color:"var(--texte-sec)", borderRadius:8, padding:"6px", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ padding:"1.5rem" }}>
              <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
                {modalDetail.photo
                  ? <img src={modalDetail.photo} style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:"3px solid var(--vert-clair)", margin:"0 auto" }} alt="" />
                  : <div style={{ width:80, height:80, borderRadius:"50%", background:"var(--vert-pale)", border:"2px solid var(--vert-clair)", color:"var(--vert)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:700, margin:"0 auto" }}>
                      {(modalDetail.nom[0]||"")+(modalDetail.prenoms[0]||"")}
                    </div>
                }
                <div style={{ marginTop:10 }}>
                  <div style={{ fontWeight:700, fontSize:18, color:"var(--texte)" }}>{modalDetail.nom} {modalDetail.prenoms}</div>
                  <div style={{ fontFamily:"monospace", fontSize:12, color:"var(--or)", fontWeight:700, marginTop:3 }}>{modalDetail.id}</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  ["Village", modalDetail.village],
                  ["Quartier", modalDetail.quartier || "—"],
                  ["Pays", modalDetail.pays || "—"],
                  ["Continent", modalDetail.continent],
                  ["Contact", modalDetail.contact],
                  ["Email", modalDetail.email || "—"],
                  ["Situation", modalDetail.situation],
                  ["Opérateur", modalDetail.operateur || "—"],
                  ["Date naissance", modalDetail.ddn || "—"],
                  ["Lieu naissance", modalDetail.lieu_naissance || "—"],
                  ["Date inscription", modalDetail.date_inscription],
                  ["Cotisation", modalDetail.paye ? "✓ Payée" : "En attente"],
                ].map(([k,v]) => (
                  <div key={k} style={{ padding:"8px 10px", background:"var(--fond)", borderRadius:8 }}>
                    <div style={{ fontSize:10.5, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:3 }}>{k}</div>
                    <div style={{ fontSize:13, fontWeight:500, color:"var(--texte)" }}>{v}</div>
                  </div>
                ))}
              </div>
              {modalDetail.notes && (
                <div style={{ marginTop:10, padding:"10px 12px", background:"var(--or-pale)", border:"1px solid var(--or-bordure)", borderRadius:10 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:"var(--or)", textTransform:"uppercase", marginBottom:4 }}>Notes</div>
                  <div style={{ fontSize:13, color:"var(--texte)" }}>{modalDetail.notes}</div>
                </div>
              )}
            </div>
            <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid var(--bordure)", display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button className="btn-neutre" onClick={() => setModalDetail(null)}>Fermer</button>
              <button className="btn-principal" onClick={() => { ouvrir(modalDetail); setModalDetail(null); }}><Edit3 size={14}/> Modifier</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" style={{ background: toast.type==="err" ? "var(--rouge-pale)" : "var(--blanc)", borderColor: toast.type==="err" ? "rgba(192,57,43,0.3)" : "var(--vert-clair)" }}>
          <span style={{ color: toast.type==="err" ? "var(--rouge)" : "var(--vert)" }}>{toast.type==="err" ? "!" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
