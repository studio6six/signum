import fs from "fs/promises";
import path from "path";
import { VaultData } from "./types";

const VAULT_FILE = "signum-vault.json";
const VAULT_PATH = path.join(process.cwd(), VAULT_FILE);

export async function vaultExists(): Promise<boolean> {
    try {
        await fs.access(VAULT_PATH);
        return true;
    } catch {
        return false;
    }
}

export async function loadVault(): Promise<VaultData> {
    const data = await fs.readFile(VAULT_PATH, "utf-8");
    return JSON.parse(data) as VaultData;
}

export async function saveVault(vault: VaultData): Promise<void> {
    await fs.writeFile(VAULT_PATH, JSON.stringify(vault, null, 2), "utf-8");
}
