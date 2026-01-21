import { deriveKey, encryptVault, decryptVault, verifyPassword } from "../src/lib/crypto";
import { Credential } from "../src/lib/types";

async function runTest() {
    console.log("Starting Crypto Test...");

    const password = "super-secure-password";
    const credentials: Credential[] = [
        {
            id: "1",
            title: "Test Credential",
            username: "user",
            password: "password123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    try {
        console.log("1. Encrypting Vault...");
        const vault = await encryptVault(credentials, password);
        console.log("   Vault AuthHash:", vault.authHash);
        console.log("   Vault IV:", vault.iv);

        console.log("2. verifying Password...");
        const key = await verifyPassword(password, vault);
        if (!key) {
            throw new Error("Password verification failed!");
        }
        console.log("   Password verified. Key derived.");

        console.log("3. Decrypting Vault...");
        const decrypted = decryptVault(vault, key);

        if (decrypted.length !== 1 || decrypted[0].username !== "user") {
            throw new Error("Decrypted data does not match original!");
        }
        console.log("   Decryption successful:", decrypted[0].title);

        console.log("4. Testing Wrong Password...");
        const wrongKey = await verifyPassword("wrong-password", vault);
        if (wrongKey) {
            throw new Error("Wrong password should NOT return a key!");
        }
        console.log("   Wrong password correctly rejected.");

        console.log("✅ ALL TESTS PASSED");
    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        process.exit(1);
    }
}

runTest();
