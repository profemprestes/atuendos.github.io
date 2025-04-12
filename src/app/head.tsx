import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Atuendos - Mati y Cami',
  description: 'Generado con IA',
};

export default function Head() {
  return (
    <>
      <title>{metadata.title?.toString()}</title>
      <meta name="description" content={metadata.description?.toString()} />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </>
  );
}