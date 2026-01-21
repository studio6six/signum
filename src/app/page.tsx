import { isVaultInitialized } from "./actions";
import { VaultManager } from "@/components/VaultManager";
import { Toaster } from "@/components/ui/sonner";

export default async function Home() {
  const initialized = await isVaultInitialized();

  return (
    <main className="min-h-screen bg-gray-100">
      <VaultManager isInitialized={initialized} />
      <Toaster />
    </main>
  );
}
