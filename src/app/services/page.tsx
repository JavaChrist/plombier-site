export default function Services() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Nos Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez nos prestations professionnelles pour tous vos besoins en plomberie et chauffage
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Installation */}
          <div className="p-6 bg-white shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-blue-50">
            <div className="text-center mb-4">
              <span className="text-4xl">🚿</span>
              <h2 className="text-2xl font-bold text-blue-600 mt-2">Installation</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• Installation de chaudières</li>
              <li>• Pose de chauffe-eau</li>
              <li>• Équipements sanitaires</li>
              <li>• Rénovation salle de bain</li>
            </ul>
          </div>

          {/* Dépannage */}
          <div className="p-6 bg-white shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-blue-50">
            <div className="text-center mb-4">
              <span className="text-4xl">🛠</span>
              <h2 className="text-2xl font-bold text-blue-600 mt-2">Dépannage</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• Intervention d&apos;urgence</li>
              <li>• Réparation de fuites</li>
              <li>• Débouchage canalisations</li>
              <li>• Pannes de chauffage</li>
            </ul>
          </div>

          {/* Entretien */}
          <div className="p-6 bg-white shadow-lg rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-blue-50">
            <div className="text-center mb-4">
              <span className="text-4xl">🔧</span>
              <h2 className="text-2xl font-bold text-blue-600 mt-2">Entretien</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• Maintenance chaudière</li>
              <li>• Contrats d&apos;entretien</li>
              <li>• Détartrage</li>
              <li>• Diagnostic technique</li>
            </ul>
          </div>
        </div>

        {/* Section Contact */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Besoin d&apos;un devis ?</h2>
          <p className="text-gray-600 mb-6">
            Contactez-nous pour obtenir un devis personnalisé gratuit
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300"
          >
            Demander un devis
          </a>
        </div>
      </section>
    </div>
  );
}
