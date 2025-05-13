"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Plus, Trash2, Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/lib/sonner-utils"

interface Rubrique {
    id: number
    rubrique: string
    nCompte: string
}

interface Decompte {
    id?: number
    nFacture: string
    nDecompte: number
    dateExecution: string
    montantDecompte: number
}

interface MarcheFormData {
    rubriqueId: number | null
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
}

export default function NewMarchePage() {
    const [rubriques, setRubriques] = useState<Rubrique[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [nCompte, setNCompte] = useState("")
    const [rubriqueDetails, setRubriqueDetails] = useState<Rubrique | null>(null)
    const [isSearchingRubrique, setIsSearchingRubrique] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState<MarcheFormData>({
        rubriqueId: null,
        typeBudget: "",
        objet: "",
        modePassation: "",
        prestataire: "",
        reference: "",
        montantMarche: 0,
        dateApprobation: "",
        dateOrdreServiceCommencement: "",
        datePvReceptionProvisoire: "",
        dateBureauOrdre: "",
        decomptes: [],
    })

    useEffect(() => {
        const fetchRubriques = async () => {
            try {
                const response = await api.get("/api/rubriques")
                setRubriques(response.data)
            } catch (error) {
                console.error("Error fetching rubriques:", error)
                setError("Impossible de charger les rubriques")
            }
        }

        fetchRubriques()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: Number.parseFloat(value) || 0,
        }))
    }

    const handleDecompteChange = (index: number, field: keyof Decompte, value: string | number) => {
        const updatedDecomptes = [...formData.decomptes]

        if (field === "nDecompte" || field === "montantDecompte") {
            updatedDecomptes[index][field] = typeof value === "string" ? Number.parseFloat(value as string) || 0 : value
        } else {
            updatedDecomptes[index][field as "nFacture" | "dateExecution"] = value as string
        }

        setFormData((prev) => ({
            ...prev,
            decomptes: updatedDecomptes,
        }))
    }

    const addDecompte = () => {
        setFormData((prev) => ({
            ...prev,
            decomptes: [
                ...prev.decomptes,
                {
                    nFacture: "",
                    nDecompte: 0,
                    dateExecution: "",
                    montantDecompte: 0,
                },
            ],
        }))
    }

    const removeDecompte = (index: number) => {
        const updatedDecomptes = [...formData.decomptes]
        updatedDecomptes.splice(index, 1)
        setFormData((prev) => ({
            ...prev,
            decomptes: updatedDecomptes,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            await api.post("/api/marches", formData)
            toast.success("Succès", "Le marché a été créé avec succès")
            router.push("/dashboard/marches")
        } catch (err: Error | unknown) {
            console.error("Error creating marche:", err)
            const error = err as { response?: { data?: string } }
            setError(error.response?.data || "Une erreur s'est produite lors de la création du marché")
        } finally {
            setIsLoading(false)
        }
    }

    const searchRubriqueByNCompte = async () => {
        if (!nCompte.trim()) {
            setRubriqueDetails(null)
            setFormData((prev) => ({
                ...prev,
                rubriqueId: null,
            }))
            return
        }

        setIsSearchingRubrique(true)
        try {
            const response = await api.get(`/api/rubriques/compte/${nCompte}`)
            setRubriqueDetails(response.data)
            setFormData((prev) => ({
                ...prev,
                rubriqueId: response.data.id,
            }))
            toast.success("Rubrique trouvée", `${response.data.rubrique} (${response.data.nCompte})`)
        } catch (error) {
            console.error("Error searching rubrique:", error)
            setRubriqueDetails(null)
            setFormData((prev) => ({
                ...prev,
                rubriqueId: null,
            }))
            toast.error("Erreur", "Numéro de compte non trouvé")
        } finally {
            setIsSearchingRubrique(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nouveau Marché</h1>
                <p className="text-muted-foreground">Créez un nouveau marché et ajoutez ses décomptes</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations du Marché</CardTitle>
                            <CardDescription>Entrez les détails du marché</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Référence</Label>
                                    <Input
                                        id="reference"
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nCompte">Numéro de compte</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="nCompte"
                                            value={nCompte}
                                            onChange={(e) => setNCompte(e.target.value)}
                                            placeholder="Entrez le numéro de compte"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={searchRubriqueByNCompte}
                                            disabled={isSearchingRubrique}
                                        >
                                            {isSearchingRubrique ? "Recherche..." : <Search className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {rubriqueDetails && (
                                        <div className="mt-2 rounded-md bg-green-50 p-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                            Rubrique: {rubriqueDetails.rubrique}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rubriqueId">Rubrique</Label>
                                    <Select
                                        value={formData.rubriqueId?.toString() || ""}
                                        onValueChange={(value) => handleSelectChange("rubriqueId", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner une rubrique" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rubriques.map((rubrique) => (
                                                <SelectItem key={rubrique.id} value={rubrique.id.toString()}>
                                                    {rubrique.rubrique} ({rubrique.nCompte})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="typeBudget">Type de Budget</Label>
                                    <Input
                                        id="typeBudget"
                                        name="typeBudget"
                                        value={formData.typeBudget}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="modePassation">Mode de Passation</Label>
                                    <Input
                                        id="modePassation"
                                        name="modePassation"
                                        value={formData.modePassation}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prestataire">Prestataire</Label>
                                    <Input
                                        id="prestataire"
                                        name="prestataire"
                                        value={formData.prestataire}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="montantMarche">Montant du Marché (MAD)</Label>
                                    <Input
                                        id="montantMarche"
                                        name="montantMarche"
                                        type="number"
                                        step="0.01"
                                        value={formData.montantMarche}
                                        onChange={handleNumberChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateApprobation">Date d&apos;Approbation</Label>
                                    <Input
                                        id="dateApprobation"
                                        name="dateApprobation"
                                        type="date"
                                        value={formData.dateApprobation}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOrdreServiceCommencement">Date d&apos;Ordre de Service</Label>
                                    <Input
                                        id="dateOrdreServiceCommencement"
                                        name="dateOrdreServiceCommencement"
                                        type="date"
                                        value={formData.dateOrdreServiceCommencement}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="datePvReceptionProvisoire">Date PV Réception Provisoire</Label>
                                    <Input
                                        id="datePvReceptionProvisoire"
                                        name="datePvReceptionProvisoire"
                                        type="date"
                                        value={formData.datePvReceptionProvisoire}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateBureauOrdre">Date Bureau d&apos;Ordre</Label>
                                    <Input
                                        id="dateBureauOrdre"
                                        name="dateBureauOrdre"
                                        type="date"
                                        value={formData.dateBureauOrdre}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="objet">Objet du Marché</Label>
                                <Textarea
                                    id="objet"
                                    name="objet"
                                    value={formData.objet}
                                    onChange={handleInputChange}
                                    rows={3}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Décomptes</CardTitle>
                                <CardDescription>Ajoutez les décomptes associés à ce marché</CardDescription>
                            </div>
                            <Button type="button" onClick={addDecompte} variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Ajouter un décompte
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {formData.decomptes.length === 0 ? (
                                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                                    <p className="text-sm text-muted-foreground">Aucun décompte ajouté</p>
                                    <Button variant="link" onClick={addDecompte} className="mt-2">
                                        Ajouter un décompte
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.decomptes.map((decompte, index) => (
                                        <div key={index} className="relative rounded-md border p-4">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-2 text-red-500"
                                                onClick={() => removeDecompte(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`decompte-${index}-nFacture`}>N° Facture</Label>
                                                    <Input
                                                        id={`decompte-${index}-nFacture`}
                                                        value={decompte.nFacture}
                                                        onChange={(e) => handleDecompteChange(index, "nFacture", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`decompte-${index}-nDecompte`}>N° Décompte</Label>
                                                    <Input
                                                        id={`decompte-${index}-nDecompte`}
                                                        type="number"
                                                        value={decompte.nDecompte}
                                                        onChange={(e) => handleDecompteChange(index, "nDecompte", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`decompte-${index}-dateExecution`}>Date d&apos;Exécution</Label>
                                                    <Input
                                                        id={`decompte-${index}-dateExecution`}
                                                        type="date"
                                                        value={decompte.dateExecution}
                                                        onChange={(e) => handleDecompteChange(index, "dateExecution", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`decompte-${index}-montantDecompte`}>Montant (MAD)</Label>
                                                    <Input
                                                        id={`decompte-${index}-montantDecompte`}
                                                        type="number"
                                                        step="0.01"
                                                        value={decompte.montantDecompte}
                                                        onChange={(e) => handleDecompteChange(index, "montantDecompte", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <CardFooter className="flex justify-between border-t p-6">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/marches">Annuler</Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Création en cours..." : "Créer le marché"}
                        </Button>
                    </CardFooter>
                </div>
            </form>
        </div>
    )
}
