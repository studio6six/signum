"use server";

import { vaultExists, loadVault, saveVault } from "@/lib/storage";
import { encryptVault, decryptVault, verifyPassword } from "@/lib/crypto";
import { Credential, Category } from "@/lib/types";

export type UnlockResult =
    | { success: true; credentials: Credential[]; categories: Category[] }
    | { success: false; error: string };

export async function isVaultInitialized(): Promise<boolean> {
    return await vaultExists();
}

export async function createVault(password: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (await vaultExists()) {
            return { success: false, error: "Vault already exists." };
        }
        // Initialize with new structure
        const initialData = { credentials: [], categories: [] };
        const vault = await encryptVault(initialData, password);
        await saveVault(vault);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function unlockVault(password: string): Promise<UnlockResult> {
    try {
        if (!(await vaultExists())) {
            return { success: false, error: "Vault not found." };
        }
        const vault = await loadVault();
        const key = await verifyPassword(password, vault);

        if (!key) {
            return { success: false, error: "Invalid password" };
        }

        const rawData = decryptVault(vault, key);

        // MIGRATION LOGIC: Check if it's the old Array format
        if (Array.isArray(rawData)) {
            // Old format: rawData is Credential[]
            return { success: true, credentials: rawData, categories: [] };
        } else {
            // New format: rawData is { credentials: [], categories: [] }
            // We cast it to any because rawData comes from JSON.parse which is any
            return {
                success: true,
                credentials: (rawData as any).credentials || [],
                categories: (rawData as any).categories || []
            };
        }

    } catch (err: any) {
        return { success: false, error: "Decryption failed: " + err.message };
    }
}

export async function saveVaultData(password: string, data: { credentials: Credential[], categories: Category[] }): Promise<{ success: boolean; error?: string }> {
    try {
        const vault = await encryptVault(data, password);
        await saveVault(vault);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: "Save failed: " + err.message };
    }
}
