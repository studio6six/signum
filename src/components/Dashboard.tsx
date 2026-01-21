"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, LogOut, Copy } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { Credential } from "@/lib/types";
import { saveCredentials } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface DashboardProps {
    credentials: Credential[];
    onLock: () => void;
    // We need the password to re-encrypt data when saving
    masterPassword: string | null;
}

const credentialSchema = z.object({
    title: z.string().min(1, "Title is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    url: z.string().optional(),
    description: z.string().optional(),
});

export function Dashboard({ credentials: initialCredentials, onLock, masterPassword }: DashboardProps) {
    const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const form = useForm<z.infer<typeof credentialSchema>>({
        resolver: zodResolver(credentialSchema),
        defaultValues: {
            title: "",
            username: "",
            password: "",
            url: "",
            description: "",
        },
    });

    const filteredCredentials = credentials.filter((cred) =>
        cred.title.toLowerCase().includes(search.toLowerCase()) ||
        cred.username.toLowerCase().includes(search.toLowerCase())
    );

    async function onAddCredential(values: z.infer<typeof credentialSchema>) {
        if (!masterPassword) return;

        const newCred: Credential = {
            id: uuidv4(),
            ...values,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
        };

        const newCredentials = [...credentials, newCred];

        try {
            const result = await saveCredentials(masterPassword, newCredentials);
            if (result.success) {
                setCredentials(newCredentials);
                toast.success("Credential saved.");
                setIsAddOpen(false);
                form.reset();
            } else {
                toast.error(result.error || "Failed to save.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Signum</h1>
                        <p className="text-muted-foreground">Secure Credential Manager</p>
                    </div>
                    <Button variant="ghost" onClick={onLock}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Lock Vault
                    </Button>
                </header>

                <div className="flex items-center space-x-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search credentials..."
                            className="pl-8 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Credential
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Credential</DialogTitle>
                                <DialogDescription>
                                    Store a new password securely in your vault.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onAddCredential)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Netflix" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="url"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Notes..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit">Save Credential</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCredentials.map((cred) => (
                        <div key={cred.id} className="group relative rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold">{cred.title}</h3>
                                    <p className="text-sm text-gray-500">{cred.username}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => copyToClipboard(cred.password || "")}
                                >
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copy Password</span>
                                </Button>
                            </div>
                            {cred.description && (
                                <p className="mt-2 text-xs text-gray-400 line-clamp-2">{cred.description}</p>
                            )}
                        </div>
                    ))}
                    {filteredCredentials.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No credentials found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
