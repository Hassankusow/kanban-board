import Counter from '@/components/Counter';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">MyCritters Onboarding</h1>
      <Counter initial={0} />
    </main>
  );
}

