"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, LogOut, Copy, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { Credential, Category } from "@/lib/types";
import { saveVaultData } from "@/app/actions";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CategorySidebar } from "./CategorySidebar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CredentialDetailView } from "./CredentialDetailView";

interface DashboardProps {
    credentials: Credential[];
    categories: Category[];
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
    categoryId: z.string().optional(),
});


export function Dashboard({ credentials: initialCredentials, categories: initialCategories, onLock, masterPassword }: DashboardProps) {
    const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
    const [viewingCredential, setViewingCredential] = useState<Credential | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof credentialSchema>>({
        resolver: zodResolver(credentialSchema),
        defaultValues: {
            title: "",
            username: "",
            password: "",
            url: "",
            description: "",
            categoryId: "none", // Default to none? Or undefined
        },
    });

    const filteredCredentials = credentials.filter((cred) => {
        const matchesSearch = cred.title.toLowerCase().includes(search.toLowerCase()) ||
            cred.username.toLowerCase().includes(search.toLowerCase());

        if (selectedCategoryId) {
            return matchesSearch && cred.categoryId === selectedCategoryId;
        }
        return matchesSearch;
    });

    // Reset form when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCredential(null);
            setShowPassword(false);
            form.reset({
                title: "",
                username: "",
                password: "",
                url: "",
                description: "",
                categoryId: "none",
            });
        }
    };

    const navToEdit = (e: React.MouseEvent, cred: Credential) => {
        e.stopPropagation(); // Prevent opening detail view
        setEditingCredential(cred);
        setShowPassword(false);
        form.reset({
            title: cred.title,
            username: cred.username,
            password: cred.password || "",
            url: cred.url || "",
            description: cred.description || "",
            categoryId: cred.categoryId || "none",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent opening detail view
        onDelete(id);
    };

    async function handleAddCategory(name: string) {
        if (!masterPassword) return;

        const newCat: Category = {
            id: uuidv4(),
            name,
        };
        const newCategories = [...categories, newCat];

        try {
            const result = await saveVaultData(masterPassword, { credentials, categories: newCategories });
            if (result.success) {
                setCategories(newCategories);
                toast.success("Category created.");
            } else {
                toast.error(result.error || "Failed to create category.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    }

    async function handleDeleteCategory(id: string) {
        if (!masterPassword) return;
        if (!confirm("Delete this category? Credentials in this category will move to 'All Items'.")) return;

        // Remove category
        const newCategories = categories.filter(c => c.id !== id);

        // Update credentials to remove categoryId
        const newCredentials = credentials.map(c =>
            c.categoryId === id ? { ...c, categoryId: undefined } : c
        );

        try {
            const result = await saveVaultData(masterPassword, { credentials: newCredentials, categories: newCategories });
            if (result.success) {
                setCategories(newCategories);
                setCredentials(newCredentials);
                if (selectedCategoryId === id) setSelectedCategoryId(null);
                toast.success("Category deleted.");
            } else {
                toast.error(result.error || "Failed to delete.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    }

    async function handleRenameCategory(id: string, name: string) {
        if (!masterPassword) return;

        const newCategories = categories.map(c => c.id === id ? { ...c, name } : c);

        try {
            const result = await saveVaultData(masterPassword, { credentials, categories: newCategories });
            if (result.success) {
                setCategories(newCategories);
                toast.success("Category renamed.");
            } else {
                toast.error(result.error || "Failed to rename.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    }

    async function onSubmit(values: z.infer<typeof credentialSchema>) {
        if (!masterPassword) return;

        let newCredentials = [...credentials];
        // Handle "none" logic for select
        const categoryIdToSave = values.categoryId === "none" ? undefined : values.categoryId;

        if (editingCredential) {
            // Update existing
            newCredentials = newCredentials.map((cred) =>
                cred.id === editingCredential.id
                    ? { ...cred, ...values, categoryId: categoryIdToSave, updatedAt: new Date().toISOString() }
                    : cred
            );
        } else {
            // Create new
            const newCred: Credential = {
                id: uuidv4(),
                ...values,
                categoryId: categoryIdToSave,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: [],
            };
            newCredentials.push(newCred);
        }

        try {
            const result = await saveVaultData(masterPassword, { credentials: newCredentials, categories });
            if (result.success) {
                setCredentials(newCredentials);
                toast.success(editingCredential ? "Credential updated." : "Credential saved.");
                handleOpenChange(false);
            } else {
                toast.error(result.error || "Failed to save.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    }

    async function onDelete(id: string) {
        if (!masterPassword || !confirm("Are you sure you want to delete this credential?")) return;

        const newCredentials = credentials.filter((c) => c.id !== id);

        try {
            const result = await saveVaultData(masterPassword, { credentials: newCredentials, categories });
            if (result.success) {
                setCredentials(newCredentials);
                toast.success("Credential deleted.");
                if (viewingCredential?.id === id) {
                    setViewingCredential(null);
                }
            } else {
                toast.error(result.error || "Failed to delete.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    }

    const copyToClipboard = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <CategorySidebar
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                onRenameCategory={handleRenameCategory}
            />

            <div className="flex-1 p-8 h-screen overflow-y-auto">
                <div className="mx-auto max-w-5xl space-y-8">
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
                        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Credential
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{editingCredential ? "Edit Credential" : "Add Credential"}</DialogTitle>
                                    <DialogDescription>
                                        {editingCredential ? "Update your secure credential." : "Store a new password securely in your vault."}
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            name="categoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a category (optional)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="none">No Category</SelectItem>
                                                            {categories.map((cat) => (
                                                                <SelectItem key={cat.id} value={cat.id}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
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
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                autoComplete="off"
                                                                className="pr-20"
                                                                {...field}
                                                            />
                                                            <div className="absolute right-0 top-0 flex h-full">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={(e) => copyToClipboard(e, field.value)}
                                                                    tabIndex={-1}
                                                                    title="Copy Password"
                                                                >
                                                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-full px-3 py-2 hover:bg-transparent"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    tabIndex={-1}
                                                                >
                                                                    {showPassword ? (
                                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                    ) : (
                                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                    <span className="sr-only">
                                                                        {showPassword ? "Hide password" : "Show password"}
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        </div>
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
                                            <Button type="submit">{editingCredential ? "Update" : "Save"} Credential</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="text-sm text-muted-foreground px-1">
                        Categories &gt; <span className="font-medium text-foreground">
                            {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : "All Items"}
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredCredentials.map((cred) => (
                            <div
                                key={cred.id}
                                className="group relative rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-primary/50"
                                onClick={() => setViewingCredential(cred)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg leading-none">{cred.title}</h3>
                                        <p className="text-sm text-gray-500">{cred.username}</p>
                                    </div>
                                </div>

                                {cred.description && (
                                    <p className="mb-4 text-xs text-gray-400 line-clamp-2">{cred.description}</p>
                                )}

                                <div className="flex items-center justify-end gap-2 border-t pt-4 mt-auto">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                                        onClick={(e) => copyToClipboard(e, cred.password || "")}
                                        title="Copy Password"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                        onClick={(e) => navToEdit(e, cred)}
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => handleDelete(e, cred.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {filteredCredentials.length === 0 && (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                {selectedCategoryId ? "No credentials in this category." : "No credentials found."}
                            </div>
                        )}
                    </div>
                </div>

                {viewingCredential && (
                    <CredentialDetailView
                        credential={viewingCredential}
                        onClose={() => setViewingCredential(null)}
                        onEdit={(cred) => navToEdit({ stopPropagation: () => { } } as React.MouseEvent, cred)}
                        onDelete={(id) => handleDelete({ stopPropagation: () => { } } as React.MouseEvent, id)}
                    />
                )}
            </div>
        </div>
    );
}
