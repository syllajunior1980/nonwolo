"use client";
import { useStore } from "@/lib/store";
import Sidebar from "./components/Sidebar";
import TableauDeBord from "./components/TableauDeBord";
import Adherents from "./components/Adherents";
import Villages from "./components/Villages";
import Messagerie from "./components/Messagerie";
import Cotisations from "./components/Cotisations";

export default function Page() {
  const { activeTab } = useStore();

  const pages: Record<string, React.ReactNode> = {
    "tableau-de-bord": <TableauDeBord />,
    "adherents": <Adherents />,
    "villages": <Villages />,
    "messagerie": <Messagerie />,
    "paiements": <Cotisations />,
  };

  return (
    <div>
      <Sidebar />
      <main className="main-content">
        {pages[activeTab] || <TableauDeBord />}
      </main>
    </div>
  );
}
