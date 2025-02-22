"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ArticlesNav from '@/components/navigation/ArticlesNav';

interface FamilleArticle {
  id: string;
  nom: string;
  code: string;
  coefficient: number;
  description?: string;
}

export default function FamillesArticles() {
  // États
  const [familles, setFamilles] = useState<FamilleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFamille, setEditingFamille] = useState<FamilleArticle | null>(null);
  const [formData, setFormData] = useState<Omit<FamilleArticle, 'id'>>({
    nom: '',
    code: '',
    coefficient: 1.0,
    description: '' // sera undefined si non renseigné
  });


  // Chargement des familles
  useEffect(() => {
    const fetchFamilles = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'famillesArticles'));
        const famillesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FamilleArticle[];
        setFamilles(famillesData);
      } catch (error) {
        console.error('Erreur chargement familles:', error);
        setError('Erreur lors du chargement des familles');
      } finally {
        setLoading(false);
      }
    };

    fetchFamilles();
  }, []);

  // Gestion du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFamille) {
        // Mise à jour
        await updateDoc(doc(db, 'famillesArticles', editingFamille.id), formData);
        setFamilles(familles.map(f =>
          f.id === editingFamille.id ? { ...f, ...formData } : f
        ));
      } else {
        // Création
        const docRef = await addDoc(collection(db, 'famillesArticles'), formData);
        setFamilles([...familles, { id: docRef.id, ...formData }]);
      }
      resetForm();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', code: '', coefficient: 1.0, description: '' });
    setEditingFamille(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Articles</h1>

      <ArticlesNav />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={e => setFormData({ ...formData, nom: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Coefficient</label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={formData.coefficient}
              onChange={e => setFormData({ ...formData, coefficient: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingFamille ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>

      {/* Liste des familles */}
      {loading ? (
        <div className="text-center py-4">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Coefficient</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {familles.map(famille => (
                <tr key={famille.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{famille.code}</td>
                  <td className="px-6 py-4">{famille.nom}</td>
                  <td className="px-6 py-4 text-right">{famille.coefficient}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingFamille(famille);

                        setFormData({
                          nom: famille.nom,
                          code: famille.code,
                          coefficient: famille.coefficient,
                          description: famille.description || ''
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      type="button"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}