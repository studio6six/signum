"use client";

import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Folder, FolderOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface CategorySidebarProps {
    categories: Category[];
    selectedCategoryId: string | null;
    onSelectCategory: (id: string | null) => void;
    onAddCategory: (name: string) => void;
    onDeleteCategory: (id: string) => void;
}

export function CategorySidebar({
    categories,
    selectedCategoryId,
    onSelectCategory,
    onAddCategory,
    onDeleteCategory,
    onRenameCategory,
}: CategorySidebarProps & { onRenameCategory: (id: string, name: string) => void }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleOpenAdd = () => {
        setEditingCategory(null);
        setCategoryName("");
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (e: React.MouseEvent, category: Category) => {
        e.stopPropagation();
        setEditingCategory(category);
        setCategoryName(category.name);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!categoryName.trim()) return;

        if (editingCategory) {
            onRenameCategory(editingCategory.id, categoryName);
        } else {
            onAddCategory(categoryName);
        }

        setCategoryName("");
        setEditingCategory(null);
        setIsDialogOpen(false);
    };

    return (
        <div className="w-64 border-r bg-gray-50/50 p-4 flex flex-col gap-4 h-[calc(100vh-4rem)] sticky top-0">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Categories</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleOpenAdd}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "Rename Category" : "Add Category"}</DialogTitle>
                            <DialogDescription>
                                {editingCategory ? "Rename your category." : "Create a new category to organize your credentials."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                            <Label htmlFor="name">Category Name</Label>
                            <Input
                                id="name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder="e.g. Work"
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>{editingCategory ? "Save Changes" : "Create Category"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-1">
                <Button
                    variant={selectedCategoryId === null ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", selectedCategoryId === null && "bg-white shadow-sm")}
                    onClick={() => onSelectCategory(null)}
                >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    All Items
                </Button>

                {categories.map((cat) => (
                    <div key={cat.id} className="group flex items-center gap-1">
                        <Button
                            variant={selectedCategoryId === cat.id ? "secondary" : "ghost"}
                            className={cn(
                                "flex-1 justify-start truncate",
                                selectedCategoryId === cat.id && "bg-white shadow-sm"
                            )}
                            onClick={() => onSelectCategory(cat.id)}
                        >
                            <Folder className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">{cat.name}</span>
                        </Button>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-400 hover:text-blue-600"
                                onClick={(e) => handleOpenEdit(e, cat)}
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 15 15"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                >
                                    <path
                                        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89291L2.01855 12.3966L1.99995 12.4285L1.93603 12.4903L1.93435 12.492L1.05472 13.3716C0.84032 13.586 0.920534 13.9516 1.20593 14.0537L4.79469 12.5645C4.91299 12.5144 5.01928 12.4424 5.10924 12.3525L12.5412 4.92055C12.7365 4.72528 12.7365 4.4087 12.5412 4.21344L11.8536 1.14645ZM11.1465 2.56066L11.4394 2.85355L10.0252 4.26777L9.73232 3.97487L11.1465 2.56066ZM8.67166 5.03553L9.37877 5.74264L4.78696 10.3344C4.75783 10.3636 4.72251 10.3879 4.68334 10.4045L3.43444 10.9329L4.01772 9.76103C4.03222 9.72149 4.0545 9.68494 4.08362 9.65581L8.67166 5.03553Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCategory(cat.id);
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
