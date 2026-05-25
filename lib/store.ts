import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Situation = "Fonctionnaire" | "Chomeur" | "Ouvrier" | "Eleve" | "Etudiant" | "Autre";
export type Operateur = "Orange Money" | "Moov Money" | "Wave" | "";
export type Continent = "Afrique" | "Europe" | "Amerique du Nord" | "Amerique du Sud" | "Asie" | "Oceanie";

export interface Adherent {
  id: string;
  nom: string;
  prenoms: string;
  ddn: string;
  lieu_naissance: string;
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
  date_paiement: string;
  date_inscription: string;
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
  chargement: boolean;
  chargerDonnees: () => Promise<void>;
  setActiveTab: (t: string) => void;
  addAdherent: (a: Omit<Adherent, "id" | "date_inscription">) => Promise<void>;
  updateAdherent: (id: string, a: Partial<Adherent>) => Promise<void>;
  deleteAdherent: (id: string) => Promise<void>;
  addVillage: (v: Omit<Village, "id">) => Promise<void>;
  deleteVillage: (id: string) => Promise<void>;
  addMessage: (m: Omit<Message, "id" | "date" | "lu">) => void;
  deleteMessage: (id: string) => void;
  markLu: (id: string) => void;
}

function nextId(adherents: Adherent[]) {
  const nums = adherents.map(a => parseInt(a.id.replace("AJRN-", ""))).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return "AJRN-" + String(max + 1).padStart(4, "0");
}

export const useStore = create<Store>((set, get) => ({
  adherents: [],
  villages: [],
  messages: [],
  activeTab: "tableau-de-bord",
  chargement: true,

  chargerDonnees: async () => {
    set({ chargement: true });
    try {
      const [{ data: adh }, { data: vil }] = await Promise.all([
        supabase.from("adherents").select("*").order("date_inscription", { ascending: false }),
        supabase.from("villages").select("*").order("nom"),
      ]);
      set({
        adherents: (adh || []) as Adherent[],
        villages: (vil || []) as Village[],
        chargement: false,
      });
    } catch {
      set({ chargement: false });
    }
  },

  setActiveTab: (t) => set({ activeTab: t }),

  addAdherent: async (a) => {
    const { adherents } = get();
    const newId = nextId(adherents);
    const today = new Date().toISOString().split("T")[0];
    const record = { ...a, id: newId, date_inscription: today };
    const { data, error } = await supabase.from("adherents").insert([record]).select().single();
    if (!error && data) {
      set(s => ({ adherents: [data as Adherent, ...s.adherents] }));
    }
  },

  updateAdherent: async (id, a) => {
    const { error } = await supabase.from("adherents").update(a).eq("id", id);
    if (!error) {
      set(s => ({ adherents: s.adherents.map(x => x.id === id ? { ...x, ...a } : x) }));
    }
  },

  deleteAdherent: async (id) => {
    const { error } = await supabase.from("adherents").delete().eq("id", id);
    if (!error) {
      set(s => ({ adherents: s.adherents.filter(x => x.id !== id) }));
    }
  },

  addVillage: async (v) => {
    const { data, error } = await supabase.from("villages").insert([v]).select().single();
    if (!error && data) {
      set(s => ({ villages: [...s.villages, data as Village] }));
    }
  },

  deleteVillage: async (id) => {
    const { error } = await supabase.from("villages").delete().eq("id", id);
    if (!error) {
      set(s => ({ villages: s.villages.filter(x => x.id !== id) }));
    }
  },

  addMessage: (m) => set(s => ({
    messages: [{ ...m, id: "msg" + Date.now(), date: new Date().toISOString(), lu: false }, ...s.messages]
  })),
  deleteMessage: (id) => set(s => ({ messages: s.messages.filter(x => x.id !== id) })),
  markLu: (id) => set(s => ({ messages: s.messages.map(x => x.id === id ? { ...x, lu: true } : x) })),
}));
