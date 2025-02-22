import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out" // S'assure que les fichiers statiques sont générés dans `out/`
};

export default nextConfig;


