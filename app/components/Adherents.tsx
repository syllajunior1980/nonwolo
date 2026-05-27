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
  const [modalPaiement,   setModalPaiement]   = useState<{id:string; nom:string; operateur:string}|null>(null);

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

  const sauvegarder = async () => {
    if (!form.nom.trim() || !form.prenoms.trim() || !form.village || !form.contact.trim()) {
      afficherToast("Veuillez remplir les champs obligatoires (*)", "err"); return;
    }
    if (editId) {
      updateAdherent(editId, form);
      afficherToast("Adherent mis a jour !");
      setModalOuvert(false);
    } else {
      await addAdherent(form);
      setModalOuvert(false);
      // Apres enregistrement, proposer le paiement si pas encore paye
      if (!form.paye) {
        const { adherents: updatedList } = useStore.getState();
        const nouvel = updatedList[0]; // le plus recent
        setModalPaiement({
          id: nouvel?.id || "AJRN-????",
          nom: form.nom + " " + form.prenoms,
          operateur: form.operateur,
        });
      } else {
        afficherToast("Adherent enregistre avec succes !");
      }
    }
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
                  <tr key={a.id} onClick={() => setModalDetail(a)} style={{ cursor:"pointer" }}>
                    <td>
                      <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"var(--or)", background:"var(--or-pale)", padding:"3px 8px", borderRadius:6 }}>
                        {a.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {a.photo
                          ? <img src={a.photo} style={{ width:52,height:52,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--vert-clair)",flexShrink:0 }} alt="" />
                          : <div style={{ width:52,height:52,borderRadius:"50%",background:"var(--vert-pale)",border:"1.5px solid var(--vert-clair)",color:"var(--vert)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,flexShrink:0 }}>
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
                        <button onClick={e => { e.stopPropagation(); setModalDetail(a); }} title="Voir" style={{ border:"none", background:"var(--fond)", color:"var(--texte-sec)", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Eye size={14}/></button>
                        <button onClick={e => { e.stopPropagation(); ouvrir(a); }} title="Modifier" style={{ border:"none", background:"var(--vert-pale)", color:"var(--vert)", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Edit3 size={14}/></button>
                        <button onClick={e => { e.stopPropagation(); supprimer(a.id); }} title="Supprimer" style={{ border:"none", background:"var(--rouge-pale)", color:"var(--rouge)", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}><Trash2 size={14}/></button>
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
                  <input className="champ" value={form.pays} onChange={e => champ("pays", e.target.value)} placeholder="Ex: Cote d'Ivoire, France..." />
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

              {/* Cotisation - enregistrer d abord, payer apres */}
              <div style={{ marginTop:"1rem", border:"1.5px solid var(--vert-clair)", borderRadius:12, overflow:"hidden" }}>

                {/* Choix opérateur si pas encore sélectionné */}
                {!form.operateur && (
                  <div style={{ padding:"12px 14px", background:"var(--or-pale)", borderBottom:"1px solid var(--or-bordure)" }}>
                    <div style={{ fontSize:12.5, color:"var(--or)", fontWeight:600 }}>
                      ⚠️ Sélectionnez d'abord votre opérateur Mobile Money ci-dessus pour payer automatiquement
                    </div>
                  </div>
                )}

                {/* Checkbox cotisation */}
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"var(--vert-pale)" }}>
                  <input type="checkbox" id="paye" checked={form.paye} onChange={e => champ("paye", e.target.checked)} style={{ width:16, height:16, accentColor:"var(--vert)", cursor:"pointer" }} />
                  <label htmlFor="paye" style={{ fontSize:13.5, fontWeight:600, color:"var(--vert)", cursor:"pointer" }}>
                    Cotisation de 1 000 FCFA payée
                  </label>
                </div>

                {/* Bouton paiement automatique USSD */}
                {form.operateur && (() => {
                  const USSD: Record<string, { tel: string; label: string; couleur: string }> = {
                    "Orange Money": { tel:"tel:%23144*1*1*0789514185*1000%23", label:"#144*1*1*0789514185*1000#", couleur:"#e8650a" },
                    "Moov Money":   { tel:"tel:*155*1*1*NUMERO_MOOV*1000%23",  label:"*155*1*1*NUMERO_MOOV*1000#",  couleur:"#2563eb" },
                    "Wave":         { tel:"tel:*9113*1*0789514185*1000%23",    label:"*9113*1*0789514185*1000#",    couleur:"#0891b2" },
                  };
                  const op = USSD[form.operateur];
                  const info = form.operateur === "Orange Money" ? USSD["Orange Money"]
                             : form.operateur === "Wave"         ? USSD["Wave"]
                             : form.operateur === "Moov Money"   ? USSD["Moov Money"]
                             : { tel:"tel:*133*3*1*0544415662*1000%23", label:"*133*3*1*0544415662*1000#", couleur:"#d4900a" };

                  return (
                    <div style={{ padding:"14px 16px", background:"white", borderTop:"1px solid var(--vert-clair)" }}>
                      <div style={{ fontSize:12.5, color:"var(--texte-sec)", marginBottom:10, fontWeight:500 }}>
                        📱 Appuyez ci-dessous pour payer automatiquement via <strong style={{ color:info.couleur }}>{form.operateur}</strong> :
                      </div>
                      <div style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:info.couleur, background:"rgba(0,0,0,0.04)", padding:"8px 12px", borderRadius:8, marginBottom:12, border:"1px solid rgba(0,0,0,0.08)" }}>
                        {info.label}
                      </div>
                      <a
                        href={info.tel}
                        onClick={() => champ("paye", true)}
                        style={{
                          display:"inline-flex", alignItems:"center", gap:8,
                          background:info.couleur, color:"white",
                          padding:"11px 22px", borderRadius:10,
                          fontSize:14, fontWeight:700,
                          textDecoration:"none",
                          boxShadow:"0 3px 10px rgba(0,0,0,0.20)",
                          letterSpacing:"0.2px",
                        }}
                      >
                        📞 Payer 1 000 F via {form.operateur}
                      </a>
                      <div style={{ fontSize:11, color:"var(--texte-ter)", marginTop:8, lineHeight:1.5 }}>
                        ✅ Fonctionne sur smartphone Android et iPhone<br/>
                        Le composeur s'ouvre automatiquement avec le code pré-rempli.<br/>
                        Appuyez simplement sur <strong>Appel</strong> puis entrez votre <strong>PIN</strong>.
                      </div>
                    </div>
                  );
                })()}
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

      {/* Page Profil Adherent — style app native */}
      {modalDetail && (
        <div style={{ position:"fixed", inset:0, background:"var(--fond)", zIndex:200, overflowY:"auto", animation:"slideUp 0.2s ease" }}>
          {/* Header vert avec photo */}
          <div style={{ background:"var(--vert)", paddingBottom:"2rem", position:"relative" }}>
            {/* Barre navigation */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1rem 1.25rem" }}>
              <button onClick={() => setModalDetail(null)} style={{ border:"none", background:"rgba(255,255,255,0.15)", color:"white", borderRadius:10, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontWeight:600, fontSize:13 }}>
                ← Retour
              </button>
              <div style={{ color:"white", fontWeight:700, fontSize:16, letterSpacing:"0.5px" }}>PROFIL</div>
              <button onClick={() => { ouvrir(modalDetail); setModalDetail(null); }} style={{ border:"none", background:"rgba(255,255,255,0.15)", color:"white", borderRadius:10, padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontWeight:600, fontSize:13 }}>
                <Edit3 size={14}/> Modifier
              </button>
            </div>

            {/* Photo + Nom */}
            <div style={{ textAlign:"center", paddingTop:"0.5rem" }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                {modalDetail.photo
                  ? <img src={modalDetail.photo} style={{ width:100, height:100, borderRadius:"50%", objectFit:"cover", border:"3px solid white", boxShadow:"0 4px 15px rgba(0,0,0,0.25)" }} alt="" />
                  : <div style={{ width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"3px solid white", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:700, margin:"0 auto" }}>
                      {(modalDetail.nom[0]||"")+(modalDetail.prenoms[0]||"")}
                    </div>
                }
              </div>
              <div style={{ marginTop:12 }}>
                <div style={{ fontWeight:800, fontSize:20, color:"white", letterSpacing:"0.5px" }}>
                  {modalDetail.nom.toUpperCase()} {modalDetail.prenoms.toUpperCase()}
                </div>
                <div style={{ fontFamily:"monospace", fontSize:13, color:"rgba(255,255,255,0.80)", marginTop:4, fontWeight:600 }}>
                  {modalDetail.id}
                </div>
                {modalDetail.email && (
                  <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.70)", marginTop:3 }}>
                    ✉ {modalDetail.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div style={{ padding:"1.25rem" }}>

            {/* Badge cotisation */}
            <div style={{ display:"flex", justifyContent:"center", marginTop:"-1rem", marginBottom:"1.25rem" }}>
              <span style={{ background: modalDetail.paye ? "var(--vert)" : "var(--alerte)", color:"white", padding:"6px 20px", borderRadius:99, fontSize:13, fontWeight:700, boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
                {modalDetail.paye ? "✓ Cotisation payée" : "⏳ Cotisation en attente"}
              </span>
            </div>

            {/* Infos personnelles */}
            <div style={{ background:"var(--vert)", borderRadius:12, padding:"10px 14px", marginBottom:"1rem", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"white", fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                👤 Informations personnelles
              </span>
            </div>

            {[
              { icon:"👤", label:"NOM",              val: modalDetail.nom },
              { icon:"👤", label:"PRÉNOMS",           val: modalDetail.prenoms },
              { icon:"📞", label:"N° DE TÉLÉPHONE",   val: modalDetail.contact, tel: true },
              { icon:"✉",  label:"MAIL",              val: modalDetail.email || "—" },
              { icon:"🎂", label:"DATE DE NAISSANCE", val: modalDetail.ddn || "—" },
              { icon:"📍", label:"LIEU DE NAISSANCE", val: modalDetail.lieu_naissance || "—" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:"white", borderRadius:12, padding:"13px 16px", marginBottom:8, boxShadow:"0 1px 4px rgba(22,79,51,0.06)" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"var(--vert-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {item.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10.5, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--texte)" }}>{item.val}</div>
                </div>
                {item.tel && item.val !== "—" && (
                  <a href={"tel:"+item.val.replace(/\s/g,"")} style={{ width:42, height:42, borderRadius:10, background:"var(--vert)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, textDecoration:"none" }}>
                    <span style={{ fontSize:18 }}>📞</span>
                  </a>
                )}
              </div>
            ))}

            {/* Localisation */}
            <div style={{ background:"var(--vert)", borderRadius:12, padding:"10px 14px", marginBottom:"1rem", marginTop:"1rem", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"white", fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                🌍 Localisation
              </span>
            </div>

            {[
              { icon:"🏘", label:"VILLAGE",         val: modalDetail.village },
              { icon:"🏠", label:"QUARTIER",        val: modalDetail.quartier || "—" },
              { icon:"🌍", label:"PAYS DE RÉSIDENCE", val: modalDetail.pays || "—" },
              { icon:"🌐", label:"CONTINENT",       val: modalDetail.continent },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:"white", borderRadius:12, padding:"13px 16px", marginBottom:8, boxShadow:"0 1px 4px rgba(22,79,51,0.06)" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"var(--vert-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize:10.5, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--texte)" }}>{item.val}</div>
                </div>
              </div>
            ))}

            {/* Adhesion */}
            <div style={{ background:"var(--vert)", borderRadius:12, padding:"10px 14px", marginBottom:"1rem", marginTop:"1rem" }}>
              <span style={{ color:"white", fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                📋 Adhésion
              </span>
            </div>

            {[
              { icon:"💼", label:"SITUATION PROFESSIONNELLE", val: modalDetail.situation },
              { icon:"📱", label:"OPÉRATEUR MOBILE MONEY",   val: modalDetail.operateur || "—" },
              { icon:"📅", label:"DATE D'INSCRIPTION",       val: modalDetail.date_inscription },
              { icon:"💳", label:"DATE DE PAIEMENT",         val: modalDetail.date_paiement || "—" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, background:"white", borderRadius:12, padding:"13px 16px", marginBottom:8, boxShadow:"0 1px 4px rgba(22,79,51,0.06)" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"var(--vert-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize:10.5, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--texte)" }}>{item.val}</div>
                </div>
              </div>
            ))}

            {modalDetail.notes && (
              <div style={{ background:"var(--or-pale)", border:"1.5px solid var(--or-bordure)", borderRadius:12, padding:"14px 16px", marginTop:8 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--or)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>📝 Notes</div>
                <div style={{ fontSize:13.5, color:"var(--texte)", lineHeight:1.6 }}>{modalDetail.notes}</div>
              </div>
            )}

            {/* Bouton supprimer */}
            <button
              onClick={() => { supprimer(modalDetail.id); setModalDetail(null); }}
              className="btn-danger"
              style={{ width:"100%", justifyContent:"center", marginTop:"1.5rem", marginBottom:"1rem" }}
            >
              <Trash2 size={15}/> Supprimer cet adhérent
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" style={{ background: toast.type==="err" ? "var(--rouge-pale)" : "var(--blanc)", borderColor: toast.type==="err" ? "rgba(192,57,43,0.3)" : "var(--vert-clair)" }}>
          <span style={{ color: toast.type==="err" ? "var(--rouge)" : "var(--vert)" }}>{toast.type==="err" ? "!" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      {/* Modal paiement apres enregistrement */}
      {modalPaiement && (
        <div className="modal-fond">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              {/* Succes */}
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--vert-pale)", border: "2px solid var(--vert-clair)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: 28 }}>
                ✅
              </div>
              <h2 className="titre" style={{ fontSize: 20, fontWeight: 700, color: "var(--vert)", marginBottom: 6 }}>
                Enregistrement reussi !
              </h2>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "var(--or)", marginBottom: 4 }}>
                {modalPaiement.id}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--texte-sec)", marginBottom: "1.5rem" }}>
                {modalPaiement.nom} est bien enregistre(e).
              </div>

              {/* Proposition paiement */}
              <div style={{ background: "var(--or-pale)", border: "1.5px solid var(--or-bordure)", borderRadius: 14, padding: "1.25rem", marginBottom: "1.25rem", textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--or)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  💳 Voulez-vous payer la cotisation de 1 000 FCFA maintenant ?
                </div>

                {modalPaiement.operateur && (() => {
                  const USSD: Record<string, { tel: string; label: string; couleur: string; numero: string }> = {
                    "Orange Money": { tel: "tel:%23144*1*1*0789514185*1000%23", label: "#144*1*1*0789514185*1000#", couleur: "#e8650a", numero: "0789514185" },
                    "MTN Money":    { tel: "tel:*133*3*1*0544415662*1000%23",   label: "*133*3*1*0544415662*1000#",  couleur: "#d4900a", numero: "0544415662" },
                    "Moov Money":   { tel: "tel:*155*1*1*NUMERO_MOOV*1000%23", label: "*155*1*1*NUMERO_MOOV*1000#", couleur: "#2563eb", numero: "a venir" },
                    "Wave":         { tel: "tel:*9113*1*0789514185*1000%23",   label: "*9113*1*0789514185*1000#",   couleur: "#0891b2", numero: "0789514185" },
                  };
                  const info = USSD[modalPaiement.operateur];
                  if (!info) return null;
                  return (
                    <div>
                      <div style={{ fontSize: 12, color: "var(--texte-sec)", marginBottom: 8 }}>
                        Via <strong style={{ color: info.couleur }}>{modalPaiement.operateur}</strong> — N° {info.numero}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: info.couleur, background: "rgba(0,0,0,0.04)", padding: "8px 12px", borderRadius: 8, marginBottom: 10, wordBreak: "break-all" }}>
                        {info.label}
                      </div>
                      <a
                        href={info.tel}
                        onClick={() => {
                          // Marquer comme paye apres le clic
                          const { adherents: list, updateAdherent: upd } = useStore.getState();
                          const found = list.find(a => a.id === modalPaiement.id);
                          if (found) upd(found.id, { paye: true, date_paiement: new Date().toISOString().split("T")[0] });
                          setTimeout(() => {
                            setModalPaiement(null);
                            afficherToast("Paiement lance ! Cotisation confirmee.");
                          }, 1500);
                        }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: info.couleur, color: "white", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 3px 10px rgba(0,0,0,0.20)", marginBottom: 8 }}
                      >
                        📞 Payer 1 000 F via {modalPaiement.operateur}
                      </a>
                      <div style={{ fontSize: 11, color: "var(--texte-ter)", textAlign: "center" }}>
                        Le composeur s&apos;ouvre automatiquement · Appuyez sur Appel puis entrez votre PIN
                      </div>
                    </div>
                  );
                })()}

                {!modalPaiement.operateur && (
                  <div style={{ fontSize: 13, color: "var(--texte-ter)" }}>
                    Aucun operateur mobile money selectionne. Vous pouvez payer plus tard depuis la section Cotisations.
                  </div>
                )}
              </div>

              {/* Boutons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="btn-neutre"
                  style={{ flex: 1 }}
                  onClick={() => { setModalPaiement(null); afficherToast("Adherent enregistre. Paiement a faire plus tard."); }}
                >
                  Payer plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
