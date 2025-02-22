"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Liste des liens de navigation
type NavLink = {
  href: string;
  label: string;
};

export default function ArticlesNav() {
  // Récupère le chemin actuel de la page
  const pathname = usePathname();

  // Configuration des liens de navigation
  const links: NavLink[] = [
    { href: '/articles', label: 'Articles' },
    { href: '/familles', label: 'Familles' },
  ];

  return (
    // Conteneur principal de la navigation
    <nav className="mb-8">
      {/* Liste horizontale des liens */}
      <ul className="flex space-x-4 border-b">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`px-4 py-2 inline-block ${
                // Applique un style différent pour le lien actif
                pathname === href
                  ? 'border-b-2 border-blue-500 text-blue-600' // Style du lien actif
                  : 'text-gray-600 hover:text-blue-500'        // Style des autres liens
                }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}