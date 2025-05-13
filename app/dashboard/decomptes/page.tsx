"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/lib/sonner-utils"

interface DecompteWithMarche {
    id: number
    nFacture: string
    nDecompte: number
    dateExecution: string
    montantDecompte: number
    marcheId: number
    marcheObjet: string
    marcheReference: string
    marchePrestataire: string
    marcheMontantTotal: number
    marcheTypeBudget: string
    rubriqueNom: string
    rubriqueNCompte: string
}

export default function DecomptesPage() {
    const [decomptes, setDecomptes] = useState<DecompteWithMarche[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [searchTerm, setSearchTerm] = useState("")
    const pageSize = 10

    const fetchDecomptes = async (page = 0) => {
        setIsLoading(true)
        try {
            const response = await api.get(`/api/decomptes/paginated?page=${page}&size=${pageSize}&sortBy=id&direction=desc`)
            setDecomptes(response.data.content)
            setTotalPages(response.data.totalPages)
            setCurrentPage(response.data.number)
        } catch (error) {
            console.error("Error fetching decomptes:", error)
            toast.error("Erreur", "Impossible de charger les décomptes")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDecomptes()
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            // This is a simplified search - in a real app, you'd implement a proper search endpoint
            const response = await api.get(`/api/decomptes`)
            const allDecomptes = response.data

            const filteredDecomptes = allDecomptes.filter(
                (decompte: DecompteWithMarche) =>
                    decompte.nFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    decompte.marcheReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    decompte.marchePrestataire.toLowerCase().includes(searchTerm.toLowerCase()),
            )

            setDecomptes(filteredDecomptes)
            setTotalPages(Math.ceil(filteredDecomptes.length / pageSize))
            setCurrentPage(0)
        } catch (error) {
            console.error("Error searching decomptes:", error)
            toast.error("Erreur", "Impossible de rechercher les décomptes")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePageChange = (page: number) => {
        if (searchTerm) {
            // If searching, just change the page in the current results
            setCurrentPage(page)
        } else {
            // If not searching, fetch new data
            fetchDecomptes(page)
        }
    }

    const resetSearch = () => {
        setSearchTerm("")
        fetchDecomptes()
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Décomptes</h1>
                <p className="text-muted-foreground">Consultez tous les décomptes des marchés</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Décomptes</CardTitle>
                    <CardDescription>Consultez les décomptes de tous les marchés</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="mb-6 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher par n° facture, référence ou prestataire..."
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
                    ) : decomptes.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                            <p className="text-sm text-muted-foreground">Aucun décompte trouvé</p>
                            {searchTerm && (
                                <Button variant="link" onClick={resetSearch} className="mt-2">
                                    Réinitialiser la recherche
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>N° Facture</TableHead>
                                            <TableHead>N° Décompte</TableHead>
                                            <TableHead>Marché</TableHead>
                                            <TableHead>Prestataire</TableHead>
                                            <TableHead className="hidden md:table-cell">Date d&apos;exécution</TableHead>
                                            <TableHead className="text-right">Montant (MAD)</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {decomptes.map((decompte) => (
                                            <TableRow key={decompte.id}>
                                                <TableCell className="font-medium">{decompte.nFacture}</TableCell>
                                                <TableCell>{decompte.nDecompte}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    <Link
                                                        href={`/dashboard/marches/${decompte.marcheId}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {decompte.marcheReference}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{decompte.marchePrestataire}</TableCell>
                                                <TableCell className="hidden md:table-cell">{decompte.dateExecution}</TableCell>
                                                <TableCell className="text-right">
                                                    {new Intl.NumberFormat("fr-MA", {
                                                        style: "currency",
                                                        currency: "MAD",
                                                        minimumFractionDigits: 2,
                                                    }).format(decompte.montantDecompte)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="icon" asChild>
                                                        <Link href={`/dashboard/marches/${decompte.marcheId}`}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">Voir le marché</span>
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                                                className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }).map((_, index) => (
                                            <PaginationItem key={index}>
                                                <PaginationLink onClick={() => handlePageChange(index)} isActive={currentPage === index}>
                                                    {index + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                                                className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
