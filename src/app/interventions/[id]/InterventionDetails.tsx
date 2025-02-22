"use client";

import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  setDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebase";
import { db } from "@/config/firebase";
import { Intervention } from "@/types";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import DeleteModal from "@/components/DeleteModal";
import PhotosSection from "@/components/PhotosSection";
import HistoriqueSection from "@/components/HistoriqueSection";
import { auth } from "@/config/firebase";
import Auth from "@/components/Auth";
import Link from "next/link";

export default function InterventionDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const clientId = searchParams.get("clientId");

  const router = useRouter();
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchIntervention = async () => {
      if (!id) {
        console.warn("⚠️ ID manquant");
        return;
      }

      try {
        if (id === "nouveau") {
          if (!clientId) {
            console.warn("⚠️ ClientID manquant pour nouvelle intervention");
            return;
          }

          console.warn("🆕 Création nouvelle intervention:", {
            clientId,
            dateIntervention: new Date().toISOString(),
          });

          // Créer un nouveau document dans Firestore
          const newInterventionRef = doc(collection(db, "interventions"));
          const newIntervention = {
            id: newInterventionRef.id,
            idClient: clientId,
            dateIntervention: new Date().toISOString(),
            type: "depannage",
            statut: "planifiee",
            description: "Création intervention",
            montantHT: 0,
            tva: 20,
            montantTTC: 0,
            dateCreation: new Date().toISOString(),
          };

          await setDoc(newInterventionRef, newIntervention);
          console.warn("✅ Nouvelle intervention créée:", newIntervention);

          setIntervention(newIntervention as Intervention);
          setEditing(true); // Passer directement en mode édition
          setLoading(false);
          return;
        }

        console.log("🔍 Chargement intervention:", id);
        const docRef = doc(db, "interventions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const interventionData = docSnap.data();
          setIntervention({
            id: docSnap.id,
            ...interventionData,
          } as Intervention);
        } else {
          setError("Intervention non trouvée");
          router.push("/interventions");
        }
      } catch (error) {
        console.error("❌ Erreur:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Une erreur inattendue");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchIntervention();
  }, [id, clientId, router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (!intervention) return;

    setUpdateLoading(true);
    try {
      const docRef = doc(db, "interventions", intervention.id);
      await updateDoc(docRef, {
        ...intervention,
        dateModification: new Date().toISOString(),
      });
      setEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!intervention || !intervention.id) return;

    try {
      const docRef = doc(db, "interventions", intervention.id);
      await deleteDoc(docRef);
      router.push("/interventions");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    if (!intervention) return;

    const { name, value } = e.target;
    setIntervention((prev) => {
      if (!prev) return prev;

      if (name === "montantHT") {
        const montantHT = parseFloat(value) || 0;
        const montantTTC = montantHT * (1 + (prev.tva || 20) / 100);
        return { ...prev, montantHT, montantTTC };
      }

      if (name === "tva") {
        const tva = parseFloat(value) || 0;
        const montantTTC = (prev.montantHT || 0) * (1 + tva / 100);
        return { ...prev, tva, montantTTC };
      }

      return { ...prev, [name]: value };
    });
  };

  const handlePhotoUpload = async (file: File, type: "avant" | "apres") => {
    if (!isAuthenticated) {
      alert("Veuillez vous connecter pour uploader des photos");
      return;
    }

    try {
      const storageRef = ref(
        storage,
        `interventions/${intervention?.id}/${type}/${file.name}`
      );

      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: auth.currentUser?.email || "anonymous",
          uploadedAt: new Date().toISOString(),
        },
      };

      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);

      // Mettre à jour l'intervention
      if (intervention?.id) {
        const docRef = doc(db, "interventions", intervention.id);
        const photoField = type === "avant" ? "photosAvant" : "photosApres";

        await updateDoc(docRef, {
          [photoField]: [...(intervention[photoField] || []), url],
          dateModification: new Date().toISOString(),
        });

        // Mettre à jour l'état local
        setIntervention((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            [photoField]: [...(prev[photoField] || []), url],
          };
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      alert("Erreur lors du chargement. Veuillez réessayer.");
    }
  };

  const handlePhotoUploadWrapper = async (
    files: FileList | null,
    type: "avant" | "apres"
  ) => {
    if (!files || files.length === 0) return;
    await handlePhotoUpload(files[0], type);
  };

  // Ajout d'une vérification de sécurité pour le type
  const formatType = (type: string | undefined) => {
    if (!type) return "Non défini";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Erreur!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!intervention) {
    return <div className="text-center py-8">Intervention non trouvée</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">
          Veuillez vous connecter pour accéder à cette page
        </p>
        <Auth />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editing
            ? "Modifier l&apos;intervention"
            : "Détails de l&apos;intervention"}
        </h1>
        <div className="space-x-4">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                disabled={updateLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {updateLoading ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        {/* Formulaire principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type d'intervention */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d&apos;intervention
            </label>
            {editing ? (
              <select
                name="type"
                value={intervention.type || "depannage"}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="depannage">Dépannage</option>
                <option value="installation">Installation</option>
                <option value="maintenance">Maintenance</option>
                <option value="divers">Divers</option>
              </select>
            ) : (
              <p className="p-2 bg-gray-50 rounded-lg">
                {formatType(intervention.type)}
              </p>
            )}
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            {editing ? (
              <select
                name="statut"
                value={intervention.statut}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            ) : (
              <span
                className={`inline-block px-2 py-1 rounded-full text-sm ${
                  intervention.statut === "planifiee"
                    ? "bg-blue-100 text-blue-800"
                    : intervention.statut === "en_cours"
                    ? "bg-yellow-100 text-yellow-800"
                    : intervention.statut === "terminee"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {intervention.statut.replace("_", " ").toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {editing ? (
            <textarea
              name="description"
              value={intervention.description || ""}
              onChange={handleChange}
              className="w-full p-4 border rounded-lg min-h-[150px] text-gray-700"
              rows={6}
              placeholder="Décrivez l&apos;intervention..."

            />
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 min-h-[100px]">
              {intervention.description ? (
                intervention.description
              ) : (
                <span className="text-gray-500 italic">Aucune description</span>
              )}
            </div>
          )}
        </div>

        {/* Photos */}
        <PhotosSection
          intervention={intervention}
          editing={editing}
          onPhotoUpload={handlePhotoUploadWrapper}
          uploading={false}
        />

        {/* Historique */}
        <HistoriqueSection historique={intervention.historique} />
      </div>

      <div className="flex justify-between items-center">
        <p className="font-medium">
          Montant: {intervention.montantTTC.toFixed(2)}€ TTC
        </p>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Modifier
              </button>
              {intervention.statut === "terminee" && (
                <Link
                  href={`/facture?interventionId=${intervention.id}&clientId=${intervention.idClient}`}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Créer une facture
                </Link>
              )}
            </>
          ) : (
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Enregistrer
            </button>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
