"use client";
import { useState } from "react";
import { useStore, Adherent, Situation, Operateur, Continent } from "@/lib/store";
import { Plus, Search, Trash2, Edit3, Eye, X, Camera, ChevronDown } from "lucide-react";

const SITUATIONS: Situation[] = ["Fonctionnaire","Chômeur","Ouvrier","Élève","Étudiant","Autre"];
const OPERATEURS: Operateur[] = ["Orange Money","Moov Money","Wave",""];
const CONTINENTS: Continent[] = ["Afrique","Europe","Amérique du Nord","Amérique du Sud","Asie","Océanie"];

const SYNTAXES: Record<string, { code: string; tip: string; couleur: string }> = {
  "Orange Money": { code: "#144*1*1*0707070707*1000#", tip: "Composer → Valider → Entrer PIN Orange", couleur: "#ff6b00" },
  "Moov Money": { code: "#133*1*0707070707*1000#", tip: "Composer → Valider → Entrer PIN Moov", couleur: "#0066cc" },
  "Wave": { code: "Ouvrir Wave → Envoyer → 0707070707 → 1000 FCFA", tip: 'Motif : "Cotisation AJRN + Votre nom"', couleur: "#1e90ff" },
};

const BADGE_SITUATION: Record<string, { bg: string; color: string }> = {
  "Fonctionnaire": { bg: "#e8f5ee", color: "#1a7a4a" },
  "Chômeur": { bg: "#fef2f2", color: "#dc2626" },
  "Ouvrier": { bg: "#f0e7ff", color: "#7c3aed" },
  "Élève": { bg: "#fdf3e0", color: "#c8951a" },
  "Étudiant": { bg: "#e0f2fe", color: "#0891b2" },
  "Autre": { bg: "#f3f4f6", color: "#6b7280" },
};

const VIDE: Omit<Adherent,"id"|"dateInscription"> = {
  nom:"",prenoms:"",ddn:"",lieuNaissance:"",village:"",quartier:"",
  contact:"",email:"",pays:"",continent:"Afrique",
  situation:"Étudiant",operateur:"",photo:"",
  paye:false,datePaiement:"",notes:""
};

export default function Adherents() {
  const { adherents, villages, addAdherent, updateAdherent, deleteAdherent } = useStore();
  const [recherche, setRecherche] = useState("");
  const [filtrePaye, setFiltrePaye] = useState<"tous"|"payé"|"impayé">("tous");
  const [filtreContinent, setFiltreContinent] = useState("tous");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modalDetail, setModalDetail] = useState<Adherent | null>(null);
  const [form, setForm] = useState(VIDE);
  const [editId, setEditId] = useState<string|null>(null);
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);

  const afficherToast = (msg: string, type: "ok"|"err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtres = adherents.filter(a => {
    const q = recherche.toLowerCase();
    const ok = (a.nom+" "+a.prenoms).toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.village.toLowerCase().includes(q) || a.pays.toLowerCase().includes(q);
    const paye = filtrePaye === "tous" ? true : filtrePaye === "payé" ? a.paye : !a.paye;
    const cont = filtreContinent === "tous" ? true : a.continent === filtreContinent;
    return ok && paye && cont;
  });

  const ouvrir = (a?: Adherent) => {
    if (a) { setForm({ ...a }); setEditId(a.id); }
    else { setForm(VIDE); setEditId(null); }
    setModalOuvert(true);
  };

  const sauvegarder = () => {
    if (!form.nom.trim() || !form.prenoms.trim() || !form.village || !form.contact.trim()) {
      afficherToast("Veuillez remplir les champs obligatoires (*)", "err");
      return;
    }
    if (editId) { updateAdherent(editId, form); afficherToast("Adhérent mis à jour !"); }
    else { addAdherent(form); afficherToast("Adhérent enregistré avec succès !"); }
    setModalOuvert(false);
  };

  const supprimer = (id: string) => {
    if (confirm("Supprimer cet adhérent ?")) {
      deleteAdherent(id);
      afficherToast("Adhérent supprimé");
    }
  };

  const lirePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setForm(x => ({ ...x, photo: ev.target?.result as string }));
    r.readAsDataURL(f);
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 className="syne" style={{ fontSize:26, fontWeight:800, color:"var(--vert-fonce)", marginBottom:4 }}>Adhérents</h1>
          <p style={{ color:"var(--texte-sec)", fontSize:14 }}>{adherents.length} membres inscrits dans le monde</p>
        </div>
        <button className="btn-principal" onClick={() => ouvrir()}>
          <Plus size={16} /> Ajouter un adhérent
        </button>
      </div>

      {/* Filtres */}
      <div className="carte" style={{ marginBottom:"1.25rem", display:"flex", gap:"10px", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--texte-sec)" }} />
          <input className="champ" style={{ paddingLeft:32 }} placeholder="Rechercher par nom, ID, village, pays..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        </div>
        <select className="champ" style={{ width:"auto" }} value={filtrePaye} onChange={e => setFiltrePaye(e.target.value as "tous"|"payé"|"impayé")}>
          <option value="tous">Toutes les cotisations</option>
          <option value="payé">Cotisation payée</option>
          <option value="impayé">Cotisation impayée</option>
        </select>
        <select className="champ" style={{ width:"auto" }} value={filtreContinent} onChange={e => setFiltreContinent(e.target.value)}>
          <option value="tous">Tous les continents</option>
          {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ fontSize:12.5, color:"var(--texte-sec)", fontWeight:600 }}>{filtres.length} résultat{filtres.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Tableau */}
      <div className="carte" style={{ padding:0, overflow:"hidden" }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>N° Adhésion</th>
                <th>Adhérent</th>
                <th>Localisation</th>
                <th>Village</th>
                <th>Contact</th>
                <th>Situation</th>
                <th>Cotisation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:"center", color:"var(--texte-sec)", padding:"2.5rem" }}>Aucun adhérent trouvé</td></tr>
              ) : filtres.map(a => {
                const bs = BADGE_SITUATION[a.situation] || BADGE_SITUATION["Autre"];
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight:700, color:"var(--vert)", fontFamily:"monospace", fontSize:12.5 }}>{a.id}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        {a.photo
                          ? <img src={a.photo} style={{ width:34,height:34,borderRadius:"50%",objectFit:"cover" }} alt="" />
                          : <div style={{ width:34,height:34,borderRadius:"50%",background:"var(--vert)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700 }}>{(a.nom[0]+a.prenoms[0]).toUpperCase()}</div>
                        }
                        <div>
                          <div style={{ fontWeight:600, fontSize:13.5 }}>{a.nom} {a.prenoms}</div>
                          <div style={{ fontSize:11.5, color:"var(--texte-sec)" }}>Inscrit le {a.dateInscription}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize:13 }}>{a.pays}</div>
                      <div style={{ fontSize:11, color:"var(--texte-sec)" }}>{a.continent}</div>
                    </td>
                    <td style={{ fontSize:13 }}>{a.village}</td>
                    <td style={{ fontSize:12.5, fontFamily:"monospace" }}>{a.contact}</td>
                    <td><span className="badge" style={{ background:bs.bg, color:bs.color }}>{a.situation}</span></td>
                    <td>
                      <span className="badge" style={{ background:a.paye?"#dcfce7":"#fef2f2", color:a.paye?"#16a34a":"#dc2626" }}>
                        {a.paye ? "✓ Payé" : "En attente"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:5 }}>
                        <button onClick={() => setModalDetail(a)} style={{ border:"none", background:"var(--vert-clair)", color:"var(--vert)", borderRadius:7, padding:"5px 8px" }} title="Voir"><Eye size={13} /></button>
                        <button onClick={() => ouvrir(a)} style={{ border:"none", background:"#e0f2fe", color:"#0891b2", borderRadius:7, padding:"5px 8px" }} title="Modifier"><Edit3 size={13} /></button>
                        <button onClick={() => supprimer(a.id)} style={{ border:"none", background:"var(--danger-clair)", color:"var(--danger)", borderRadius:7, padding:"5px 8px" }} title="Supprimer"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ajout/édition */}
      {modalOuvert && (
        <div className="modal-fond">
          <div className="modal">
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"white", zIndex:1 }}>
              <h2 className="syne" style={{ fontSize:17, fontWeight:700 }}>{editId ? "Modifier l'adhérent" : "Nouvelle adhésion"}</h2>
              <button onClick={() => setModalOuvert(false)} style={{ border:"none", background:"none", color:"var(--texte-sec)", padding:4 }}><X size={20} /></button>
            </div>
            <div style={{ padding:"1.5rem" }}>
              {!editId && (
                <div style={{ marginBottom:"1rem", padding:"10px 14px", background:"var(--vert-clair)", borderRadius:10, fontSize:13, color:"var(--vert)", fontWeight:600 }}>
                  N° d'adhésion : sera attribué automatiquement
                </div>
              )}

              {/* Photo */}
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:"1.25rem" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", border:"2px dashed var(--bordure)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0 }}
                  onClick={() => document.getElementById("inputPhoto")?.click()}>
                  {form.photo ? <img src={form.photo} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" /> : <><Camera size={20} color="var(--texte-sec)" /><span style={{ fontSize:10, color:"var(--texte-sec)", marginTop:3 }}>Photo</span></>}
                </div>
                <input type="file" id="inputPhoto" accept="image/*" style={{ display:"none" }} onChange={lirePhoto} />
                <div style={{ fontSize:12.5, color:"var(--texte-sec)" }}>Cliquer sur le cercle pour ajouter une photo<br />(optionnel)</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                {[["nom","Nom *","text"],["prenoms","Prénoms *","text"],["ddn","Date de naissance","date"],["lieuNaissance","Lieu de naissance","text"],["quartier","Quartier","text"],["contact","Contact * (ex: +33 06 12...)","tel"],["email","Email","email"],["pays","Pays de résidence","text"],["notes","Notes","text"]].map(([k,l,t]) => (
                  <div key={k} style={{ gridColumn: k === "notes" ? "1/-1" : undefined }}>
                    <label className="label">{l}</label>
                    <input className="champ" type={t} value={(form as unknown as Record<string,string>)[k] || ""} onChange={e => setForm(x => ({ ...x, [k]: e.target.value }))} />
                  </div>
                ))}

                <div>
                  <label className="label">Village *</label>
                  <select className="champ" value={form.village} onChange={e => setForm(x => ({ ...x, village: e.target.value }))}>
                    <option value="">Choisir un village...</option>
                    {villages.map(v => <option key={v.id} value={v.nom}>{v.nom}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Continent</label>
                  <select className="champ" value={form.continent} onChange={e => setForm(x => ({ ...x, continent: e.target.value as Continent }))}>
                    {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Situation professionnelle</label>
                  <select className="champ" value={form.situation} onChange={e => setForm(x => ({ ...x, situation: e.target.value as Situation }))}>
                    {SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label">Opérateur de paiement</label>
                  <select className="champ" value={form.operateur} onChange={e => setForm(x => ({ ...x, operateur: e.target.value as Operateur }))}>
                    <option value="">Choisir...</option>
                    {["Orange Money","Moov Money","Wave"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div style={{ gridColumn:"1/-1" }}>
                  <label className="label">Statut cotisation</label>
                  <div style={{ display:"flex", gap:"1rem" }}>
                    {[true,false].map(v => (
                      <label key={String(v)} style={{ display:"flex", alignItems:"center", gap:7, cursor:"pointer", fontSize:13.5, fontWeight:500 }}>
                        <input type="radio" checked={form.paye===v} onChange={() => setForm(x => ({ ...x, paye:v }))} />
                        {v ? "✓ Cotisation payée" : "⏳ En attente de paiement"}
                      </label>
                    ))}
                  </div>
                </div>

                {form.operateur && SYNTAXES[form.operateur] && (
                  <div style={{ gridColumn:"1/-1", background:"#f8fafc", border:"1px solid var(--bordure)", borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:11.5, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:8 }}>Syntaxe de paiement — {form.operateur}</div>
                    <div style={{ fontFamily:"monospace", fontSize:14, fontWeight:700, color:SYNTAXES[form.operateur].couleur, marginBottom:4 }}>{SYNTAXES[form.operateur].code}</div>
                    <div style={{ fontSize:12, color:"var(--texte-sec)" }}>{SYNTAXES[form.operateur].tip}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:"var(--vert)", marginTop:6 }}>Numéro de dépôt AJRN : 0707070707 · Montant : 1 000 FCFA</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid var(--bordure)", display:"flex", justifyContent:"flex-end", gap:"10px" }}>
              <button className="btn-neutre" onClick={() => setModalOuvert(false)}>Annuler</button>
              <button className="btn-principal" onClick={sauvegarder}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {modalDetail && (
        <div className="modal-fond" onClick={() => setModalDetail(null)}>
          <div className="modal" style={{ maxWidth:460 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 className="syne" style={{ fontSize:17, fontWeight:700 }}>Fiche adhérent</h2>
              <button onClick={() => setModalDetail(null)} style={{ border:"none", background:"none", color:"var(--texte-sec)" }}><X size={20} /></button>
            </div>
            <div style={{ padding:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:"1.25rem" }}>
                {modalDetail.photo
                  ? <img src={modalDetail.photo} style={{ width:64,height:64,borderRadius:"50%",objectFit:"cover" }} alt="" />
                  : <div style={{ width:64,height:64,borderRadius:"50%",background:"var(--vert)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700 }}>{(modalDetail.nom[0]+modalDetail.prenoms[0]).toUpperCase()}</div>
                }
                <div>
                  <div style={{ fontWeight:700, fontSize:18 }}>{modalDetail.nom} {modalDetail.prenoms}</div>
                  <div style={{ fontFamily:"monospace", fontSize:12.5, color:"var(--vert)", fontWeight:700, marginTop:2 }}>{modalDetail.id}</div>
                  <span className="badge" style={{ background:modalDetail.paye?"#dcfce7":"#fef2f2", color:modalDetail.paye?"#16a34a":"#dc2626", marginTop:5 }}>
                    {modalDetail.paye ? "✓ Cotisation payée" : "⏳ En attente"}
                  </span>
                </div>
              </div>
              {[
                ["Né(e) le", modalDetail.ddn || "—"],
                ["Lieu de naissance", modalDetail.lieuNaissance || "—"],
                ["Village d'origine", modalDetail.village],
                ["Quartier", modalDetail.quartier || "—"],
                ["Pays", modalDetail.pays || "—"],
                ["Continent", modalDetail.continent],
                ["Contact", modalDetail.contact],
                ["Email", modalDetail.email || "—"],
                ["Situation", modalDetail.situation],
                ["Opérateur", modalDetail.operateur || "—"],
                ["Date d'inscription", modalDetail.dateInscription],
              ].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--bordure)", fontSize:13.5 }}>
                  <span style={{ color:"var(--texte-sec)", fontWeight:500 }}>{k}</span>
                  <span style={{ fontWeight:600, textAlign:"right" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" style={{ background:toast.type==="ok"?"var(--vert)":"var(--danger)", color:"white" }}>
          {toast.type==="ok" ? "✓" : "✗"} {toast.msg}
        </div>
      )}
    </div>
  );
}
