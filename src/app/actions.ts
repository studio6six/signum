"use server";

import { vaultExists, loadVault, saveVault } from "@/lib/storage";
import { encryptVault, decryptVault, verifyPassword } from "@/lib/crypto";
import { Credential } from "@/lib/types";

export type UnlockResult =
    | { success: true; credentials: Credential[] }
    | { success: false; error: string };

export async function isVaultInitialized(): Promise<boolean> {
    return await vaultExists();
}

export async function createVault(password: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (await vaultExists()) {
            return { success: false, error: "Vault already exists." };
        }
        const emptyCredentials: Credential[] = [];
        const vault = await encryptVault(emptyCredentials, password);
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

        const credentials = decryptVault(vault, key);
        return { success: true, credentials };
    } catch (err: any) {
        return { success: false, error: "Decryption failed: " + err.message };
    }
}

export async function saveCredentials(password: string, credentials: Credential[]): Promise<{ success: boolean; error?: string }> {
    try {
        // We re-verify the password to get the new key/salt or just reuse the logic.
        // Ideally we re-encrypt completely.
        // Note: encryptVault generates a NEW Salt and IV every time, which is good security practice (Rotation).
        const vault = await encryptVault(credentials, password);
        await saveVault(vault);
        return { success: true };
    } catch (err: any) {
        return { success: false, error: "Save failed: " + err.message };
    }
}
