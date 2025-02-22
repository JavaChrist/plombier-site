"use client";

import { useState } from 'react';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface AuthProps {
  onSuccess?: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Authentification réussie:", userCredential.user.uid);
      onSuccess?.();
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      setError(error instanceof Error ? error.message : "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="px-3 py-2 border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="px-3 py-2 border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </form>
  );
} 