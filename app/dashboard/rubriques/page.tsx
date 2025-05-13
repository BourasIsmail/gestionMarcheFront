"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/lib/sonner-utils"
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

interface Rubrique {
    id: number
    rubrique: string
    nCompte: string
}

export default function RubriquesPage() {
    const [rubriques, setRubriques] = useState<Rubrique[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [rubriqueToDelete, setRubriqueToDelete] = useState<number | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedRubrique, setSelectedRubrique] = useState<Rubrique | null>(null)

    const [formData, setFormData] = useState({
        rubrique: "",
        nCompte: "",
    })

    const fetchRubriques = async () => {
        setIsLoading(true)
        try {
            const response = await api.get("/api/rubriques")
            setRubriques(response.data)
        } catch (error) {
            console.error("Error fetching rubriques:", error)
            toast.error("Erreur", "Impossible de charger les rubriques")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRubriques()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        if (!searchTerm.trim()) {
            fetchRubriques()
            return
        }

        const filteredRubriques = rubriques.filter(
            (rubrique) =>
                rubrique.rubrique.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rubrique.nCompte.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        setRubriques(filteredRubriques)
    }

    const resetSearch = () => {
        setSearchTerm("")
        fetchRubriques()
    }

    const handleDeleteRubrique = async () => {
        if (!rubriqueToDelete) return

        try {
            await api.delete(`/api/rubriques/${rubriqueToDelete}`)
            toast.success("Succès", "La rubrique a été supprimée avec succès")
            fetchRubriques()
        } catch (error) {
            console.error("Error deleting rubrique:", error)
            toast.error("Erreur", "Impossible de supprimer la rubrique")
        } finally {
            setRubriqueToDelete(null)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleAddRubrique = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await api.post("/api/rubriques", formData)
            toast.success("Succès", "La rubrique a été ajoutée avec succès")
            setIsAddDialogOpen(false)
            setFormData({
                rubrique: "",
                nCompte: "",
            })
            fetchRubriques()
        } catch (error: Error | unknown) {
            console.error("Error adding rubrique:", error)
            if (error && typeof error === 'object' && error !== null && 'response' in error && error.response && typeof error.response === 'object' && error.response !== null && 'status' in error.response && error.response.status === 409) {
                toast.error("Erreur", "Ce numéro de compte existe déjà")
            } else {
                toast.error("Erreur", "Impossible d'ajouter la rubrique")
            }
        }
    }

    const openEditDialog = (rubrique: Rubrique) => {
        setSelectedRubrique(rubrique)
        setFormData({
            rubrique: rubrique.rubrique,
            nCompte: rubrique.nCompte,
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdateRubrique = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedRubrique) return

        try {
            await api.put(`/api/rubriques/${selectedRubrique.id}`, formData)
            toast.success("Succès", "La rubrique a été mise à jour avec succès")
            setIsEditDialogOpen(false)
            setSelectedRubrique(null)
            fetchRubriques()
        } catch (error: Error | unknown) {
            console.error("Error updating rubrique:", error)
            if (error && typeof error === 'object' && error !== null && 'response' in error && error.response && typeof error.response === 'object' && error.response !== null && 'status' in error.response && error.response.status === 409) {
                toast.error("Erreur", "Ce numéro de compte existe déjà")
            } else {
                toast.error("Erreur", "Impossible de mettre à jour la rubrique")
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rubriques</h1>
                    <p className="text-muted-foreground">Gérez les rubriques comptables</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Nouvelle Rubrique
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une rubrique</DialogTitle>
                            <DialogDescription>Créez une nouvelle rubrique comptable</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddRubrique}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nCompte">Numéro de compte</Label>
                                    <Input id="nCompte" name="nCompte" value={formData.nCompte} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rubrique">Libellé de la rubrique</Label>
                                    <Input
                                        id="rubrique"
                                        name="rubrique"
                                        value={formData.rubrique}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Ajouter</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier la rubrique</DialogTitle>
                            <DialogDescription>Modifiez les informations de la rubrique</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateRubrique}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nCompte">Numéro de compte</Label>
                                    <Input
                                        id="edit-nCompte"
                                        name="nCompte"
                                        value={formData.nCompte}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-rubrique">Libellé de la rubrique</Label>
                                    <Input
                                        id="edit-rubrique"
                                        name="rubrique"
                                        value={formData.rubrique}
                                        onChange={handleInputChange}
                                        required
                                    />
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
                    <CardTitle>Liste des Rubriques</CardTitle>
                    <CardDescription>Consultez et gérez toutes les rubriques comptables</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher par libellé ou numéro de compte..."
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
                    ) : rubriques.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                            <p className="text-sm text-muted-foreground">Aucune rubrique trouvée</p>
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
                                        <TableHead>Numéro de compte</TableHead>
                                        <TableHead>Libellé de la rubrique</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rubriques.map((rubrique) => (
                                        <TableRow key={rubrique.id}>
                                            <TableCell className="font-medium">{rubrique.nCompte}</TableCell>
                                            <TableCell>{rubrique.rubrique}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(rubrique)}>
                                                        <Edit className="h-4 w-4" />
                                                        <span className="sr-only">Modifier</span>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-red-500"
                                                                onClick={() => setRubriqueToDelete(rubrique.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Supprimer</span>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Êtes-vous sûr de vouloir supprimer cette rubrique? Cette action ne peut pas être
                                                                    annulée.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={handleDeleteRubrique}
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
