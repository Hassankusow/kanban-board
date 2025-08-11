import BoardList from "@/components/BoardList";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">MyCritters Onboarding</h1>

      {/* Board List Component */}
      <BoardList />
    </main>
  );
}
