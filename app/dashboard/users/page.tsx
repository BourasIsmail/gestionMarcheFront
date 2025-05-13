"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/lib/sonner-utils"
import { useAuth } from "@/contexts/AuthContext"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios";

interface User {
    id: number
    name: string
    email: string
    roles: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [userToDelete, setUserToDelete] = useState<number | null>(null)
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
    const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const { user: currentUser, isAdmin } = useAuth()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        roles: "USER_ROLES",
    })

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/auth/getUsers")
            setUsers(response.data)
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Erreur", "Impossible de charger les utilisateurs")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isAdmin) {
            toast.error("Accès refusé", "Vous n'avez pas les droits pour accéder à cette page")
            return
        }

        fetchUsers()
    }, [isAdmin])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        if (!searchTerm.trim()) {
            fetchUsers()
            return
        }

        const filteredUsers = users.filter(
            (user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        setUsers(filteredUsers)
    }

    const resetSearch = () => {
        setSearchTerm("")
        fetchUsers()
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            await api.delete(`/auth/${userToDelete}`)
            toast.success("Succès", "L'utilisateur a été supprimé avec succès")
            fetchUsers()
        } catch (error) {
            console.error("Error deleting user:", error)
            toast.error("Erreur", "Impossible de supprimer l'utilisateur")
        } finally {
            setUserToDelete(null)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            roles: value,
        }))
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await api.post("/auth/addUser", formData)
            toast.success("Succès", "L'utilisateur a été ajouté avec succès")
            setIsAddUserDialogOpen(false)
            setFormData({
                name: "",
                email: "",
                password: "",
                roles: "USER_ROLES",
            })
            fetchUsers()
        } catch (error: unknown) {
            console.error("Error adding user:", error)
            toast.error("Erreur", error instanceof Error ? error.message : "Impossible d'ajouter l'utilisateur")
        }
    }

    const openEditDialog = (user: User) => {
        setSelectedUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: "", // Password will be required for update
            roles: user.roles,
        })
        setIsEditUserDialogOpen(true)
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedUser) return

        try {
            await api.put(`/auth/updateUser/${selectedUser.id}`, formData)
            toast.success("Succès", "L'utilisateur a été mis à jour avec succès")
            setIsEditUserDialogOpen(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (error: Error | unknown) {
            if (axios.isAxiosError(error)) {
                console.error("Error updating user:", error)
                toast.error("Erreur", error.response?.data || "Impossible de mettre à jour l'utilisateur")
            } else {
                console.error("Error updating user:", error)
                toast.error("Erreur", "Impossible de mettre à jour l'utilisateur")
            }
        }
    }

    if (!isAdmin) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Accès refusé</CardTitle>
                        <CardDescription>Vous n&apos;avez pas les droits pour accéder à cette page</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
                    <p className="text-muted-foreground">Gérez les utilisateurs du système</p>
                </div>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Nouvel Utilisateur
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un utilisateur</DialogTitle>
                            <DialogDescription>Créez un nouvel utilisateur pour le système</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddUser}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roles">Rôle</Label>
                                    <Select value={formData.roles} onValueChange={handleRoleChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER_ROLES">Utilisateur</SelectItem>
                                            <SelectItem value="ADMIN_ROLES">Administrateur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Ajouter</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
                            <DialogDescription>Modifiez les informations de l&apos;utilisateur</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateUser}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nom complet</Label>
                                    <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-password">Nouveau mot de passe</Label>
                                    <Input
                                        id="edit-password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-roles">Rôle</Label>
                                    <Select value={formData.roles} onValueChange={handleRoleChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un rôle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USER_ROLES">Utilisateur</SelectItem>
                                            <SelectItem value="ADMIN_ROLES">Administrateur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Mettre à jour</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Utilisateurs</CardTitle>
                    <CardDescription>Consultez et gérez tous les utilisateurs du système</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher par nom ou email..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button type="submit">Rechercher</Button>
                        {searchTerm && (
                            <Button variant="outline" onClick={resetSearch}>
                                Réinitialiser
                            </Button>
                        )}
                    </form>

                    {isLoading ? (
                        <div className="space-y-2">
                            {Array(5)
                                .fill(0)
                                .map((_, index) => (
                                    <Skeleton key={index} className="h-12 w-full" />
                                ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                            <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
                            {searchTerm && (
                                <Button variant="link" onClick={resetSearch} className="mt-2">
                                    Réinitialiser la recherche
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rôle</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.roles === "ADMIN_ROLES" ? "Administrateur" : "Utilisateur"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openEditDialog(user)}
                                                        disabled={user.id === currentUser?.id}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Modifier</span>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-500"
                                                                onClick={() => setUserToDelete(user.id)}
                                                                disabled={user.id === currentUser?.id}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Supprimer</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action ne peut pas être
                                                                    annulée.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDeleteUser}
                                                                    className="bg-red-500 text-white hover:bg-red-600"
                                                                >
                                                                    Supprimer
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
