"use client";

interface HistoriqueItem {
  date: string;
  action: string;
  description: string;
  utilisateur?: string;
}

interface HistoriqueSectionProps {
  historique?: HistoriqueItem[];
}

export default function HistoriqueSection({ historique = [] }: HistoriqueSectionProps) {
  if (!historique || historique.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Historique</h3>
        <p className="text-gray-500 italic">Aucun historique disponible</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Historique</h3>
      <div className="space-y-4">
        {historique.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0">
              <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.action}</p>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {item.utilisateur && (
                <p className="text-sm text-gray-500 mt-1">
                  Par: {item.utilisateur}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}