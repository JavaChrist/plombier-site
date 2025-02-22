"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { auth } from "@/config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import Auth from "./Auth";

export default function Header() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    // Fermer le menu si on clique en dehors
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      console.log("Déconnexion réussie");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setLoading(false);
    }
  };

  // Liens publics toujours visibles
  const publicLinks = [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  // Liens privés dans le menu hamburger
  const privateLinks = [
    { href: "/admin", label: "Entreprise" },
    { href: "/interventions", label: "Interventions" },
    { href: "/list", label: "Clients" },
    { href: "/factures", label: "Factures" },
    { href: "/familles", label: "Familles" },
    { href: "/parametres", label: "Paramètres" },
  ];

  return (
    <>
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Image
              src="/assets/Favicon-jaune.ico"
              alt="Logo Plombier"
              width={40}
              height={40}
              className="rounded-full"
              style={{ width: "40px", height: "40px" }}
            />
            <h1 className="text-xl font-bold">Plombier Chauffagiste</h1>
          </div>

          <nav className="flex items-center gap-4">
            {/* Liens publics */}
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors ${
                  pathname === link.href ? "bg-blue-700" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Menu hamburger pour les liens privés */}
            {isAuthenticated && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                    {privateLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 ${
                          pathname.startsWith(link.href) ? "bg-gray-100" : ""
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      disabled={loading}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t"
                    >
                      {loading ? "Déconnexion..." : "Se déconnecter"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bouton de connexion */}
            {!isAuthenticated && (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-2 bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors"
              >
                Se connecter
              </button>
            )}
          </nav>
        </div>
      </header>

      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Connexion</h2>
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <Auth onSuccess={() => setIsLoginModalOpen(false)} />
        </div>
      </Modal>
    </>
  );
}
