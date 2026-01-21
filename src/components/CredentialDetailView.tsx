"use client";

import Draggable from "react-draggable";
import { Copy, X, Calendar, Eye, EyeOff } from "lucide-react";
import { Credential } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRef, useState } from "react";

interface CredentialDetailViewProps {
    credential: Credential;
    onClose: () => void;
}

export function CredentialDetailView({ credential, onClose }: CredentialDetailViewProps) {
    const nodeRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label} to clipboard`);
    };

    return (
        <Draggable handle=".draggable-handle" nodeRef={nodeRef}>
            <div ref={nodeRef} className="fixed top-1/4 left-1/2 z-50 w-full max-w-[425px] -translate-x-1/2 p-4">
                <Card className="grid w-full gap-4 border bg-white shadow-lg sm:rounded-lg p-6">
                    <div className="draggable-handle cursor-move flex flex-col space-y-1.5 text-center sm:text-left mb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold leading-none tracking-tight">
                                {credential.title}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-4 w-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {credential.username}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Password
                            </label>
                            <div className="flex items-center justify-between rounded-md border bg-transparent px-3 py-1 shadow-sm">
                                <code className="text-sm font-semibold truncate mr-2">
                                    {showPassword ? credential.password : "•••••••••••••••"}
                                </code>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Hide Password" : "Show Password"}
                                    >
                                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={() => copyToClipboard(credential.password || "", "Password")}
                                        title="Copy Password"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {credential.url && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    URL
                                </label>
                                <div className="flex items-center justify-between rounded-md border bg-transparent px-3 py-1 shadow-sm">
                                    <a
                                        href={credential.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline truncate"
                                    >
                                        {credential.url}
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => copyToClipboard(credential.url || "", "URL")}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {credential.tokens && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Tokens
                                </label>
                                <div className="flex items-center justify-between rounded-md border bg-transparent px-3 py-1 shadow-sm">
                                    <code className="text-sm truncate">{credential.tokens}</code>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => copyToClipboard(credential.tokens || "", "Tokens")}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {credential.description && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Description
                                </label>
                                <p className="rounded-md border bg-transparent px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap shadow-sm">
                                    {credential.description}
                                </p>
                            </div>
                        )}

                        {credential.notes && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Secure Notes
                                </label>
                                <div className="relative">
                                    <p className="rounded-md border bg-transparent px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap pr-10 shadow-sm">
                                        {credential.notes}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6"
                                        onClick={() => copyToClipboard(credential.notes || "", "Notes")}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {new Date(credential.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Updated: {new Date(credential.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {credential.tags && credential.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                                {credential.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1">{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </Draggable>
    );
}
