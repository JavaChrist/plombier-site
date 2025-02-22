"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { Intervention } from "@/types";
import Link from "next/link";

export default function InterventionsClient() {
  const params = useParams();
  const clientId = params?.id as string;
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterventions = async () => {
      if (!clientId) return;

      try {
        const interventionsRef = collection(db, "interventions");
        const q = query(
          interventionsRef,
          where("idClient", "==", clientId),
          orderBy("dateIntervention", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const interventionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Intervention[];

        setInterventions(interventionsData);
      } catch (error) {
        console.error("❌ Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, [clientId]);

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interventions du client</h1>
        <Link href="/list" className="text-blue-500 hover:text-blue-700">
          ← Retour à la liste
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Liste des interventions ({interventions.length})
              </h2>
              <p className="text-sm text-gray-500">
                {interventions.filter((i) => i.statut === "planifiee").length} planifiée(s),{" "}
                {interventions.filter((i) => i.statut === "en_cours").length} en cours,{" "}
                {interventions.filter((i) => i.statut === "terminee").length} terminée(s)
              </p>
            </div>
          </div>
        </div>

        {interventions.length > 0 ? (
          <div className="space-y-4">
            {interventions.map((intervention) => (
              <div
                key={intervention.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">
                        {new Date(intervention.dateIntervention).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          intervention.statut === "planifiee"
                            ? "bg-blue-100 text-blue-800"
                            : intervention.statut === "en_cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {intervention.statut.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600">{intervention.description}</p>
                    <p className="font-medium">
                      Montant: {intervention.montantTTC.toFixed(2)}€ TTC
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/interventions/${intervention.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Modifier
                    </Link>
                    {intervention.statut === "terminee" && (
                      <Link
                        href={`/facture?interventionId=${intervention.id}`}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Facturer
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Aucune intervention pour ce client
          </p>
        )}
      </div>
    </div>
  );
} 