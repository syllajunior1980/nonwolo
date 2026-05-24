"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Send, Plus, Trash2, X, Users, User, Eye } from "lucide-react";

type TypeMsg  = "groupe" | "individuel";
type Categorie = "rappel-cotisation" | "information" | "evenement" | "urgence" | "autre";

const CATEGORIES: { val: Categorie; label: string; icone: string; couleur: string; fond: string }[] = [
  { val: "rappel-cotisation", label: "Rappel cotisation",  icone: "💰", couleur: "var(--alerte)", fond: "var(--alerte-pale)" },
  { val: "information",       label: "Information",        icone: "ℹ️", couleur: "#38bdf8",       fond: "rgba(56,189,248,0.1)" },
  { val: "evenement",         label: "Événement",          icone: "📅", couleur: "#a78bfa",       fond: "rgba(167,139,250,0.1)" },
  { val: "urgence",           label: "Urgence",            icone: "🚨", couleur: "#f87171",       fond: "rgba(248,113,113,0.1)" },
  { val: "autre",             label: "Autre",              icone: "✉️", couleur: "var(--texte-sec)", fond: "rgba(255,255,255,0.04)" },
];

const MODELES = [
  {
    label: "Rappel cotisation",
    objet: "⏰ Rappel — Cotisation Mouvement JN1000 en attente",
    contenu: `Cher(e) membre,

Nous vous rappelons que votre cotisation annuelle de 1 000 FCFA pour l'année 2025 n'a pas encore été enregistrée.

Merci d'effectuer votre paiement sur le numéro unique du Mouvement :

📱 0707070707

Syntaxes de paiement :
• Orange Money : #144*1*1*0707070707*1000#
• Moov Money : #133*1*0707070707*1000#
• Wave : Ouvrir l'app → Envoyer → 0707070707 → 1 000 FCFA

Votre soutien est vital pour nos actions communautaires.

Cordialement,
Le Bureau du Mouvement 1000 Jeunes pour le Nonwolo`,
  },
  {
    label: "Convocation assemblée",
    objet: "📢 Convocation — Assemblée Générale du Mouvement",
    contenu: `Chers membres,

Le Bureau du Mouvement 1000 Jeunes pour le Nonwolo a l'honneur de vous convoquer à l'Assemblée Générale Ordinaire.

📅 Date : À préciser
🕐 Heure : À préciser
📍 Lieu : À préciser

Ordre du jour :
1. Rapport moral du Président
2. Rapport financier du Trésorier
3. Bilan des activités de l'année
4. Questions diverses

Votre présence est indispensable.

Le Bureau du Mouvement JN1000`,
  },
  {
    label: "Bienvenue au nouveau membre",
    objet: "🎉 Bienvenue dans le Mouvement 1000 Jeunes pour le Nonwolo !",
    contenu: `Cher(e) nouveau membre,

Au nom de l'ensemble du Bureau et de tous les membres du Mouvement 1000 Jeunes pour le Nonwolo, nous vous souhaitons la bienvenue !

Votre adhésion est un geste fort de solidarité envers notre communauté.
Ensemble, 26 villages — une seule vision.

✅ Développement du Nonwolo
✅ Solidarité entre ressortissants partout dans le monde
✅ Préservation de notre culture

Pensez à régler votre cotisation de 1 000 FCFA sur le 0707070707.

Avec toute notre fraternité,
Le Bureau du Mouvement JN1000`,
  },
];

export default function Messagerie() {
  const { adherents, messages, addMessage, deleteMessage, markLu } = useStore();
  const [type,         setType]         = useState<TypeMsg>("groupe");
  const [categorie,    setCategorie]    = useState<Categorie>("information");
  const [destinataires,setDestinataires]= useState<string[]>([]);
  const [objet,        setObjet]        = useState("");
  const [contenu,      setContenu]      = useState("");
  const [expediteur,   setExpediteur]   = useState("Le Bureau du Mouvement JN1000");
  const [onglet,       setOnglet]       = useState<"rediger"|"boite">("rediger");
  const [toast,        setToast]        = useState<string|null>(null);
  const [detailMsg,    setDetailMsg]    = useState<string|null>(null);

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };
  const nonPayes = adherents.filter(a => !a.paye);
  const appliquerModele = (m: typeof MODELES[0]) => { setObjet(m.objet); setContenu(m.contenu); };

  const envoyer = () => {
    if (!objet.trim() || !contenu.trim()) { afficherToast("Veuillez remplir l'objet et le contenu"); return; }
    const dest = type === "groupe"
      ? (destinataires.length === 0 ? adherents.map(a => a.id) : destinataires)
      : destinataires;
    if (dest.length === 0) { afficherToast("Veuillez sélectionner au moins un destinataire"); return; }
    addMessage({ type, destinataires: dest, objet, contenu, expediteur });
    afficherToast(`Message envoyé à ${dest.length} destinataire(s) ✓`);
    setObjet(""); setContenu(""); setDestinataires([]);
    setOnglet("boite");
  };

  const toggleDest = (id: string) => {
    setDestinataires(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  };

  const msgDetail = detailMsg ? messages.find(m => m.id === detailMsg) : null;
  const cat = CATEGORIES.find(c => c.val === categorie) || CATEGORIES[0];

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom:"1.75rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <div style={{ width:4, height:32, background:"var(--or)", borderRadius:99 }} />
          <h1 className="titre" style={{ fontSize:32, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>Messagerie</h1>
        </div>
        <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
          Envoi de messages groupés et individuels à vos membres
        </p>
      </div>

      {/* Onglets */}
      <div style={{ display:"flex", gap:6, marginBottom:"1.5rem" }}>
        {([["rediger","✏️  Rédiger"],["boite",`📬  Boîte d'envoi (${messages.length})`]] as const).map(([val,lbl]) => (
          <button key={val} onClick={() => setOnglet(val)}
            style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${onglet===val ? "var(--or)" : "var(--bordure)"}`,
              fontSize:13, fontWeight:600, cursor:"pointer",
              background: onglet===val ? "var(--or-pale)" : "transparent",
              color:      onglet===val ? "var(--or)" : "var(--texte-sec)",
              transition:"all 0.15s" }}>
            {lbl}
          </button>
        ))}
      </div>

      {onglet === "rediger" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
          {/* Colonne gauche — formulaire */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <div className="carte">
              <h2 style={{ fontWeight:600, fontSize:14, color:"var(--texte)", marginBottom:"1rem" }}>Composition du message</h2>

              {/* Type d'envoi */}
              <div style={{ marginBottom:"1rem" }}>
                <label className="label">Type d'envoi</label>
                <div style={{ display:"flex", gap:8 }}>
                  {([["groupe","👥  Groupé"],["individuel","👤  Individuel"]] as const).map(([v,l]) => (
                    <button key={v} onClick={() => { setType(v); setDestinataires([]); }}
                      style={{ flex:1, padding:"9px 12px", borderRadius:9,
                        border:`1.5px solid ${type===v ? "var(--or)" : "var(--bordure)"}`,
                        background: type===v ? "var(--or-pale)" : "transparent",
                        color:      type===v ? "var(--or)" : "var(--texte-sec)",
                        fontWeight:600, fontSize:13, cursor:"pointer", transition:"all 0.15s" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catégorie */}
              <div style={{ marginBottom:"1rem" }}>
                <label className="label">Catégorie</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.val} onClick={() => setCategorie(c.val)}
                      style={{ padding:"5px 12px", borderRadius:8,
                        border:`1.5px solid ${categorie===c.val ? c.couleur : "var(--bordure)"}`,
                        background: categorie===c.val ? c.fond : "transparent",
                        color:      categorie===c.val ? c.couleur : "var(--texte-ter)",
                        fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
                      {c.icone} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expéditeur */}
              <div style={{ marginBottom:"1rem" }}>
                <label className="label">Expéditeur</label>
                <input className="champ" value={expediteur} onChange={e => setExpediteur(e.target.value)} placeholder="Nom de l'expéditeur..." />
              </div>

              {/* Objet */}
              <div style={{ marginBottom:"1rem" }}>
                <label className="label">Objet *</label>
                <input className="champ" value={objet} onChange={e => setObjet(e.target.value)} placeholder="Sujet du message..." />
              </div>

              {/* Contenu */}
              <div style={{ marginBottom:"1.25rem" }}>
                <label className="label">Contenu *</label>
                <textarea className="champ" value={contenu} onChange={e => setContenu(e.target.value)}
                  placeholder="Rédigez votre message ici..."
                  style={{ resize:"vertical", minHeight:160, lineHeight:1.65 }} />
                <div style={{ fontSize:11, color:"var(--texte-ter)", marginTop:4, textAlign:"right" }}>
                  {contenu.length} caractère{contenu.length !== 1 ? "s" : ""}
                </div>
              </div>

              <button className="btn-principal" onClick={envoyer} style={{ width:"100%", justifyContent:"center" }}>
                <Send size={15} /> Envoyer le message
              </button>
            </div>

            {/* Modèles */}
            <div className="carte">
              <h3 style={{ fontWeight:600, fontSize:13.5, color:"var(--texte)", marginBottom:"0.75rem" }}>
                📋 Modèles de messages
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {MODELES.map((m, i) => (
                  <button key={i} onClick={() => appliquerModele(m)}
                    style={{ textAlign:"left", padding:"10px 14px", borderRadius:10,
                      border:"1px solid var(--bordure)", background:"rgba(255,255,255,0.02)",
                      fontSize:13, fontWeight:500, color:"var(--texte-sec)", cursor:"pointer",
                      transition:"all 0.15s", display:"flex", alignItems:"center", gap:8 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="var(--or-bordure)"; (e.currentTarget as HTMLButtonElement).style.color="var(--or)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor="var(--bordure)"; (e.currentTarget as HTMLButtonElement).style.color="var(--texte-sec)"; }}>
                    <Plus size={13} /> {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite — destinataires */}
          <div className="carte">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
              <h3 style={{ fontWeight:600, fontSize:14, color:"var(--texte)" }}>
                {type === "groupe" ? "👥  Groupes rapides" : "👤  Choisir les destinataires"}
              </h3>
              {destinataires.length > 0 && (
                <button onClick={() => setDestinataires([])}
                  style={{ fontSize:11.5, color:"var(--texte-ter)", border:"none", background:"none", cursor:"pointer", transition:"color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--texte-ter)")}>
                  Réinitialiser
                </button>
              )}
            </div>

            {type === "groupe" && (
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:"1rem" }}>
                {[
                  { lbl: "Tous les membres",             ids: adherents.map(a=>a.id),                                 icone:"👥" },
                  { lbl: `Cotisations en retard (${nonPayes.length})`, ids: nonPayes.map(a=>a.id),                    icone:"⏰" },
                  { lbl: "Membres en Afrique",           ids: adherents.filter(a=>a.continent==="Afrique").map(a=>a.id), icone:"🌍" },
                  { lbl: "Membres en Europe",            ids: adherents.filter(a=>a.continent==="Europe").map(a=>a.id), icone:"🇪🇺" },
                  { lbl: "Membres en Amérique",          ids: adherents.filter(a=>a.continent.includes("Amérique")).map(a=>a.id), icone:"🌎" },
                ].map((g, i) => {
                  const actif = JSON.stringify([...destinataires].sort()) === JSON.stringify([...g.ids].sort());
                  return (
                    <button key={i} onClick={() => setDestinataires(g.ids)}
                      style={{ textAlign:"left", padding:"9px 14px", borderRadius:10,
                        border:`1.5px solid ${actif ? "var(--or)" : "var(--bordure)"}`,
                        background: actif ? "var(--or-pale)" : "rgba(255,255,255,0.02)",
                        fontSize:13, fontWeight:500, color: actif ? "var(--or)" : "var(--texte-sec)", cursor:"pointer", transition:"all 0.15s" }}>
                      {g.icone}  {g.lbl}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
              {adherents.map(a => (
                <label key={a.id} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:9, cursor:"pointer",
                  background: destinataires.includes(a.id) ? "var(--or-pale)" : "transparent",
                  border:`1px solid ${destinataires.includes(a.id) ? "var(--or-bordure)" : "transparent"}`,
                  transition:"all 0.15s" }}>
                  <input type="checkbox" checked={destinataires.includes(a.id)} onChange={() => toggleDest(a.id)} style={{ accentColor:"var(--or)" }} />
                  <div style={{ width:26,height:26,borderRadius:"50%",background:"var(--or-pale)",border:"1px solid var(--or-bordure)",color:"var(--or)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0 }}>
                    {(a.nom[0]+a.prenoms[0]).toUpperCase()}
                  </div>
                  <span style={{ fontSize:13, fontWeight:500, flex:1, color:"var(--texte)" }}>{a.nom} {a.prenoms}</span>
                  {!a.paye && <span style={{ fontSize:10, color:"var(--alerte)", fontWeight:700, background:"var(--alerte-pale)", padding:"2px 6px", borderRadius:99 }}>impayé</span>}
                </label>
              ))}
              {adherents.length === 0 && <p style={{ color:"var(--texte-ter)", fontSize:13, padding:"1rem" }}>Aucun adhérent</p>}
            </div>

            {destinataires.length > 0 && (
              <div style={{ marginTop:10, padding:"8px 12px", background:"var(--or-pale)", border:"1px solid var(--or-bordure)", borderRadius:10, fontSize:13, color:"var(--or)", fontWeight:600 }}>
                ✦ {destinataires.length} destinataire{destinataires.length > 1 ? "s" : ""} sélectionné{destinataires.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      )}

      {onglet === "boite" && (
        <div className="carte" style={{ padding:0, overflow:"hidden" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign:"center", padding:"4rem", color:"var(--texte-ter)" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
              <div style={{ fontSize:16, fontWeight:600, color:"var(--texte-sec)", marginBottom:6 }}>Aucun message envoyé</div>
              <div style={{ fontSize:13 }}>Rédigez votre premier message</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Objet</th>
                    <th>Destinataires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id} style={{ opacity: m.lu ? 0.65 : 1 }}>
                      <td style={{ fontSize:12.5, whiteSpace:"nowrap", color:"var(--texte-ter)" }}>
                        {new Date(m.date).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" })}
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: m.type==="groupe" ? "var(--or-pale)" : "rgba(56,189,248,0.1)",
                          color:      m.type==="groupe" ? "var(--or)" : "#38bdf8",
                        }}>
                          {m.type==="groupe" ? "👥 Groupé" : "👤 Individuel"}
                        </span>
                      </td>
                      <td style={{ fontWeight:600, fontSize:13.5, color:"var(--texte)" }}>{m.objet}</td>
                      <td style={{ fontSize:13, color:"var(--texte-sec)" }}>
                        {m.destinataires.length} membre{m.destinataires.length > 1 ? "s" : ""}
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:5 }}>
                          <button onClick={() => { setDetailMsg(m.id); markLu(m.id); }}
                            style={{ border:"none", background:"var(--or-pale)", color:"var(--or)", borderRadius:8, padding:"5px 12px", fontSize:12.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                            <Eye size={12} /> Voir
                          </button>
                          <button onClick={() => deleteMessage(m.id)}
                            style={{ border:"none", background:"var(--rouge-pale)", color:"#f87171", borderRadius:8, padding:"5px 8px", cursor:"pointer" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal détail message */}
      {msgDetail && (
        <div className="modal-fond" onClick={() => setDetailMsg(null)}>
          <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure-or)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 className="titre" style={{ fontSize:20, fontWeight:600, color:"var(--or)" }}>Détail du message</h2>
              <button onClick={() => setDetailMsg(null)} style={{ border:"none", background:"rgba(255,255,255,0.05)", color:"var(--texte-sec)", borderRadius:8, padding:"6px" }}><X size={18} /></button>
            </div>
            <div style={{ padding:"1.5rem" }}>
              <div style={{ fontWeight:700, fontSize:17, color:"var(--texte)", marginBottom:"1.25rem", lineHeight:1.3 }}>{msgDetail.objet}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:"1.25rem" }}>
                {[
                  ["Type",          msgDetail.type === "groupe" ? "👥 Groupé" : "👤 Individuel"],
                  ["Destinataires", `${msgDetail.destinataires.length} membre(s)`],
                  ["Envoyé le",     new Date(msgDetail.date).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })],
                  ["Expéditeur",    msgDetail.expediteur],
                ].map(([k,v]) => (
                  <div key={k} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px", border:"1px solid var(--bordure)" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:"var(--texte)" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--texte-ter)", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Contenu</div>
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid var(--bordure)", borderRadius:10, padding:"14px", fontSize:13.5, lineHeight:1.75, whiteSpace:"pre-wrap", color:"var(--texte-sec)" }}>
                {msgDetail.contenu}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast">
          <span style={{ color:"var(--or)" }}>✓</span> {toast}
        </div>
      )}
    </div>
  );
}
