export interface Client {
  id: string;
  idClient: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: {
    rue: string;
    codePostal: string;
    ville: string;
  };
  notes?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface Intervention {
  id: string;
  idClient: string;
  dateIntervention: string;
  type: "depannage" | "installation" | "entretien" | "autre";
  statut: "planifiee" | "en_cours" | "terminee" | "annulee";
  description: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  dateCreation: string;
  dateModification?: string;
  heureDebut?: string;
  heureFin?: string;
  materielUtilise?: string[];
  photosAvant?: string[];
  photosApres?: string[];
  signatureClient?: string;
  technicienId?: string;
  historique?: Modification[];
}

export interface Modification {
  date: string;
  action: string;
  description: string;
  changedFields?: string[];
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  utilisateur?: string;
}
