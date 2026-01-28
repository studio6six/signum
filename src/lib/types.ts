export interface Category {
    id: string;
    name: string;
    icon?: string;
}

export interface Credential {
    id: string;
    title: string;
    username: string;
    password?: string; // Optional because we might list without showing password
    url?: string;
    notes?: string;
    tokens?: string;
    tags?: string[];
    categoryId?: string; // Foreign Key to Category
    createdAt: string;
    updatedAt: string;
    description?: string;
}

export interface KdfParams {
    salt: string; // hex
    iterations: number;
    memory: number;
    parallelism: number;
}

export interface VaultData {
    version: string;
    kdfParams: KdfParams;
    authHash: string; // hex, SHA-256 of derived key
    iv: string; // hex
    tag: string; // hex
    encryptedData: string; // hex
}
