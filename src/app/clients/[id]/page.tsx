import { Suspense } from 'react';
import ClientDetails from './ClientDetails';
import Link from 'next/link';

interface PageProps {
  params: { id: string }; // On s'assure que c'est bien un objet et non une promesse
}

export default function ClientPage({ params }: PageProps) {
  const id = params.id; // On extrait directement l'ID

  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Chargement du client...</div>
        </div>
      }>
        <ClientDetails id={id} />
      </Suspense>
      <Link
        href={`/interventions/nouveau?clientId=${id}`}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Nouvelle intervention
      </Link>
    </div>
  );
}
