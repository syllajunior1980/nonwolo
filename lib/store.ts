"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Situation = "Fonctionnaire" | "Chômeur" | "Ouvrier" | "Élève" | "Étudiant" | "Autre";
export type Operateur = "Orange Money" | "Moov Money" | "Wave" | "";
export type Continent = "Afrique" | "Europe" | "Amérique du Nord" | "Amérique du Sud" | "Asie" | "Océanie";

export interface Adherent {
  id: string;
  nom: string;
  prenoms: string;
  ddn: string;
  lieuNaissance: string;
  village: string;
  quartier: string;
  contact: string;
  email: string;
  pays: string;
  continent: Continent;
  situation: Situation;
  operateur: Operateur;
  photo: string;
  paye: boolean;
  datePaiement: string;
  dateInscription: string;
  notes: string;
}

export interface Message {
  id: string;
  type: "groupe" | "individuel";
  destinataires: string[];
  objet: string;
  contenu: string;
  date: string;
  lu: boolean;
  expediteur: string;
}

export interface Village {
  id: string;
  nom: string;
  region: string;
}

interface Store {
  adherents: Adherent[];
  villages: Village[];
  messages: Message[];
  activeTab: string;
  setActiveTab: (t: string) => void;
  addAdherent: (a: Omit<Adherent, "id" | "dateInscription">) => void;
  updateAdherent: (id: string, a: Partial<Adherent>) => void;
  deleteAdherent: (id: string) => void;
  addVillage: (v: Omit<Village, "id">) => void;
  deleteVillage: (id: string) => void;
  addMessage: (m: Omit<Message, "id" | "date" | "lu">) => void;
  deleteMessage: (id: string) => void;
  markLu: (id: string) => void;
}

const DEMO_ADHERENTS: Adherent[] = [
  { id: "AJRN-0001", nom: "Koné", prenoms: "Mamadou", ddn: "1995-03-12", lieuNaissance: "Bouaké", village: "Nonwolo", quartier: "Koko", contact: "+225 07 01 23 45 67", email: "kone.m@gmail.com", pays: "Côte d'Ivoire", continent: "Afrique", situation: "Fonctionnaire", operateur: "Orange Money", photo: "", paye: true, datePaiement: "2025-01-10", dateInscription: "2025-01-10", notes: "" },
  { id: "AJRN-0002", nom: "Ouattara", prenoms: "Fatoumata", ddn: "2001-07-25", lieuNaissance: "Nonwolo", village: "Gnégré", quartier: "Centre", contact: "+33 06 12 34 56 78", email: "fato.o@gmail.com", pays: "France", continent: "Europe", situation: "Étudiant", operateur: "Wave", photo: "", paye: true, datePaiement: "2025-01-15", dateInscription: "2025-01-12", notes: "" },
  { id: "AJRN-0003", nom: "Coulibaly", prenoms: "Ibrahim", ddn: "1999-11-08", lieuNaissance: "Abidjan", village: "Kakolo", quartier: "Résidentiel", contact: "+1 212 555 0123", email: "ibra.c@gmail.com", pays: "États-Unis", continent: "Amérique du Nord", situation: "Chômeur", operateur: "Moov Money", photo: "", paye: false, datePaiement: "", dateInscription: "2025-02-01", notes: "" },
  { id: "AJRN-0004", nom: "Traoré", prenoms: "Aminata", ddn: "1988-05-20", lieuNaissance: "Korhogo", village: "Tiébila", quartier: "Nord", contact: "+49 30 12345678", email: "ami.t@gmail.com", pays: "Allemagne", continent: "Europe", situation: "Fonctionnaire", operateur: "Orange Money", photo: "", paye: false, datePaiement: "", dateInscription: "2025-02-10", notes: "" },
  { id: "AJRN-0005", nom: "Diallo", prenoms: "Moussa", ddn: "2003-09-14", lieuNaissance: "Nonwolo", village: "Zologo", quartier: "Sud", contact: "+225 05 99 88 77 66", email: "moussa.d@gmail.com", pays: "Côte d'Ivoire", continent: "Afrique", situation: "Élève", operateur: "Wave", photo: "", paye: true, datePaiement: "2025-03-01", dateInscription: "2025-03-01", notes: "" },
];

const DEMO_VILLAGES: Village[] = [
  { id: "v1", nom: "Nonwolo", region: "Centre" },
  { id: "v2", nom: "Gnégré", region: "Nord" },
  { id: "v3", nom: "Kakolo", region: "Est" },
  { id: "v4", nom: "Zologo", region: "Ouest" },
  { id: "v5", nom: "Tiébila", region: "Sud" },
];

function nextId(adherents: Adherent[]) {
  const nums = adherents.map(a => parseInt(a.id.split("-")[1])).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return "AJRN-" + String(max + 1).padStart(4, "0");
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      adherents: DEMO_ADHERENTS,
      villages: DEMO_VILLAGES,
      messages: [],
      activeTab: "tableau-de-bord",
      setActiveTab: (t) => set({ activeTab: t }),
      addAdherent: (a) => set(s => ({
        adherents: [...s.adherents, { ...a, id: nextId(s.adherents), dateInscription: new Date().toISOString().split("T")[0] }]
      })),
      updateAdherent: (id, a) => set(s => ({
        adherents: s.adherents.map(x => x.id === id ? { ...x, ...a } : x)
      })),
      deleteAdherent: (id) => set(s => ({ adherents: s.adherents.filter(x => x.id !== id) })),
      addVillage: (v) => set(s => ({
        villages: [...s.villages, { ...v, id: "v" + Date.now() }]
      })),
      deleteVillage: (id) => set(s => ({ villages: s.villages.filter(x => x.id !== id) })),
      addMessage: (m) => set(s => ({
        messages: [{ ...m, id: "msg" + Date.now(), date: new Date().toISOString(), lu: false }, ...s.messages]
      })),
      deleteMessage: (id) => set(s => ({ messages: s.messages.filter(x => x.id !== id) })),
      markLu: (id) => set(s => ({ messages: s.messages.map(x => x.id === id ? { ...x, lu: true } : x) })),
    }),
    { name: "ajrn-storage" }
  )
);
