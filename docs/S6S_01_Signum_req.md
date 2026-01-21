# S6S_01_Signum_req

## 1. Introduction
**Product Name:** Signum
**Description:** A simple, secure credential manager designed to "seal" and protect sensitive information.
**Goal:** Provide a straightforward way for users to store, retrieve, and manage credentials (usernames, passwords, notes) with a focus on security and ease of use.

## 2. Target Audience
- Individuals needing a locally hosted solution for password management.
- Users who prefer a minimal interface without the bloat of enterprise password managers.

## 3. Core Features

### 3.1 Authentication (The Seal)
- **Master Password:** The application must be protected by a single master password.
- **Password Strength:** The Master Password must meet NIST guidelines (e.g., minimum 12 characters, typically a passphrase) to ensure high entropy.
- **Key Derivation:** Use **Argon2id** (minimum configuration: 64MB memory, 3 iterations, 4 parallelism) to derive the encryption key from the Master Password. This is crucial for resisting GPU-based brute-force attacks ("industry specific encryption standards").
- **Lock/Unlock:** Users must "unlock" the vault to view passwords. Auto-lock after X minutes of inactivity.

### 3.2 Credential Management
- **Create:** Add new entries with the following fields:
    - Title (e.g., "Google", "Work Email")
    - Description (optional, short summary)
    - URL (optional)
    - Username
    - Password (with input masking and copy-to-clipboard)
    - Tokens (optional, e.g., API keys, TOTP secrets)
    - Notes (optional, for extra details like recovery codes)
    - Tags (for organization)
    - Creation Date (Auto-generated)
- **Read:** View list of credentials. Search/Filter by Title or Username.
- **Update:** Edit existing entries.
- **Delete:** Remove entries (with confirmation).

### 3.3 Security
- **Encryption:** All sensitive data (passwords, notes) must be encrypted at rest using **AES-256-GCM** (Galois/Counter Mode). This provides both confidentiality and data integrity.
- **Zero Knowledge:** The application generally operates on a Zero Knowledge basis: the backend/file-system only sees encrypted blobs. The Master Password is never stored or transmitted; only a hash (distinct from the encryption key derivation) is used for verification if necessary.

### 3.4 User Interface
- **Dashboard:** Clean list view of credentials.
- **Detail View:** Pop-up or side panel to view/edit details.
- **Password Generator:** Helper to generate strong random passwords during creation/edit.

## 4. Technical Constraints & Requirements
- **OS:** Windows (Primary).
- **Stack (Proposed):**
    - Frontend: Next.js / React
    - Styling: Tailwind CSS (Modern, Clean)
    - Storage: Encrypted JSON file (Exclusive storage method).
- **Performance:** Instant search and load times for < 1000 items.
- **Ease of Setup:** The application must require minimal steps to run locally after downloading the repository. Ideally, a single command (e.g., `npm run setup` or `npm start`) should handle dependency installation and database initialization. Zero complex configuration files for the default local setup.

## 5. Future Scope (Not in MVP)
- Browser Extension integration.
- Cloud Sync between devices.
- Biometric unlock.
