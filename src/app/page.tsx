import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <section className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Bienvenue chez votre Plombier Chauffagiste
          </h1>
          <p className="text-xl text-gray-700">
            Interventions rapides et efficaces pour tous vos besoins.
          </p>
        </div>

        <div className="w-full max-w-2xl flex justify-center">
          <div className="w-[500px]">
            {" "}
            {/* Ajustez la largeur selon vos besoins */}
            <Image
              src="/assets/Plombier-chauffagiste.jpg"
              alt="Illustration Plombier"
              width={300}
              height={225}
              className="rounded-lg shadow-lg"
              style={{
                width: "100%",
                height: "auto",
              }}
              priority
            />
          </div>
        </div>

        <Link
          href="/services"
          className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg shadow hover:bg-blue-700 transition"
        >
          Découvrir nos services
        </Link>
      </section>
    </div>
  );
}
