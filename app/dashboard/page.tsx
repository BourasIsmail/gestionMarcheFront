"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { FileText, Users, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
    totalMarches: number
    totalDecomptes: number
    totalUsers: number
    totalAmount: number
    totalMontantMarche: number
}

export default function DashboardPage() {
    const { user, isAdmin } = useAuth()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true)
            try {
                // Fetch marches count
                const marchesResponse = await api.get("/api/marches")
                const marches = marchesResponse.data

                // Fetch decomptes
                const decomptesResponse = await api.get("/api/decomptes")
                const decomptes = decomptesResponse.data

                // Fetch users if admin
                interface User {
                    id: string
                    name: string
                    email: string
                }
                let users: User[] = []
                if (isAdmin) {
                    const usersResponse = await api.get("/auth/getUsers")
                    users = usersResponse.data
                }

                // Calculate total amount from decomptes
                interface Decompte {
                    montantDecompte: number
                }
                const totalAmount = decomptes.reduce((sum: number, decompte: Decompte) => sum + decompte.montantDecompte, 0)

                // Calculate total amount from marches
                interface Marche {
                    montantMarche: number
                }
                const totalMontantMarche = marches.reduce((sum: number, marche: Marche) => sum + marche.montantMarche, 0)

                setStats({
                    totalMarches: marches.length,
                    totalDecomptes: decomptes.length,
                    totalUsers: users.length,
                    totalAmount,
                    totalMontantMarche,
                })
            } catch (error) {
                console.error("Error fetching dashboard stats:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [isAdmin])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground">Bienvenue, {user?.name}! Voici un aperçu de votre activité.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Marchés"
                    value={stats?.totalMarches}
                    description="Total des marchés"
                    icon={<FileText className="h-5 w-5 text-blue-600" />}
                    isLoading={isLoading}
                />
                <StatsCard
                    title="Décomptes"
                    value={stats?.totalDecomptes}
                    description="Total des décomptes"
                    icon={<FileText className="h-5 w-5 text-green-600" />}
                    isLoading={isLoading}
                />
                {isAdmin && (
                    <StatsCard
                        title="Utilisateurs"
                        value={stats?.totalUsers}
                        description="Utilisateurs enregistrés"
                        icon={<Users className="h-5 w-5 text-purple-600" />}
                        isLoading={isLoading}
                    />
                )}
                <StatsCard
                    title="Montant Total"
                    value={stats?.totalAmount}
                    description="Somme des décomptes (MAD)"
                    icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
                    isLoading={isLoading}
                    isCurrency={true}
                />
                <StatsCard
                    title="Montant Total Marchés"
                    value={stats?.totalMontantMarche}
                    description="Somme des marchés (MAD)"
                    icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                    isLoading={isLoading}
                    isCurrency={true}
                />
            </div>

            {/* Additional dashboard content can be added here */}
        </div>
    )
}

interface StatsCardProps {
    title: string
    value: number | undefined
    description: string
    icon: React.ReactNode
    isLoading: boolean
    isCurrency?: boolean
}

function StatsCard({ title, value, description, icon, isLoading, isCurrency = false }: StatsCardProps) {
    const formattedValue =
        isCurrency && value
            ? new Intl.NumberFormat("fr-MA", {
                style: "currency",
                currency: "MAD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value)
            : value?.toLocaleString()

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-7 w-1/2" /> : <div className="text-2xl font-bold">{formattedValue}</div>}
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}
