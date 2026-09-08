import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-3 px-4">
      <h1 className="font-heading text-2xl font-semibold">Página não encontrada</h1>
      <Link href="/" className="text-sm text-accent hover:underline">
        Voltar ao painel
      </Link>
    </main>
  );
}
