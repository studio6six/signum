import argon2 from "argon2";
import { randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";
import { Credential, VaultData, KdfParams } from "./types";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 32; // 256 bits

// Default KDF params for new vaults
const DEFAULT_KDF: Omit<KdfParams, "salt"> = {
    iterations: 3,
    memory: 65536, // 64 MB
    parallelism: 4,
};

/**
 * Derives a 32-byte key from the master password using Argon2id.
 */
export async function deriveKey(password: string, saltHex: string): Promise<Buffer> {
    const salt = Buffer.from(saltHex, "hex");

    // argon2.hash returns a string encoded hash by default, but we need the raw buffer for the key.
    // We use argon2.hash specifically configured to return raw buffer if possible, 
    // OR we use the recommended `argon2.hash` and extract. 
    // Actually, `argon2` package has `raw` option in `hash`, but typically we use `argon2.hash` for storage.
    // For key derivation, we want the raw bytes.

    const key = await argon2.hash(password, {
        salt,
        type: argon2.argon2id,
        memoryCost: DEFAULT_KDF.memory,
        timeCost: DEFAULT_KDF.iterations,
        parallelism: DEFAULT_KDF.parallelism,
        hashLength: KEY_LENGTH,
        raw: true, // Return Buffer
    });

    return key;
}

/**
 * Verifies if the password matches the vault's authHash.
 * We derive the key and check SHA256(Key) == authHash.
 */
export async function verifyPassword(password: string, vault: VaultData): Promise<Buffer | null> {
    const { kdfParams, authHash } = vault;

    // Re-derive key using vault's params
    const salt = Buffer.from(kdfParams.salt, "hex");
    const key = await argon2.hash(password, {
        salt,
        type: argon2.argon2id,
        memoryCost: kdfParams.memory,
        timeCost: kdfParams.iterations,
        parallelism: kdfParams.parallelism,
        hashLength: KEY_LENGTH,
        raw: true,
    });

    const checkHash = createHash("sha256").update(key).digest("hex");

    if (checkHash === authHash) {
        return key;
    }
    return null;
}

/**
 * Encrypts the credentials array into a VaultData object.
 */
export async function encryptVault(credentials: Credential[], password: string): Promise<VaultData> {
    const salt = randomBytes(SALT_LENGTH);
    const saltHex = salt.toString("hex");

    // Derive Key
    const key = await deriveKey(password, saltHex);

    // Auth Hash
    const authHash = createHash("sha256").update(key).digest("hex");

    // Encrypt
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const dataString = JSON.stringify(credentials);
    let encrypted = cipher.update(dataString, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");

    return {
        version: "1.0",
        kdfParams: {
            salt: saltHex,
            ...DEFAULT_KDF,
        },
        authHash,
        iv: iv.toString("hex"),
        tag,
        encryptedData: encrypted,
    };
}

/**
 * Decrypts the vault using the provided Key (derived from verifyPassword).
 */
export function decryptVault(vault: VaultData, key: Buffer): Credential[] {
    const iv = Buffer.from(vault.iv, "hex");
    const tag = Buffer.from(vault.tag, "hex");
    const encryptedText = vault.encryptedData;

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
}
