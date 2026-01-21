"use client";

import { useState } from "react";
import { Credential } from "@/lib/types";
import { SetupView } from "./SetupView";
import { LockScreen } from "./LockScreen";
import { Dashboard } from "./Dashboard";

interface VaultManagerProps {
    isInitialized: boolean;
}

export function VaultManager({ isInitialized: initialIsInitialized }: VaultManagerProps) {
    const [isInitialized, setIsInitialized] = useState(initialIsInitialized);
    // 'locked' | 'unlocked'
    const [state, setState] = useState<"locked" | "unlocked">("locked");
    const [credentials, setCredentials] = useState<Credential[]>([]);
    // We keep the password in memory to re-encrypt when saving changes
    const [masterPassword, setMasterPassword] = useState<string | null>(null);

    const handleSetupComplete = () => {
        setIsInitialized(true);
        setState("locked"); // Force them to login right after setup to confirm password
    };

    const handleUnlock = (creds: Credential[], password: string) => {
        setCredentials(creds);
        setMasterPassword(password);
        setState("unlocked");
    };

    const handleLock = () => {
        setCredentials([]);
        setMasterPassword(null);
        setState("locked");
    };

    if (!isInitialized) {
        return <SetupView onSetupComplete={handleSetupComplete} />;
    }

    if (state === "locked") {
        return <LockScreen onUnlock={handleUnlock} />;
    }

    return <Dashboard credentials={credentials} onLock={handleLock} masterPassword={masterPassword} />;
}
