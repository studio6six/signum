# S6S_02_Implementation_Plan

# Goal Description
Build "Signum," a locally hosted, secure credential manager using Next.js and Encrypted JSON storage. The focus is on strictly implementing the requirements from S6S_01: "The Seal" (Security) and premium "User Flow".

## User Review Required
> [!IMPORTANT]
> **Data Loss Risk:** The Master Password is NOT stored. If the user forgets it, the `signum-vault.json` is mathematically unrecoverable. We must add a specific "Emergency Kit" or clear warning UI during setup.

> [!NOTE]
> **Storage Location:** The `signum-vault.json` will be stored in the root of the project directory for the MVP to ensure portability and "Ease of Setup".

## Proposed Changes

### Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (with `shadcn/ui` components for speed/aesthetics).
- **Backend/API:** Next.js API Routes (Serverless functions running locally).
- **Cryptography:** 
    - `argon2` (npm) for Key Derivation (Master Password -> Key).
    - `node:crypto` for AES-256-GCM encryption/decryption.

### Data Schema (`signum-vault.json`)
The storage file will contain a single JSON object wrapping the encrypted blob.

```json
{
  "version": "1.0",
  "kdfParams": {
    "salt": "hex_string",       // Random 16+ byte salt
    "iterations": 3,
    "memory": 65536,
    "parallelism": 4
  },
  "authHash": "hex_string",     // Hash of the derived key. Used to verify password correctness WITHOUT attempting decryption.
  "iv": "hex_string",           // Initialization Vector for AES-GCM (12 bytes)
  "tag": "hex_string",          // Auth Tag for AES-GCM (16 bytes) - Critical for integrity
  "encryptedData": "hex_string" // The actual vault data, encrypted.
}
```

**Decrypted `encryptedData` Structure:**
```json
[
  {
    "id": "uuid",
    "title": "Google",
    "username": "me@gmail.com",
    "password": "plain_text_password", // Only exists in memory when unlocked
    "url": "https://google.com",
    "notes": "Backup email...",
    "tokens": "API_KEY_123...",
    "tags": ["personal", "email"],
    "createdAt": "ISO_DATE_STRING",
    "updatedAt": "ISO_DATE_STRING"
  }
]
```

### Component Architecture
This follows a standard Next.js App Router structure.

#### [NEW] [src/lib/crypto.ts](file:///src/lib/crypto.ts)
- `deriveKey(password, salt)`: Returns Key.
- `encryptVault(data, password)`: Returns full JSON object.
- `decryptVault(json, password)`: Returns Array of Credentials.

#### [NEW] [src/app/page.tsx](file:///src/app/page.tsx)
- The main entry point. Checks if `signum-vault.json` exists.
- If **False** -> Renders `SetupView` (Create Master Password).
- If **True** -> Renders `LockScreen` (Enter Master Password).

#### [NEW] [src/components/Dashboard.tsx](file:///src/components/Dashboard.tsx)
- Only rendered after successful unlock.
- Contains `CredentialList`, `SearchBar`, and `AddCredentialModal`.

### Execution Steps
1.  **Initialize Project:** `npx create-next-app` with Tailwind.
2.  **Crypto Core:** Implement `crypto.ts` with test cases to ensure `encrypt` -> `decrypt` loop works 100%.
3.  **API Layer:** Create `route.ts` handlers for reading/writing the `signum-vault.json` file safely.
4.  **UI - The Seal:** Build the Setup and Lock screens.
5.  **UI - The Manager:** Build the Dashboard and CRUD forms.

## Verification Plan

### Automated Tests
- **Crypto Unit Tests:** We will write a script `scripts/test-crypto.js` to verify that our specific config of Argon2 + AES-GCM works correctly before hooking it up to the UI.

### Manual Verification
- **Setup Flow:** Download repo, run `npm install && npm run dev`. Verify it prompts for setup.
- **Persistence:** Add a password, restart the dev server, unlock, verify password exists.
- **Wrong Password:** Verify that entering a wrong password returns a generic error and DOES NOT decrypt data.
