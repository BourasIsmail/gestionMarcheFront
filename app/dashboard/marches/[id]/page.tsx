"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/lib/sonner-utils"
import { Edit, ArrowLeft } from "lucide-react"

interface Decompte {
    id: number
    nFacture: string
    nDecompte: number
    dateExecution: string
    montantDecompte: number
}

interface Marche {
    id: number
    rubriqueId: number
    typeBudget: string
    objet: string
    modePassation: string
    prestataire: string
    reference: string
    montantMarche: number
    dateApprobation: string
    dateOrdreServiceCommencement: string
    datePvReceptionProvisoire: string
    dateBureauOrdre: string
    decomptes: Decompte[]
    rubrique?: {
        id: number
        rubrique: string
        nCompte: string
    }
}


export default function MarcheDetailsPage({ params }: { params: { id: string } }) {
    const [marche, setMarche] = useState<Marche | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchMarche = async () => {
            setIsLoading(true)
            try {
                const response = await api.get(`/api/marches/${params.id}`)
                setMarche(response.data)
            } catch (error) {
                console.error("Error fetching marche:", error)
                toast.error("Erreur", "Impossible de charger les détails du marché")
                router.push("/dashboard/marches")
            } finally {
                setIsLoading(false)
            }
        }

        fetchMarche()
    }, [params.id, router])

    if (isLoading) {
        return <LoadingState />
    }

    if (!marche) {
        return null
    }

    // Calculate total amount of decomptes
    const totalDecomptes = marche.decomptes.reduce((sum, decompte) => sum + decompte.montantDecompte, 0)

    // Calculate remaining amount
    const remainingAmount = marche.montantMarche - totalDecomptes

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/marches">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Marché: {marche.reference}</h1>
                </div>
                <Button asChild>
                    <Link href={`/dashboard/marches/${marche.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du Marché</CardTitle>
                        <CardDescription>Détails du marché</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-4">
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Référence:</dt>
                                <dd>{marche.reference}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Objet:</dt>
                                <dd>{marche.objet}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Prestataire:</dt>
                                <dd>{marche.prestataire}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Montant:</dt>
                                <dd>
                                    {new Intl.NumberFormat("fr-MA", {
                                        style: "currency",
                                        currency: "MAD",
                                        minimumFractionDigits: 2,
                                    }).format(marche.montantMarche)}
                                </dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Type de Budget:</dt>
                                <dd>{marche.typeBudget}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Mode de Passation:</dt>
                                <dd>{marche.modePassation}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Rubrique:</dt>
                                <dd>
                                    {marche.rubrique?.rubrique} ({marche.rubrique?.nCompte})
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dates</CardTitle>
                        <CardDescription>Dates importantes du marché</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-4">
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Date d&apos;Approbation:</dt>
                                <dd>{marche.dateApprobation || "Non définie"}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Date d&apos;Ordre de Service:</dt>
                                <dd>{marche.dateOrdreServiceCommencement || "Non définie"}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Date PV Réception Provisoire:</dt>
                                <dd>{marche.datePvReceptionProvisoire || "Non définie"}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <dt className="font-medium text-gray-500">Date Bureau d&apos;Ordre:</dt>
                                <dd>{marche.dateBureauOrdre || "Non définie"}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Décomptes</CardTitle>
                    <CardDescription>Liste des décomptes associés à ce marché</CardDescription>
                </CardHeader>
                <CardContent>
                    {marche.decomptes.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                            <p className="text-sm text-muted-foreground">Aucun décompte pour ce marché</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href={`/dashboard/marches/${marche.id}/edit`}>Ajouter un décompte</Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>N° Facture</TableHead>
                                            <TableHead>N° Décompte</TableHead>
                                            <TableHead>Date d&apos;Exécution</TableHead>
                                            <TableHead className="text-right">Montant (MAD)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {marche.decomptes.map((decompte) => (
                                            <TableRow key={decompte.id}>
                                                <TableCell className="font-medium">{decompte.nFacture}</TableCell>
                                                <TableCell>{decompte.nDecompte}</TableCell>
                                                <TableCell>{decompte.dateExecution}</TableCell>
                                                <TableCell className="text-right">
                                                    {new Intl.NumberFormat("fr-MA", {
                                                        style: "currency",
                                                        currency: "MAD",
                                                        minimumFractionDigits: 2,
                                                    }).format(decompte.montantDecompte)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} className="font-bold">
                                                Total des décomptes
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {new Intl.NumberFormat("fr-MA", {
                                                    style: "currency",
                                                    currency: "MAD",
                                                    minimumFractionDigits: 2,
                                                }).format(totalDecomptes)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={3} className="font-bold">
                                                Montant restant
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {new Intl.NumberFormat("fr-MA", {
                                                    style: "currency",
                                                    currency: "MAD",
                                                    minimumFractionDigits: 2,
                                                }).format(remainingAmount)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array(6)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} className="grid grid-cols-2 gap-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array(4)
                            .fill(0)
                            .map((_, index) => (
                                <div key={index} className="grid grid-cols-2 gap-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {Array(5)
                            .fill(0)
                            .map((_, index) => (
                                <Skeleton key={index} className="h-12 w-full" />
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
